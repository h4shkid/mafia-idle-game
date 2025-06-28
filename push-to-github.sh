#!/bin/bash

# Script to push mafia-idle-game to GitHub
# Replace YOUR_USERNAME with your actual GitHub username

echo "🎮 Pushing Mafia Idle Game to GitHub..."

# Initialize git if not already done
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git repository initialized"
fi

# Add all files
git add .
echo "✅ Files added to git"

# Create commit
git commit -m "Initial commit: Mafia idle game with tap mechanics

🎮 Features:
- Tap-to-earn mechanics with critical hits
- 7 business types with automatic income
- Prestige system with respect points
- Mobile-responsive design
- Save/load functionality
- Offline progress calculation

🎨 UI:
- Italian mafia theme with custom fonts
- Centered tommy gun tap button
- Header with logo and prestige controls
- Footer with metrics and controls
- Stable DOM patterns for performance

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

echo "✅ Commit created"

# Add remote (replace YOUR_USERNAME)
echo "📝 Next steps:"
echo "1. Create repository on GitHub: https://github.com/new"
echo "2. Name it: mafia-idle-game"
echo "3. Run these commands:"
echo ""
echo "git remote add origin https://github.com/YOUR_USERNAME/mafia-idle-game.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "🚀 Your game will be live at: https://YOUR_USERNAME.github.io/mafia-idle-game"