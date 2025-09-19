from flask import Flask, render_template, request, redirect, url_for, flash
from models import db, Team, Player, Match, Innings, PlayerInnings, BallEvent, BowlingInnings, MatchTeamPlayer
from sqlalchemy.exc import IntegrityError
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = 'devsecret'

# --- Database Setup ---
db_url = os.getenv("DATABASE_URL", "sqlite:///cricket.db")  # ✅ Use SQLite locally, Postgres on Render
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)  # ✅ Render fix

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()
    # Ensure two fixed teams exist
    t1 = Team.query.filter_by(name='Team Bat First').first()
    t2 = Team.query.filter_by(name='Team Bowl First').first()
    if not t1:
        db.session.add(Team(name='Team Bat First'))
    if not t2:
        db.session.add(Team(name='Team Bowl First'))
    db.session.commit()

def get_active_innings(match):
    return Innings.query.filter_by(match_id=match.id, completed=False).order_by(Innings.number).first()

def ensure_player_innings(inns, player_id):
    if not player_id:
        return None
    pi = PlayerInnings.query.filter_by(innings_id=inns.id, player_id=player_id).first()
    if not pi:
        pi = PlayerInnings(innings_id=inns.id, player_id=player_id, runs=0, balls=0)
        db.session.add(pi)
        db.session.flush()
    return pi

def ensure_bowling_innings(inns, player_id):
    if not player_id:
        return None
    bi = BowlingInnings.query.filter_by(innings_id=inns.id, player_id=player_id).first()
    if not bi:
        bi = BowlingInnings(innings_id=inns.id, player_id=player_id, balls=0, runs_conceded=0, wickets=0)
        db.session.add(bi)
        db.session.flush()
    return bi

def sync_player_flags(inns):
    # set is_striker/is_non_striker flags according to inns.striker_id / non_striker_id
    for pi in PlayerInnings.query.filter_by(innings_id=inns.id).all():
        pi.is_striker = (pi.player_id == inns.striker_id)
        pi.is_non_striker = (pi.player_id == inns.non_striker_id)

def compute_winner_text(match):
    inns_list = sorted(match.innings, key=lambda i: i.number)
    if len(inns_list) < 2 or not inns_list[0].completed or not inns_list[1].completed:
        return None
    first, second = inns_list[0], inns_list[1]
    if first.runs > second.runs:
        return f"{first.batting_team.name} won by {first.runs - second.runs} runs"
    if second.runs > first.runs:
        total_players = MatchTeamPlayer.query.filter_by(match_id=match.id, team_id=second.batting_team_id).count()
        wickets_remaining = total_players - 1 - second.wickets  # -1 because last man standing does not count as wicket
        return f"{second.batting_team.name} won by {wickets_remaining} wickets"
    return "Match tied"

def finalize_match(match):
    # Called after match ends
    player_ids = set()
    for inns in match.innings:
        for pi in inns.player_innings:
            player_ids.add(pi.player_id)
            p = pi.player
            p.career_runs += pi.runs
        for bi in inns.bowling_innings:
            bi.player.career_wickets += bi.wickets
    for pid in player_ids:
        Player.query.get(pid).career_matches += 1
    db.session.commit()

@app.route('/')
def index():
    matches = Match.query.order_by(Match.created_at.desc()).limit(10).all()
    return render_template('index.html', matches=matches)

# Player pool management (global)
@app.route('/players', methods=['GET','POST'])
def players():
    # keep it simple: players are global pool, no permanent team assignment
    if request.method == 'POST':
        name = request.form['name'].strip()
        if name:
            db.session.add(Player(name=name))
            db.session.commit()
            flash('Player added to pool')
        return redirect(url_for('players'))
    players = Player.query.order_by(Player.name).all()
    return render_template('players.html', players=players)

@app.route('/players/<int:player_id>/edit', methods=['GET','POST'])
def edit_player(player_id):
    p = Player.query.get_or_404(player_id)
    if request.method == 'POST':
        p.name = request.form['name'].strip()
        db.session.commit()
        flash('Player updated')
        return redirect(url_for('players'))
    return render_template('edit_player.html', player=p)

@app.route('/players/<int:player_id>/delete', methods=['POST'])
def delete_player(player_id):
    p = Player.query.get_or_404(player_id)
    db.session.delete(p)
    db.session.commit()
    flash('Player deleted')
    return redirect(url_for('players'))

