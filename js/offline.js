// Offline Progress Calculation - Updated for Auto-Income Businesses
const OfflineProgress = {
    // Check for offline progress when game loads
    check() {
        const now = Date.now();
        const lastSave = Game.state.lastSave;
        const timeOffline = now - lastSave;
        
        // Only show offline progress if away for more than 30 seconds
        const MIN_OFFLINE_TIME = 30000; // 30 seconds
        
        if (timeOffline > MIN_OFFLINE_TIME) {
            const offlineEarnings = this.calculateOfflineEarnings(timeOffline);
            
            if (offlineEarnings > 0) {
                UI.showOfflineModal(timeOffline, offlineEarnings);
            }
        }
        
        // Update last save time
        Game.state.lastSave = now;
    },
    
    // Calculate how much money was earned offline
    calculateOfflineEarnings(timeOfflineMs) {
        const timeOfflineSeconds = timeOfflineMs / 1000;
        let totalOfflineEarnings = 0;
        
        // Calculate earnings from each business that has instances
        Object.keys(BusinessSystem.businesses).forEach(businessType => {
            const business = BusinessSystem.businesses[businessType];
            const businessInfo = BusinessSystem.businessTypes[businessType];
            
            // Only businesses with count > 0 earn offline (they're all automatic)
            if (business.count > 0) {
                const income = BusinessSystem.getBusinessIncome(businessType);
                const cycleTime = businessInfo.incomeInterval / 1000; // Convert to seconds
                const incomePerSecond = (income * business.count) / cycleTime;
                
                // Calculate total earnings for this business
                const businessEarnings = incomePerSecond * timeOfflineSeconds;
                totalOfflineEarnings += businessEarnings;
            }
        });
        
        // Apply offline efficiency scaling
        // As requested in updated requirements: unlimited offline progression
        // But we still apply some scaling to prevent extreme exploitation
        
        const FULL_EFFICIENCY_TIME = 3600; // 1 hour in seconds
        
        if (timeOfflineSeconds <= FULL_EFFICIENCY_TIME) {
            // Full efficiency for first hour
            return totalOfflineEarnings;
        } else {
            // Diminishing returns after 1 hour, but still unlimited
            const fullEfficiencyEarnings = (totalOfflineEarnings / timeOfflineSeconds) * FULL_EFFICIENCY_TIME;
            const remainingTime = timeOfflineSeconds - FULL_EFFICIENCY_TIME;
            const remainingEarnings = (totalOfflineEarnings / timeOfflineSeconds) * remainingTime;
            
            // Apply logarithmic scaling to remaining time
            // This ensures unlimited progression but prevents extreme exploitation
            const efficiency = Math.log(1 + remainingTime / FULL_EFFICIENCY_TIME) / Math.log(2);
            const scaledRemainingEarnings = remainingEarnings * efficiency * 0.75; // 75% max efficiency
            
            return fullEfficiencyEarnings + scaledRemainingEarnings;
        }
    },
    
    // Calculate specific business offline earnings (for detailed breakdown)
    calculateBusinessOfflineEarnings(businessType, timeOfflineMs) {
        const business = BusinessSystem.businesses[businessType];
        const businessInfo = BusinessSystem.businessTypes[businessType];
        
        if (business.count === 0) return 0;
        
        const timeOfflineSeconds = timeOfflineMs / 1000;
        const income = BusinessSystem.getBusinessIncome(businessType);
        const cycleTime = businessInfo.incomeInterval / 1000;
        const incomePerSecond = (income * business.count) / cycleTime;
        
        return incomePerSecond * timeOfflineSeconds;
    },
    
    // Get detailed offline earnings breakdown
    getOfflineBreakdown(timeOfflineMs) {
        const breakdown = {};
        let total = 0;
        
        Object.keys(BusinessSystem.businesses).forEach(businessType => {
            const business = BusinessSystem.businesses[businessType];
            const businessInfo = BusinessSystem.businessTypes[businessType];
            
            if (business.count > 0) {
                const earnings = this.calculateBusinessOfflineEarnings(businessType, timeOfflineMs);
                breakdown[businessType] = {
                    name: businessInfo.name,
                    count: business.count,
                    earnings: earnings,
                    incomePerSecond: earnings / (timeOfflineMs / 1000)
                };
                total += earnings;
            }
        });
        
        return {
            breakdown: breakdown,
            total: total,
            scaledTotal: this.calculateOfflineEarnings(timeOfflineMs)
        };
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
    },
    
    // Get estimated offline earnings rate per hour
    getOfflineEarningsRate() {
        let totalRate = 0;
        
        Object.keys(BusinessSystem.businesses).forEach(businessType => {
            const business = BusinessSystem.businesses[businessType];
            const businessInfo = BusinessSystem.businessTypes[businessType];
            
            if (business.count > 0) {
                const income = BusinessSystem.getBusinessIncome(businessType);
                const cycleTime = businessInfo.incomeInterval / 1000;
                const incomePerSecond = (income * business.count) / cycleTime;
                totalRate += incomePerSecond * 3600; // Per hour
            }
        });
        
        return totalRate;
    },
    
    // Preview offline earnings for UI display
    previewOfflineEarnings(hours = 1) {
        const timeInMs = hours * 60 * 60 * 1000;
        return this.calculateOfflineEarnings(timeInMs);
    },
    
    // Check if any businesses are earning offline
    hasOfflineIncome() {
        return Object.keys(BusinessSystem.businesses).some(businessType => {
            return BusinessSystem.businesses[businessType].count > 0;
        });
    },
    
    // Get next milestone time for offline earnings
    getNextMilestone() {
        const currentRate = this.getOfflineEarningsRate();
        if (currentRate <= 0) return null;
        
        // Find next business unlock or upgrade milestone
        const currentMoney = Game.state.money;
        const milestones = [];
        
        // Business purchase milestones
        Object.keys(BusinessSystem.businessTypes).forEach(businessType => {
            const cost = BusinessSystem.getBusinessCost(businessType);
            if (cost > currentMoney) {
                const timeToAfford = (cost - currentMoney) / (currentRate / 3600); // in hours
                milestones.push({
                    type: 'business',
                    name: BusinessSystem.businessTypes[businessType].name,
                    cost: cost,
                    timeHours: timeToAfford
                });
            }
        });
        
        // Return soonest milestone
        milestones.sort((a, b) => a.timeHours - b.timeHours);
        return milestones[0] || null;
    }
};