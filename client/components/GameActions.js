import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const GameActions = ({ 
  onDeleteLetter,
  onShuffleLetter,
  onSubmitWord,
  canDelete = false,
  canInteract = true,
  canSubmit = false,
  isSubmitting = false,
  buttonHeight = 55
}) => {
  return (
    <View style={styles.actionButtons}>
      {/* Delete Button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          styles.deleteButton,
          { minHeight: buttonHeight },
          !canDelete && styles.disabledButton
        ]}
        onPress={onDeleteLetter}
        disabled={!canDelete}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>

      {/* Shuffle Button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          styles.shuffleButton,
          { minHeight: buttonHeight },
          !canInteract && styles.disabledButton
        ]}
        onPress={onShuffleLetter}
        disabled={!canInteract}
        activeOpacity={0.7}
      >
        <Text style={styles.shuffleButtonText}>⟲</Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          styles.submitButton,
          { minHeight: buttonHeight },
          !canSubmit && styles.disabledButton
        ]}
        onPress={onSubmitWord}
        disabled={!canSubmit}
        activeOpacity={0.7}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Validating...' : 'Submit'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  actionButton: {
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 16,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  deleteButton: {
    backgroundColor: '#FFFBF2',
    borderColor: '#D9A93D',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  shuffleButton: {
    backgroundColor: '#F7F0E6',
    borderColor: '#E8B94E',
  },
  shuffleButtonText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#333333',
  },
  submitButton: {
    backgroundColor: '#8B4513',
    borderColor: '#7A3A0F',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFBF2',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

// Memoize to prevent unnecessary re-renders
export default React.memo(GameActions);