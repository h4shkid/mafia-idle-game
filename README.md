# Mafia Empire - Idle Crime Game (Updated v2.0)

A mobile-first web-based idle game inspired by Adventure Capitalist with a dark mafia theme and central tap mechanic.

## 🎮 Core Gameplay

### Central Tap Mechanic
- **Large circular tap button** at bottom-center of screen
- Tap to generate immediate income
- Income scales with business progression
- Visual feedback with ripple animations
- Keyboard shortcuts: `Space` or `Enter` to tap

### Automatic Business Income
- **Businesses generate income immediately** after purchase
- No manual "run" buttons required
- No automation unlock requirements
- All businesses are automated by default
- Income accumulates while playing and offline

### Progressive Business Empire
1. **Protection Racket** 🏪 - $50 base cost, unlocked from start
2. **Underground Casino** 🎰 - $500 base cost, unlocked at $100 total earned
3. **Smuggling Operation** 🚢 - $2.5K base cost, unlocked at $1K total earned
4. **Construction Consulting** 🏗️ - $12.5K base cost, unlocked at $10K total earned
5. **Waste Management** 🚛 - $60K base cost, unlocked at $75K total earned
6. **Real Estate Development** 🏢 - $300K base cost, unlocked at $500K total earned
7. **Political Influence** 🎩 - $1.5M base cost, unlocked at $2.5M total earned

## 🎯 Key Features

✅ **Mobile-First Design**
- Responsive layout optimized for touch
- Large tap button for easy mobile interaction
- Touch-friendly business cards
- Smooth animations and feedback

✅ **Automatic Progression**
- Businesses start earning immediately after purchase
- No micromanagement required
- Scales exponentially for satisfying growth

✅ **Unlimited Offline Income**
- True offline progression with time-based calculations
- Diminishing returns after 1 hour for balance
- Welcome back modal shows offline earnings

✅ **Prestige System**
- Reset empire for permanent "Respect" bonuses
- 10% income multiplier per Respect point
- Exponential prestige requirements

✅ **Complete Save System**
- Auto-save every 5 seconds
- Manual save/export/import functionality
- Backward compatibility with older saves

✅ **Leaderboard Integration**
- Global rankings by total lifetime earnings
- Anonymous submission system
- Mock API with local fallback

## 🎨 Mafia Theme

- **Dark Color Palette**: Blacks, grays, deep reds, gold accents
- **Vintage Typography**: Bold fonts reminiscent of 1930s-1950s
- **Thematic Icons**: Business-specific emojis and mafia imagery
- **Atmospheric Design**: Dark city skylines and criminal empire aesthetic

## 🎮 Controls

### Touch/Mouse
- **Tap central button** to generate income
- **Tap business cards** to buy/upgrade
- **Tap control buttons** for stats/save/leaderboard/settings

### Keyboard Shortcuts
- `Space` or `Enter` - Tap for income
- `Ctrl+S` - Manual save
- `P` - Prestige (when available)

## 📊 Progression Systems

### Tap Power Upgrades
- Upgrade tap income through stats menu
- Cost doubles with each upgrade
- Tap income scales with business progression

### Business Upgrades
- Level up businesses for 20% income increase per level
- Purchase multiplier upgrades (2x-3x income)
- Exponential cost scaling for balanced progression

### Prestige Bonuses
- Earn 1 Respect per $1000 total earned
- Permanent 10% income multiplier per Respect
- Reset costs: $1M, $10M, $100M, etc.

## 💾 Technical Features

- **Vanilla JavaScript** - No framework dependencies
- **localStorage** - Local save persistence
- **DOM Rendering** - No Canvas, accessibility-friendly
- **Mobile Responsive** - CSS Grid and Flexbox
- **Performance Optimized** - Efficient game loops and updates

## 🚀 Getting Started

1. **Open** `index.html` in any modern web browser
2. **Start tapping** the central button to earn your first money
3. **Buy businesses** when you can afford them
4. **Watch** your criminal empire grow automatically
5. **Upgrade** businesses and tap power for faster progression
6. **Prestige** when ready for permanent bonuses

### Development Server
```bash
cd mafia-idle-game
python3 -m http.server 8080
# Visit http://localhost:8080
```

## 📱 Mobile Experience

The game is designed mobile-first with:
- **Large tap targets** for easy touch interaction
- **Responsive business cards** that stack on small screens
- **Fixed positioning** for tap button and navigation
- **Touch feedback** with visual animations
- **Portrait orientation** optimized layout

## 🎯 Acceptance Criteria Met

✅ Central tap button generates income  
✅ Businesses start generating money automatically after purchase  
✅ No run button per business  
✅ Offline income calculated and applied correctly  
✅ Save/load via local storage  
✅ Prestige and leaderboard systems functional  
✅ Mobile responsive with consistent mafia theme  

## 🎪 Game Balance

- **Early Game**: Tap-focused with first business purchases
- **Mid Game**: Business automation takes over, tap supplements income
- **Late Game**: Prestige cycling for exponential growth
- **Offline**: Unlimited progression with balanced scaling

## 🌐 Browser Compatibility

- **Chrome/Edge** 60+
- **Firefox** 55+
- **Safari** 12+
- **Mobile browsers** with ES6 support

## 🎵 Audio & Settings

- Settings menu for sound/notification preferences
- Visual feedback compensates for optional audio
- Customizable game experience

---

**Build your criminal empire, one tap at a time! 🎩💰**