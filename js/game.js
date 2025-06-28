// Core Game Logic and State Management - Updated for Tap Mechanic
const Game = {
    // Game state
    state: {
        money: 10,
        totalEarned: 0,
        prestigeLevel: 0,
        respectPoints: 0,
        lastSave: Date.now(),
        tapPower: 1, // Base tap income
        settings: {
            sound: true,
            notifications: true
        }
    },

    // Game constants
    constants: {
        SAVE_INTERVAL: 5000, // Auto-save every 5 seconds
        UI_UPDATE_INTERVAL: 500,  // UI update every 500ms (reduced frequency)
        PRESTIGE_THRESHOLD: 1000000, // $1M for first prestige
        RESPECT_RATIO: 0.001, // 1 respect per $1000 earned
        TAP_POWER_UPGRADE_COST: 50, // Cost for first tap upgrade
        CRITICAL_HIT_CHANCE: 0.2, // 20% chance for critical hits
        CRITICAL_MIN_MULTIPLIER: 5, // Minimum critical multiplier
        CRITICAL_MAX_MULTIPLIER: 13 // Maximum critical multiplier
    },

    // Tap popup management
    tapPopupPool: [],
    activeTapPopups: new Set(),

    // Initialize game
    init() {
        console.log('Initializing Mafia Empire...');
        
        // Load save data
        SaveSystem.load();
        
        // Initialize business system
        BusinessSystem.init();
        
        // Check for offline progress
        OfflineProgress.check();
        
        // Initialize UI
        UI.init();
        
        // Start game loops
        this.startGameLoop();
        this.startAutoSave();
        
        console.log('Mafia Empire initialized successfully');
    },

    // Main game loop
    tick() {
        // Update UI
        UI.updateAll();
        
        // Check prestige availability
        this.checkPrestige();
    },

    // Start the main game loop
    startGameLoop() {
        setInterval(() => {
            this.tick();
        }, this.constants.UI_UPDATE_INTERVAL);
    },

    // Start auto-save loop
    startAutoSave() {
        setInterval(() => {
            SaveSystem.save();
        }, this.constants.SAVE_INTERVAL);
    },

    // Handle tap button press
    handleTap() {
        let tapIncome = this.getTapIncome();
        let isCritical = false;
        
        // Check for critical hit
        if (this.isCriticalHit()) {
            const critMultiplier = this.getCriticalMultiplier();
            tapIncome *= critMultiplier;
            isCritical = true;
            
            // Trigger critical visual effects
            this.triggerCriticalEffects();
        }
        
        // Add money and show popup
        this.addMoney(tapIncome);
        this.showTapPopup(tapIncome, isCritical);
        
        // Visual feedback
        UI.animateTap();
        UI.animateMoney();
        
        // Update tap amount display (base amount, not including crit)
        document.getElementById('tap-amount').textContent = this.formatNumber(this.getTapIncome());
    },

    // Calculate current tap income
    getTapIncome() {
        let income = this.state.tapPower;
        
        // Apply prestige multiplier
        income *= this.getPrestigeMultiplier();
        
        // Apply business-based multipliers (tap income scales with business income)
        const businessMultiplier = Math.max(1, BusinessSystem.getTotalIncomePerSecond() * 0.1);
        income *= businessMultiplier;
        
        return Math.floor(income);
    },

    // Create or reuse tap popup element
    getTapPopupElement() {
        let popup = this.tapPopupPool.pop();
        if (!popup) {
            popup = document.createElement('div');
            popup.className = 'tap-popup';
        }
        return popup;
    },

    // Return tap popup to pool
    returnTapPopupToPool(popup) {
        this.activeTapPopups.delete(popup);
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
        // Reset styles
        popup.className = 'tap-popup';
        popup.style.left = '';
        popup.style.top = '';
        popup.textContent = '';
        this.tapPopupPool.push(popup);
    },

    // Show tap income popup
    showTapPopup(amount, isCritical = false) {
        const tapButton = document.getElementById('tap-button');
        if (!tapButton) return;

        const popup = this.getTapPopupElement();
        popup.textContent = `+${this.formatMoney(amount)}`;
        
        if (isCritical) {
            popup.className = 'tap-popup critical';
        }
        
        // Position above the tap button
        const rect = tapButton.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        popup.style.left = (rect.left + scrollLeft + rect.width / 2) + 'px';
        popup.style.top = (rect.top + scrollTop) + 'px';

        // Add to DOM
        document.body.appendChild(popup);
        this.activeTapPopups.add(popup);

        // Remove after animation
        setTimeout(() => {
            this.returnTapPopupToPool(popup);
        }, 1200);
    },

    // Check for critical hit
    isCriticalHit() {
        return Math.random() < this.constants.CRITICAL_HIT_CHANCE;
    },

    // Generate critical multiplier
    getCriticalMultiplier() {
        const min = this.constants.CRITICAL_MIN_MULTIPLIER;
        const max = this.constants.CRITICAL_MAX_MULTIPLIER;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Trigger critical hit effects on button
    triggerCriticalEffects() {
        const tapButton = document.getElementById('tap-button');
        if (!tapButton) return;

        // Add shake effect
        tapButton.classList.add('crit-shake');
        setTimeout(() => {
            tapButton.classList.remove('crit-shake');
        }, 300);

        // Add glow effect
        tapButton.classList.add('crit-glow');
        setTimeout(() => {
            tapButton.classList.remove('crit-glow');
        }, 500);
    },

    // Add money to the game state
    addMoney(amount) {
        if (amount <= 0) return;
        
        this.state.money += amount;
        this.state.totalEarned += amount;
        
        // Update only money display for responsive feedback
        UI.updateMoneyDisplay();
        UI.updateIncomeDisplay();
    },

    // Check if player can afford something
    canAfford(cost) {
        return this.state.money >= cost;
    },

    // Spend money
    spendMoney(amount) {
        if (!this.canAfford(amount)) return false;
        
        this.state.money -= amount;
        return true;
    },

    // Check if prestige is available
    checkPrestige() {
        const threshold = this.constants.PRESTIGE_THRESHOLD * Math.pow(10, this.state.prestigeLevel);
        const canPrestige = this.state.totalEarned >= threshold;
        
        const respectGain = Math.floor(this.state.totalEarned * this.constants.RESPECT_RATIO);
        
        const prestigeBtn = document.getElementById('prestige-btn');
        if (prestigeBtn) {
            prestigeBtn.disabled = !canPrestige;
            prestigeBtn.textContent = canPrestige 
                ? `Prestige (+${respectGain} Respect)`
                : `Prestige`;
        }
    },

    // Perform prestige reset
    prestige() {
        const respectGain = Math.floor(this.state.totalEarned * this.constants.RESPECT_RATIO);
        
        if (respectGain <= 0) {
            this.showNotification("Not enough earnings to prestige!");
            return false;
        }
        
        // Confirmation dialog
        if (!confirm(`Prestige and reset your empire for ${respectGain} Respect points? This will reset all progress but give permanent bonuses.`)) {
            return false;
        }
        
        // Add respect points
        this.state.respectPoints += respectGain;
        this.state.prestigeLevel++;
        
        // Reset progress
        this.state.money = 10;
        this.state.totalEarned = 0;
        this.state.tapPower = 1;
        
        // Reset businesses
        BusinessSystem.reset();
        
        // Update UI
        UI.updateAll();
        
        // Show prestige notification
        this.showNotification(`Prestige! Gained ${respectGain} Respect points. Your empire is reborn stronger!`);
        
        return true;
    },

    // Get prestige multiplier
    getPrestigeMultiplier() {
        return 1 + (this.state.respectPoints * 0.1); // 10% per respect point
    },

    // Upgrade tap power
    upgradeTapPower() {
        const cost = this.getTapUpgradeCost();
        
        if (!this.canAfford(cost)) {
            this.showNotification("Not enough cash!");
            return false;
        }
        
        if (this.spendMoney(cost)) {
            this.state.tapPower += Math.max(1, Math.floor(this.state.tapPower * 0.5));
            this.showNotification("Tap power upgraded!");
            return true;
        }
        
        return false;
    },

    // Calculate tap upgrade cost
    getTapUpgradeCost() {
        return Math.floor(this.constants.TAP_POWER_UPGRADE_COST * Math.pow(2, this.state.tapPower - 1));
    },

    // Format money for display
    formatMoney(amount) {
        if (amount < 1000) return `$${amount.toFixed(0)}`;
        if (amount < 1000000) return `$${(amount / 1000).toFixed(1)}K`;
        if (amount < 1000000000) return `$${(amount / 1000000).toFixed(1)}M`;
        if (amount < 1000000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
        if (amount < 1000000000000000) return `$${(amount / 1000000000000).toFixed(1)}T`;
        return `$${(amount / 1000000000000000).toFixed(1)}Q`;
    },

    // Format numbers for display
    formatNumber(num) {
        if (num < 1000) return num.toFixed(0);
        if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
        if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num < 1000000000000) return `${(num / 1000000000).toFixed(1)}B`;
        if (num < 1000000000000000) return `${(num / 1000000000000).toFixed(1)}T`;
        return `${(num / 1000000000000000).toFixed(1)}Q`;
    },

    // Show notification
    showNotification(message) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-secondary);
            color: var(--accent-gold);
            padding: 1rem;
            border-radius: 4px;
            border: 1px solid var(--accent-gold);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 250px;
            word-wrap: break-word;
            font-size: 0.9rem;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },

    // Reset entire game
    reset() {
        if (confirm('Are you sure you want to reset your entire criminal empire? This cannot be undone!')) {
            // Clear save data
            localStorage.removeItem('mafiaIdleGame');
            
            // Stop business timers
            BusinessSystem.stopIncomeTimers();
            
            // Clean up tap popups
            this.activeTapPopups.forEach(popup => {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
            });
            this.activeTapPopups.clear();
            this.tapPopupPool = [];
            
            // Reset state
            this.state = {
                money: 10,
                totalEarned: 0,
                prestigeLevel: 0,
                respectPoints: 0,
                lastSave: Date.now(),
                tapPower: 1,
                settings: {
                    sound: true,
                    notifications: true
                }
            };
            
            // Reset businesses
            BusinessSystem.reset();
            
            // Update UI
            UI.updateAll();
            
            this.showNotification('Empire reset successfully.');
        }
    },

    // Get stats for display
    getStats() {
        return {
            currentMoney: this.state.money,
            totalEarned: this.state.totalEarned,
            tapPower: this.state.tapPower,
            tapIncome: this.getTapIncome(),
            incomePerSecond: BusinessSystem.getTotalIncomePerSecond(),
            prestigeLevel: this.state.prestigeLevel,
            respectPoints: this.state.respectPoints,
            prestigeMultiplier: this.getPrestigeMultiplier(),
            tapUpgradeCost: this.getTapUpgradeCost()
        };
    }
};

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);