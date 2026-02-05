import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { bingoCards } from './cartela';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [displayedCards, setDisplayedCards] = useState([1, 2, 3]);
  const [markedNumbers, setMarkedNumbers] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [cardRangeInput, setCardRangeInput] = useState('');
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [multiMarkMode, setMultiMarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Hide navigation bar on Android for full screen
    const setupFullScreen = async () => {
      try {
        if (NavigationBar.setVisibilityAsync) {
          await NavigationBar.setVisibilityAsync('hidden');
        }
      } catch (error) {
        console.log('Navigation bar control not available');
      }
    };
    setupFullScreen();
  }, []);

  const markNumber = (cardId, number) => {
    setMarkedNumbers(prev => {
      const cardMarked = prev[cardId] || new Set();
      const newCardMarked = new Set(cardMarked);
      
      if (newCardMarked.has(number)) {
        newCardMarked.delete(number);
      } else {
        newCardMarked.add(number);
      }
      
      return {
        ...prev,
        [cardId]: newCardMarked
      };
    });
  };

  const markNumberOnAllCards = (number) => {
    setMarkedNumbers(prev => {
      const newMarked = { ...prev };
      
      displayedCards.forEach(cardId => {
        const currentCard = bingoCards[cardId];
        if (currentCard) {
          // Check if this number exists in the card
          const hasNumber = currentCard.some(row => 
            row.some(cell => cell === number)
          );
          
          if (hasNumber) {
            const cardMarked = newMarked[cardId] || new Set();
            const newCardMarked = new Set(cardMarked);
            
            if (newCardMarked.has(number)) {
              newCardMarked.delete(number);
            } else {
              newCardMarked.add(number);
            }
            
            newMarked[cardId] = newCardMarked;
          }
        }
      });
      
      return newMarked;
    });
  };

  const handleMarkAll = () => {
    const number = parseInt(markAllNumber.trim());
    if (number >= 1 && number <= 75) {
      markNumberOnAllCards(number);
      setMarkAllNumber('');
      setShowMarkAllModal(false);
    } else {
      Alert.alert('Invalid Number', 'Please enter a number between 1 and 75');
    }
  };

  const addCardRange = () => {
    const input = cardRangeInput.trim();
    if (!input) return;

    // Parse input like "1-2600" or single numbers
    if (input.includes('-')) {
      const [start, end] = input.split('-').map(num => parseInt(num.trim()));
      if (start >= 1 && end <= 1000 && start <= end) {
        const newCards = [];
        for (let i = start; i <= Math.min(end, start + 50); i++) { // Limit to 50 cards max
          if (!displayedCards.includes(i)) {
            newCards.push(i);
          }
        }
        setDisplayedCards(prev => [...prev, ...newCards]);
        setCardRangeInput('');
        setShowAddModal(false);
      } else {
        Alert.alert('Invalid Range', 'Please enter a valid range (1-1000)');
      }
    } else {
      const cardNum = parseInt(input);
      if (cardNum >= 1 && cardNum <= 1000) {
        if (!displayedCards.includes(cardNum)) {
          setDisplayedCards(prev => [...prev, cardNum]);
        }
        setCardRangeInput('');
        setShowAddModal(false);
      } else {
        Alert.alert('Invalid Number', 'Please enter a card number between 1 and 1000');
      }
    }
  };

  const removeCard = (cardId) => {
    setDisplayedCards(prev => prev.filter(id => id !== cardId));
    setMarkedNumbers(prev => {
      const newMarked = { ...prev };
      delete newMarked[cardId];
      return newMarked;
    });
  };

  const checkBingo = (cardId) => {
    const currentCard = bingoCards[cardId];
    const cardMarked = markedNumbers[cardId] || new Set();
    
    if (!currentCard) return false;
    
    // Check rows
    for (let row = 0; row < 5; row++) {
      let rowComplete = true;
      for (let col = 0; col < 5; col++) {
        const cell = currentCard[row][col];
        if (cell !== 'FREE' && cell !== 'Free' && !cardMarked.has(cell)) {
          rowComplete = false;
          break;
        }
      }
      if (rowComplete) return true;
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
      let colComplete = true;
      for (let row = 0; row < 5; row++) {
        const cell = currentCard[row][col];
        if (cell !== 'FREE' && cell !== 'Free' && !cardMarked.has(cell)) {
          colComplete = false;
          break;
        }
      }
      if (colComplete) return true;
    }
    
    // Check diagonals
    let diag1Complete = true;
    let diag2Complete = true;
    
    for (let i = 0; i < 5; i++) {
      const cell1 = currentCard[i][i];
      const cell2 = currentCard[i][4 - i];
      
      if (cell1 !== 'FREE' && cell1 !== 'Free' && !cardMarked.has(cell1)) {
        diag1Complete = false;
      }
      if (cell2 !== 'FREE' && cell2 !== 'Free' && !cardMarked.has(cell2)) {
        diag2Complete = false;
      }
    }
    
    return diag1Complete || diag2Complete;
  };

  const renderBingoCard = (cardId) => {
    const currentCard = bingoCards[cardId];
    const cardMarked = markedNumbers[cardId] || new Set();
    const hasBingo = checkBingo(cardId);
    
    if (!currentCard) return null;

    // Dynamic width based on number of cards
    const isFullWidth = displayedCards.length === 1;
    const cardWidth = isFullWidth ? width - 4 : (width - 6) / 2;
    const cellSize = (cardWidth - 20) / 5;

    return (
      <View style={[
        styles.bingoCard, 
        { width: cardWidth },
        isFullWidth && styles.fullWidthCard
      ]}>
        <View style={[styles.cardHeader, hasBingo && styles.bingoCardHeader]}>
          <Text style={styles.cardNumber}>No- {cardId}</Text>
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => removeCard(cardId)}
          >
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.bingoHeader}>
          <Text style={[styles.bingoHeaderText, { width: cellSize }]}>B</Text>
          <Text style={[styles.bingoHeaderText, { width: cellSize }]}>I</Text>
          <Text style={[styles.bingoHeaderText, { width: cellSize }]}>N</Text>
          <Text style={[styles.bingoHeaderText, { width: cellSize }]}>G</Text>
          <Text style={[styles.bingoHeaderText, { width: cellSize }]}>O</Text>
        </View>
        
        {currentCard.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => {
              const isMarked = cardMarked.has(cell) || cell === 'FREE' || cell === 'Free';
              const isFreeSpace = cell === 'FREE' || cell === 'Free';
              
              return (
                <TouchableOpacity
                  key={`${rowIndex}-${colIndex}`}
                  style={[
                    styles.cell,
                    { width: cellSize, height: cellSize },
                    isMarked && styles.markedCell,
                    isFreeSpace && styles.freeCell,
                  ]}
                  onPress={() => {
                    if (!isFreeSpace) {
                      markNumber(cardId, cell);
                    }
                  }}
                >
                  <Text style={[
                    styles.cellText,
                    { fontSize: isFullWidth ? 16 : 12 },
                    isMarked && styles.markedCellText,
                    isFreeSpace && styles.freeCellText,
                  ]}>
                    {isFreeSpace ? 'F' : cell}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Fidel Bingo</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowMenu(true)}
        >
          <Text style={styles.menuText}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.cardsContainer} showsVerticalScrollIndicator={false}>
        {multiMarkMode && (
          <View style={styles.modeIndicator}>
            <Text style={styles.modeIndicatorText}>
              🎯 Multi-Mark Mode: Tap numbers directly on cards to mark them
            </Text>
          </View>
        )}
        <View style={[
          styles.cardsGrid,
          displayedCards.length === 1 && styles.singleCardGrid
        ]}>
          {displayedCards.map((cardId) => {
            const hasBingo = checkBingo(cardId);
            return (
              <View
                key={cardId}
                style={[
                  styles.cardWrapper, 
                  hasBingo && styles.bingoCardWrapper,
                  displayedCards.length === 1 && styles.singleCardWrapper
                ]}
              >
                {renderBingoCard(cardId)}
                {hasBingo && (
                  <View style={styles.bingoIndicator}>
                    <Text style={styles.bingoIndicatorText}>BINGO!</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContent}>
            <TouchableOpacity
              style={[styles.menuItem, styles.lastMenuItem]}
              onPress={() => {
                // Clear all marked numbers
                setMarkedNumbers({});
                setShowMenu(false);
              }}
            >
              <Text style={styles.menuItemText}>Clean</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Card Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.modalInput}
              placeholder="Cartela 1 - 2600"
              value={cardRangeInput}
              onChangeText={setCardRangeInput}
              keyboardType="numeric"
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={addCardRange}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowAddModal(false);
                  setCardRangeInput('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8e8e8',
  },
  header: {
    backgroundColor: '#000',
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  menuButton: {
    padding: 5,
  },
  menuText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardsContainer: {
    flex: 1,
    padding: 0,
  },
  modeIndicator: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  modeIndicatorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 0,
  },
  singleCardGrid: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  cardWrapper: {
    marginRight: 2,
    marginBottom: 2,
    position: 'relative',
  },
  singleCardWrapper: {
    alignSelf: 'center',
    margin: 0,
  },
  bingoCardWrapper: {
    shadowColor: '#e74c3c',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  bingoIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    transform: [{ rotate: '15deg' }],
  },
  bingoIndicatorText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bingoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fullWidthCard: {
    alignSelf: 'center',
  },
  cardHeader: {
    backgroundColor: '#8B4CB8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bingoCardHeader: {
    backgroundColor: '#e74c3c',
  },
  cardNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bingoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#000',
    paddingVertical: 4,
    marginBottom: 2,
  },
  bingoHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cell: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0.5,
    backgroundColor: 'white',
  },
  markedCell: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b',
  },
  freeCell: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b',
  },
  cellText: {
    fontWeight: 'bold',
    color: '#000000',
  },
  markedCellText: {
    color: 'white',
  },
  freeCellText: {
    color: 'white',
    fontSize: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#000',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  menuContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  disabledMenuItem: {
    opacity: 0.5,
  },
  disabledMenuItemText: {
    color: '#bdc3c7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: width - 80,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2c3e50',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    width: '100%',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});