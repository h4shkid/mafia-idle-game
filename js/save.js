// Save/Load System using localStorage
const SaveSystem = {
    SAVE_KEY: 'mafiaIdleGame',
    
    // Save current game state
    save() {
        try {
            const saveData = {
                gameState: Game.state,
                businesses: BusinessSystem.businesses,
                upgrades: BusinessSystem.upgrades,
                version: '2.1.0', // Prestige rebalance version
                saveTime: Date.now()
            };
            
            const saveString = JSON.stringify(saveData);
            localStorage.setItem(this.SAVE_KEY, saveString);
            
            // Update last save time
            Game.state.lastSave = Date.now();
            
            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            Game.showNotification('Failed to save game!');
            return false;
        }
    },
    
    // Load game state
    load() {
        try {
            const saveString = localStorage.getItem(this.SAVE_KEY);
            
            if (!saveString) {
                console.log('No save data found, starting new game');
                return false;
            }
            
            const saveData = JSON.parse(saveString);
            
            // Check version compatibility and migrate if needed
            if (!saveData.version || saveData.version === '1.0.0') {
                console.warn('Save data is from old version, resetting for rebalance');
                localStorage.removeItem(this.SAVE_KEY);
                Game.showNotification('Game reset for rebalance - sorry for the inconvenience!');
                return false;
            } else if (saveData.version === '2.0.0') {
                // Migrate from 2.0.0 to 2.1.0 (prestige rebalance)
                console.log('Migrating save data from 2.0.0 to 2.1.0');
                Game.showNotification('Prestige system rebalanced - bonuses recalculated!');
                // No data reset needed, just formula change
                saveData.version = '2.1.0';
            }
            
            // Validate save data
            if (!this.validateSave(saveData)) {
                console.warn('Save data is invalid, starting new game');
                return false;
            }
            
            // Load game state
            if (saveData.gameState) {
                Object.assign(Game.state, saveData.gameState);
                // Ensure new properties exist
                if (typeof Game.state.tapPower === 'undefined') {
                    Game.state.tapPower = 2;
                }
            }
            
            // Load businesses
            if (saveData.businesses) {
                Object.assign(BusinessSystem.businesses, saveData.businesses);
            }
            
            // Load upgrades
            if (saveData.upgrades) {
                Object.keys(saveData.upgrades).forEach(upgradeId => {
                    if (BusinessSystem.upgrades[upgradeId]) {
                        BusinessSystem.upgrades[upgradeId].purchased = saveData.upgrades[upgradeId].purchased;
                    }
                });
            }
            
            console.log('Game loaded successfully');
            Game.showNotification('Welcome back, Boss!');
            return true;
        } catch (error) {
            console.error('Failed to load game:', error);
            Game.showNotification('Failed to load save data!');
            return false;
        }
    },
    
    // Validate save data structure
    validateSave(saveData) {
        if (!saveData || typeof saveData !== 'object') {
            return false;
        }
        
        // Check for required properties
        if (!saveData.gameState || !saveData.businesses) {
            return false;
        }
        
        // Basic validation of game state
        const state = saveData.gameState;
        if (typeof state.money !== 'number' || 
            typeof state.totalEarned !== 'number' || 
            typeof state.prestigeLevel !== 'number') {
            return false;
        }
        
        // Prevent negative values
        if (state.money < 0 || state.totalEarned < 0 || state.prestigeLevel < 0) {
            return false;
        }
        
        // Basic anti-cheat: reasonable limits
        const MAX_MONEY = 1e20; // 100 quintillion
        const MAX_PRESTIGE = 1000;
        
        if (state.money > MAX_MONEY || 
            state.totalEarned > MAX_MONEY || 
            state.prestigeLevel > MAX_PRESTIGE) {
            console.warn('Save data contains unrealistic values');
            return false;
        }
        
        return true;
    },
    
    // Export save data as string
    exportSave() {
        try {
            const saveData = {
                gameState: Game.state,
                businesses: BusinessSystem.businesses,
                upgrades: BusinessSystem.upgrades,
                version: '2.1.0', // Prestige rebalance version
                saveTime: Date.now()
            };
            
            return btoa(JSON.stringify(saveData)); // Base64 encode
        } catch (error) {
            console.error('Failed to export save:', error);
            return null;
        }
    },
    
    // Import save data from string
    importSave(saveString) {
        try {
            const decoded = atob(saveString); // Base64 decode
            const saveData = JSON.parse(decoded);
            
            if (!this.validateSave(saveData)) {
                Game.showNotification('Invalid save data!');
                return false;
            }
            
            // Store the save data
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            
            // Reload the page to apply changes
            if (confirm('Save imported successfully! Reload page to apply changes?')) {
                location.reload();
            }
            
            return true;
        } catch (error) {
            console.error('Failed to import save:', error);
            Game.showNotification('Failed to import save data!');
            return false;
        }
    },
    
    // Delete save data
    deleteSave() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            console.log('Save data deleted');
            return true;
        } catch (error) {
            console.error('Failed to delete save:', error);
            return false;
        }
    },
    
    // Get save info for display
    getSaveInfo() {
        try {
            const saveString = localStorage.getItem(this.SAVE_KEY);
            if (!saveString) return null;
            
            const saveData = JSON.parse(saveString);
            return {
                version: saveData.version || 'Unknown',
                saveTime: new Date(saveData.saveTime || 0).toLocaleString(),
                money: saveData.gameState?.money || 0,
                totalEarned: saveData.gameState?.totalEarned || 0,
                prestigeLevel: saveData.gameState?.prestigeLevel || 0
            };
        } catch (error) {
            console.error('Failed to get save info:', error);
            return null;
        }
    },
    
    // Check if save exists
    hasSave() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    },
    
    // Get save size in bytes
    getSaveSize() {
        const saveString = localStorage.getItem(this.SAVE_KEY);
        return saveString ? new Blob([saveString]).size : 0;
    }
};

// Auto-save when page is about to unload
window.addEventListener('beforeunload', () => {
    SaveSystem.save();
});

// Save when page loses focus
window.addEventListener('blur', () => {
    SaveSystem.save();
});

// Save when page becomes hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        SaveSystem.save();
    }
});