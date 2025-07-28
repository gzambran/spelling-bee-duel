import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AboutModal from './AboutModal';
import HowToPlayModal from './HowToPlayModal';

const TopMenu = ({ onSignOut }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const insets = useSafeAreaInsets();

  const openAbout = () => {
    setIsMenuVisible(false);
    setShowAbout(true);
  };

  const openHowToPlay = () => {
    setIsMenuVisible(false);
    setShowHowToPlay(true);
  };

  const handleSignOut = () => {
    setIsMenuVisible(false);
    if (onSignOut) {
      onSignOut();
    }
  };

  return (
    <>
      {/* Menu Button */}
      <View style={[styles.menuContainer, { top: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Dropdown */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={[styles.menuDropdown, { marginTop: insets.top + 60 }]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={openAbout}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>About</Text>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={openHowToPlay}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>How to Play</Text>
            </TouchableOpacity>

            {onSignOut && (
              <>
                <View style={styles.menuDivider} />
                
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleSignOut}
                  activeOpacity={0.7}
                >
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Components */}
      <HowToPlayModal
        visible={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />

      <AboutModal
        visible={showAbout}
        onClose={() => setShowAbout(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  menuButton: {
    backgroundColor: '#333333',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  menuDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  signOutText: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },
});

export default TopMenu;