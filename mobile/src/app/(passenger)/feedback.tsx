import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import apiClient from '@/api/client';
import { useAuth } from '@/context/AuthContext';

export default function FeedbackPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { driverId, busNumber } = useLocalSearchParams();

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select at least 1 star before submitting.');
      return;
    }
    if (!driverId) {
      Alert.alert('Error', 'Driver information is missing.');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post(
        '/api/feedback/add',
        {
          driverId,
          busNumber: busNumber || '',
          stars: rating,
          comment: comment.trim(),
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );

      if (response.data.success) {
        Alert.alert('Thank You!', 'Your feedback has been submitted successfully.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to submit feedback. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A5F56" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Feedback</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.busInfoText}>
          Rate your journey with Bus {busNumber || '—'}
        </Text>

        {/* ⭐ STAR RATING ROW */}
        <Text style={styles.sectionLabel}>Select Rating:</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={36}
                color={star <= rating ? '#F1C40F' : '#CBD5E1'}
                style={{ marginRight: 8 }}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* 📝 COMMENT INPUT */}
        <Text style={styles.sectionLabel}>Write your comment:</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Share your experience with the driver and bus condition..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
        />

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmitFeedback}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>Submit Feedback</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1A5F56', marginLeft: 12 },
  card: {
    backgroundColor: '#FFFFFF', margin: 16, borderRadius: 16, padding: 20,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  busInfoText: { fontSize: 15, fontWeight: '700', color: '#334155', textAlign: 'center', marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 8 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, marginTop: 4 },
  commentInput: {
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#334155', height: 100, textAlignVertical: 'top', marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#1A5F56', height: 46, borderRadius: 10,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});