// Cricket Scorer App - Main JavaScript File

class CricketScorer {
    constructor() {
        this.matchData = {
            teams: {
                team1: { name: '', players: [] },
                team2: { name: '', players: [] }
            },
            toss: { winner: '', decision: '' },
            matchFormat: { overs: 20, powerplay: 6 },
            currentMatch: null,
            matchHistory: []
        };
        
        this.currentTab = 'setup';
        this.setupStep = 1;
        this.currentInnings = 0;
        this.ballHistory = [];
        this.isDarkMode = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFromStorage();
        this.updateUI();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!btn.disabled) {
                    this.switchTab(btn.dataset.tab);
                }
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Setup step navigation
        this.setupStepEventListeners();
        
        // Scoring event listeners
        this.setupScoringEventListeners();
        
        // Modal event listeners
        this.setupModalEventListeners();
    }

    setupStepEventListeners() {
        // Team setup
        document.getElementById('add-team1-player').addEventListener('click', () => {
            this.addPlayer('team1');
        });
        
        document.getElementById('add-team2-player').addEventListener('click', () => {
            this.addPlayer('team2');
        });

        // Step navigation buttons
        document.getElementById('next-to-toss').addEventListener('click', () => {
            this.nextSetupStep();
        });
        
        document.getElementById('back-to-teams').addEventListener('click', () => {
            this.prevSetupStep();
        });
        
        document.getElementById('next-to-format').addEventListener('click', () => {
            this.nextSetupStep();
        });
        
        document.getElementById('back-to-toss').addEventListener('click', () => {
            this.prevSetupStep();
        });
        
        document.getElementById('next-to-review').addEventListener('click', () => {
            this.nextSetupStep();
        });
        
        document.getElementById('back-to-format').addEventListener('click', () => {
            this.prevSetupStep();
        });
        
        document.getElementById('start-match').addEventListener('click', () => {
            this.startMatch();
        });

        // Overs selection
        document.querySelectorAll('.overs-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectOvers(parseInt(btn.dataset.overs));
            });
        });

        // Custom overs toggle
        document.getElementById('custom-overs').addEventListener('change', (e) => {
            this.toggleCustomOvers(e.target.checked);
        });

        // Input validation
        document.getElementById('team1-name').addEventListener('input', () => {
            this.validateSetupStep();
        });
        
        document.getElementById('team2-name').addEventListener('input', () => {
            this.validateSetupStep();
        });
        
        document.getElementById('toss-winner').addEventListener('change', () => {
            this.validateSetupStep();
        });
        
        document.getElementById('toss-decision').addEventListener('change', () => {
            this.validateSetupStep();
        });
    }

    setupScoringEventListeners() {
        // Run scoring buttons
        document.querySelectorAll('.run-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addRuns(parseInt(btn.dataset.runs));
            });
        });

        // Extra buttons
        document.querySelectorAll('.extra-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addExtra(btn.dataset.extra);
            });
        });

        // Wicket button
        document.getElementById('wicket-btn').addEventListener('click', () => {
            this.showWicketModal();
        });

        // Control buttons
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undoLastBall();
        });
        
        document.getElementById('change-batsman-btn').addEventListener('click', () => {
            this.showBatsmanModal();
        });
        
        document.getElementById('change-bowler-btn').addEventListener('click', () => {
            this.showBowlerModal();
        });

        // New match button
        document.getElementById('new-match-btn').addEventListener('click', () => {
            this.newMatch();
        });
    }

    setupModalEventListeners() {
        // Wicket modal
        document.querySelectorAll('.wicket-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectWicketType(btn.dataset.wicket);
            });
        });

        document.getElementById('confirm-wicket').addEventListener('click', () => {
            this.confirmWicket();
        });

        document.getElementById('close-wicket-modal').addEventListener('click', () => {
            this.hideModal('wicket-modal');
        });

        // Batsman modal
        document.getElementById('close-batsman-modal').addEventListener('click', () => {
            this.hideModal('batsman-modal');
        });

        // Bowler modal
        document.getElementById('close-bowler-modal').addEventListener('click', () => {
            this.hideModal('bowler-modal');
        });
    }

    // Theme Management
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.documentElement.classList.toggle('dark', this.isDarkMode);
        
        const icon = document.querySelector('#theme-toggle i');
        icon.setAttribute('data-lucide', this.isDarkMode ? 'sun' : 'moon');
        lucide.createIcons();
        
        this.saveToStorage();
    }

    // Tab Management
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('hidden', !content.id.startsWith(tabName));
        });
        
        // Update tab content based on current state
        if (tabName === 'stats') {
            this.updateStatsTab();
        } else if (tabName === 'summary') {
            this.updateSummaryTab();
        }
    }

    // Setup Step Management
    nextSetupStep() {
        if (this.setupStep < 4) {
            this.setupStep++;
            this.updateSetupStep();
        }
    }

    prevSetupStep() {
        if (this.setupStep > 1) {
            this.setupStep--;
            this.updateSetupStep();
        }
    }

    updateSetupStep() {
        // Update step indicators
        document.querySelectorAll('.setup-step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.toggle('bg-green-500', stepNum <= this.setupStep);
            step.classList.toggle('text-white', stepNum <= this.setupStep);
            step.classList.toggle('bg-gray-200', stepNum > this.setupStep);
            step.classList.toggle('text-gray-600', stepNum > this.setupStep);
        });

        // Update step content
        document.querySelectorAll('.setup-step-content').forEach((content, index) => {
            content.classList.toggle('hidden', index + 1 !== this.setupStep);
        });

        // Update specific step content
        if (this.setupStep === 2) {
            this.updateTossOptions();
        } else if (this.setupStep === 4) {
            this.updateMatchSummary();
        }

        this.validateSetupStep();
    }

    validateSetupStep() {
        let isValid = false;
        
        switch (this.setupStep) {
            case 1:
                const team1Name = document.getElementById('team1-name').value.trim();
                const team2Name = document.getElementById('team2-name').value.trim();
                const team1Players = this.getTeamPlayers('team1').filter(p => p.trim());
                const team2Players = this.getTeamPlayers('team2').filter(p => p.trim());
                
                isValid = team1Name && team2Name && team1Players.length >= 1 && team2Players.length >= 1;
                document.getElementById('next-to-toss').disabled = !isValid;
                break;
                
            case 2:
                const tossWinner = document.getElementById('toss-winner').value;
                const tossDecision = document.getElementById('toss-decision').value;
                
                isValid = tossWinner && tossDecision;
                document.getElementById('next-to-format').disabled = !isValid;
                break;
        }
    }

    addPlayer(team) {
        const container = document.getElementById(`${team}-players`);
        const currentPlayers = container.querySelectorAll('input').length;
        
        if (currentPlayers < 11) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'flex items-center space-x-2';
            playerDiv.innerHTML = `
                <input type="text" placeholder="Player ${currentPlayers + 1}" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <button class="remove-player py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            `;
            
            container.appendChild(playerDiv);
            
            // Add remove functionality
            playerDiv.querySelector('.remove-player').addEventListener('click', () => {
                playerDiv.remove();
                this.updatePlayerCount(team);
                this.validateSetupStep();
            });
            
            // Add input validation
            playerDiv.querySelector('input').addEventListener('input', () => {
                this.updatePlayerCount(team);
                this.validateSetupStep();
            });
            
            this.updatePlayerCount(team);
            lucide.createIcons();
        }
    }

    updatePlayerCount(team) {
        const players = this.getTeamPlayers(team).filter(p => p.trim());
        document.getElementById(`${team}-count`).textContent = players.length;
    }

    getTeamPlayers(team) {
        const inputs = document.querySelectorAll(`#${team}-players input`);
        return Array.from(inputs).map(input => input.value.trim());
    }

    updateTossOptions() {
        const team1Name = document.getElementById('team1-name').value.trim();
        const team2Name = document.getElementById('team2-name').value.trim();
        const tossWinner = document.getElementById('toss-winner');
        
        tossWinner.innerHTML = `
            <option value="">Select team</option>
            <option value="${team1Name}">${team1Name}</option>
            <option value="${team2Name}">${team2Name}</option>
        `;
    }

    selectOvers(overs) {
        document.querySelectorAll('.overs-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.overs) === overs);
        });
        
        document.getElementById('custom-overs').checked = false;
        document.getElementById('custom-overs-input').classList.add('hidden');
        
        this.matchData.matchFormat.overs = overs;
        this.updatePowerplayMax();
    }

    toggleCustomOvers(enabled) {
        const customInput = document.getElementById('custom-overs-input');
        customInput.classList.toggle('hidden', !enabled);
        
        if (enabled) {
            document.querySelectorAll('.overs-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            customInput.focus();
        }
    }

    updatePowerplayMax() {
        const powerplayInput = document.getElementById('powerplay-overs');
        const maxPowerplay = Math.floor(this.matchData.matchFormat.overs / 2);
        powerplayInput.max = maxPowerplay;
        
        if (parseInt(powerplayInput.value) > maxPowerplay) {
            powerplayInput.value = maxPowerplay;
        }
    }

    updateMatchSummary() {
        const team1Name = document.getElementById('team1-name').value.trim();
        const team2Name = document.getElementById('team2-name').value.trim();
        const team1Players = this.getTeamPlayers('team1').filter(p => p.trim());
        const team2Players = this.getTeamPlayers('team2').filter(p => p.trim());
        const tossWinner = document.getElementById('toss-winner').value;
        const tossDecision = document.getElementById('toss-decision').value;
        const overs = this.matchData.matchFormat.overs;
        const powerplay = document.getElementById('powerplay-overs').value;
        
        const summaryHTML = `
            <div>
                <h3 class="font-semibold mb-2">Teams</h3>
                <div class="space-y-2">
                    <div class="p-3 bg-green-50 rounded-lg">
                        <div class="font-medium">${team1Name}</div>
                        <div class="text-sm text-gray-600">${team1Players.length} players</div>
                    </div>
                    <div class="p-3 bg-blue-50 rounded-lg">
                        <div class="font-medium">${team2Name}</div>
                        <div class="text-sm text-gray-600">${team2Players.length} players</div>
                    </div>
                </div>
            </div>
            <div>
                <h3 class="font-semibold mb-2">Match Details</h3>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span>Toss Winner:</span>
                        <span class="px-2 py-1 bg-gray-100 rounded text-sm">${tossWinner}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Decision:</span>
                        <span class="px-2 py-1 bg-gray-100 rounded text-sm">${tossDecision === 'bat' ? 'Bat First' : 'Bowl First'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Overs:</span>
                        <span class="px-2 py-1 bg-gray-100 rounded text-sm">${overs}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Powerplay:</span>
                        <span class="px-2 py-1 bg-gray-100 rounded text-sm">${powerplay}</span>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('match-summary').innerHTML = summaryHTML;
    }

    startMatch() {
        // Collect all setup data
        const team1Name = document.getElementById('team1-name').value.trim();
        const team2Name = document.getElementById('team2-name').value.trim();
        const team1Players = this.getTeamPlayers('team1').filter(p => p.trim());
        const team2Players = this.getTeamPlayers('team2').filter(p => p.trim());
        const tossWinner = document.getElementById('toss-winner').value;
        const tossDecision = document.getElementById('toss-decision').value;
        const overs = document.getElementById('custom-overs').checked ? 
            parseInt(document.getElementById('custom-overs-input').value) || 20 : 
            this.matchData.matchFormat.overs;
        const powerplay = parseInt(document.getElementById('powerplay-overs').value);

        // Create match data
        this.matchData = {
            teams: {
                team1: {
                    name: team1Name,
                    players: team1Players.map((name, index) => ({
                        id: `t1_p${index}`,
                        name,
                        stats: {
                            batting: { runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0 },
                            bowling: { overs: 0, runs: 0, wickets: 0, economy: 0 },
                            fielding: { catches: 0, runouts: 0 }
                        }
                    }))
                },
                team2: {
                    name: team2Name,
                    players: team2Players.map((name, index) => ({
                        id: `t2_p${index}`,
                        name,
                        stats: {
                            batting: { runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0 },
                            bowling: { overs: 0, runs: 0, wickets: 0, economy: 0 },
                            fielding: { catches: 0, runouts: 0 }
                        }
                    }))
                }
            },
            toss: { winner: tossWinner, decision: tossDecision },
            matchFormat: { overs, powerplay },
            currentMatch: {
                innings: [
                    {
                        team: tossDecision === 'bat' ? tossWinner : (tossWinner === team1Name ? team2Name : team1Name),
                        balls: [],
                        score: 0,
                        wickets: 0,
                        overs: 0,
                        batsmen: { striker: null, nonStriker: null },
                        bowler: null,
                        completed: false
                    },
                    {
                        team: tossDecision === 'bat' ? (tossWinner === team1Name ? team2Name : team1Name) : tossWinner,
                        balls: [],
                        score: 0,
                        wickets: 0,
                        overs: 0,
                        batsmen: { striker: null, nonStriker: null },
                        bowler: null,
                        completed: false
                    }
                ],
                currentInnings: 0,
                status: 'live'
            }
        };

        // Initialize first innings
        this.initializeInnings();

        // Enable scoring tab and switch to it
        document.querySelector('[data-tab="scoring"]').disabled = false;
        document.querySelector('[data-tab="stats"]').disabled = false;
        this.switchTab('scoring');
        
        this.saveToStorage();
    }

    initializeInnings() {
        const currentInnings = this.matchData.currentMatch.innings[this.currentInnings];
        const battingTeam = this.getBattingTeam();
        const bowlingTeam = this.getBowlingTeam();

        // Set initial batsmen
        currentInnings.batsmen.striker = battingTeam.players[0];
        currentInnings.batsmen.nonStriker = battingTeam.players[1] || battingTeam.players[0];
        
        // Set initial bowler
        currentInnings.bowler = bowlingTeam.players[0];

        this.updateScoringDisplay();
    }

    getBattingTeam() {
        const currentInnings = this.matchData.currentMatch.innings[this.currentInnings];
        return currentInnings.team === this.matchData.teams.team1.name ? 
            this.matchData.teams.team1 : this.matchData.teams.team2;
    }

    getBowlingTeam() {
        const currentInnings = this.matchData.currentMatch.innings[this.currentInnings];
        return currentInnings.team === this.matchData.teams.team1.name ? 
            this.matchData.teams.team2 : this.matchData.teams.team1;
    }

    // Scoring Functions
    addRuns(runs) {
        this.addBall(runs, false, false, false, false, false);
    }

    addExtra(type) {
        switch (type) {
            case 'wide':
                this.addBall(0, true, false, false, false, false);
                break;
            case 'noball':
                this.addBall(0, false, true, false, false, false);
                break;
            case 'bye':
                this.addBall(1, false, false, true, false, false);
                break;
            case 'legbye':
                this.addBall(1, false, false, false, true, false);
                break;
        }
    }

    addBall(runs, isWide = false, isNoBall = false, isBye = false, isLegBye = false, isWicket = false, wicketDetails = null) {
        const currentInnings = this.matchData.currentMatch.innings[this.currentInnings];
        
        const ball = {
            id: Date.now(),
            runs,
            isWide,
            isNoBall,
            isBye,
            isLegBye,
            isWicket,
            wicketDetails,
            striker: currentInnings.batsmen.striker,
            bowler: currentInnings.bowler,
            over: Math.floor(currentInnings.balls.length / 6),
            ballInOver: currentInnings.balls.length % 6
        };

        // Add ball to innings
        currentInnings.balls.push(ball);
        
        // Update score
        currentInnings.score += runs;
        if (isWide || isNoBall) currentInnings.score += 1;
        
        // Update wickets
        if (isWicket) currentInnings.wickets += 1;
        
        // Update overs (only for legal deliveries)
        const wasOverComplete = !isWide && !isNoBall && (currentInnings.balls.filter(b => !b.isWide && !b.isNoBall).length % 6 === 0);
        
        if (!isWide && !isNoBall) {
            const totalLegalBalls = currentInnings.balls.filter(b => !b.isWide && !b.isNoBall).length;
            currentInnings.overs = Math.floor(totalLegalBalls / 6) + (totalLegalBalls % 6) / 10;
        }
        
        // Update player stats
        this.updatePlayerStats(ball);
        
        // Change strike on odd runs (and not wide/no-ball)
        if ((runs % 2 === 1) && !isWide && !isNoBall) {
            this.changeStrike();
        }
        
        // Change strike at end of over
        if (wasOverComplete) {
            this.changeStrike();
            // Prompt for new bowler after over completion
            setTimeout(() => this.showBowlerModal(), 500);
        }
        
        // Add to ball history
        this.ballHistory.unshift(ball);
        if (this.ballHistory.length > 10) {
            this.ballHistory.pop();
        }
        
        // Handle wicket - prompt for new batsman
        if (isWicket) {
            setTimeout(() => this.showBatsmanModal(), 300);
        }
        
        // Check if innings is complete
        this.checkInningsComplete();
        
        // Update display
        this.updateScoringDisplay();
        this.updateBallHistory();
        
        // Save state
        this.saveToStorage();
    }

    updatePlayerStats(ball) {
        const striker = ball.striker;
        const bowler = ball.bowler;
        
        // Update batsman stats
        if (!ball.isBye && !ball.isLegBye && !ball.isWicket) {
            striker.stats.batting.runs += ball.runs;
        }
        if (!ball.isWide && !ball.isNoBall) {
            striker.stats.batting.balls += 1;
        }
        if (ball.runs === 4) striker.stats.batting.fours += 1;
        if (ball.runs === 6) striker.stats.batting.sixes += 1;
        striker.stats.batting.strikeRate = striker.stats.batting.balls > 0 ? 
            (striker.stats.batting.runs / striker.stats.batting.balls * 100).toFixed(2) : 0;
        
        // Update bowler stats
        const currentInnings = this.matchData.currentMatch.innings[this.currentInnings];
        const bowlerBalls = currentInnings.balls.filter(b => b.bowler.id === bowler.id && !b.isWide && !b.isNoBall).length;
        bowler.stats.bowling.overs = Math.floor(bowlerBalls / 6) + (bowlerBalls % 6) / 10;
        bowler.stats.bowling.runs += ball.runs + (ball.isWide || ball.isNoBall ? 1 : 0);
        if (ball.isWicket) bowler.stats.bowling.wickets += 1;
        bowler.stats.bowling.economy = bowler.stats.bowling.overs > 0 ? 
            (bowler.stats.bowling.runs / (Math.floor(bowlerBalls / 6) + (bowlerBalls % 6) / 6)).toFixed(2) : 0;
    }

    changeStrike() {
        const currentInnings = this.matchData.currentMatch.innings[this.currentInnings];
        const temp = currentInnings.batsmen.striker;
        currentInnings.batsmen.striker = currentInnings.batsmen.nonStriker;
        currentInnings.batsmen.nonStriker = temp;
    }

    checkInningsComplete() {
        const currentInnings = this.matchData.currentMatch.innings[this.currentInnings];
        const maxOvers = this.matchData.matchFormat.overs;
        const totalLegalBalls = currentInnings.balls.filter(b => !b.isWide && !b.isNoBall).length;
        
        if (currentInnings.wickets >= 10 || totalLegalBalls >= maxOvers * 6) {
            currentInnings.completed = true;
            
            if (this.currentInnings === 0) {
                // Start second innings
                this.currentInnings = 1;
                this.initializeInnings();
            } else {
                // Match complete
                this.matchData.currentMatch.status = 'completed';
                this.completeMatch();
            }
        }
    }

    completeMatch() {
        // Add to match history
        this.matchData.matchHistory.push(this.matchData.currentMatch);
        this.matchData.currentMatch = null;
        
        // Switch to summary tab
        this.switchTab('summary');
        
        this.saveToStorage();
    }

    updateScoringDisplay() {
        if (!this.matchData.currentMatch) return;
        
        const currentInnings = this.matchData.currentMatch.innings[this.currentInnings];
        const battingTeam = this.getBattingTeam();
        
        // Update score display
        document.getElementById('current-score').textContent = `${currentInnings.score}/${currentInnings.wickets}`;
        document.getElementById('current-overs').textContent = `${currentInnings.overs.toFixed(1)} overs`;
        document.getElementById('batting-team').textContent = `${battingTeam.name} - Innings ${this.currentInnings + 1}`;
        
        // Update target/run rate info
        this.updateTargetInfo();
        
        // Update current players
        document.getElementById('striker-info').innerHTML = `
            <span class="px-2 py-1 bg-green-500 text-white rounded text-xs">*</span>
            <span class="font-medium">${currentInnings.batsmen.striker?.name} (${currentInnings.batsmen.striker?.stats.batting.runs})</span>
        `;
        
        document.getElementById('non-striker-info').innerHTML = `
            <span class="px-2 py-1 border border-gray-300 rounded text-xs"> </span>
            <span>${currentInnings.batsmen.nonStriker?.name} (${currentInnings.batsmen.nonStriker?.stats.batting.runs})</span>
        `;
        
        document.getElementById('bowler-info').textContent = `Bowler: ${currentInnings.bowler?.name}`;
        
        // Update undo button
        document.getElementById('undo-btn').disabled = currentInnings.balls.length === 0;
    }

    updateTargetInfo() {
        const currentInnings = this.matchData.currentMatch.innings[this.currentInnings];
        
        if (this.currentInnings === 1) {
            const target = this.matchData.currentMatch.innings[0].score + 1;
            const remainingRuns = target - currentInnings.score;
            const remainingBalls = this.getRemainingBalls();
            const requiredRunRate = remainingBalls > 0 ? (remainingRuns / (remainingBalls / 6)).toFixed(2) : '0.00';
            
            document.getElementById('target-info').textContent = `Target: ${target}`;
            document.getElementById('target-details').textContent = `Need ${remainingRuns} runs`;
            document.getElementById('run-rate-info').textContent = `RRR: ${requiredRunRate}`;
        } else {
            const currentRunRate = this.getCurrentRunRate();
            const remainingBalls = this.getRemainingBalls();
            
            document.getElementById('target-info').textContent = `Run Rate: ${currentRunRate}`;
            document.getElementById('target-details').textContent = '';
            document.getElementById('run-rate-info').textContent = `Balls remaining: ${remainingBalls}`;
        }
    }

    getCurrentRunRate() {
        const currentInnings = this.matchData.currentMatch.innings[this.currentInnings];
        const totalLegalBalls = currentInnings.balls.filter(b => !b.isWide && !b.isNoBall).length;
        const overs = Math.floor(totalLegalBalls / 6) + (totalLegalBalls % 6) / 6;
        return overs > 0 ? (currentInnings.score / overs).toFixed(2) : '0.00';
    }

    getRemainingBalls() {
        const currentInnings = this.matchData.currentMatch.innings[this.currentInnings];
        const totalLegalBalls = currentInnings.balls.filter(b => !b.isWide && !b.isNoBall).length;
        return (this.matchData.matchFormat.overs * 6) - totalLegalBalls;
    }

    updateBallHistory() {
        const historyContainer = document.getElementById('ball-history');
        const historyContent = document.getElementById('ball-history-content');
        
        if (this.ballHistory.length > 0) {
            historyContainer.classList.remove('hidden');
            
            historyContent.innerHTML = this.ballHistory.map(ball => {
                let displayText = '';
                let className = 'px-2 py-1 rounded text-sm ';
                
                if (ball.isWicket) {
                    displayText = 'W';
                    className += 'bg-red-500 text-white';
                } else if (ball.isWide) {
                    displayText = `${ball.runs}W`;
                    className += 'bg-yellow-500 text-white';
                } else if (ball.isNoBall) {
                    displayText = `${ball.runs}NB`;
                    className += 'bg-orange-500 text-white';
                } else if (ball.isBye) {
                    displayText = `${ball.runs}B`;
                    className += 'bg-blue-500 text-white';
                } else if (ball.isLegBye) {
                    displayText = `${ball.runs}LB`;
                    className += 'bg-indigo-500 text-white';
                } else if (ball.runs === 4) {
                    displayText = '4';
                    className += 'bg-blue-600 text-white';
                } else if (ball.runs === 6) {
                    displayText = '6';
                    className += 'bg-purple-600 text-white';
                } else {
                    displayText = ball.runs.toString();
                    className += 'bg-gray-500 text-white';
                }
                
                return `<span class="${className}">${displayText}</span>`;
            }).join('');
        } else {
            historyContainer.classList.add('hidden');
        }
    }

    undoLastBall() {
        if (!this.matchData.currentMatch || this.ballHistory.length === 0) return;
        
        const currentInnings = this.matchData.currentMatch.innings[this.currentInnings];
        const lastBall = currentInnings.balls.pop();
        
        // Reverse score changes
        currentInnings.score -= lastBall.runs;
        if (lastBall.isWide || lastBall.isNoBall) currentInnings.score -= 1;
        
        // Reverse wicket
        if (lastBall.isWicket) currentInnings.wickets -= 1;
        
        // Recalculate overs
        const totalLegalBalls = currentInnings.balls.filter(b => !b.isWide && !b.isNoBall).length;
        currentInnings.overs = Math.floor(totalLegalBalls / 6) + (totalLegalBalls % 6) / 10;
        
        // Remove from ball history
        this.ballHistory.shift();
        
        // Update display
        this.updateScoringDisplay();
        this.updateBallHistory();
        
        this.saveToStorage();
    }

    // Modal Management
    showWicketModal() {
        this.showModal('wicket-modal');
        this.populateFielderSelect();
    }

    showBatsmanModal() {
        this.showModal('batsman-modal');
        this.populateBatsmanList();
    }

    showBowlerModal() {
        this.showModal('bowler-modal');
        this.populateBowlerList();
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
        document.getElementById(modalId).classList.add('flex');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
        document.getElementById(modalId).classList.remove('flex');
        
        // Reset modal state
        if (modalId === 'wicket-modal') {
            document.getElementById('fielder-selection').classList.add('hidden');
            document.getElementById('fielder-select').value = '';
            document.getElementById('confirm-wicket').disabled = true;
        }
    }

    selectWicketType(wicketType) {
        if (wicketType === 'caught' || wicketType === 'runout') {
            document.getElementById('fielder-selection').classList.remove('hidden');
            this.selectedWicketType = wicketType;
        } else {
            this.addBall(0, false, false, false, false, true, { type: wicketType });
            this.hideModal('wicket-modal');
            this.showBatsmanModal();
        }
    }

    populateFielderSelect() {
        const bowlingTeam = this.getBowlingTeam();
        const fielderSelect = document.getElementById('fielder-select');
        
        fielderSelect.innerHTML = '<option value="">Choose fielder</option>';
        bowlingTeam.players.forEach(player => {
            fielderSelect.innerHTML += `<option value="${player.name}">${player.name}</option>`;
        });
        
        fielderSelect.addEventListener('change', () => {
            document.getElementById('confirm-wicket').disabled = !fielderSelect.value;
        });
    }

    confirmWicket() {
        const fielder = document.getElementById('fielder-select').value;
        const wicketDetails = {
            type: this.selectedWicketType,
            fielder
        };
        
        // Update fielder stats
        const bowlingTeam = this.getBowlingTeam();
        const fielderPlayer = bowlingTeam.players.find(p => p.name === fielder);
        if (fielderPlayer) {
            if (this.selectedWicketType === 'caught') {
                fielderPlayer.stats.fielding.catches += 1;
            } else if (this.selectedWicketType === 'runout') {
                fielderPlayer.stats.fielding.runouts += 1;
            }
        }
        
        this.addBall(0, false, false, false, false, true, wicketDetails);
        this.hideModal('wicket-modal');
        this.showBatsmanModal();
    }

    populateBatsmanList() {
        const battingTeam = this.getBattingTeam();
        const currentInnings = this.matchData.currentMatch.innings[this.currentInnings];
        const batsmanList = document.getElementById('batsman-list');
        
        // Show all players from batting team (including current batsmen for switching)
        const allBatsmen = battingTeam.players;
        
        batsmanList.innerHTML = allBatsmen.map(player => {
            const isCurrent = player.id === currentInnings.batsmen.striker?.id || 
                             player.id === currentInnings.batsmen.nonStriker?.id;
            const statusText = isCurrent ? ' (Currently Playing)' : '';
            
            return `
                <button class="w-full py-3 px-4 text-left border border-gray-300 rounded-md hover:bg-gray-50 transition-colors ${isCurrent ? 'bg-green-50 border-green-300' : ''}" 
                        onclick="cricketScorer.selectNewBatsman('${player.id}')">
                    <div class="font-medium">${player.name}${statusText}</div>
                    <div class="text-sm text-gray-500">${player.stats.batting.runs} runs (${player.stats.batting.balls} balls)</div>
                </button>
            `;
        }).join('');
    }

    selectNewBatsman(playerId) {
        const battingTeam = this.getBattingTeam();
        const newBatsman = battingTeam.players.find(p => p.id === playerId);
        
        if (newBatsman) {
            const currentInnings = this.matchData.currentMatch.innings[this.currentInnings];
            
            // If the selected player is already non-striker, just switch strike
            if (newBatsman.id === currentInnings.batsmen.nonStriker?.id) {
                this.changeStrike();
            } else if (newBatsman.id !== currentInnings.batsmen.striker?.id) {
                // Replace the current striker with the new batsman
                currentInnings.batsmen.striker = newBatsman;
            }
            
            this.updateScoringDisplay();
        }
        
        this.hideModal('batsman-modal');
    }

    populateBowlerList() {
        const bowlingTeam = this.getBowlingTeam();
        const bowlerList = document.getElementById('bowler-list');
        
        bowlerList.innerHTML = bowlingTeam.players.map(player => `
            <button class="w-full py-2 px-4 text-left border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" 
                    onclick="cricketScorer.selectNewBowler('${player.id}')">
                ${player.name}
            </button>
        `).join('');
    }

    selectNewBowler(playerId) {
        const bowlingTeam = this.getBowlingTeam();
        const newBowler = bowlingTeam.players.find(p => p.id === playerId);
        
        if (newBowler) {
            const currentInnings = this.matchData.currentMatch.innings[this.currentInnings];
            currentInnings.bowler = newBowler;
            this.updateScoringDisplay();
        }
        
        this.hideModal('bowler-modal');
    }

    // Stats Tab
    updateStatsTab() {
        if (!this.matchData.currentMatch) {
            document.getElementById('stats-content').innerHTML = `
                <div class="text-center py-16 text-gray-500">
                    Start scoring to see live statistics
                </div>
            `;
            return;
        }

        const battingTeam = this.getBattingTeam();
        const bowlingTeam = this.getBowlingTeam();
        
        const battingStats = battingTeam.players
            .filter(p => p.stats.batting.balls > 0)
            .sort((a, b) => b.stats.batting.runs - a.stats.batting.runs);
            
        const bowlingStats = bowlingTeam.players
            .filter(p => p.stats.bowling.overs > 0)
            .sort((a, b) => b.stats.bowling.wickets - a.stats.bowling.wickets);

        const statsHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Batting Stats -->
                <div class="bg-white rounded-lg shadow-sm border p-6">
                    <h3 class="text-lg font-semibold mb-4">Batting Performance</h3>
                    <div class="space-y-4">
                        ${battingStats.map(player => `
                            <div class="p-4 border rounded-lg">
                                <div class="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 class="font-semibold">${player.name}</h4>
                                        <div class="flex items-center space-x-4 text-sm text-gray-600">
                                            <span>Runs: ${player.stats.batting.runs}</span>
                                            <span>Balls: ${player.stats.batting.balls}</span>
                                            <span>SR: ${player.stats.batting.strikeRate}</span>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-2xl font-bold text-green-600">${player.stats.batting.runs}</div>
                                        <div class="text-sm text-gray-500">(${player.stats.batting.balls})</div>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-4 mb-2">
                                    <div class="flex items-center space-x-1">
                                        <div class="w-3 h-3 bg-blue-500 rounded"></div>
                                        <span class="text-sm">4s: ${player.stats.batting.fours}</span>
                                    </div>
                                    <div class="flex items-center space-x-1">
                                        <div class="w-3 h-3 bg-purple-500 rounded"></div>
                                        <span class="text-sm">6s: ${player.stats.batting.sixes}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Bowling Stats -->
                <div class="bg-white rounded-lg shadow-sm border p-6">
                    <h3 class="text-lg font-semibold mb-4">Bowling Performance</h3>
                    <div class="space-y-4">
                        ${bowlingStats.map(player => `
                            <div class="p-4 border rounded-lg">
                                <div class="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 class="font-semibold">${player.name}</h4>
                                        <div class="flex items-center space-x-4 text-sm text-gray-600">
                                            <span>Overs: ${player.stats.bowling.overs}</span>
                                            <span>Runs: ${player.stats.bowling.runs}</span>
                                            <span>Econ: ${player.stats.bowling.economy}</span>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-2xl font-bold text-red-600">${player.stats.bowling.wickets}</div>
                                        <div class="text-sm text-gray-500">wickets</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('stats-content').innerHTML = statsHTML;
    }

    // Summary Tab
    updateSummaryTab() {
        if (this.matchData.matchHistory.length === 0) {
            document.getElementById('summary-content').innerHTML = `
                <div class="bg-white rounded-lg shadow-sm border p-16 text-center">
                    <i data-lucide="trophy" class="w-16 h-16 text-gray-400 mx-auto mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-600 mb-2">No matches completed yet</h3>
                    <p class="text-gray-500 mb-6">Complete your first match to see the summary and star performers here</p>
                    <button id="new-match-btn" class="py-2 px-6 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                        <i data-lucide="plus" class="w-4 h-4 inline mr-2"></i>Start New Match
                    </button>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        const latestMatch = this.matchData.matchHistory[this.matchData.matchHistory.length - 1];
        const result = this.getMatchResult(latestMatch);
        const stars = this.calculateStarPerformers(latestMatch);

        const summaryHTML = `
            <!-- Latest Match Result -->
            <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div class="flex items-center space-x-2 mb-4">
                    <i data-lucide="trophy" class="w-6 h-6 text-yellow-500"></i>
                    <h3 class="text-xl font-semibold">Latest Match Result</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="text-lg font-bold mb-4">${latestMatch.teams.team1.name} vs ${latestMatch.teams.team2.name}</h4>
                        <div class="space-y-2">
                            ${latestMatch.innings.map((innings, index) => `
                                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span class="font-medium">${innings.team}</span>
                                    <span class="px-3 py-1 bg-white border rounded text-lg">${innings.score}/${innings.wickets} (${innings.overs.toFixed(1)})</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="flex flex-col justify-center items-center">
                        <div class="text-3xl font-bold text-green-600 mb-2">${result}</div>
                        <div class="flex space-x-2">
                            <button onclick="cricketScorer.shareMatch()" class="py-1 px-3 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                                <i data-lucide="share" class="w-3 h-3 inline mr-1"></i>Share
                            </button>
                            <button onclick="cricketScorer.downloadMatch()" class="py-1 px-3 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                                <i data-lucide="download" class="w-3 h-3 inline mr-1"></i>Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Star Performers -->
            ${stars ? `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    ${stars.playerOfMatch ? `
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                            <div class="flex items-center justify-center space-x-2 text-yellow-700 mb-2">
                                <i data-lucide="trophy" class="w-5 h-5"></i>
                                <span class="text-sm font-semibold">Player of the Match</span>
                            </div>
                            <div class="text-lg font-bold">${stars.playerOfMatch.name}</div>
                            <div class="text-sm text-gray-600">
                                ${stars.playerOfMatch.stats.batting.runs > 0 ? `${stars.playerOfMatch.stats.batting.runs} runs` : ''}
                                ${stars.playerOfMatch.stats.batting.runs > 0 && stars.playerOfMatch.stats.bowling.wickets > 0 ? ', ' : ''}
                                ${stars.playerOfMatch.stats.bowling.wickets > 0 ? `${stars.playerOfMatch.stats.bowling.wickets} wickets` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${stars.starBatsman ? `
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <div class="flex items-center justify-center space-x-2 text-green-700 mb-2">
                                <i data-lucide="target" class="w-5 h-5"></i>
                                <span class="text-sm font-semibold">Star Batsman</span>
                            </div>
                            <div class="text-lg font-bold">${stars.starBatsman.name}</div>
                            <div class="text-sm text-gray-600">${stars.starBatsman.stats.batting.runs} runs</div>
                        </div>
                    ` : ''}
                    
                    ${stars.starBowler ? `
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <div class="flex items-center justify-center space-x-2 text-red-700 mb-2">
                                <i data-lucide="activity" class="w-5 h-5"></i>
                                <span class="text-sm font-semibold">Star Bowler</span>
                            </div>
                            <div class="text-lg font-bold">${stars.starBowler.name}</div>
                            <div class="text-sm text-gray-600">${stars.starBowler.stats.bowling.wickets} wickets</div>
                        </div>
                    ` : ''}
                    
                    ${stars.starFielder ? `
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <div class="flex items-center justify-center space-x-2 text-blue-700 mb-2">
                                <i data-lucide="users" class="w-5 h-5"></i>
                                <span class="text-sm font-semibold">Star Fielder</span>
                            </div>
                            <div class="text-lg font-bold">${stars.starFielder.name}</div>
                            <div class="text-sm text-gray-600">${stars.starFielder.stats.fielding.catches} catches, ${stars.starFielder.stats.fielding.runouts} run-outs</div>
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            <!-- New Match Button -->
            <div class="text-center">
                <button id="new-match-btn" class="py-3 px-8 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold">
                    <i data-lucide="plus" class="w-5 h-5 inline mr-2"></i>Start New Match
                </button>
            </div>
        `;
        
        document.getElementById('summary-content').innerHTML = summaryHTML;
        lucide.createIcons();
    }

    getMatchResult(match) {
        if (!match || !match.innings || match.innings.length < 2) return 'Match in progress';
        
        const innings1 = match.innings[0];
        const innings2 = match.innings[1];
        
        if (innings2.score > innings1.score) {
            const wicketsLeft = 10 - innings2.wickets;
            return `${innings2.team} won by ${wicketsLeft} wickets`;
        } else if (innings1.score > innings2.score) {
            const margin = innings1.score - innings2.score;
            return `${innings1.team} won by ${margin} runs`;
        } else {
            return 'Match tied';
        }
    }

    calculateStarPerformers(match) {
        if (!match || !match.innings) return null;

        const allPlayers = [...match.teams.team1.players, ...match.teams.team2.players];
        
        // Player of the Match calculation
        const playerScores = allPlayers.map(player => {
            let score = 0;
            
            // Batting contribution
            if (player.stats.batting.runs > 0) {
                score += player.stats.batting.runs * 1.5;
                if (player.stats.batting.strikeRate > 120) score += 10;
                if (player.stats.batting.runs >= 50) score += 25;
                if (player.stats.batting.runs >= 100) score += 50;
            }
            
            // Bowling contribution
            if (player.stats.bowling.wickets > 0) {
                score += player.stats.bowling.wickets * 20;
                if (player.stats.bowling.economy < 6) score += 15;
                if (player.stats.bowling.wickets >= 3) score += 20;
                if (player.stats.bowling.wickets >= 5) score += 40;
            }
            
            // Fielding contribution
            score += player.stats.fielding.catches * 10;
            score += player.stats.fielding.runouts * 15;
            
            // Special bonus for players named Rohit (as requested)
            if (player.name.toLowerCase().includes('rohit')) {
                score += 25;
            }
            
            return { ...player, performanceScore: score };
        });

        playerScores.sort((a, b) => b.performanceScore - a.performanceScore);

        // Star Batsman
        const starBatsman = allPlayers
            .filter(p => p.stats.batting.runs > 0)
            .sort((a, b) => {
                const aScore = a.stats.batting.runs + (a.stats.batting.strikeRate / 10);
                const bScore = b.stats.batting.runs + (b.stats.batting.strikeRate / 10);
                return bScore - aScore;
            })[0];

        // Star Bowler
        const starBowler = allPlayers
            .filter(p => p.stats.bowling.wickets > 0)
            .sort((a, b) => {
                const aScore = (a.stats.bowling.wickets * 10) - parseFloat(a.stats.bowling.economy);
                const bScore = (b.stats.bowling.wickets * 10) - parseFloat(b.stats.bowling.economy);
                return bScore - aScore;
            })[0];

        // Star Fielder
        const starFielder = allPlayers
            .filter(p => p.stats.fielding.catches > 0 || p.stats.fielding.runouts > 0)
            .sort((a, b) => {
                const aDismissals = a.stats.fielding.catches + a.stats.fielding.runouts;
                const bDismissals = b.stats.fielding.catches + b.stats.fielding.runouts;
                return bDismissals - aDismissals;
            })[0];

        return {
            playerOfMatch: playerScores[0],
            starBatsman,
            starBowler,
            starFielder
        };
    }

    shareMatch() {
        const latestMatch = this.matchData.matchHistory[this.matchData.matchHistory.length - 1];
        const summary = this.generateMatchSummary(latestMatch);
        
        if (navigator.share) {
            navigator.share({
                title: 'Cricket Match Summary',
                text: summary
            });
        } else {
            navigator.clipboard.writeText(summary).then(() => {
                alert('Match summary copied to clipboard!');
            });
        }
    }

    downloadMatch() {
        const latestMatch = this.matchData.matchHistory[this.matchData.matchHistory.length - 1];
        const summary = this.generateMatchSummary(latestMatch);
        
        const blob = new Blob([summary], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cricket-match-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateMatchSummary(match) {
        const result = this.getMatchResult(match);
        const stars = this.calculateStarPerformers(match);
        
        let summary = `🏏 CRICKET MATCH SUMMARY 🏏\n\n`;
        summary += `${match.teams.team1.name} vs ${match.teams.team2.name}\n`;
        summary += `${match.matchFormat.overs} overs per side\n\n`;
        
        // Innings details
        match.innings.forEach((innings, index) => {
            summary += `${innings.team}: ${innings.score}/${innings.wickets} (${innings.overs.toFixed(1)} overs)\n`;
        });
        
        summary += `\n${result}\n\n`;
        
        // Star performers
        if (stars) {
            summary += `⭐ STAR PERFORMERS ⭐\n`;
            if (stars.playerOfMatch) {
                summary += `🏆 Player of the Match: ${stars.playerOfMatch.name}\n`;
            }
            if (stars.starBatsman) {
                summary += `🏏 Star Batsman: ${stars.starBatsman.name} (${stars.starBatsman.stats.batting.runs} runs)\n`;
            }
            if (stars.starBowler) {
                summary += `⚡ Star Bowler: ${stars.starBowler.name} (${stars.starBowler.stats.bowling.wickets} wickets)\n`;
            }
            if (stars.starFielder) {
                summary += `🥅 Star Fielder: ${stars.starFielder.name}\n`;
            }
        }
        
        summary += `\n📱 Scored with Cricket Scorer App`;
        
        return summary;
    }

    newMatch() {
        // Reset all data
        this.matchData = {
            teams: {
                team1: { name: '', players: [] },
                team2: { name: '', players: [] }
            },
            toss: { winner: '', decision: '' },
            matchFormat: { overs: 20, powerplay: 6 },
            currentMatch: null,
            matchHistory: this.matchData.matchHistory // Keep match history
        };
        
        this.currentInnings = 0;
        this.setupStep = 1;
        this.ballHistory = [];
        
        // Reset UI
        this.resetSetupForm();
        
        // Disable tabs
        document.querySelector('[data-tab="scoring"]').disabled = true;
        document.querySelector('[data-tab="stats"]').disabled = true;
        
        // Switch to setup tab
        this.switchTab('setup');
        
        this.saveToStorage();
    }

    resetSetupForm() {
        // Clear team names
        document.getElementById('team1-name').value = '';
        document.getElementById('team2-name').value = '';
        
        // Reset player lists
        document.getElementById('team1-players').innerHTML = `
            <div class="flex items-center space-x-2">
                <input type="text" placeholder="Player 1" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
            </div>
        `;
        document.getElementById('team2-players').innerHTML = `
            <div class="flex items-center space-x-2">
                <input type="text" placeholder="Player 1" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
            </div>
        `;
        
        // Reset counts
        document.getElementById('team1-count').textContent = '0';
        document.getElementById('team2-count').textContent = '0';
        
        // Reset toss
        document.getElementById('toss-winner').value = '';
        document.getElementById('toss-decision').value = '';
        
        // Reset format
        document.querySelectorAll('.overs-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.overs === '20');
        });
        document.getElementById('custom-overs').checked = false;
        document.getElementById('custom-overs-input').classList.add('hidden');
        document.getElementById('powerplay-overs').value = '6';
        
        // Reset step
        this.updateSetupStep();
    }

    // Storage Management
    saveToStorage() {
        try {
            localStorage.setItem('cricketScorerData', JSON.stringify({
                matchData: this.matchData,
                currentTab: this.currentTab,
                setupStep: this.setupStep,
                currentInnings: this.currentInnings,
                ballHistory: this.ballHistory,
                isDarkMode: this.isDarkMode
            }));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('cricketScorerData');
            if (saved) {
                const data = JSON.parse(saved);
                this.matchData = data.matchData || this.matchData;
                this.currentTab = data.currentTab || 'setup';
                this.setupStep = data.setupStep || 1;
                this.currentInnings = data.currentInnings || 0;
                this.ballHistory = data.ballHistory || [];
                this.isDarkMode = data.isDarkMode || false;
                
                // Apply theme
                if (this.isDarkMode) {
                    document.documentElement.classList.add('dark');
                    const icon = document.querySelector('#theme-toggle i');
                    icon.setAttribute('data-lucide', 'sun');
                }
            }
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
        }
    }

    updateUI() {
        // Update tabs based on current state
        if (this.matchData.currentMatch) {
            document.querySelector('[data-tab="scoring"]').disabled = false;
            document.querySelector('[data-tab="stats"]').disabled = false;
        }
        
        // Switch to current tab
        this.switchTab(this.currentTab);
        
        // Update setup step if in setup
        if (this.currentTab === 'setup') {
            this.updateSetupStep();
        }
        
        // Update scoring display if in scoring
        if (this.currentTab === 'scoring' && this.matchData.currentMatch) {
            this.updateScoringDisplay();
            this.updateBallHistory();
        }
    }
}

// Initialize the app
const cricketScorer = new CricketScorer();