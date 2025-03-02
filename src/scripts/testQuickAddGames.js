// Test script for StepQuickAddGames component
// This script simulates selecting and adding games through the StepQuickAddGames component

const { getAuth } = require('firebase/auth');
const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');
const { addGame } = require('../services/gameService');

// Initialize Firebase (using the same config as your app)
const firebaseConfig = require('../config/firebase').firebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Sample game data in the format that StepQuickAddGames would pass to addGame
const testGame = {
  id: "178900", // Codenames
  name: "Codenames",
  image: "/games/onboarding/178900.jpg",
  playerCount: {
    min: 2,
    max: 8
  },
  playTime: {
    min: 15,
    max: 15
  },
  rank: {
    abstracts: null,
    cgs: null,
    childrens: null,
    family: null,
    party: null,
    strategy: null,
    thematic: null,
    wargames: null
  },
  type: 'boardgame'
};

// Function to test adding a game
async function testAddGame() {
  try {
    // You'll need to be logged in to run this test
    // This assumes you're already logged in through the app
    const user = auth.currentUser;
    
    if (!user) {
      console.error('No user logged in. Please log in through the app first.');
      return;
    }
    
    console.log(`Testing addGame with user: ${user.email}`);
    console.log('Game data:', testGame);
    
    const result = await addGame(user.email, testGame);
    console.log('Game added successfully!', result);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAddGame();
