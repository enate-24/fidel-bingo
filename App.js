import { useState, useEffect } from 'react';
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
  Vibration,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bingoCards } from './cartela';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [displayedCards, setDisplayedCards] = useState([]);
  const [markedNumbers, setMarkedNumbers] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [cardRangeInput, setCardRangeInput] = useState('');
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
    
    // Load saved data on app start
    loadSavedData();
  }, []);

  // Save data to AsyncStorage
  const saveData = async (cards, marked) => {
    try {
      const dataToSave = {
        displayedCards: cards,
        markedNumbers: marked
      };
      await AsyncStorage.setItem('bingoData', JSON.stringify(dataToSave));
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };

  // Load data from AsyncStorage
  const loadSavedData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('bingoData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.displayedCards && parsedData.displayedCards.length > 0) {
          setDisplayedCards(parsedData.displayedCards);
        }
        if (parsedData.markedNumbers) {
          // Convert arrays back to Sets
          const convertedMarked = {};
          Object.keys(parsedData.markedNumbers).forEach(cardId => {
            convertedMarked[cardId] = new Set(parsedData.markedNumbers[cardId]);
          });
          setMarkedNumbers(convertedMarked);
        }
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  // Save data whenever displayedCards or markedNumbers change
  useEffect(() => {
    if (displayedCards.length > 0 || Object.keys(markedNumbers).length > 0) {
      // Convert Sets to arrays for storage
      const markedForStorage = {};
      Object.keys(markedNumbers).forEach(cardId => {
        markedForStorage[cardId] = Array.from(markedNumbers[cardId]);
      });
      saveData(displayedCards, markedForStorage);
    }
  }, [displayedCards, markedNumbers]);

  const markNumber = (cardId, number) => {
    Vibration.vibrate(10); // Quick haptic feedback
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

  const addCardRange = () => {
    const input = cardRangeInput.trim();
    if (!input) return;

    // Parse input like "1-2000" or single numbers
    if (input.includes('-')) {
      const [start, end] = input.split('-').map(num => parseInt(num.trim()));
      if (start >= 1 && end <= 2000 && start <= end) {
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
        Alert.alert('Invalid Range', 'Please enter a valid range (1-2000)');
      }
    } else {
      const cardNum = parseInt(input);
      if (cardNum >= 1 && cardNum <= 2000) {
        if (!displayedCards.includes(cardNum)) {
          setDisplayedCards(prev => [...prev, cardNum]);
        }
        setCardRangeInput('');
        setShowAddModal(false);
      } else {
        Alert.alert('Invalid Number', 'Please enter a card number between 1 and 2000');
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

  const renderBingoCard = (cardId) => {
    const currentCard = bingoCards[cardId];
    const cardMarked = markedNumbers[cardId] || new Set();
    
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
        <View style={styles.cardHeader}>
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
                <Pressable
                  key={`${rowIndex}-${colIndex}`}
                  style={({ pressed }) => [
                    styles.cell,
                    { width: cellSize, height: cellSize },
                    isMarked && styles.markedCell,
                    isFreeSpace && styles.freeCell,
                    pressed && { opacity: 0.6 },
                  ]}
                  onPressIn={() => {
                    if (!isFreeSpace) {
                      markNumber(cardId, cell);
                    }
                  }}
                  delayLongPress={0}
                  android_disableSound={true}
                >
                  <Text style={[
                    styles.cellText,
                    { fontSize: isFullWidth ? 16 : 12 },
                    isMarked && styles.markedCellText,
                    isFreeSpace && styles.freeCellText,
                  ]}>
                    {isFreeSpace ? 'F' : cell}
                  </Text>
                </Pressable>
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
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>FB</Text>
          </View>
          <Text style={styles.title}>Fidel Bingo</Text>
        </View>
        <TouchableOpacity 
          style={styles.menuButton}
          onPressIn={() => setShowMenu(true)}
        >
          <Text style={styles.menuText}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.cardsContainer} showsVerticalScrollIndicator={false}>
        {displayedCards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No cards added yet</Text>
            <Text style={styles.emptyStateSubtext}>Tap the + button to add your first card</Text>
          </View>
        ) : (
          <View style={[
            styles.cardsGrid,
            displayedCards.length === 1 && styles.singleCardGrid
          ]}>
            {displayedCards.map((cardId) => {
              return (
                <View
                  key={cardId}
                  style={[
                    styles.cardWrapper,
                    displayedCards.length === 1 && styles.singleCardWrapper
                  ]}
                >
                  {renderBingoCard(cardId)}
                </View>
              );
            })}
          </View>
        )}
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
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <TouchableOpacity 
            style={styles.cleanButtonMenu}
            activeOpacity={0.7}
            onPress={async () => {
              // Clear all marked numbers and saved data
              setMarkedNumbers({});
              try {
                await AsyncStorage.removeItem('bingoData');
              } catch (error) {
                console.log('Error clearing saved data:', error);
              }
              setShowMenu(false);
            }}
          >
            <Text style={styles.cleanButtonMenuText}>Clean</Text>
          </TouchableOpacity>
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
              placeholder="Cartela 1 - 2000"
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
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#1a1a2e',
    paddingTop: 15,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  menuButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  menuText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  cardsContainer: {
    flex: 1,
    padding: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 120,
  },
  emptyStateText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 17,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 26,
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
  bingoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  fullWidthCard: {
    alignSelf: 'center',
  },
  cardHeader: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardNumber: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  removeButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  bingoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a2e',
    paddingVertical: 8,
    marginBottom: 4,
    borderRadius: 8,
  },
  bingoHeaderText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cell: {
    borderWidth: 2,
    borderColor: '#dfe6e9',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  markedCell: {
    backgroundColor: '#00b894',
    borderColor: '#00a383',
  },
  freeCell: {
    backgroundColor: '#00b894',
    borderColor: '#00a383',
  },
  cellText: {
    fontWeight: '900',
    color: '#2d3436',
  },
  markedCellText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  freeCellText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#1a1a2e',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1a1a2e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 10,
    paddingRight: 50,
    paddingLeft: 20,
  },
  cleanButtonMenu: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cleanButtonMenuText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  menuContent: {
    backgroundColor: 'rgba(59, 130, 246, 0.95)',
    borderRadius: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    padding: 20,
  },
  menuPlaceholder: {
    fontSize: 15,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  menuItem: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  menuItemText: {
    fontSize: 17,
    color: '#ffffff',
    fontWeight: '600',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  disabledMenuItem: {
    opacity: 0.5,
  },
  disabledMenuItemText: {
    color: '#b2bec3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    width: width - 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
    color: '#2d3436',
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 17,
    width: '100%',
    marginBottom: 24,
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    fontWeight: '600',
    color: '#2d3436',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
    shadowColor: '#1a1a2e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
});