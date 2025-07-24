const fs = require('fs');
const path = require('path');

class WordData {
  constructor() {
    this.puzzles = [];
    this.isLoaded = false;
  }

  // Load all puzzle data from JSON files
  async loadPuzzleData() {
    try {
      const dataDir = path.join(__dirname, 'data');
      
      if (!fs.existsSync(dataDir)) {
        throw new Error('Data directory not found. Run download-puzzles.js first.');
      }

      // Read all JSON files from the data directory
      const files = fs.readdirSync(dataDir)
        .filter(file => file.endsWith('.json') && file !== 'index.json')
        .sort();

      console.log(`📚 Loading ${files.length} puzzle files...`);

      this.puzzles = [];
      
      for (const file of files) {
        try {
          const filePath = path.join(dataDir, file);
          const data = fs.readFileSync(filePath, 'utf8');
          const puzzle = JSON.parse(data);
          
          // Validate puzzle structure
          if (this.isValidPuzzle(puzzle)) {
            this.puzzles.push(puzzle);
          } else {
            console.warn(`⚠️  Invalid puzzle structure in ${file}, skipping...`);
          }
        } catch (error) {
          console.warn(`⚠️  Error loading ${file}:`, error.message);
        }
      }

      this.isLoaded = true;
      console.log(`✅ Successfully loaded ${this.puzzles.length} puzzles`);
      
      return this.puzzles.length;
    } catch (error) {
      console.error('❌ Error loading puzzle data:', error.message);
      throw error;
    }
  }

  // Validate puzzle has required structure
  isValidPuzzle(puzzle) {
    return puzzle &&
           typeof puzzle.centerLetter === 'string' &&
           Array.isArray(puzzle.outerLetters) &&
           puzzle.outerLetters.length === 6 &&
           Array.isArray(puzzle.answers) &&
           puzzle.answers.length > 0 &&
           Array.isArray(puzzle.pangrams);
  }

  // Get a random puzzle for a new game
  getRandomPuzzle() {
    if (!this.isLoaded || this.puzzles.length === 0) {
      throw new Error('Puzzle data not loaded');
    }

    const randomIndex = Math.floor(Math.random() * this.puzzles.length);
    const puzzle = this.puzzles[randomIndex];
    
    console.log(`🎯 Selected puzzle: ${puzzle.displayDate || puzzle.printDate} (${puzzle.answers.length} words, ${puzzle.pangrams.length} pangrams)`);
    
    return {
      centerLetter: puzzle.centerLetter,
      outerLetters: puzzle.outerLetters,
      validLetters: [puzzle.centerLetter, ...puzzle.outerLetters],
      answers: puzzle.answers,
      pangrams: puzzle.pangrams,
      totalWords: puzzle.answers.length,
      totalPangrams: puzzle.pangrams.length,
      puzzleDate: puzzle.displayDate || puzzle.printDate
    };
  }

  // Validate if a word is correct for the given puzzle
  isValidWord(word, puzzle) {
    if (!word || !puzzle) {
      return false;
    }

    const wordLower = word.toLowerCase().trim();
    
    // Check minimum length (4 letters)
    if (wordLower.length < 4) {
      return false;
    }

    // Check if word contains center letter
    if (!wordLower.includes(puzzle.centerLetter.toLowerCase())) {
      return false;
    }

    // Check if word only uses available letters
    const availableLetters = puzzle.validLetters.map(l => l.toLowerCase());
    for (const letter of wordLower) {
      if (!availableLetters.includes(letter)) {
        return false;
      }
    }

    // Check if word is in the answer list
    return puzzle.answers.map(a => a.toLowerCase()).includes(wordLower);
  }

  // Check if a word is a pangram
  isPangram(word, puzzle) {
    if (!word || !puzzle) {
      return false;
    }

    const wordLower = word.toLowerCase().trim();
    return puzzle.pangrams.map(p => p.toLowerCase()).includes(wordLower);
  }

  // Get statistics about loaded puzzles
  getStats() {
    if (!this.isLoaded) {
      return { loaded: false };
    }

    const totalWords = this.puzzles.reduce((sum, puzzle) => sum + puzzle.answers.length, 0);
    const totalPangrams = this.puzzles.reduce((sum, puzzle) => sum + puzzle.pangrams.length, 0);
    
    return {
      loaded: true,
      totalPuzzles: this.puzzles.length,
      totalWords,
      totalPangrams,
      avgWordsPerPuzzle: Math.round(totalWords / this.puzzles.length),
      avgPangramsPerPuzzle: Math.round((totalPangrams / this.puzzles.length) * 10) / 10
    };
  }
}

// Create singleton instance
const wordData = new WordData();

module.exports = wordData;