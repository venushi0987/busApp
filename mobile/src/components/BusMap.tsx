import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface BusMapProps {
  latitude: number;
  longitude: number;
  busNumber: string;
  isBusFull: boolean;
}

export default function BusMap({ latitude, longitude, busNumber, isBusFull }: BusMapProps) {
  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        region={{
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={busNumber}
          description={isBusFull ? 'Bus is Full' : 'Bus is Available'}
          pinColor={isBusFull ? 'red' : 'green'}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
