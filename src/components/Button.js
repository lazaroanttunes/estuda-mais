import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({ title, onPress, color = '#4a90e2', type = 'primary', small = false, icon, style }) => {
  const isOutline = type === 'outline';
  
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        small && styles.smallButton,
        isOutline ? styles.outlineButton : { backgroundColor: color },
        style
      ]} 
      onPress={onPress}
    >
      {icon}
      <Text style={[
        styles.buttonText,
        small && styles.smallButtonText,
        isOutline && styles.outlineButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
  },
  smallButton: {
    padding: 10,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  smallButtonText: {
    fontSize: 14,
  },
  outlineButtonText: {
    color: '#4a90e2',
  },
});

export default Button;