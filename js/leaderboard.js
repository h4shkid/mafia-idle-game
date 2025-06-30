// Leaderboard System
const Leaderboard = {
    // Mock leaderboard API endpoint (would be replaced with real backend)
    API_URL: 'https://api.example.com/mafia-idle-leaderboard',
    
    // Local leaderboard storage for offline mode
    LOCAL_LEADERBOARD_KEY: 'mafiaIdleLeaderboard',
    
    // Initialize leaderboard system
    init() {
        console.log('Leaderboard system initialized');
        this.addLeaderboardUI();
    },
    
    // Submit score to leaderboard
    async submitScore(playerName = 'Anonymous Boss') {
        const score = {
            name: playerName.substring(0, 20), // Limit name length
            totalEarned: Game.state.totalEarned,
            prestigeLevel: Game.state.prestigeLevel,
            respectPoints: Game.state.respectPoints,
            timestamp: Date.now()
        };
        
        // Basic validation
        if (score.totalEarned <= 0) {
            Game.showNotification('Nothing to submit yet!');
            return false;
        }
        
        try {
            // Try to submit to real API first
            const submitted = await this.submitToAPI(score);
            if (submitted) {
                Game.showNotification('Score submitted to global leaderboard!');
                return true;
            }
        } catch (error) {
            console.log('API unavailable, using local leaderboard');
        }
        
        // Fallback to local leaderboard
        this.submitToLocal(score);
        Game.showNotification('Score saved to local leaderboard!');
        return true;
    },
    
    // Submit to API (mock implementation)
    async submitToAPI(score) {
        // This would be a real API call in production
        // For now, just simulate network delay and success/failure
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate 80% success rate
                const success = Math.random() > 0.2;
                resolve(success);
            }, 1000 + Math.random() * 2000);
        });
    },
    
    // Submit to local storage
    submitToLocal(score) {
        try {
            let leaderboard = this.getLocalLeaderboard();
            
            // Add new score
            leaderboard.push(score);
            
            // Sort by total earned (descending)
            leaderboard.sort((a, b) => b.totalEarned - a.totalEarned);
            
            // Keep only top 100 scores
            leaderboard = leaderboard.slice(0, 100);
            
            // Save back to localStorage
            localStorage.setItem(this.LOCAL_LEADERBOARD_KEY, JSON.stringify(leaderboard));
            
            return true;
        } catch (error) {
            console.error('Failed to save to local leaderboard:', error);
            return false;
        }
    },
    
    // Get local leaderboard
    getLocalLeaderboard() {
        try {
            const data = localStorage.getItem(this.LOCAL_LEADERBOARD_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load local leaderboard:', error);
            return [];
        }
    },
    
    // Get leaderboard data (try API first, fallback to local)
    async getLeaderboard() {
        try {
            // Try to get from API first
            const apiData = await this.getFromAPI();
            if (apiData && apiData.length > 0) {
                return apiData;
            }
        } catch (error) {
            console.log('API unavailable, using local leaderboard');
        }
        
        // Fallback to local leaderboard
        return this.getLocalLeaderboard();
    },
    
    // Get from API (mock implementation)
    async getFromAPI() {
        // This would be a real API call in production
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate API failure 50% of the time
                if (Math.random() > 0.5) {
                    reject(new Error('API unavailable'));
                    return;
                }
                
                // Return mock leaderboard data
                const mockData = this.generateMockLeaderboard();
                resolve(mockData);
            }, 500 + Math.random() * 1000);
        });
    },
    
    // Generate mock leaderboard data for demonstration
    generateMockLeaderboard() {
        const names = [
            'The Don', 'Scarface Tony', 'Lucky Luciano', 'Boss Corleone', 'Big Shot',
            'Smokin\' Joe', 'Fast Eddie', 'Silent Sam', 'Diamond Jim', 'Slick Rick',
            'Tommy Gun', 'Iron Mike', 'Gentleman Jack', 'Mad Dog', 'The Hammer'
        ];
        
        const leaderboard = [];
        for (let i = 0; i < 20; i++) {
            const name = names[Math.floor(Math.random() * names.length)];
            const totalEarned = Math.pow(10, 6 + Math.random() * 6); // $1M to $1T
            const prestigeLevel = Math.floor(Math.random() * 20);
            const respectPoints = Math.floor(totalEarned * 0.001);
            
            leaderboard.push({
                name: `${name} ${i + 1}`,
                totalEarned,
                prestigeLevel,
                respectPoints,
                timestamp: Date.now() - Math.random() * 86400000 * 30 // Random within last 30 days
            });
        }
        
        // Sort by total earned
        leaderboard.sort((a, b) => b.totalEarned - a.totalEarned);
        
        return leaderboard;
    },
    
    // Show leaderboard modal
    async showLeaderboard() {
        // Create loading modal first
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Criminal Leaderboard</h2>
                <div class="loading">Loading leaderboard...</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        try {
            // Get leaderboard data
            const leaderboard = await this.getLeaderboard();
            
            // Update modal content
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
                    <h2>Criminal Leaderboard</h2>
                    <div style="margin: 1rem 0;">
                        ${leaderboard.length === 0 ? 
                            '<p>No scores yet. Be the first to submit!</p>' :
                            this.formatLeaderboardHTML(leaderboard)
                        }
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="Leaderboard.promptSubmitScore()">Submit Score</button>
                        <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
                    </div>
                </div>
            `;
        } catch (error) {
            modal.innerHTML = `
                <div class="modal-content">
                    <h2>Criminal Leaderboard</h2>
                    <div class="error">Failed to load leaderboard. Please try again later.</div>
                    <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
                </div>
            `;
        }
    },
    
    // Format leaderboard as HTML
    formatLeaderboardHTML(leaderboard) {
        let html = `
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--accent-gold);">
                        <th style="padding: 0.5rem; text-align: left;">Rank</th>
                        <th style="padding: 0.5rem; text-align: left;">Boss Name</th>
                        <th style="padding: 0.5rem; text-align: right;">Total Earned</th>
                        <th style="padding: 0.5rem; text-align: center;">Prestige</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        leaderboard.forEach((entry, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? 'top-three' : '';
            const isCurrentPlayer = entry.name === 'You' || 
                (entry.totalEarned === Game.state.totalEarned && 
                 entry.prestigeLevel === Game.state.prestigeLevel);
            
            html += `
                <tr style="border-bottom: 1px solid var(--border-color); ${isCurrentPlayer ? 'background: rgba(255, 215, 0, 0.1);' : ''}" class="${rankClass}">
                    <td style="padding: 0.5rem; font-weight: bold; color: ${rank <= 3 ? 'var(--accent-gold)' : 'inherit'};">
                        ${rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
                    </td>
                    <td style="padding: 0.5rem;">${entry.name}${isCurrentPlayer ? ' (You)' : ''}</td>
                    <td style="padding: 0.5rem; text-align: right; font-family: monospace;">${Game.formatMoney(entry.totalEarned)}</td>
                    <td style="padding: 0.5rem; text-align: center;">${entry.prestigeLevel}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        return html;
    },
    
    // Prompt for score submission
    promptSubmitScore() {
        const playerName = prompt('Enter your boss name for the leaderboard:', 'Anonymous Boss');
        if (playerName !== null) {
            this.submitScore(playerName || 'Anonymous Boss');
        }
    },
    
    // Add leaderboard UI elements
    addLeaderboardUI() {
        // Note: Leaderboard button removed from header to avoid duplication
        // Leaderboard is accessible via footer button only
        
        // Add auto-submit on prestige
        const originalPrestige = Game.prestige;
        Game.prestige = function() {
            const result = originalPrestige.call(this);
            if (result) {
                // Auto-submit score after prestige
                setTimeout(() => {
                    Leaderboard.submitScore('Anonymous Boss');
                }, 1000);
            }
            return result;
        };
    }
};

// Initialize leaderboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        Leaderboard.init();
    }, 200);
});