@app.route('/matches/new', methods=['GET','POST'])
def new_match():
    if request.method == 'POST':
        t1 = Team.query.filter_by(name='Team Bat First').first()
        t2 = Team.query.filter_by(name='Team Bowl First').first()
        overs = int(request.form.get('overs', 20))
        m = Match(team1_id=t1.id, team2_id=t2.id, overs=overs, status='Ongoing')
        db.session.add(m)
        db.session.commit()
        first = Innings(match_id=m.id, number=1, batting_team_id=t1.id, bowling_team_id=t2.id)
        db.session.add(first)
        db.session.commit()
        # redirect to select players for this match
        return redirect(url_for('select_match_players', match_id=m.id))
    # show only overs input
    return render_template('new_match.html')

@app.route('/matches/<int:match_id>/players', methods=['GET', 'POST'])
def select_match_players(match_id):
    match = Match.query.get_or_404(match_id)

    if request.method == 'POST':
        team1_player_ids = [int(pid) for pid in request.form.getlist('team1_players')]
        team2_player_ids = [int(pid) for pid in request.form.getlist('team2_players')]

        if not team1_player_ids or not team2_player_ids:
            flash('You must select at least one player for each team.')
            return redirect(url_for('select_match_players', match_id=match_id))

        # Clear old assignments
        MatchTeamPlayer.query.filter_by(match_id=match.id).delete()

        # Insert new assignments
        for pid in team1_player_ids:
            db.session.add(MatchTeamPlayer(match_id=match.id, team_id=match.team1_id, player_id=pid))
        for pid in team2_player_ids:
            db.session.add(MatchTeamPlayer(match_id=match.id, team_id=match.team2_id, player_id=pid))

        db.session.commit()
        flash("Teams saved successfully!")
        return redirect(url_for('match', match_id=match.id))

    all_players = Player.query.order_by(Player.name).all()
    return render_template('select_players.html', match=match, all_players=all_players)

@app.route('/matches/<int:match_id>')
def match(match_id):
    m = Match.query.get_or_404(match_id)
    inns = get_active_innings(m)

    batting_players = []
    bowling_players = []
    bench_players = []
    bowling_stats = []

    if inns:
        batting_players = [
            mtp.player for mtp in m.match_players
            if mtp.team_id == inns.batting_team_id
        ]
        bowling_players = [
            mtp.player for mtp in m.match_players
            if mtp.team_id == inns.bowling_team_id
        ]
        pi_player_ids = [pi.player_id for pi in inns.player_innings]
        bench_players = [p for p in batting_players if p.id not in pi_player_ids]
        bowling_stats = inns.bowling_innings
    if not batting_players or not bowling_players:
        flash("No players assigned to one of the teams. Go back and select match players.")
        return redirect(url_for('select_match_players', match_id=m.id))

    return render_template(
        'match.html',
        match=m,
        innings=inns,
        batting_players=batting_players,
        bowling_players=bowling_players,
        bench_players=bench_players,
        bowling_stats=bowling_stats
    )


# --- The rest of scoring / innings / wicket endpoints are unchanged ---
# (We reuse your existing implementations for set_openers, add_ball, etc.)
# For brevity we include them by importing from a small helper file OR paste the functions
# below — I'll paste the code so you have a single file.

# --- Set openers ---
@app.route('/matches/<int:match_id>/set_openers', methods=['POST'])
def set_openers(match_id):
    m = Match.query.get_or_404(match_id)
    inns = get_active_innings(m)
    if not inns:
        flash('No active innings')
        return redirect(url_for('match', match_id=match_id))
    opener1 = int(request.form['opener1'])
    opener2 = int(request.form['opener2'])
    if opener1 == opener2:
        flash('Choose two different openers')
        return redirect(url_for('match', match_id=match_id))
    ensure_player_innings(inns, opener1)
    ensure_player_innings(inns, opener2)
    inns.striker_id = opener1
    inns.non_striker_id = opener2
    sync_player_flags(inns)
    db.session.commit()
    flash('Openers set')
    return redirect(url_for('match', match_id=match_id))

# Add batsman/substitute
@app.route('/matches/<int:match_id>/add_batsman', methods=['POST'])
def add_batsman(match_id):
    pid = int(request.form['player_id'])
    make_striker = bool(request.form.get('make_striker'))
    m = Match.query.get_or_404(match_id)
    inns = get_active_innings(m)
    if not inns:
        flash('No active innings')
        return redirect(url_for('match', match_id=match_id))
    existing = PlayerInnings.query.filter_by(innings_id=inns.id, player_id=pid).first()
    if existing and existing.out:
        flash('Cannot add: player already out in this innings')
        return redirect(url_for('match', match_id=match_id))
    if existing and existing.retired:
        flash('Cannot add: player retired in this innings')
        return redirect(url_for('match', match_id=match_id))
    ensure_player_innings(inns, pid)
    if make_striker:
        inns.striker_id = pid
        sync_player_flags(inns)
    db.session.commit()
    flash('Batsman added')
    return redirect(url_for('match', match_id=match_id))

