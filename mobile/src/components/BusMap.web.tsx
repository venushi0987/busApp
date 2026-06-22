import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BusMapProps {
  latitude: number;
  longitude: number;
  busNumber: string;
  isBusFull: boolean;
}

export default function BusMap({ latitude, longitude }: BusMapProps) {
  return (
    <View style={styles.noLocationCard}>
      <Ionicons name="map-outline" size={24} color="#64748B" />
      <Text style={styles.noLocationText}>
        {latitude && longitude
          ? `Live Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          : 'Live location tracking is currently offline.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  noLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  noLocationText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
});
