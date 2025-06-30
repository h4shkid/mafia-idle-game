// Business System Management - Updated for Auto-Income with Stable DOM
const BusinessSystem = {
    // Business types with rebalanced stats for smoother progression
    businessTypes: {
        protection_racket: {
            name: "Protection Racket",
            baseCost: 50,
            baseIncome: 0.8,
            incomeInterval: 1000, // 1 second for 0.8/sec
            costMultiplier: 1.12,
            description: "Classic neighborhood protection scheme",
            icon: "🏪",
            unlockCost: 0
        },
        numbers_parlor: {
            name: "Numbers Parlor",
            baseCost: 350,
            baseIncome: 4,
            incomeInterval: 1000, // 1 second for 4/sec
            costMultiplier: 1.13,
            description: "Neighborhood betting operation",
            icon: "🎲",
            unlockCost: 150
        },
        underground_casino: {
            name: "Underground Casino",
            baseCost: 2000,
            baseIncome: 15,
            incomeInterval: 1000, // 1 second for 15/sec
            costMultiplier: 1.14,
            description: "High-stakes gambling den",
            icon: "🎰",
            unlockCost: 750
        },
        smuggling_operation: {
            name: "Smuggling Operation",
            baseCost: 10000,
            baseIncome: 60,
            incomeInterval: 1000, // 1 second for 60/sec
            costMultiplier: 1.15,
            description: "Moving goods across borders",
            icon: "🚢",
            unlockCost: 4000
        },
        construction_consulting: {
            name: "Construction Consulting",
            baseCost: 60000,
            baseIncome: 300,
            incomeInterval: 1000, // 1 second for 300/sec
            costMultiplier: 1.16,
            description: "Legitimate construction with benefits",
            icon: "🏗️",
            unlockCost: 25000
        },
        waste_management: {
            name: "Waste Management",
            baseCost: 300000,
            baseIncome: 1200,
            incomeInterval: 1000, // 1 second for 1200/sec
            costMultiplier: 1.17,
            description: "Making things disappear",
            icon: "🚛",
            unlockCost: 120000
        },
        real_estate: {
            name: "Real Estate Development",
            baseCost: 1500000,
            baseIncome: 5000,
            incomeInterval: 1000, // 1 second for 5000/sec
            costMultiplier: 1.18,
            description: "Prime property acquisition",
            icon: "🏢",
            unlockCost: 600000
        },
        political_influence: {
            name: "Political Influence",
            baseCost: 8000000,
            baseIncome: 20000,
            incomeInterval: 1000, // 1 second for 20000/sec
            costMultiplier: 1.19,
            description: "Friends in high places",
            icon: "🎩",
            unlockCost: 3000000
        }
    },

    // Current business state
    businesses: {},

    // Available upgrades
    upgrades: {
        protection_umbrella: {
            name: "Premium Protection",
            description: "Triple income from Protection Rackets",
            cost: 200, // 4x base cost of 50
            multiplier: 3,
            businessType: "protection_racket",
            purchased: false
        },
        numbers_network: {
            name: "Numbers Network",
            description: "Triple income from Numbers Parlors",
            cost: 1400, // 4x base cost of 350
            multiplier: 3,
            businessType: "numbers_parlor",
            purchased: false
        },
        lucky_dice: {
            name: "Lucky Dice",
            description: "Triple income from Underground Casinos",
            cost: 8000, // 4x base cost of 2000
            multiplier: 3,
            businessType: "underground_casino",
            purchased: false
        },
        fast_boats: {
            name: "Fast Boats",
            description: "Triple income from Smuggling Operations",
            cost: 40000, // 4x base cost of 10000
            multiplier: 3,
            businessType: "smuggling_operation",
            purchased: false
        },
        insider_contracts: {
            name: "Insider Contracts",
            description: "Triple income from Construction Consulting",
            cost: 240000, // 4x base cost of 60000
            multiplier: 3,
            businessType: "construction_consulting",
            purchased: false
        },
        advanced_disposal: {
            name: "Advanced Disposal",
            description: "Triple income from Waste Management",
            cost: 1200000, // 4x base cost of 300000
            multiplier: 3,
            businessType: "waste_management",
            purchased: false
        },
        prime_locations: {
            name: "Prime Locations",
            description: "Triple income from Real Estate",
            cost: 6000000, // 4x base cost of 1500000
            multiplier: 3,
            businessType: "real_estate",
            purchased: false
        },
        global_network: {
            name: "Global Network",
            description: "Triple income from Political Influence",
            cost: 32000000, // 4x base cost of 8000000
            multiplier: 3,
            businessType: "political_influence",
            purchased: false
        }
    },

    // Active income timers
    incomeTimers: {},

    // Track which businesses are displayed to avoid recreating DOM
    displayedBusinesses: new Set(),

    // Popup management for performance
    popupPool: [],
    activePopups: new Set(),

    // Initialize business system
    init() {
        // Initialize businesses if not loaded or migrate old data
        this.migrateBusinessData();
        
        if (Object.keys(this.businesses).length === 0) {
            Object.keys(this.businessTypes).forEach(type => {
                this.businesses[type] = {
                    count: 0,
                    level: 0,
                    lastIncome: Date.now()
                };
            });
        }

        this.createBusinessDisplay();
        this.createUpgradesDisplay();
        this.startIncomeTimers();
    },

    // Migrate old business data to new structure
    migrateBusinessData() {
        // Check if we have new business types that don't exist in save data
        Object.keys(this.businessTypes).forEach(type => {
            if (!this.businesses[type]) {
                this.businesses[type] = {
                    count: 0,
                    level: 0,
                    lastIncome: Date.now()
                };
            }
        });

        // Reset all upgrade purchases for rebalance
        Object.keys(this.upgrades).forEach(upgradeId => {
            this.upgrades[upgradeId].purchased = false;
        });
    },

    // Calculate current cost for a business
    getBusinessCost(businessType) {
        const business = this.businesses[businessType];
        const type = this.businessTypes[businessType];
        return Math.floor(type.baseCost * Math.pow(type.costMultiplier, business.count));
    },

    // Calculate current income for a business
    getBusinessIncome(businessType) {
        const business = this.businesses[businessType];
        const type = this.businessTypes[businessType];
        
        let income = type.baseIncome;
        
        // Apply level multipliers (25% per level)
        income *= (1 + business.level * 0.25);
        
        // Apply upgrade multipliers
        Object.values(this.upgrades).forEach(upgrade => {
            if (upgrade.businessType === businessType && upgrade.purchased) {
                income *= upgrade.multiplier;
            }
        });
        
        // Apply prestige multiplier
        income *= Game.getPrestigeMultiplier();
        
        return income;
    },

    // Check if business is unlocked
    isBusinessUnlocked(businessType) {
        const type = this.businessTypes[businessType];
        return Game.state.totalEarned >= type.unlockCost;
    },

    // Buy a business
    buyBusiness(businessType) {
        const cost = this.getBusinessCost(businessType);
        
        if (!this.isBusinessUnlocked(businessType)) {
            Game.showNotification("Business not unlocked yet!");
            return false;
        }
        
        if (!Game.canAfford(cost)) {
            Game.showNotification("Not enough cash!");
            return false;
        }
        
        if (Game.spendMoney(cost)) {
            this.businesses[businessType].count++;
            
            // If this is the first purchase, start income timer
            if (this.businesses[businessType].count === 1) {
                this.startBusinessTimer(businessType);
            }
            
            this.updateBusinessCard(businessType);
            Game.showNotification(`Purchased ${this.businessTypes[businessType].name}!`);
            return true;
        }
        
        return false;
    },

    // Upgrade a business
    upgradeBusiness(businessType) {
        const business = this.businesses[businessType];
        const upgradeCost = this.getUpgradeCost(businessType);
        
        if (business.count === 0) {
            Game.showNotification("Buy the business first!");
            return false;
        }
        
        if (!Game.canAfford(upgradeCost)) {
            Game.showNotification("Not enough cash!");
            return false;
        }
        
        if (Game.spendMoney(upgradeCost)) {
            business.level++;
            this.updateBusinessCard(businessType);
            Game.showNotification(`Upgraded ${this.businessTypes[businessType].name}!`);
            return true;
        }
        
        return false;
    },

    // Calculate upgrade cost
    getUpgradeCost(businessType) {
        const business = this.businesses[businessType];
        const type = this.businessTypes[businessType];
        return Math.floor(type.baseCost * Math.pow(1.35, business.level) * 0.6);
    },

    // Start income timer for a specific business
    startBusinessTimer(businessType) {
        const type = this.businessTypes[businessType];
        
        // Clear existing timer if any
        if (this.incomeTimers[businessType]) {
            clearInterval(this.incomeTimers[businessType]);
        }
        
        this.incomeTimers[businessType] = setInterval(() => {
            const business = this.businesses[businessType];
            
            if (business.count > 0) {
                const income = this.getBusinessIncome(businessType) * business.count;
                Game.addMoney(income);
                business.lastIncome = Date.now();
                
                // Show income popup
                this.showIncomePopup(businessType, income);
            }
        }, type.incomeInterval);
    },

    // Start all income timers
    startIncomeTimers() {
        Object.keys(this.businessTypes).forEach(businessType => {
            const business = this.businesses[businessType];
            if (business.count > 0) {
                this.startBusinessTimer(businessType);
            }
        });
    },

    // Stop all income timers
    stopIncomeTimers() {
        Object.values(this.incomeTimers).forEach(timer => {
            if (timer) clearInterval(timer);
        });
        this.incomeTimers = {};
    },

    // Buy an upgrade
    buyUpgrade(upgradeId) {
        const upgrade = this.upgrades[upgradeId];
        
        if (upgrade.purchased) {
            Game.showNotification("Upgrade already purchased!");
            return false;
        }
        
        if (!Game.canAfford(upgrade.cost)) {
            Game.showNotification("Not enough cash!");
            return false;
        }
        
        if (Game.spendMoney(upgrade.cost)) {
            upgrade.purchased = true;
            Game.showNotification(`Purchased: ${upgrade.name}`);
            this.updateUpgradeCard(upgradeId);
            return true;
        }
        
        return false;
    },

    // Calculate total income per second
    getTotalIncomePerSecond() {
        let totalIncome = 0;
        
        Object.keys(this.businesses).forEach(businessType => {
            const business = this.businesses[businessType];
            const type = this.businessTypes[businessType];
            
            if (business.count > 0) {
                const income = this.getBusinessIncome(businessType) * business.count;
                const timeInSeconds = type.incomeInterval / 1000;
                totalIncome += income / timeInSeconds;
            }
        });
        
        return totalIncome;
    },

    // Create initial business display (only once)
    createBusinessDisplay() {
        const container = document.getElementById('businesses-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.keys(this.businessTypes).forEach(businessType => {
            const businessCard = this.createBusinessCard(businessType);
            container.appendChild(businessCard);
            this.displayedBusinesses.add(businessType);
        });
    },

    // Create a single business card DOM element
    createBusinessCard(businessType) {
        const type = this.businessTypes[businessType];
        const business = this.businesses[businessType];
        
        const businessCard = document.createElement('div');
        businessCard.className = 'business-card';
        businessCard.id = `business-${businessType}`;
        
        businessCard.innerHTML = `
            <div class="business-header">
                <div class="business-name">${type.icon} ${type.name}</div>
                <div class="business-header-right">
                    <div class="empire-upgrade-icon" id="empire-upgrade-icon-${businessType}" 
                         aria-label="Purchase empire upgrade" tabindex="0" role="button">
                        <span class="upgrade-icon-symbol">↑</span>
                        <div class="empire-upgrade-tooltip" id="empire-tooltip-${businessType}">
                            <div class="tooltip-name" id="tooltip-name-${businessType}"></div>
                            <div class="tooltip-description" id="tooltip-description-${businessType}"></div>
                            <div class="tooltip-cost" id="tooltip-cost-${businessType}"></div>
                            <div class="tooltip-prerequisite" id="tooltip-prerequisite-${businessType}" style="display: none;"></div>
                        </div>
                    </div>
                    <div class="business-count" id="count-${businessType}">0</div>
                </div>
            </div>
            <div class="unlock-requirement" id="unlock-${businessType}" style="display: none;">
                Unlock: ${Game.formatMoney(type.unlockCost)}
            </div>
            <div class="business-description">${type.description}</div>
            <div class="business-info" id="info-${businessType}">
                <div class="info-row">
                    <span>Income: <span id="income-${businessType}">$0</span></span>
                    <span>Level: <span id="level-${businessType}">0</span></span>
                </div>
                <div class="info-row">
                    <span>Every: ${(type.incomeInterval / 1000).toFixed(1)}s</span>
                    <span>Total/sec: <span id="total-income-${businessType}">$0</span></span>
                </div>
            </div>
            <div class="business-controls">
                <button class="btn btn-primary buy-btn" id="buy-${businessType}">
                    Buy <span id="buy-cost-${businessType}">$0</span>
                </button>
                <button class="btn btn-secondary upgrade-btn" id="upgrade-${businessType}">
                    Upgrade <span id="upgrade-cost-${businessType}">$0</span>
                    <span class="upgrade-arrow-icon" id="upgrade-arrow-${businessType}">↑</span>
                </button>
            </div>
        `;
        
        // Add event listeners to stable buttons
        const buyBtn = businessCard.querySelector(`#buy-${businessType}`);
        const upgradeBtn = businessCard.querySelector(`#upgrade-${businessType}`);
        const empireUpgradeIcon = businessCard.querySelector(`#empire-upgrade-icon-${businessType}`);
        
        buyBtn.addEventListener('click', () => this.buyBusiness(businessType));
        upgradeBtn.addEventListener('click', () => this.upgradeBusiness(businessType));
        
        // Empire upgrade icon handlers
        if (empireUpgradeIcon) {
            // Desktop: hover to show tooltip, click to purchase
            empireUpgradeIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleEmpireUpgradeClick(businessType);
            });
            
            // Keyboard accessibility
            empireUpgradeIcon.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleEmpireUpgradeClick(businessType);
                }
            });
            
            // Mobile: track touch state for tap-to-show, tap-to-buy behavior
            let mobileTooltipVisible = false;
            empireUpgradeIcon.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const tooltip = document.getElementById(`empire-tooltip-${businessType}`);
                if (!mobileTooltipVisible && tooltip) {
                    tooltip.classList.add('mobile-visible');
                    mobileTooltipVisible = true;
                    // Hide after 3 seconds if no second tap
                    setTimeout(() => {
                        if (mobileTooltipVisible) {
                            tooltip.classList.remove('mobile-visible');
                            mobileTooltipVisible = false;
                        }
                    }, 3000);
                } else {
                    this.handleEmpireUpgradeClick(businessType);
                    tooltip.classList.remove('mobile-visible');
                    mobileTooltipVisible = false;
                }
            });
        }
        
        this.updateBusinessCard(businessType);
        this.updateEmpireUpgradeIcon(businessType);
        
        return businessCard;
    },

    // Update only the content of an existing business card
    updateBusinessCard(businessType) {
        const type = this.businessTypes[businessType];
        const business = this.businesses[businessType];
        const cost = this.getBusinessCost(businessType);
        const income = this.getBusinessIncome(businessType);
        const upgradeCost = this.getUpgradeCost(businessType);
        const isUnlocked = this.isBusinessUnlocked(businessType);
        const canAffordBuy = Game.canAfford(cost) && isUnlocked;
        const canAffordUpgrade = Game.canAfford(upgradeCost) && business.count > 0;
        
        // Update business card class
        const card = document.getElementById(`business-${businessType}`);
        if (!card) return;
        
        if (!isUnlocked && business.count === 0) {
            card.className = 'business-card locked';
            document.getElementById(`unlock-${businessType}`).style.display = 'block';
            document.getElementById(`info-${businessType}`).style.display = 'none';
        } else {
            card.className = 'business-card';
            document.getElementById(`unlock-${businessType}`).style.display = 'none';
            document.getElementById(`info-${businessType}`).style.display = 'block';
        }
        
        // Update text content only
        document.getElementById(`count-${businessType}`).textContent = business.count;
        document.getElementById(`income-${businessType}`).textContent = Game.formatMoney(income);
        document.getElementById(`level-${businessType}`).textContent = business.level;
        document.getElementById(`total-income-${businessType}`).textContent = 
            Game.formatMoney((income * business.count) / (type.incomeInterval / 1000));
        document.getElementById(`buy-cost-${businessType}`).textContent = Game.formatMoney(cost);
        document.getElementById(`upgrade-cost-${businessType}`).textContent = Game.formatMoney(upgradeCost);
        
        // Update button states
        const buyBtn = document.getElementById(`buy-${businessType}`);
        const upgradeBtn = document.getElementById(`upgrade-${businessType}`);
        
        buyBtn.disabled = !canAffordBuy;
        upgradeBtn.disabled = !canAffordUpgrade;
    },

    // Update all business cards (called by UI)
    updateBusinessDisplay() {
        Object.keys(this.businessTypes).forEach(businessType => {
            this.updateBusinessCard(businessType);
            this.updateEmpireUpgradeIcon(businessType);
        });
    },

    // Create initial upgrades display
    createUpgradesDisplay() {
        const container = document.getElementById('upgrades-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.keys(this.upgrades).forEach(upgradeId => {
            const upgradeCard = this.createUpgradeCard(upgradeId);
            container.appendChild(upgradeCard);
        });
    },

    // Create a single upgrade card DOM element
    createUpgradeCard(upgradeId) {
        const upgrade = this.upgrades[upgradeId];
        
        const upgradeCard = document.createElement('div');
        upgradeCard.className = 'upgrade-card';
        upgradeCard.id = `upgrade-${upgradeId}`;
        upgradeCard.style.display = 'none'; // Hidden initially
        
        upgradeCard.innerHTML = `
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-description">${upgrade.description}</div>
            <div class="upgrade-cost">Cost: ${Game.formatMoney(upgrade.cost)}</div>
            <button class="btn btn-primary" id="upgrade-btn-${upgradeId}">
                Purchase
            </button>
            <div class="purchased-badge" id="purchased-${upgradeId}" style="display: none;">PURCHASED</div>
        `;
        
        // Add event listener to stable button
        const button = upgradeCard.querySelector(`#upgrade-btn-${upgradeId}`);
        button.addEventListener('click', () => this.buyUpgrade(upgradeId));
        
        this.updateUpgradeCard(upgradeId);
        
        return upgradeCard;
    },

    // Update only the content of an existing upgrade card
    updateUpgradeCard(upgradeId) {
        const upgrade = this.upgrades[upgradeId];
        const canAfford = Game.canAfford(upgrade.cost);
        const businessOwned = this.businesses[upgrade.businessType].count > 0;
        
        const card = document.getElementById(`upgrade-${upgradeId}`);
        const button = document.getElementById(`upgrade-btn-${upgradeId}`);
        const purchasedBadge = document.getElementById(`purchased-${upgradeId}`);
        
        if (!card) return;
        
        // Show/hide upgrade based on business ownership or purchase status
        if (!businessOwned && !upgrade.purchased) {
            card.style.display = 'none';
        } else {
            card.style.display = 'block';
        }
        
        // Update purchased state
        if (upgrade.purchased) {
            card.className = 'upgrade-card purchased';
            button.style.display = 'none';
            purchasedBadge.style.display = 'block';
        } else {
            card.className = 'upgrade-card';
            button.style.display = 'block';
            button.disabled = !canAfford;
            purchasedBadge.style.display = 'none';
        }
    },

    // Update all upgrade cards (called by UI)
    updateUpgradesDisplay() {
        Object.keys(this.upgrades).forEach(upgradeId => {
            this.updateUpgradeCard(upgradeId);
        });
    },

    // Calculate offline income for a business
    calculateOfflineIncome(businessType, timeOfflineMs) {
        const business = this.businesses[businessType];
        const type = this.businessTypes[businessType];
        
        if (business.count === 0) return 0;
        
        const income = this.getBusinessIncome(businessType) * business.count;
        const cyclesOffline = Math.floor(timeOfflineMs / type.incomeInterval);
        
        return income * cyclesOffline;
    },

    // Reset businesses (for prestige)
    reset() {
        // Stop all timers
        this.stopIncomeTimers();
        
        // Reset business counts and levels
        Object.keys(this.businesses).forEach(businessType => {
            this.businesses[businessType] = {
                count: 0,
                level: 0,
                lastIncome: Date.now()
            };
        });
        
        // Reset upgrades
        Object.keys(this.upgrades).forEach(upgradeId => {
            this.upgrades[upgradeId].purchased = false;
        });
        
        this.updateBusinessDisplay();
        this.updateUpgradesDisplay();
    },

    // Check if element is in viewport for performance
    isInViewport(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Create or reuse popup element
    getPopupElement() {
        let popup = this.popupPool.pop();
        if (!popup) {
            popup = document.createElement('div');
            popup.className = 'income-popup';
        }
        return popup;
    },

    // Return popup to pool
    returnPopupToPool(popup) {
        this.activePopups.delete(popup);
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
        // Reset styles
        popup.style.left = '';
        popup.style.top = '';
        popup.textContent = '';
        this.popupPool.push(popup);
    },

    // Show income popup for a business
    showIncomePopup(businessType, amount) {
        const businessCard = document.getElementById(`business-${businessType}`);
        if (!businessCard || !this.isInViewport(businessCard)) {
            return; // Skip if not visible
        }

        const popup = this.getPopupElement();
        popup.textContent = `+${Game.formatMoney(amount)}`;
        
        // Position near right edge aligned with income text row
        const rect = businessCard.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Try to find the business-info section for more precise positioning
        const infoSection = document.getElementById(`info-${businessType}`);
        let targetTop = rect.top + scrollTop + rect.height * 0.45; // Fallback to ~45% down the card
        
        if (infoSection) {
            const infoRect = infoSection.getBoundingClientRect();
            targetTop = infoRect.top + scrollTop + 8; // Top of info section + small offset
        }
        
        // Position near right edge but with padding to avoid button overlap
        const rightOffset = rect.width * 0.75; // 75% across the card width
        
        popup.style.left = (rect.left + scrollLeft + rightOffset) + 'px';
        popup.style.top = targetTop + 'px';
        popup.style.transform = 'translateX(-50%)';

        // Add to DOM
        document.body.appendChild(popup);
        this.activePopups.add(popup);

        // Remove after animation
        setTimeout(() => {
            this.returnPopupToPool(popup);
        }, 1000);
    },

    // Find empire upgrade for a business type
    getEmpireUpgradeForBusiness(businessType) {
        return Object.keys(this.upgrades).find(upgradeId => 
            this.upgrades[upgradeId].businessType === businessType
        );
    },

    // Buy empire upgrade for a business
    buyEmpireUpgrade(businessType) {
        const upgradeId = this.getEmpireUpgradeForBusiness(businessType);
        if (!upgradeId) return false;
        
        return this.buyUpgrade(upgradeId);
    },

    // Handle empire upgrade icon click/tap
    handleEmpireUpgradeClick(businessType) {
        const upgradeId = this.getEmpireUpgradeForBusiness(businessType);
        if (!upgradeId) return;
        
        const upgrade = this.upgrades[upgradeId];
        const business = this.businesses[businessType];
        
        // Check if upgrade is available and affordable
        if (upgrade.purchased) {
            Game.showNotification("Upgrade already purchased!");
            return;
        }
        
        if (business.count === 0) {
            Game.showNotification(`Buy at least 1 ${this.businessTypes[businessType].name} first!`);
            return;
        }
        
        if (!Game.canAfford(upgrade.cost)) {
            Game.showNotification("Not enough cash!");
            return;
        }
        
        // Purchase the upgrade
        this.buyUpgrade(upgradeId);
    },

    // Update empire upgrade icon for a business
    updateEmpireUpgradeIcon(businessType) {
        const upgradeId = this.getEmpireUpgradeForBusiness(businessType);
        if (!upgradeId) return;
        
        const upgrade = this.upgrades[upgradeId];
        const business = this.businesses[businessType];
        const upgradeIcon = document.getElementById(`empire-upgrade-icon-${businessType}`);
        
        if (!upgradeIcon) return;
        
        // Update tooltip content
        const tooltipName = document.getElementById(`tooltip-name-${businessType}`);
        const tooltipDescription = document.getElementById(`tooltip-description-${businessType}`);
        const tooltipCost = document.getElementById(`tooltip-cost-${businessType}`);
        const tooltipPrereq = document.getElementById(`tooltip-prerequisite-${businessType}`);
        
        if (tooltipName) tooltipName.textContent = upgrade.name;
        if (tooltipDescription) tooltipDescription.textContent = upgrade.description;
        if (tooltipCost) tooltipCost.textContent = Game.formatMoney(upgrade.cost);
        
        // Determine icon state
        const canAfford = Game.canAfford(upgrade.cost);
        const hasPrerequisites = business.count > 0;
        const isAlreadyPurchased = upgrade.purchased;
        
        // Update icon appearance and visibility
        if (isAlreadyPurchased) {
            // Show green checkmark or hide completely
            upgradeIcon.className = 'empire-upgrade-icon purchased';
            upgradeIcon.querySelector('.upgrade-icon-symbol').textContent = '✓';
            upgradeIcon.style.display = 'flex';
            if (tooltipPrereq) tooltipPrereq.style.display = 'none';
        } else {
            upgradeIcon.style.display = 'flex';
            upgradeIcon.querySelector('.upgrade-icon-symbol').textContent = '↑';
            
            if (!hasPrerequisites) {
                upgradeIcon.className = 'empire-upgrade-icon disabled';
                if (tooltipPrereq) {
                    tooltipPrereq.textContent = `Prerequisite: Own at least 1 ${this.businessTypes[businessType].name}`;
                    tooltipPrereq.style.display = 'block';
                }
            } else if (!canAfford) {
                upgradeIcon.className = 'empire-upgrade-icon muted';
                if (tooltipPrereq) tooltipPrereq.style.display = 'none';
            } else {
                upgradeIcon.className = 'empire-upgrade-icon available';
                if (tooltipPrereq) tooltipPrereq.style.display = 'none';
            }
        }
    }
};