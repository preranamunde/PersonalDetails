// CustomDrawer.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';

const CustomDrawer = (props) => {
  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <View style={styles.profileIcon}>
              <Text style={styles.emojiIcon}>👤</Text>
            </View>
            <Text style={styles.appName}>Personal Details</Text>
            
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.drawerBody}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => props.navigation.navigate('PersonalDetails')}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.menuIcon}>✏️</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Personal Details</Text>
              <Text style={styles.menuSub}>Add your information</Text>
            </View>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => props.navigation.navigate('Fetch Personal Details')}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.menuIcon}>👁️</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Fetch Data</Text>
              <Text style={styles.menuSub}>View your details</Text>
            </View>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>

          {/* Assignment Card */}
          <View style={styles.assignmentCard}>
            <Text style={styles.assignTitle}>Assignment - 1</Text>
            <Text style={styles.assignDate}>Date: 19 June 2025</Text>
          </View>
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1976D2',
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileIcon: {
    backgroundColor: '#fff',
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emojiIcon: {
    fontSize: 40,
    color: '#1976D2',
  },
  appName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  drawerBody: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuSub: {
    fontSize: 13,
    color: '#888',
  },
  chevronIcon: {
    fontSize: 18,
    color: '#bbb',
    fontWeight: 'bold',
  },
  assignmentCard: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  assignTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  assignDate: {
    fontSize: 14,
    color: '#666',
  },
});