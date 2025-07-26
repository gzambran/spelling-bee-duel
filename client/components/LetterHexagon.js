import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const LetterHexagon = ({ 
  centerLetter, 
  outerLetters, 
  onLetterPress, 
  canInteract = true,
  centerSize = 100,
  outerSize = 90,
  radius = 120
}) => {
  return (
    <View style={[styles.hexagonContainer, { height: radius * 2 + centerSize }]}>
      {/* Center Letter */}
      <TouchableOpacity
        style={[
          styles.hexagon,
          styles.centerHexagon,
          {
            width: centerSize,
            height: centerSize,
            borderRadius: centerSize / 2,
          }
        ]}
        onPress={() => onLetterPress(centerLetter)}
        disabled={!canInteract}
        activeOpacity={0.7}
      >
        <Text style={[styles.centerLetterText, { fontSize: centerSize * 0.4 }]}>
          {centerLetter.toUpperCase()}
        </Text>
      </TouchableOpacity>

      {/* Outer Letters */}
      {outerLetters.map((letter, index) => {
        const angle = (index * 60) * (Math.PI / 180);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <TouchableOpacity
            key={`${letter}-${index}`}
            style={[
              styles.hexagon,
              styles.outerHexagon,
              {
                width: outerSize,
                height: outerSize,
                borderRadius: outerSize / 2,
                transform: [
                  { translateX: x },
                  { translateY: y },
                ],
              },
            ]}
            onPress={() => onLetterPress(letter)}
            disabled={!canInteract}
            activeOpacity={0.7}
          >
            <Text style={[styles.outerLetterText, { fontSize: outerSize * 0.35 }]}>
              {letter.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  hexagonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  hexagon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  centerHexagon: {
    backgroundColor: '#E6C200',
    borderWidth: 3,
    borderColor: '#D4B000',
  },
  outerHexagon: {
    backgroundColor: '#F7DA21',
    borderWidth: 2,
    borderColor: '#E6C200',
  },
  centerLetterText: {
    fontWeight: 'bold',
    color: '#2E2E2E',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  outerLetterText: {
    fontWeight: 'bold',
    color: '#2E2E2E',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

export default LetterHexagon;