@app.route('/matches/<int:match_id>/baby_over', methods=['POST'])
def baby_over(match_id):
    match = Match.query.get_or_404(match_id)
    innings = match.innings[-1]  # current innings is last one

    # Calculate start of current over
    over_start_ball = innings.legal_balls - (innings.legal_balls % 6)

    # Reset only the over count
    innings.legal_balls = over_start_ball
    db.session.commit()

    flash("Baby over applied — over reset, runs/wickets remain unchanged.")
    return redirect(url_for('match', match_id=match.id))

# Score ball (slightly trimmed - same logic you had)
@app.route('/matches/<int:match_id>/ball', methods=['POST'])
def add_ball(match_id):
    m = Match.query.get_or_404(match_id)
    inns = get_active_innings(m)
    if not inns:
        flash('No active innings')
        return redirect(url_for('match', match_id=match_id))

    if not inns.striker_id or not inns.non_striker_id:
        flash('Set openers first')
        return redirect(url_for('match', match_id=match_id))

    chosen_striker = request.form.get('striker')
    if chosen_striker:
        try:
            inns.striker_id = int(chosen_striker)
        except:
            pass

    striker_id = inns.striker_id
    bowler_id = request.form.get('bowler')
    bowler_id = int(bowler_id) if bowler_id else None

    extras = request.form.get('extras','')
    runs_btn = int(request.form.get('runs', 0))

    wicket_type = request.form.get('wicket_type')
    wicket_taker = int(request.form.get('wicket_taker')) if request.form.get('wicket_taker') else None

    bat_runs = 0
    extra_runs = 0
    legal = True

    if extras:
        ex = extras.upper()
        if ex == 'WD':
            extra_runs = 1
            legal = False
        elif ex == 'NB':
            extra_runs = 1
            legal = False
        elif ex.startswith('NB+'):
            try:
                x = int(ex.split('+',1)[1])
            except Exception:
                x = runs_btn
            extra_runs = 1
            bat_runs = x
            legal = False
        else:
            bat_runs = runs_btn
    else:
        bat_runs = runs_btn

    # handle current_bowler logic: if new bowler selected, set it
    if bowler_id:
        inns.current_bowler_id = bowler_id
    else:
        bowler_id = inns.current_bowler_id

    be = BallEvent(
        innings_id=inns.id,
        striker_id=striker_id,
        bowler_id=bowler_id,
        runs=bat_runs,
        extras=extras if extras else '',
        wicket_type=wicket_type if wicket_type else None,
        wicket_taker_id=wicket_taker
    )
    db.session.add(be)

    pi = ensure_player_innings(inns, striker_id)
    bi = ensure_bowling_innings(inns, bowler_id)

    inns.runs = (inns.runs or 0) + bat_runs + extra_runs
    if bi:
        bi.runs_conceded = (bi.runs_conceded or 0) + bat_runs + extra_runs

    if legal:
        inns.legal_balls = (inns.legal_balls or 0) + 1
        if pi:
            pi.balls = (pi.balls or 0) + 1
        if bi:
            bi.balls = (bi.balls or 0) + 1

    if legal and inns.current_bowler_id:
        inns.current_bowler_balls = (inns.current_bowler_balls or 0) + 1
        if inns.current_bowler_balls >= 6:
            inns.current_bowler_id = None
            inns.current_bowler_balls = 0
            flash('Over complete! Please choose next bowler.')

    if pi:
        pi.runs = (pi.runs or 0) + bat_runs

    if wicket_type:
        if pi:
            pi.out = True
        inns.wickets = (inns.wickets or 0) + 1
        if wicket_type.lower() != 'run-out':
            if bi:
                bi.wickets = (bi.wickets or 0) + 1
        if inns.striker_id == (pi.player_id if pi else None):
            inns.striker_id = None

    if legal and (bat_runs % 2 == 1):
        inns.striker_id, inns.non_striker_id = inns.non_striker_id, inns.striker_id

    if inns.legal_balls and inns.legal_balls % 6 == 0:
        inns.striker_id, inns.non_striker_id = inns.non_striker_id, inns.striker_id

    sync_player_flags(inns)

    if inns.number == 2:
        first = Innings.query.filter_by(match_id=m.id, number=1).first()
        if first and (inns.runs > first.runs):
            inns.completed = True
            m.status = f"Completed - {inns.batting_team.name} won by {10 - inns.wickets} wickets"
            db.session.commit()
            flash(m.status)
            return redirect(url_for('match', match_id=match_id))

    if (inns.legal_balls or 0) >= m.overs * 6 or (inns.wickets or 0) >= 10:
        inns.completed = True
        if inns.number == 1:
            target = (inns.runs or 0) + 1
            flash(f'Innings {inns.number} completed. Target: {target} runs.')
            second = Innings(match_id=m.id, number=2, batting_team_id=inns.bowling_team_id, bowling_team_id=inns.batting_team_id)
            db.session.add(second)
        else:
            winner_text = compute_winner_text(m)
            m.status = f"Completed - {winner_text}" if winner_text else 'Completed'
            flash(m.status)

    db.session.commit()
    return redirect(url_for('match', match_id=match_id))

