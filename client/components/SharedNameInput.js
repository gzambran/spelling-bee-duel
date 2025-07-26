import {
  View,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native';

const SharedNameInput = ({ 
  playerNameInput, 
  setPlayerNameInput,
  onSubmitEditing 
}) => {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/icon.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      
      <View style={styles.nameSection}>
        <View style={styles.inputCard}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your name"
            value={playerNameInput}
            onChangeText={setPlayerNameInput}
            maxLength={20}
            autoCapitalize="words"
            autoCorrect={false}
            onSubmitEditing={onSubmitEditing}
            returnKeyType="next"
            placeholderTextColor="#999999"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  nameSection: {
    width: '100%',
    alignItems: 'center',
  },
  inputCard: {
    backgroundColor: '#FFFBF2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D9A93D',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    fontSize: 18,
    color: '#2E2E2E',
    padding: 0,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default SharedNameInput;