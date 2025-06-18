import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const FetchScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
    
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await firestore().collection('users').get();
      const userList = [];
      
      querySnapshot.forEach(doc => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by creation date (newest first)
      userList.sort((a, b) => {
  const dateA = a.createdAt?.toDate?.() ?? new Date(0);
  const dateB = b.createdAt?.toDate?.() ?? new Date(0);
  return dateB - dateA; // newest first
});
      setUsers(userList);
    } catch (error) {
      console.log("Error fetching users:", error.message);
      Alert.alert('Error', 'Failed to fetch user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEducationalInfo = (item) => {
    if (item.educationalQualification === 'Graduate' && item.subjects) {
      return (
        <View style={styles.educationContainer}>
          <Text style={styles.educationTitle}>Subjects:</Text>
          <Text style={styles.educationText}>• {item.subjects.subject1}</Text>
          <Text style={styles.educationText}>• {item.subjects.subject2}</Text>
          <Text style={styles.educationText}>• {item.subjects.subject3}</Text>
        </View>
      );
    } else if (item.educationalQualification === 'Post Graduate' && item.subject) {
      return (
        <View style={styles.educationContainer}>
          <Text style={styles.educationTitle}>Subject:</Text>
          <Text style={styles.educationText}>{item.subject}</Text>
        </View>
      );
    }
    return null;
  };

  const renderMaritalStatus = (maritalStatus) => {
    if (!maritalStatus || maritalStatus.length === 0) return 'Not specified';
    return maritalStatus.join(', ');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Header with photo and basic info */}
      <View style={styles.header}>
        <View style={styles.photoContainer}>
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>
                {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.basicInfo}>
          <Text style={styles.name}>{item.name || 'N/A'}</Text>
          <Text style={styles.mobile}>{item.mobileNumber || 'N/A'}</Text>
          <Text style={styles.email}>{item.email || 'N/A'}</Text>
        </View>
      </View>

      {/* Detailed Information */}
      <View style={styles.detailsContainer}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{item.gender || 'N/A'}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>State:</Text>
            <Text style={styles.value}>{item.state || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.fullColumn}>
            <Text style={styles.label}>Marital Status:</Text>
            <Text style={styles.value}>{renderMaritalStatus(item.maritalStatus)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.fullColumn}>
            <Text style={styles.label}>Educational Qualification:</Text>
            <Text style={styles.value}>{item.educationalQualification || 'N/A'}</Text>
          </View>
        </View>

        {renderEducationalInfo(item)}

        <View style={styles.timestampContainer}>
          <Text style={styles.timestamp}>
            Registered: {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No users found</Text>
      <TouchableOpacity style={styles.refreshButton} onPress={fetchUsers}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>Registered Users ({users.length})</Text>
      </View>
      
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  listContainer: {
    padding: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  photoContainer: {
    marginRight: 15,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e9ecef',
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  basicInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  mobile: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  detailsContainer: {
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  fullColumn: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  educationContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  educationTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 6,
  },
  educationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  timestampContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FetchScreen;