# End innings early
@app.route('/matches/<int:match_id>/end_innings', methods=['POST'])
def end_innings(match_id):
    m = Match.query.get_or_404(match_id)
    inns = get_active_innings(m)
    if not inns:
        flash('No active innings to end')
        return redirect(url_for('match', match_id=match_id))
    inns.completed = True
    if inns.number == 1:
        target = (inns.runs or 0) + 1
        flash(f'Innings {inns.number} ended early. Target: {target} runs.')
        second = Innings(match_id=m.id, number=2, batting_team_id=inns.bowling_team_id, bowling_team_id=inns.batting_team_id)
        db.session.add(second)
    else:
        winner_text = compute_winner_text(m)
        m.status = f"Completed - {winner_text}" if winner_text else 'Completed'
        flash(m.status)
    db.session.commit()
    return redirect(url_for('match', match_id=match_id))

# Set striker
@app.route('/matches/<int:match_id>/set_striker', methods=['POST'])
def set_striker(match_id):
    pid = int(request.form['player_id'])
    m = Match.query.get_or_404(match_id)
    inns = get_active_innings(m)
    if not inns:
        flash('No active innings')
        return redirect(url_for('match', match_id=match_id))
    ensure_player_innings(inns, pid)
    inns.striker_id = pid
    sync_player_flags(inns)
    db.session.commit()
    flash('Striker set')
    return redirect(url_for('match', match_id=match_id))

# Switch / Retire / End match
@app.route('/matches/<int:match_id>/switch_batsman', methods=['POST'])
def switch_batsman(match_id):
    pid = int(request.form['player_id'])
    m = Match.query.get_or_404(match_id)
    inns = get_active_innings(m)
    if not inns:
        flash('No active innings')
        return redirect(url_for('match', match_id=match_id))
    ensure_player_innings(inns, pid)
    inns.striker_id = pid
    sync_player_flags(inns)
    db.session.commit()
    flash('Striker changed')
    return redirect(url_for('match', match_id=match_id))

@app.route('/matches/<int:match_id>/retire', methods=['POST'])
def retire_batsman(match_id):
    pid = int(request.form['player_id'])
    inns = get_active_innings(Match.query.get_or_404(match_id))
    if not inns:
        flash('No active innings')
        return redirect(url_for('match', match_id=match_id))
    pi = PlayerInnings.query.filter_by(innings_id=inns.id, player_id=pid).first()
    if pi:
        pi.retired = True
        if inns.striker_id == pid:
            inns.striker_id = None
        if inns.non_striker_id == pid:
            inns.non_striker_id = None
        sync_player_flags(inns)
        db.session.commit()
    return redirect(url_for('match', match_id=match_id))

@app.route('/matches/<int:match_id>/end_match', methods=['POST'])
def end_match(match_id):
    m = Match.query.get_or_404(match_id)
    for ins in m.innings:
        ins.completed = True
    winner_text = compute_winner_text(m)
    m.status = f"Completed - {winner_text}" if winner_text else 'Manually Ended'
    finalize_match(m)
    db.session.commit()
    return redirect(url_for('match_summary', match_id=match_id))

@app.route('/matches/<int:match_id>/summary')
def match_summary(match_id):
    m = Match.query.get_or_404(match_id)
    players_team1 = [mtp.player for mtp in m.match_players if mtp.team_id == m.team1_id]
    players_team2 = [mtp.player for mtp in m.match_players if mtp.team_id == m.team2_id]
    return render_template(
        'match_summary.html',
        match=m,
        players_team1=players_team1,
        players_team2=players_team2
    )


if __name__ == '__main__':
    app.run(debug=True)
