import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  ScrollView,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bingoCards } from './cartela';

const getScales = () => {
  const { width, height } = Dimensions.get('window');
  const isTablet = width >= 768;
  const cols = isTablet ? 3 : 2;
  const cardWidth = width / cols;
  const cellSize = (cardWidth - 12) / 5;
  const scale = width / 375;
  return { width, height, isTablet, cols, cardWidth, cellSize, scale };
};

export default function App() {
  const [dims, setDims] = useState(getScales());
  const [showSplash, setShowSplash] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [cardInput, setCardInput] = useState('');
  const [displayedCards, setDisplayedCards] = useState([]);
  const [markedNumbers, setMarkedNumbers] = useState({});

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', () => setDims(getScales()));
    return () => sub?.remove();
  }, []);

  useEffect(() => {
    const setupFullScreen = async () => {
      try {
        if (NavigationBar.setVisibilityAsync) await NavigationBar.setVisibilityAsync('hidden');
      } catch (e) {}
    };
    setupFullScreen();
    const loadData = async () => {
      try {
        const saved = await AsyncStorage.getItem('cartelaData');
        if (saved) {
          const { cards, marked } = JSON.parse(saved);
          if (cards) setDisplayedCards(cards);
          if (marked) {
            const converted = {};
            Object.keys(marked).forEach(k => { converted[k] = new Set(marked[k]); });
            setMarkedNumbers(converted);
          }
        }
      } catch (e) {}
    };
    loadData();
  }, []);

  // Save whenever cards or marked numbers change
  useEffect(() => {
    const saveData = async () => {
      try {
        const markedForStorage = {};
        Object.keys(markedNumbers).forEach(k => {
          markedForStorage[k] = Array.from(markedNumbers[k]);
        });
        await AsyncStorage.setItem('cartelaData', JSON.stringify({
          cards: displayedCards,
          marked: markedForStorage,
        }));
      } catch (e) {}
    };
    saveData();
  }, [displayedCards, markedNumbers]);

  const addCards = () => {
    const input = cardInput.trim();
    if (!input) return;
    let newIds = [];
    if (input.includes('-')) {
      const [start, end] = input.split('-').map(n => parseInt(n.trim()));
      if (isNaN(start) || isNaN(end) || start < 1 || end > 2000 || start > end) {
        Alert.alert('Invalid Range', 'Range must be between 1 and 2000. Max cartela is 2000.');
        return;
      }
      for (let i = start; i <= end; i++) {
        if (!displayedCards.includes(i) && bingoCards[i]) newIds.push(i);
      }
    } else {
      const num = parseInt(input);
      if (isNaN(num) || num < 1 || num > 2000) {
        Alert.alert('Invalid Number', 'Cartela number must be between 1 and 2000.');
        return;
      }
      if (!displayedCards.includes(num) && bingoCards[num]) newIds.push(num);
    }
    if (newIds.length === 0) {
      Alert.alert('Not Found', 'No new valid cartela found');
      return;
    }
    setDisplayedCards(prev => [...prev, ...newIds]);
    setCardInput('');
    setShowAddModal(false);
  };

  const toggleNumber = (cardId, value) => {
    setMarkedNumbers(prev => {
      const newMarked = { ...prev };
      // Mark/unmark on the tapped card first to determine action
      const tappedSet = new Set(prev[cardId] || []);
      const isAdding = !tappedSet.has(value);

      // Apply to all displayed cards that contain this number
      displayedCards.forEach(id => {
        const card = bingoCards[id];
        if (!card) return;
        const hasNumber = card.some(row => row.some(cell => {
          const v = typeof cell === 'string' ? parseInt(cell) : cell;
          return v === value;
        }));
        if (hasNumber) {
          const s = new Set(prev[id] || []);
          isAdding ? s.add(value) : s.delete(value);
          newMarked[id] = s;
        }
      });

      return newMarked;
    });
  };

  const removeCard = (cardId) => {
    Alert.alert(
      'Delete Cartela',
      `Remove cartela No-${cardId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes', style: 'destructive',
          onPress: () => {
            setDisplayedCards(prev => prev.filter(id => id !== cardId));
            setMarkedNumbers(prev => { const n = { ...prev }; delete n[cardId]; return n; });
          }
        }
      ]
    );
  };

  const renderCard = useCallback((cardId) => {
    const card = bingoCards[cardId];
    if (!card) return null;
    const marked = markedNumbers[cardId] || new Set();
    const { cardWidth, cellSize, scale } = dims;
    const isFullWidth = displayedCards.length === 1;
    const cols = dims.isTablet ? 3 : 2;
    const gap = 1.5;
    const cw = isFullWidth ? dims.width : (dims.width - gap * (cols - 1)) / cols;
    const cs = (cw - 12) / 5;
    const numFontSize = Math.max(10, Math.min(cs * 0.45, 20)) * 1.15;
    const headerFontSize = Math.max(10, Math.min(cs * 0.42, 16));

    return (
      <View key={cardId} style={[styles.card, { width: cw }]}>
        <View style={[styles.cardHeader, { paddingVertical: Math.max(3, scale * 4) }]}>
          <Text style={[styles.cardNumber, { fontSize: Math.max(11, scale * 13) * 1.20 }]}>{cardId}</Text>
          <TouchableOpacity onPress={() => removeCard(cardId)} style={styles.removeBtn}>
            <Text style={styles.removeBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bingoRow}>
          {['B','I','N','G','O'].map(l => (
            <Text key={l} style={[styles.bingoLetter, { width: cs, fontSize: headerFontSize }]}>{l}</Text>
          ))}
        </View>

        {card.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((cell, ci) => {
              const isFree = cell === 'FREE' || cell === 'Free';
              const val = isFree ? cell : (typeof cell === 'string' ? parseInt(cell) : cell);
              const isMarked = isFree || marked.has(val);
              return (
                <Pressable
                  key={ci}
                  style={[styles.cell, { width: cs, height: cs * 0.88 }, isMarked && styles.markedCell]}
                  onPressIn={() => { if (!isFree) toggleNumber(cardId, val); }}
                >
                  <Text style={[styles.cellText, { fontSize: numFontSize }, isMarked && styles.markedText]}>
                    {isFree ? 'F' : cell}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    );
  }, [dims, displayedCards, markedNumbers]);

  const { width, height, scale } = dims;
  const btnSize = Math.max(52, Math.min(scale * 64, 72));
  const headerPad = Math.max(10, scale * 14);

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {showSplash && (
        <View style={styles.splashContainer}>
          <View style={[styles.splashLogo, {
            width: scale * 110, height: scale * 110, borderRadius: scale * 55, marginBottom: scale * 24,
          }]}>
            <Text style={[styles.splashLogoText, { fontSize: scale * 44 }]}>FB</Text>
          </View>
          <Text style={[styles.splashTitle, { fontSize: scale * 30 }]}>Fidel Bingo</Text>
        </View>
      )}

      {!showSplash && (
        <>
          <View style={[styles.header, { paddingHorizontal: headerPad, paddingVertical: Math.max(8, scale * 10) }]}>
            <Text style={[styles.headerTitle, { fontSize: Math.max(15, scale * 18) }]}>Fidel Bingo</Text>
            <TouchableOpacity style={styles.menuBtn} onPress={() => setShowMenu(true)}>
              <Text style={[styles.menuBtnText, { fontSize: Math.max(18, scale * 22) }]}>⋮</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: btnSize + 40 }}>
            {displayedCards.length === 0 ? (
              <View style={[styles.emptyState, { marginTop: height * 0.25 }]}>
                <Text style={[styles.emptyText, { fontSize: scale * 20 }]}>No cartela added yet</Text>
                <Text style={[styles.emptySubtext, { fontSize: scale * 14 }]}>Tap + to add your first cartela</Text>
              </View>
            ) : (
              <View style={styles.cardsGrid}>
                {displayedCards.map(id => renderCard(id))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.addButton, { width: btnSize, height: btnSize, borderRadius: btnSize / 2, bottom: scale * 28, right: scale * 24 }]}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={[styles.addButtonText, { fontSize: scale * 34, lineHeight: scale * 38 }]}>+</Text>
          </TouchableOpacity>

          {/* Add Modal */}
          <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { width: width * 0.82, padding: scale * 22 }]}>
                <Text style={[styles.modalTitle, { fontSize: scale * 18, marginBottom: scale * 14 }]}>Add Cartela</Text>
                <TextInput
                  style={[styles.modalInput, { fontSize: scale * 16, marginBottom: scale * 14, paddingVertical: scale * 11 }]}
                  placeholder="e.g. 5 or 1-2000"
                  value={cardInput}
                  onChangeText={setCardInput}
                  keyboardType="numeric"
                  autoFocus={true}
                  maxLength={9}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.modalButton, { paddingVertical: scale * 13 }]} onPress={addCards}>
                    <Text style={[styles.modalButtonText, { fontSize: scale * 15 }]}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.cancelButton, { paddingVertical: scale * 13 }]} onPress={() => { setShowAddModal(false); setCardInput(''); }}>
                    <Text style={[styles.modalButtonText, { fontSize: scale * 15 }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Dropdown Menu */}
          <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
            <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
              <View style={[styles.menuDropdown, { top: scale * 50, right: scale * 10, minWidth: scale * 140 }]}>
                <TouchableOpacity style={[styles.menuItem, { paddingVertical: scale * 13, paddingHorizontal: scale * 16 }]}
                  onPress={() => { setMarkedNumbers({}); setShowMenu(false); }}>
                  <Text style={[styles.menuItemText, { fontSize: scale * 15 }]}>🧹 Clean</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8e8e8' },
  splashContainer: { flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' },
  splashLogo: {
    backgroundColor: '#ff6b6b', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#ff6b6b', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  splashLogoText: { fontWeight: '900', color: '#fff', letterSpacing: 2 },
  splashTitle: { fontWeight: '700', color: '#ffffff', letterSpacing: 1, textAlign: 'center' },
  header: {
    backgroundColor: '#1a1a2e', flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontWeight: '700' },
  menuBtn: { padding: 6 },
  menuBtnText: { color: '#fff', fontWeight: '700' },
  emptyState: { alignItems: 'center' },
  emptyText: { fontWeight: '700', color: '#2d3436', marginBottom: 8 },
  emptySubtext: { color: '#636e72' },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 1.5, backgroundColor: '#e8e8e8' },
  card: {
    backgroundColor: '#fff', borderRadius: 0,
    borderWidth: 1, borderColor: '#ff6b6b',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2,
  },
  cardHeader: {
    backgroundColor: '#1a1a2e', borderTopLeftRadius: 10, borderTopRightRadius: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8,
  },
  cardNumber: { color: '#ffd700', fontWeight: '900', flex: 1, textAlign: 'center' },
  removeBtn: {
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  bingoRow: { flexDirection: 'row', backgroundColor: '#6c5ce7', paddingVertical: 4 },
  bingoLetter: { textAlign: 'center', color: '#fff', fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  cell: {
    borderWidth: 1, borderColor: '#dfe6e9', justifyContent: 'center',
    alignItems: 'center', margin: 1, backgroundColor: '#ffffff', borderRadius: 4,
  },
  markedCell: { backgroundColor: '#e74c3c', borderColor: '#c0392b' },
  cellText: { fontWeight: '900', color: '#1a1a2e' },
  markedText: { color: '#fff', fontWeight: '900' },
  addButton: {
    position: 'absolute', backgroundColor: '#1a1a2e',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  addButtonText: { color: '#ffffff', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 10,
  },
  modalTitle: { fontWeight: '700', color: '#2d3436' },
  modalInput: {
    borderWidth: 2, borderColor: '#dfe6e9', borderRadius: 12, paddingHorizontal: 16,
    width: '100%', textAlign: 'center', backgroundColor: '#f8f9fa', fontWeight: '600', color: '#2d3436',
  },
  modalButtons: { flexDirection: 'row', gap: 10, width: '100%' },
  modalButton: { backgroundColor: '#1a1a2e', borderRadius: 12, flex: 1, alignItems: 'center' },
  cancelButton: { backgroundColor: '#b2bec3' },
  modalButtonText: { color: '#ffffff', fontWeight: '700' },
  menuOverlay: { flex: 1, backgroundColor: 'transparent' },
  menuDropdown: {
    position: 'absolute', backgroundColor: '#1a1a2e', borderRadius: 10, elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  menuItem: {},
  menuItemText: { color: '#fff', fontWeight: '600' },
});
