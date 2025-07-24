# Spelling Bee Duel - Game Design Document

## Overview
A head-to-head mobile word game for two players, inspired by WordRacers from the HousePlay app. Players compete to find as many words as possible from a set of 7 letters in 90-second rounds.

## Core Game Mechanics

### Game Structure
- **3 rounds total** - winner has highest total score across all rounds
- **90 seconds per round**
- **7 letters per round** (6 outer + 1 center, using NYT Spelling Bee letter sets)
- **Center letter must be included in every valid word**
- **4+ letter words only** - matches Spelling Bee dataset requirements
- **Letters can be reused** - no restrictions on letter repetition within words

### Scoring System
**Exponential scoring based on word length:**
- 4 letters = 4 points
- 5 letters = 9 points  
- 6 letters = 16 points
- 7 letters = 25 points

**Pangram Bonus:**
- **+25 bonus points** for any word using all 7 letters
- 7-letter pangram total = 50 points (25 base + 25 bonus)

**No speed bonuses** - pure word-finding skill based

### Round Flow
1. Both players receive the same 7 letters
2. 90-second timer starts
3. Players find words independently (no real-time visibility of opponent's words)
4. Timer ends, results revealed
5. Show both players' word lists side by side + running total scores
6. Manual "Ready for next round" confirmation required
7. Repeat for rounds 2 and 3
8. Declare winner based on total score

## Technical Architecture

### Platform
- **Frontend:** Expo React Native app
- **Backend:** Node.js + Express + Socket.io server
- **Deployment:** Docker on Mac mini (local network)
- **Real-time:** WebSocket connections for game state sync

### Data Source
**NYT Spelling Bee puzzle data:** https://github.com/tedmiston/spelling-bee-answers
- Each day is stored as individual JSON files with complete puzzle data
- **Center letter requirement maintained** (exactly like official Spelling Bee)
- Random puzzle selection for each game from available JSON files
- All valid words and pangrams are pre-validated in each JSON file

**JSON Structure Example:**
```json
{
  "displayDate": "January 1, 2023",
  "printDate": "2023-01-01", 
  "centerLetter": "e",
  "outerLetters": ["a","c","l","n","o","w"],
  "validLetters": ["e","a","c","l","n","o","w"],
  "pangrams": ["allowance"],
  "answers": ["allowance", "acne", "aeon", ...]
}
```

## User Interface Design

### Letter Layout
- **6 outer letters + 1 center letter in hexagon formation** (exactly like Spelling Bee)
- **Center letter must be used in every valid word**
- Tap letters in sequence to build words
- Current word displays above the hexagon
- Submit button to confirm word

### Game Screens
1. **Lobby Screen** - Create/join game with room codes
2. **Game Screen** - Letter circle, timer, current word, submitted words list
3. **Results Screen** - Both players' words side by side, scores, running totals
4. **Final Results** - Winner declaration, option to play again

### Visual Feedback
- Selected letters highlight briefly when tapped
- Submitted words appear in player's word list immediately
- Timer prominently displayed
- Current round indicator (Round 1 of 3)

## Game Flow

### Starting Game
1. Player 1 creates game → receives room code
2. Player 2 joins with room code
3. Both players see "waiting for opponent" state
4. Game starts when both players ready

### During Round
1. Same 7 letters shown to both players
2. 90-second countdown timer
3. Players tap letters → build word → submit
4. Invalid words rejected with brief feedback
5. Valid words added to player's list with points
6. No visibility of opponent's progress during round

### Between Rounds
1. Timer ends, all submissions locked
2. Results screen shows:
   - Both players' word lists side by side
   - Points for each word
   - Round total and running game total
   - Words opponent found that you missed
3. Manual "Ready for Round X" button
4. Next round starts when both players ready

### End Game
1. After round 3, show final results
2. Declare winner
3. Option to start new game (new room code)

## Technical Requirements

### Server Features
- Room management (create/join with codes)
- Game state synchronization
- Word validation against pre-loaded word lists
- Timer management
- Score calculation

### Client Features
- Real-time WebSocket connection
- Touch interface for letter selection
- Local word list display
- Timer countdown display
- Results comparison screens

### Data Management
- Download collection of individual JSON files (one per day) from GitHub repo
- Load all JSON files into memory on server startup for fast random selection
- Each game randomly selects one puzzle JSON file
- Word validation checks against `answers` array in selected puzzle
- Pangram detection checks against `pangrams` array in selected puzzle

## Development Notes

### Word Validation
- Use pre-computed word lists from GitHub repo
- No external dictionary API needed
- Server validates submissions against known valid words for current letter set

### Performance Considerations
- Games are only 2 players - minimal server load
- Word lists cached in memory on server
- Real-time updates only for game state, not individual letter presses

### Future Considerations (Not MVP)
- Game history/stats tracking
- Multiple game formats
- Different word list sources (if commercializing)

## Open Questions
- None identified - design is complete for MVP implementation

## File Structure Planning

### Server (Node.js)
```
server/
├── server.js (main server file)
├── gameLogic.js (scoring, validation)
├── roomManager.js (room creation/joining)
├── wordData.js (Spelling Bee data loader)
├── package.json
└── Dockerfile
```

### Client (Expo React Native)
```
spelling-bee-app/
├── App.js
├── screens/
│   ├── LobbyScreen.js
│   ├── GameScreen.js
│   ├── ResultsScreen.js
│   └── FinalResultsScreen.js
├── components/
│   ├── LetterCircle.js
│   ├── WordList.js
│   ├── Timer.js
│   └── ScoreBoard.js
└── services/
    └── socketService.js
```