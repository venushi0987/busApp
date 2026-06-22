import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomInput } from '../../components/ui/CustomInput'; 

interface HistoryItem {
  id: string;
  from: string;
  to: string;
}

export default function PassengerDashboard() {
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [searchHistory, setSearchHistory] = useState<HistoryItem[]>([]);

  // පේජ් එක ලෝඩ් වෙද්දී AsyncStorage එකෙන් සර්ච් හිස්ට්‍රි එක ගන්නවා
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const existingHistory = await AsyncStorage.getItem('passengerSearchHistory');
      if (existingHistory) {
        setSearchHistory(JSON.parse(existingHistory));
      }
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  // සර්ච් එක හිස්ට්‍රි එකට සේව් කරන Function එක
  const saveToHistory = async (searchFrom: string, searchTo: string) => {
    try {
      const existingHistory = await AsyncStorage.getItem('passengerSearchHistory');
      let historyArray: HistoryItem[] = existingHistory ? JSON.parse(existingHistory) : [];

      historyArray = historyArray.filter(
        item => !(item.from.toLowerCase() === searchFrom.toLowerCase() && item.to.toLowerCase() === searchTo.toLowerCase())
      );

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        from: searchFrom,
        to: searchTo
      };
      
      historyArray.unshift(newItem);

      if (historyArray.length > 5) {
        historyArray.pop();
      }

      setSearchHistory(historyArray);
      await AsyncStorage.setItem('passengerSearchHistory', JSON.stringify(historyArray));
    } catch (error) {
      console.error("Error saving history:", error);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('passengerSearchHistory');
      setSearchHistory([]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  const handleSearchNavigate = async (searchFrom = from, searchTo = to) => {
    if (!searchFrom.trim() || !searchTo.trim()) {
      Alert.alert("Input Required", "Please enter both 'From' and 'To' locations to search buses.");
      return;
    }
    
    await saveToHistory(searchFrom.trim(), searchTo.trim());

    router.push({
      pathname: '/(passenger)/explore',
      params: { startPoint: searchFrom.trim(), destination: searchTo.trim() }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* ================= 1. TOP WELCOME HEADER ================= */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcomeText}>Hello Passenger 👋</Text>
            <Text style={styles.subWelcomeText}>Where do you want to go today?</Text>
          </View>
          <TouchableOpacity style={styles.notificationBadge}>
            <Ionicons name="notifications-outline" size={22} color="#1A5F56" />
          </TouchableOpacity>
        </View>

        {/* ================= 2. NEW BEAUTIFUL SEARCH CONTAINER ================= */}
        <View style={styles.mainSearchCard}>
          <Text style={styles.cardTitle}>Search Available Buses</Text>
          
          {/* Input Box Row */}
          <View style={styles.inputsRowContainer}>
            {/* From Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>From</Text>
              <CustomInput placeholder="Departure" value={from} onChangeText={setFrom} />
            </View>
            
            {/* ➡️ තනි පිරිසිදු ඇරෝ එක මැදට */}
            <View style={styles.arrowIconWrapper}>
              <Ionicons name="arrow-forward" size={16} color="#1A5F56" />
            </View>

            {/* To Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>To</Text>
              <CustomInput placeholder="Destination" value={to} onChangeText={setTo} />
            </View>
          </View>

          {/* 🔍 සර්ච් බොක්ස් දෙකට යටින් වැටෙන ලස්සන Full Width බටන් එක */}
          <TouchableOpacity style={styles.fullWidthSearchButton} onPress={() => handleSearchNavigate()}>
            <Ionicons name="search" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.searchButtonText}>Search Buses</Text>
          </TouchableOpacity>
        </View>

        {/* ================= 3. SEARCH HISTORY SECTION ================= */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionHeading}>Recent Searches</Text>
            {searchHistory.length > 0 && (
              <TouchableOpacity onPress={clearHistory}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {searchHistory.length === 0 ? (
            <View style={styles.emptyHistoryCard}>
              <Ionicons name="time-outline" size={24} color="#A0AEC0" />
              <Text style={styles.emptyHistoryText}>Your recent searches will appear here.</Text>
            </View>
          ) : (
            searchHistory.map((item) => (
              <TouchableOpacity 
                key={item.id}
                style={styles.historyCard} 
                onPress={() => {
                  setFrom(item.from);
                  setTo(item.to);
                  handleSearchNavigate(item.from, item.to);
                }}
              >
                <View style={styles.historyIconWrapper}>
                  <Ionicons name="time-outline" size={18} color="#64748B" />
                </View>
                <View style={styles.historyTextContainer}>
                  <Text style={styles.historyRouteText}>{item.from} → {item.to}</Text>
                </View>
                <Ionicons name="arrow-forward-outline" size={14} color="#CBD5E1" />
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContainer: { padding: 16 },
  
  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 24, paddingHorizontal: 4 },
  welcomeText: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  subWelcomeText: { fontSize: 13, color: '#64748B', marginTop: 2 },
  notificationBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },

  // New Search Card Layout
  mainSearchCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, marginBottom: 24 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A5F56', marginBottom: 16, marginLeft: 2 },
  
  inputsRowContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, marginBottom: 14 },
  inputWrapper: { flex: 1 },
  label: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 6, marginLeft: 2, textTransform: 'uppercase' },
  
  // මැද තනි ඇරෝ එකේ ස්ටයිල් එක
  arrowIconWrapper: { paddingHorizontal: 8, marginTop: 18, justifyContent: 'center', alignItems: 'center' },
  
  // Sign In බටන් එක වගේ පල්ලෙහාට වැටෙන පළල බටන් එක
  fullWidthSearchButton: { backgroundColor: '#1A5F56', height: 46, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' },
  searchButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // History Section
  historySection: { marginTop: 4 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 2 },
  sectionHeading: { fontSize: 15, fontWeight: '700', color: '#334155' },
  clearAllText: { fontSize: 13, color: '#EF4444', fontWeight: '600' },
  
  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  historyIconWrapper: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  historyTextContainer: { flex: 1 },
  historyRouteText: { fontSize: 14, fontWeight: '600', color: '#334155' },

  emptyHistoryCard: { alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  emptyHistoryText: { color: '#94A3B8', fontSize: 13, marginTop: 8, fontWeight: '500' }
});