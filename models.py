from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()

class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    career_runs = db.Column(db.Integer, default=0)
    career_wickets = db.Column(db.Integer, default=0)
    career_matches = db.Column(db.Integer, default=0)

class Match(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    team1_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    team2_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    overs = db.Column(db.Integer, default=20, nullable=False)
    status = db.Column(db.String(200), default='Ongoing')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    team1 = db.relationship('Team', foreign_keys=[team1_id])
    team2 = db.relationship('Team', foreign_keys=[team2_id])
    innings = db.relationship('Innings', backref='match', lazy=True, order_by='Innings.number')
    
class Innings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey('match.id'), nullable=False)
    number = db.Column(db.Integer, nullable=False)  # 1 or 2

    batting_team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    bowling_team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)

    runs = db.Column(db.Integer, default=0, nullable=False)
    wickets = db.Column(db.Integer, default=0, nullable=False)
    legal_balls = db.Column(db.Integer, default=0, nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)

    striker_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=True)
    non_striker_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=True)

    batting_team = db.relationship('Team', foreign_keys=[batting_team_id])
    bowling_team = db.relationship('Team', foreign_keys=[bowling_team_id])

    striker = db.relationship('Player', foreign_keys=[striker_id], post_update=True)
    non_striker = db.relationship('Player', foreign_keys=[non_striker_id], post_update=True)

    player_innings = db.relationship('PlayerInnings', backref='innings', lazy=True)
    ball_events = db.relationship('BallEvent', backref='innings', lazy=True)
    bowling_innings = db.relationship('BowlingInnings', backref='innings', lazy=True)
    current_bowler_id = db.Column(db.Integer, nullable=True)
    current_bowler_balls = db.Column(db.Integer, default=0)

class PlayerInnings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    innings_id = db.Column(db.Integer, db.ForeignKey('innings.id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=False)

    runs = db.Column(db.Integer, default=0, nullable=False)
    balls = db.Column(db.Integer, default=0, nullable=False)
    is_striker = db.Column(db.Boolean, default=False, nullable=False)
    is_non_striker = db.Column(db.Boolean, default=False, nullable=False)
    out = db.Column(db.Boolean, default=False, nullable=False)
    retired = db.Column(db.Boolean, default=False, nullable=False)

    player = db.relationship('Player')

class BowlingInnings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    innings_id = db.Column(db.Integer, db.ForeignKey('innings.id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=False)

    balls = db.Column(db.Integer, default=0, nullable=False)              # legal deliveries
    runs_conceded = db.Column(db.Integer, default=0, nullable=False)
    wickets = db.Column(db.Integer, default=0, nullable=False)

    player = db.relationship('Player')

class BallEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    innings_id = db.Column(db.Integer, db.ForeignKey('innings.id'), nullable=False)
    striker_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=True)
    bowler_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=True)
    runs = db.Column(db.Integer, default=0, nullable=False)        # runs off the bat
    extras = db.Column(db.String(20), default='', nullable=True)   # '', 'NB', 'WD', 'NB+4' etc
    wicket_type = db.Column(db.String(50), nullable=True)          # 'bowled','caught','run-out'
    wicket_taker_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    striker = db.relationship('Player', foreign_keys=[striker_id])
    bowler = db.relationship('Player', foreign_keys=[bowler_id])
    wicket_taker = db.relationship('Player', foreign_keys=[wicket_taker_id])

class MatchTeamPlayer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey('match.id'), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=False)

    match = db.relationship('Match', backref='match_players')
    team = db.relationship('Team')
    player = db.relationship('Player')
