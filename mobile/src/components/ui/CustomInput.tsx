import React, { useState } from 'react';
import { StyleSheet, TextInput, View, useColorScheme, TextInputProps, TouchableOpacity } from 'react-native';
import { ThemedText } from '../themed-text';
import { Colors, Spacing } from '@/constants/theme';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({ label, error, isPassword = false, style, ...props }) => {
  const scheme = useColorScheme();
  const currentScheme = scheme === 'unspecified' ? 'light' : scheme;
  const colors = Colors[currentScheme];
  const [secureText, setSecureText] = useState(isPassword);

  return (
    <View style={styles.container}>
      {label ? (
        <ThemedText style={styles.label} type="small">
          {label}
        </ThemedText>
      ) : null}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: error ? '#ff3b30' : colors.backgroundElement,
              backgroundColor: currentScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
            },
            style,
          ]}
          placeholderTextColor={currentScheme === 'dark' ? '#8e8e93' : '#a9a9b0'}
          secureTextEntry={secureText}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setSecureText(!secureText)}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.toggleText}>
              {secureText ? '👁️' : '🙈'}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <ThemedText style={styles.errorText} type="small">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
    alignSelf: 'stretch',
  },
  label: {
    fontWeight: '600',
    marginBottom: Spacing.one,
    marginLeft: Spacing.one,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    paddingRight: 48, // ensure space for password visibility toggle
  },
  toggleButton: {
    position: 'absolute',
    right: Spacing.three,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
  },
  errorText: {
    color: '#ff3b30',
    marginTop: Spacing.one,
    marginLeft: Spacing.one,
  },
});
