import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';

const RecordNotification = ({ records, onDismiss }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (records && records.length > 0) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [records]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  if (!records || records.length === 0) {
    return null;
  }

  const renderRecord = (record, index) => {
    const isPersonal = record.type === 'personal';
    const isGlobal = record.type === 'global';
    
    return (
      <View 
        key={index} 
        style={[
          styles.recordItem,
          isGlobal && styles.globalRecordItem
        ]}
      >
        <Text style={[
          styles.recordText,
          isGlobal && styles.globalRecordText
        ]}>
          {record.message}
        </Text>
        {record.previousRecord > 0 && (
          <Text style={styles.previousRecordText}>
            Previous: {record.previousRecord} pts
          </Text>
        )}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.notification}
        onPress={handleDismiss}
        activeOpacity={0.9}
      >
        {records.map(renderRecord)}
        
        <View style={styles.dismissHint}>
          <Text style={styles.dismissText}>Tap to dismiss</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  notification: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#388E3C',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordItem: {
    marginBottom: 8,
  },
  globalRecordItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
    paddingLeft: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 6,
    padding: 8,
  },
  recordText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  globalRecordText: {
    color: '#2E2E2E',
  },
  previousRecordText: {
    fontSize: 12,
    color: '#E8F5E8',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  dismissHint: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  dismissText: {
    fontSize: 12,
    color: '#E8F5E8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default RecordNotification;