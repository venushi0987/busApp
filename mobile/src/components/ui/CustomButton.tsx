import React from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, Text, StyleProp, ViewStyle } from 'react-native';
import { Spacing } from '@/constants/theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  style?: StyleProp<ViewStyle>;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const getBackgroundColor = () => {
    if (disabled || isLoading) return '#a9a9b0';
    if (variant === 'secondary') return '#34c759';
    if (variant === 'danger') return '#ff3b30';
    if (variant === 'warning') return '#ff9500';
    return '#007aff'; // default primary brand color
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: Spacing.two,
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
