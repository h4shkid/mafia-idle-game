// UI Management and Updates - Updated for Tap Mechanic
const UI = {
    // Initialize UI elements and event listeners
    init() {
        this.setupEventListeners();
        this.updateAll();
        console.log('UI initialized');
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Tap button - main interaction
        const tapButton = document.getElementById('tap-button');
        if (tapButton) {
            // Support both mouse and touch events
            tapButton.addEventListener('click', (e) => {
                e.preventDefault();
                Game.handleTap();
            });
            
            tapButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                Game.handleTap();
            });
        }
        
        // Prestige button
        const prestigeBtn = document.getElementById('prestige-btn');
        if (prestigeBtn) {
            prestigeBtn.addEventListener('click', () => {
                Game.prestige();
            });
        }
        
        // Control buttons
        const statsBtn = document.getElementById('stats-btn');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => this.showStatsModal());
        }
        
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (SaveSystem.save()) {
                    Game.showNotification('Game saved successfully!');
                }
            });
        }
        
        const leaderboardBtn = document.getElementById('leaderboard-btn');
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => {
                if (typeof Leaderboard !== 'undefined') {
                    Leaderboard.showLeaderboard();
                }
            });
        }
        
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettingsModal());
        }
        
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+S to save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                SaveSystem.save();
                Game.showNotification('Game saved!');
            }
            
            // P for prestige
            if (e.key === 'p' || e.key === 'P') {
                const prestigeBtn = document.getElementById('prestige-btn');
                if (prestigeBtn && !prestigeBtn.disabled) {
                    prestigeBtn.click();
                }
            }
            
            // Space or Enter for tap
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                Game.handleTap();
            }
        });
        
        // Offline modal close
        const collectOfflineBtn = document.getElementById('collect-offline');
        if (collectOfflineBtn) {
            collectOfflineBtn.addEventListener('click', () => {
                const modal = document.getElementById('offline-modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            });
        }
    },
    
    // Update all UI elements
    updateAll() {
        this.updateMoneyDisplay();
        this.updateIncomeDisplay();
        this.updateStatsDisplay();
        this.updateTapButton();
        
        // Update business and upgrade displays (less frequently)
        BusinessSystem.updateBusinessDisplay();
        BusinessSystem.updateUpgradesDisplay();
    },
    
    // Update only essential displays (for frequent updates)
    updateEssential() {
        this.updateMoneyDisplay();
        this.updateIncomeDisplay();
        this.updateTapButton();
    },
    
    // Update money display
    updateMoneyDisplay() {
        const moneyElement = document.getElementById('current-money');
        if (moneyElement) {
            moneyElement.textContent = Game.formatMoney(Game.state.money);
        }
    },
    
    // Update income per second display
    updateIncomeDisplay() {
        const incomeElement = document.getElementById('income-per-second');
        if (incomeElement) {
            const incomePerSecond = BusinessSystem.getTotalIncomePerSecond();
            incomeElement.textContent = Game.formatMoney(incomePerSecond);
        }
    },
    
    // Update stats display
    updateStatsDisplay() {
        const totalEarnedElement = document.getElementById('total-earned');
        if (totalEarnedElement) {
            totalEarnedElement.textContent = Game.formatNumber(Game.state.totalEarned);
        }
        
        const prestigeLevelElement = document.getElementById('prestige-level');
        if (prestigeLevelElement) {
            prestigeLevelElement.textContent = Game.state.prestigeLevel;
        }
        
        const respectAmountElement = document.getElementById('respect-amount');
        if (respectAmountElement) {
            respectAmountElement.textContent = Game.state.respectPoints;
        }
    },
    
    // Update tap button display
    updateTapButton() {
        const tapAmountElement = document.getElementById('tap-amount');
        if (tapAmountElement) {
            const tapIncome = Game.getTapIncome();
            tapAmountElement.textContent = Game.formatNumber(tapIncome);
        }
    },
    
    // Animate tap button
    animateTap() {
        const tapButton = document.getElementById('tap-button');
        const ripple = document.querySelector('.tap-ripple');
        
        if (tapButton) {
            tapButton.classList.add('pulse');
            setTimeout(() => {
                tapButton.classList.remove('pulse');
            }, 500);
        }
        
        if (ripple) {
            ripple.classList.remove('animate');
            // Force reflow
            ripple.offsetHeight;
            ripple.classList.add('animate');
        }
    },
    
    // Animate money gain
    animateMoney() {
        const moneyElement = document.getElementById('current-money');
        if (moneyElement) {
            moneyElement.classList.add('money-animation');
            setTimeout(() => {
                moneyElement.classList.remove('money-animation');
            }, 300);
        }
    },
    
    // Show stats modal
    showStatsModal() {
        const stats = Game.getStats();
        const offlineRate = BusinessSystem.getTotalIncomePerSecond() * 3600; // Per hour
        const saveInfo = SaveSystem.getSaveInfo();
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Empire Statistics</h2>
                <div style="text-align: left; margin: 1rem 0; font-size: 0.9rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <p><strong>Current Money:</strong><br>${Game.formatMoney(stats.currentMoney)}</p>
                            <p><strong>Total Earned:</strong><br>${Game.formatMoney(stats.totalEarned)}</p>
                            <p><strong>Income/Second:</strong><br>${Game.formatMoney(stats.incomePerSecond)}</p>
                            <p><strong>Income/Hour:</strong><br>${Game.formatMoney(offlineRate)}</p>
                        </div>
                        <div>
                            <p><strong>Tap Power:</strong><br>${Game.formatNumber(stats.tapPower)}</p>
                            <p><strong>Tap Income:</strong><br>+${Game.formatMoney(stats.tapIncome)}</p>
                            <p><strong>Prestige Level:</strong><br>${stats.prestigeLevel}</p>
                            <p><strong>Respect Points:</strong><br>${stats.respectPoints}</p>
                        </div>
                    </div>
                    <hr style="margin: 1rem 0; border-color: var(--border-color);">
                    <p><strong>Prestige Multiplier:</strong> ${stats.prestigeMultiplier.toFixed(1)}x</p>
                    <p><strong>Tap Upgrade Cost:</strong> ${Game.formatMoney(stats.tapUpgradeCost)}</p>
                    ${saveInfo ? `
                        <hr style="margin: 1rem 0; border-color: var(--border-color);">
                        <p><strong>Last Save:</strong> ${saveInfo.saveTime}</p>
                        <p><strong>Save Size:</strong> ${(SaveSystem.getSaveSize() / 1024).toFixed(1)} KB</p>
                    ` : ''}
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn btn-secondary" onclick="Game.upgradeTapPower(); this.parentElement.parentElement.parentElement.remove();">
                        Upgrade Tap (${Game.formatMoney(stats.tapUpgradeCost)})
                    </button>
                    <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    // Show settings modal
    showSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Settings</h2>
                <div style="text-align: left; margin: 1rem 0;">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" ${Game.state.settings.sound ? 'checked' : ''} 
                                   onchange="Game.state.settings.sound = this.checked; SaveSystem.save();">
                            <span>Sound Effects</span>
                        </label>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" ${Game.state.settings.notifications ? 'checked' : ''} 
                                   onchange="Game.state.settings.notifications = this.checked; SaveSystem.save();">
                            <span>Notifications</span>
                        </label>
                    </div>
                    <hr style="margin: 1rem 0; border-color: var(--border-color);">
                    <h4 style="color: var(--accent-gold); margin-bottom: 0.5rem;">Save Management</h4>
                    <div style="display: grid; gap: 0.5rem;">
                        <button class="btn btn-secondary" onclick="UI.exportSave()">Export Save</button>
                        <button class="btn btn-secondary" onclick="UI.importSave()">Import Save</button>
                        <button class="btn btn-danger" onclick="if(confirm('Reset entire game?')) { Game.reset(); this.parentElement.parentElement.parentElement.parentElement.remove(); }">
                            Reset Game
                        </button>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    // Export save functionality
    exportSave() {
        const saveData = SaveSystem.exportSave();
        if (saveData) {
            // Create a temporary textarea to copy the save data
            const textarea = document.createElement('textarea');
            textarea.value = saveData;
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                Game.showNotification('Save data copied to clipboard!');
            } catch (err) {
                // Fallback: show save data in a modal
                this.showSaveDataModal(saveData);
            }
            
            document.body.removeChild(textarea);
        }
    },
    
    // Import save functionality
    importSave() {
        const saveString = prompt('Paste your save data here:');
        if (saveString && saveString.trim()) {
            SaveSystem.importSave(saveString.trim());
        }
    },
    
    // Show save data in a modal (fallback for export)
    showSaveDataModal(saveData) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Export Save Data</h2>
                <p>Copy this save data:</p>
                <textarea readonly style="width: 100%; height: 100px; margin: 1rem 0; padding: 0.5rem; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 4px; resize: vertical;">${saveData}</textarea>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Select all text in textarea
        const textarea = modal.querySelector('textarea');
        textarea.focus();
        textarea.select();
    },
    
    // Show offline earnings modal
    showOfflineModal(timeOffline, earnings) {
        const modal = document.getElementById('offline-modal');
        const messageElement = document.getElementById('offline-message');
        const earningsElement = document.getElementById('offline-earnings');
        const collectBtn = document.getElementById('collect-offline');
        
        if (!modal || !messageElement || !earningsElement || !collectBtn) {
            // Fallback if modal elements not found
            Game.addMoney(earnings);
            Game.showNotification(`Offline earnings: ${Game.formatMoney(earnings)}`);
            return;
        }
        
        // Format time away
        const timeAwayText = this.formatTimeAway(timeOffline);
        
        // Update modal content
        messageElement.innerHTML = `You were away for ${timeAwayText}.<br>Your empire earned money while you were gone.`;
        earningsElement.textContent = Game.formatMoney(earnings);
        
        // Show modal
        modal.classList.remove('hidden');
        
        // Handle collect button
        collectBtn.onclick = () => {
            Game.addMoney(earnings);
            modal.classList.add('hidden');
            Game.showNotification(`Collected ${Game.formatMoney(earnings)}!`);
            
            // Update UI
            this.updateAll();
        };
        
        // Auto-collect after 10 seconds
        setTimeout(() => {
            if (!modal.classList.contains('hidden')) {
                collectBtn.click();
            }
        }, 10000);
    },
    
    // Format time away for display
    formatTimeAway(timeMs) {
        const totalSeconds = Math.floor(timeMs / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);
        
        if (totalDays > 0) {
            const hours = totalHours % 24;
            return `${totalDays} day${totalDays > 1 ? 's' : ''} and ${hours} hour${hours !== 1 ? 's' : ''}`;
        } else if (totalHours > 0) {
            const minutes = totalMinutes % 60;
            return `${totalHours} hour${totalHours > 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else if (totalMinutes > 0) {
            const seconds = totalSeconds % 60;
            return `${totalMinutes} minute${totalMinutes > 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`;
        } else {
            return `${totalSeconds} second${totalSeconds !== 1 ? 's' : ''}`;
        }
    }
};