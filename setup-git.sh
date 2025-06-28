#!/bin/bash

echo "🎮 Setting up Mafia Idle Game for GitHub..."

# Configure git credentials (one-time setup)
echo "Setting up Git credentials..."
git config --global credential.helper store

echo "✅ Git credential helper configured"

# Initialize and prepare repository
git init
git add .
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

echo "✅ Repository prepared"
echo ""
echo "📝 Next steps:"
echo "1. Create repo at: https://github.com/new (name: mafia-idle-game)"
echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/mafia-idle-game.git"
echo "3. Run: git push -u origin main"
echo "4. When prompted, enter your GitHub username and token"
echo "5. Git will remember your credentials for future pushes!"
echo ""
echo "🚀 After setup, your game will be live at:"
echo "   https://YOUR_USERNAME.github.io/mafia-idle-game"