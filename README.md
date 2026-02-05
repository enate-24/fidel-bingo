# Cartela Viewer - React Native Bingo App

A React Native app for viewing and playing with cartela (bingo cards) using data from cartela.js.

## Features

- **View 1000 Different Cards**: Navigate through cards 1-1000 using arrow buttons or direct input
- **Interactive Marking**: Tap numbers to mark them on your card
- **Number Calling**: Call numbers (1-75) and auto-mark if they appear on your current card
- **Bingo Detection**: Automatically detects when you have BINGO (row, column, or diagonal)
- **Called Numbers Tracking**: See all numbers that have been called
- **Clear Function**: Reset all marked numbers and called numbers

## How to Use

1. **Select a Card**: Use the arrow buttons or type a card number (1-1000) to select your cartela
2. **Mark Numbers**: Tap any number on the card to mark/unmark it
3. **Call Numbers**: Enter a number (1-75) in the input field and tap "Call" to add it to called numbers
4. **Auto-marking**: When you call a number that exists on your current card, it will be automatically marked
5. **Check for BINGO**: The app automatically detects BINGO patterns and shows a celebration message
6. **Clear All**: Use the "Clear All" button to reset all markings and start fresh

## Installation

1. Make sure you have Node.js and Expo CLI installed
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Use Expo Go app on your phone to scan the QR code, or run on simulator

## Card Data

The app uses the cartela.js file which contains 1000 pre-generated bingo cards. Each card has:
- 5x5 grid with numbers
- FREE space in the center
- Numbers distributed according to bingo rules (B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75)

## Technologies Used

- React Native
- Expo
- JavaScript

## BINGO Rules

Win by completing:
- Any horizontal row
- Any vertical column  
- Either diagonal line

The FREE space in the center is automatically marked and counts toward winning patterns.