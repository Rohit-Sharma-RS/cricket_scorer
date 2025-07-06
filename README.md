# Cricket Scorer - Local Setup Guide

## 🏏 Professional Cricket Scoring Application

A comprehensive, mobile-first cricket scoring application with advanced features including dynamic team management, real-time statistics, and interactive match analysis.

## ✨ Features

### Core Features
- **Custom Overs:** Choose from 2, 4, 6, 8, 10, 12, or 20 overs per innings
- **Dynamic Player Management:** Add/remove any number of players (minimum 2 per team)
- **Touch-Based Scoring:** Simple tap interface for runs (0-6), wickets, and extras
- **Comprehensive Extras:** Wide, No Ball, Bye, Leg Bye with run combinations
- **Bowler Management:** Easy bowler switching with automatic prompts after 6 balls
- **Retired Batsman:** Players can retire and new batsmen can come in anytime
- **One-Man Standing:** Last batsman can continue when all others are out

### Advanced Features
- **Toss Simulation:** Interactive coin flip with head/tail animation
- **Real-time Statistics:** Live score tracking with ball-by-ball display
- **Match End Analysis:** Comprehensive statistics with best performers
- **Man of the Match:** Intelligent calculation based on performance metrics
- **Interactive Charts:** Bar charts showing runs and wickets per over
- **Responsive Design:** Mobile-first with dark mode support
- **Professional UI:** Sleek glassmorphism design with smooth animations

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd cricket-scorer
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   - Navigate to `http://localhost:5173`
   - The application will automatically reload when you make changes

### Build for Production

1. **Create Production Build**
   ```bash
   npm run build
   ```

2. **Preview Production Build**
   ```bash
   npm run preview
   ```

3. **Deploy**
   - The `dist` folder contains the production-ready files
   - Upload the contents to any web server or hosting platform

## 📱 How to Use

### Setting Up a Match

1. **Team Setup**
   - Enter team names (default: Team A, Team B)
   - Add players using the "Add Player" button
   - Remove players using the red minus button (minimum 2 players required)
   - Select overs per innings from the dropdown

2. **Toss**
   - Click "Flip Coin" for random toss simulation
   - Or manually select toss winner and batting choice
   - Choose which team bats first

### During the Match

1. **Scoring Runs**
   - Tap run buttons (0-6) to add runs to the current batsman
   - Score updates automatically with ball count

2. **Handling Extras**
   - Click "Extras" button for wide, no ball, bye, leg bye
   - Add extra runs with wide/no ball combinations
   - Extras don't count toward batsman's score

3. **Managing Players**
   - "Retire Batsman" to bring in new batsman anytime
   - "Change Bowler" to switch bowlers
   - Automatic bowler change prompt after 6 balls

4. **Wickets**
   - Click "Wicket" button when batsman gets out
   - New batsman selection modal appears
   - One-man standing rule applies for last batsman

### Match Completion

1. **Automatic End Conditions**
   - All overs completed
   - Target reached (second innings)
   - All players out (except one-man standing)

2. **Match Results**
   - Winner announcement with margin
   - Man of the Match calculation and display
   - Best batsman and bowler statistics
   - Interactive charts showing over-by-over analysis
   - Complete team and player statistics

## 🛠️ Technical Details

### Technology Stack
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality component library
- **Recharts** - Interactive chart library
- **Lucide React** - Beautiful icon library

### Project Structure
```
cricket-scorer/
├── src/
│   ├── components/
│   │   ├── match/          # Match setup components
│   │   ├── scoring/        # Scoring interface
│   │   ├── modals/         # Modal dialogs
│   │   ├── statistics/     # Statistics components
│   │   └── ui/            # Reusable UI components
│   ├── context/           # React context for state management
│   ├── utils/             # Utility functions
│   └── App.jsx           # Main application component
├── public/               # Static assets
└── package.json         # Dependencies and scripts
```

### Key Features Implementation

1. **State Management**
   - React Context API for global state
   - Reducer pattern for complex state updates
   - Persistent match data during gameplay

2. **Responsive Design**
   - Mobile-first approach
   - Breakpoint-based layouts
   - Touch-friendly button sizes (44px minimum)

3. **Performance Optimizations**
   - Component memoization
   - Efficient re-rendering
   - Optimized bundle size

## 🎯 Usage Tips

### Best Practices
- **Mobile Use:** Designed primarily for mobile devices
- **Touch Interface:** All buttons are touch-optimized
- **Quick Scoring:** Use number buttons for fast run entry
- **Undo Feature:** Use undo button to correct mistakes
- **Statistics:** View detailed stats after match completion

### Troubleshooting

1. **Application Won't Start**
   - Ensure Node.js is installed: `node --version`
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

2. **Build Errors**
   - Check for TypeScript errors in console
   - Ensure all dependencies are installed
   - Try clearing build cache: `npm run build --clean`

3. **Performance Issues**
   - Close other browser tabs
   - Disable browser extensions
   - Use latest Chrome/Safari for best performance

## 🔧 Customization

### Modifying Team Size
- Default: 5 players per team
- Minimum: 2 players per team
- Maximum: Unlimited (practical limit ~15-20)

### Adding New Over Options
Edit `src/components/match/MatchSetup.jsx`:
```javascript
const oversOptions = [2, 4, 6, 8, 10, 12, 20, 50]; // Add new options
```

### Customizing Colors/Theme
Edit `src/App.css` for color schemes and animations.

## 📄 License

This project is created for educational and personal use. Feel free to modify and distribute according to your needs.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code comments for implementation details
3. Test on different devices for compatibility

---

**Made with ❤️ by Rohit**

Enjoy your cricket scoring experience! 🏏

