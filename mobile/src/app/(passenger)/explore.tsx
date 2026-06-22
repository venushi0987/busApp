import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  ActivityIndicator, FlatList, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import apiClient from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import BusMap from '@/components/BusMap';

interface BusData {
  _id: string;
  busNumber: string;
  busName?: string;
  startPoint: string;
  destination: string;
  departureTime: string;
  arrivalTime?: string;
  status: 'ACTIVE' | 'DELAYED' | 'CANCELED';
  isBusFull?: boolean;
  delayMinutes?: number;
  cancellationReason?: string;
  busType?: string;
  vehicleType?: string;
  routeType?: string;
  latitude?: number;
  longitude?: number;
  // Populated driver fields
  driver?: {
    _id: string;
    name: string;
    contactNo?: string;
    busType?: string;
    busName?: string;
    vehicleType?: string;
    routeType?: string;
  };
}

export default function BusSearchResults() {
  const router = useRouter();
  const { token } = useAuth();

  // Accept both param naming conventions
  const params = useLocalSearchParams();
  const startPoint = (params.startPoint || params.from || '') as string;
  const destination = (params.destination || params.to || '') as string;

  const [loading, setLoading] = useState(false);
  const [buses, setBuses] = useState<BusData[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchBuses();
    
    // Polling interval for live updates
    const interval = setInterval(() => {
      fetchBuses(false); // pass false to avoid showing loading indicator again
    }, 10000);

    return () => clearInterval(interval);
  }, [startPoint, destination]);

  const fetchBuses = async (showLoading = true) => {
    if (!startPoint || !destination) return;
    if (showLoading) setLoading(true);
    setErrorMsg('');
    try {
      const params: Record<string, string> = {};
      if (startPoint) params.startPoint = startPoint;
      if (destination) params.destination = destination;

      const res = await apiClient.get('/api/bus/schedules', {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (res.data.success && res.data.schedules.length > 0) {
        const mapped: BusData[] = res.data.schedules.map((item: any) => ({
          _id: item._id,
          busNumber: item.busNumber,
          busName: item.busName || item.driver?.busName || '',
          startPoint: item.startPoint,
          destination: item.destination,
          departureTime: item.departureTime,
          arrivalTime: item.arrivalTime || '',
          status: item.status,
          isBusFull: item.isBusFull ?? false,
          delayMinutes: item.delayMinutes ?? 0,
          cancellationReason: item.cancellationReason || '',
          busType: item.busType || item.driver?.busType || 'Private',
          vehicleType: item.vehicleType || item.driver?.vehicleType || 'Non-AC',
          routeType: item.routeType || item.driver?.routeType || 'Normal',
          latitude: item.latitude,
          longitude: item.longitude,
          driver: item.driver,
        }));
        setBuses(mapped);
        setSelectedBus(mapped[0]);
      } else {
        setBuses([]);
        setSelectedBus(null);
        setErrorMsg('No buses found on this route. Try a different route.');
      }
    } catch (err: any) {
      console.warn('[Explore] fetch error:', err?.message);
      setBuses([]);
      setSelectedBus(null);
      setErrorMsg('Could not connect to the server. Please check your connection.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'ACTIVE') return '#16a34a';
    if (status === 'DELAYED') return '#d97706';
    return '#dc2626';
  };

  const getStatusLabel = (bus: BusData) => {
    if (bus.status === 'ACTIVE') return bus.isBusFull ? '🔴 Bus Full' : '🟢 Available';
    if (bus.status === 'DELAYED') return `🟡 Delayed ${bus.delayMinutes ?? 0} min`;
    return '🔴 Cancelled';
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1A5F56" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Bus Search Results</Text>
          {startPoint && destination ? (
            <Text style={styles.headerSub}>{startPoint} → {destination}</Text>
          ) : null}
        </View>
      </View>

      {/* ── LOADING ── */}
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1A5F56" />
          <Text style={styles.loadingText}>Searching available buses…</Text>
        </View>
      )}

      {/* ── ERROR / EMPTY ── */}
      {!loading && errorMsg !== '' && (
        <View style={styles.centered}>
          <Ionicons name="bus-outline" size={48} color="#CBD5E1" />
          <Text style={styles.emptyText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchBuses()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── BUS LIST (horizontal chips) ── */}
      {!loading && buses.length > 0 && (
        <>
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>
              {buses.length} Bus{buses.length !== 1 ? 'es' : ''} Found
            </Text>
            <FlatList
              data={buses}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.busChip,
                    selectedBus?._id === item._id && styles.busChipSelected,
                    item.isBusFull && styles.busChipFull,
                  ]}
                  onPress={() => setSelectedBus(item)}
                >
                  <Ionicons
                    name="bus"
                    size={16}
                    color={selectedBus?._id === item._id ? '#FFF' : '#1A5F56'}
                  />
                  <Text style={[
                    styles.busChipText,
                    selectedBus?._id === item._id && { color: '#FFF' },
                  ]}>
                    {item.busNumber}
                  </Text>
                  {item.isBusFull && (
                    <View style={styles.fullBadge}>
                      <Text style={styles.fullBadgeText}>FULL</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>

          {/* ── SELECTED BUS DETAILS ── */}
          {selectedBus && (
            <ScrollView style={styles.detailsScroll} showsVerticalScrollIndicator={false}>

              {/* Status Banner */}
              <View style={[styles.statusBanner, { backgroundColor: getStatusColor(selectedBus.status) + '1A' }]}>
                <Text style={[styles.statusBannerText, { color: getStatusColor(selectedBus.status) }]}>
                  {getStatusLabel(selectedBus)}
                </Text>
              </View>

              {/* Map View */}
              {selectedBus.latitude && selectedBus.longitude ? (
                <BusMap 
                  latitude={selectedBus.latitude} 
                  longitude={selectedBus.longitude} 
                  busNumber={selectedBus.busNumber} 
                  isBusFull={selectedBus.isBusFull ?? false} 
                />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 16, marginBottom: 16, gap: 10 }}>
                  <Ionicons name="map-outline" size={24} color="#64748B" />
                  <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>
                    Live location tracking is currently offline.
                  </Text>
                </View>
              )}

              {/* Details Card */}
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Bus & Driver Details</Text>

                <InfoRow label="Bus Number" value={selectedBus.busNumber} />
                <InfoRow label="Bus Name" value={selectedBus.busName || '—'} />
                <InfoRow label="Driver" value={selectedBus.driver?.name || '—'} />
                <InfoRow label="Contact" value={selectedBus.driver?.contactNo || '—'} />
                <InfoRow label="Route" value={`${selectedBus.startPoint} → ${selectedBus.destination}`} />
                <InfoRow label="Departs" value={selectedBus.departureTime} highlight />
                {selectedBus.arrivalTime ? (
                  <InfoRow label="Arrives" value={selectedBus.arrivalTime} />
                ) : null}
                <InfoRow label="Bus Type" value={selectedBus.busType || '—'} />
                <InfoRow label="Vehicle" value={selectedBus.vehicleType || '—'} />
                <InfoRow label="Route Type" value={selectedBus.routeType || '—'} />
                {selectedBus.status === 'DELAYED' && (
                  <InfoRow
                    label="Delay"
                    value={`${selectedBus.delayMinutes} min — ${selectedBus.cancellationReason || 'Traffic'}`}
                    warn
                  />
                )}
                {selectedBus.status === 'CANCELED' && (
                  <InfoRow
                    label="Reason"
                    value={selectedBus.cancellationReason || 'No reason given'}
                    danger
                  />
                )}
                <InfoRow
                  label="Seats"
                  value={selectedBus.isBusFull ? 'Bus Full 🔴' : 'Available 🟢'}
                  danger={selectedBus.isBusFull}
                />
              </View>

              {/* ── FEEDBACK BUTTON ── */}
              {selectedBus.driver?._id && (
                <TouchableOpacity
                  style={styles.feedbackBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/(passenger)/feedback',
                      params: {
                        driverId: selectedBus.driver!._id,
                        busNumber: selectedBus.busNumber,
                      },
                    })
                  }
                >
                  <Ionicons name="star-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.feedbackBtnText}>Leave Feedback for Driver</Text>
                </TouchableOpacity>
              )}

              <View style={{ height: 32 }} />
            </ScrollView>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

// ── Small reusable row component ─────────────────────────────────────────────
function InfoRow({
  label, value, highlight, warn, danger,
}: {
  label: string; value: string;
  highlight?: boolean; warn?: boolean; danger?: boolean;
}) {
  const valueColor = danger ? '#dc2626' : warn ? '#d97706' : highlight ? '#1A5F56' : '#1E293B';
  return (
    <View style={styles.infoRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.fieldValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1A5F56' },
  headerSub: { fontSize: 12, color: '#64748B', marginTop: 2 },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { marginTop: 12, color: '#64748B', fontSize: 14 },
  emptyText: { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginTop: 12, lineHeight: 22 },
  retryBtn: {
    marginTop: 16, backgroundColor: '#1A5F56', paddingHorizontal: 24,
    paddingVertical: 10, borderRadius: 8,
  },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  listSection: { padding: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 10 },
  busChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F1F5F9', paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 10, marginRight: 10, borderWidth: 1, borderColor: '#E2E8F0',
  },
  busChipSelected: { backgroundColor: '#1A5F56', borderColor: '#1A5F56' },
  busChipFull: { borderColor: '#dc2626' },
  busChipText: { fontSize: 13, fontWeight: '700', color: '#334155' },
  fullBadge: { backgroundColor: '#dc2626', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  fullBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },

  detailsScroll: { flex: 1, padding: 16 },

  statusBanner: {
    borderRadius: 10, padding: 12, marginBottom: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  statusBannerText: { fontSize: 15, fontWeight: '700' },

  infoCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  fieldLabel: { fontSize: 14, color: '#64748B', width: '38%', fontWeight: '500' },
  fieldValue: { fontSize: 14, fontWeight: '700', flex: 1 },

  feedbackBtn: {
    backgroundColor: '#F59E0B', borderRadius: 12, height: 50,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  feedbackBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});