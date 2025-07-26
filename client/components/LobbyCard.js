import {
  View,
  StyleSheet,
} from 'react-native';

const LobbyCard = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFBF0',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#E6C200',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F7DA21',
  },
});

export default LobbyCard;