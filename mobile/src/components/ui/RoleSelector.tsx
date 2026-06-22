import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserRole } from '../../context/AuthContext';
import { Spacing } from '@/constants/theme';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onChange: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Your Role</Text>
      <View style={styles.selectorContainer}>
        <TouchableOpacity
          style={[
            styles.roleOption,
            selectedRole === UserRole.PASSENGER && styles.selectedOption,
          ]}
          onPress={() => onChange(UserRole.PASSENGER)}
          activeOpacity={0.9}
        >
          <Text
            style={[
              styles.optionText,
              selectedRole === UserRole.PASSENGER
                ? styles.selectedOptionText
                : styles.unselectedOptionText,
            ]}
          >
            Passenger
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleOption,
            selectedRole === UserRole.DRIVER && styles.selectedOption,
          ]}
          onPress={() => onChange(UserRole.DRIVER)}
          activeOpacity={0.9}
        >
          <Text
            style={[
              styles.optionText,
              selectedRole === UserRole.DRIVER
                ? styles.selectedOptionText
                : styles.unselectedOptionText,
            ]}
          >
            Driver
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
    alignSelf: 'stretch',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5C7470',
    marginBottom: Spacing.one,
    marginLeft: 4,
  },
  selectorContainer: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 24,
    padding: 3,
    backgroundColor: '#E2EBE9', // Matches the login page toggle background
  },
  roleOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  selectedOption: {
    backgroundColor: '#1A5F56', // Deep Teal — always clearly visible
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: '#FFFFFF', // White text on dark teal — clearly readable
    fontWeight: 'bold',
  },
  unselectedOptionText: {
    color: '#3D5A56', // Dark muted teal for unselected — clearly readable
  },
});
