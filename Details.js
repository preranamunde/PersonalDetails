import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';

import { useNavigation } from '@react-navigation/native';

const Details = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    gender: '',
    maritalStatus: [],
    state: '',
    email: '',
    educationalQualification: '',
    subject1: '',
    subject2: '',
    subject3: '',
    subject: '',
    photo: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const states = [
    'Select State',
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
  ];

  const maritalOptions = ['Unmarried', 'Married', 'Divorced', 'Widowed'];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMaritalStatusChange = (option) => {
    const updatedStatus = formData.maritalStatus.includes(option)
      ? formData.maritalStatus.filter(item => item !== option)
      : [...formData.maritalStatus, option];
    updateFormData('maritalStatus', updatedStatus);
  };

  // Request camera permission for Android
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Show image picker options
  const showImagePicker = () => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add your photo',
      [
        { 
          text: 'Take Photo', 
          onPress: () => openCamera(),
          style: 'default'
        },
        { 
          text: 'Choose from Gallery', 
          onPress: () => openGallery(),
          style: 'default'
        },
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
      ],
      { cancelable: true }
    );
  };

  // Open camera to take photo
  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
      includeBase64: false,
      saveToPhotos: false,
    };

    launchCamera(options, (response) => {
      console.log('Camera Response:', response);
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.log('Camera Error:', response.errorMessage);
        Alert.alert('Camera Error', response.errorMessage || 'Failed to open camera');
      } else if (response.assets && response.assets[0]) {
        const selectedImage = response.assets[0];
        console.log('Selected image from camera:', selectedImage);
        
        if (validateImage(selectedImage)) {
          updateFormData('photo', selectedImage);
          Alert.alert('Success', 'Photo captured successfully!');
        }
      }
    });
  };

  // Open gallery to select photo
  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
      includeBase64: false,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response) => {
      console.log('Gallery Response:', response);

      if (response.didCancel) {
        console.log('User cancelled gallery');
      } else if (response.errorCode) {
        console.log('Gallery Error:', response.errorMessage);
        Alert.alert('Gallery Error', response.errorMessage || 'Failed to open gallery');
      } else if (response.assets && response.assets[0]) {
        const selectedImage = response.assets[0];
        console.log('Selected image from gallery:', selectedImage);

        if (validateImage(selectedImage)) {
          updateFormData('photo', selectedImage);
          Alert.alert('Success', 'Photo selected successfully!');
        }
      }
    });
  };

  // Validate selected image
  const validateImage = (imageAsset) => {
    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (imageAsset.fileSize && imageAsset.fileSize > maxSize) {
      Alert.alert('File Too Large', 'Please select an image smaller than 5MB');
      return false;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (imageAsset.type && !allowedTypes.includes(imageAsset.type.toLowerCase())) {
      Alert.alert('Invalid File Type', 'Please select a JPEG or PNG image');
      return false;
    }

    return true;
  };

  // Upload image to Firebase Storage
  const uploadImage = async (imageAsset) => {
    if (!imageAsset) {
      console.log('No image asset provided');
      return null;
    }

    // File size validation
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (imageAsset.fileSize && imageAsset.fileSize > maxSizeInBytes) {
      Alert.alert('File Too Large', 'Please select an image smaller than 5MB');
      return null;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);

      const imageUri = imageAsset.uri;
      const fileName = imageAsset.fileName || `user_photo_${Date.now()}.jpg`;
      
      // Create a reference to Firebase Storage
      const reference = storage().ref(`user_photos/${fileName}`);
      
      setUploadProgress(30);
      
      // Upload the file
      const uploadTask = reference.putFile(imageUri);
      
      // Monitor upload progress
      uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      });
      
      // Wait for upload to complete
      await uploadTask;
setUploadProgress(90);

// Get the download URL
const downloadURL = await reference.getDownloadURL();
setUploadProgress(100);
console.log('Image uploaded successfully, URL:', downloadURL);
return downloadURL;
} catch (error) {
console.error('Storage Upload Error:', error);
// Silently handle error - no Alert shown to user
return null;
} finally {
setTimeout(() => {
  setIsUploading(false);
  setUploadProgress(0);
}, 1000);
}
  }
  // Form validation
  const validateForm = () => {
    const requiredFields = ['name', 'mobileNumber', 'gender', 'state', 'email', 'educationalQualification'];
    
    for (let field of requiredFields) {
      if (!formData[field] || formData[field] === 'Select State') {
        Alert.alert('Validation Error', `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    // Mobile number validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number');
      return false;
    }

    // Educational qualification specific validation
    if (formData.educationalQualification === 'Graduate') {
      if (!formData.subject1 || !formData.subject2 || !formData.subject3) {
        Alert.alert('Validation Error', 'Please fill in all three subjects for graduate qualification');
        return false;
      }
    }

    if (formData.educationalQualification === 'Post Graduate') {
      if (!formData.subject) {
        Alert.alert('Validation Error', 'Please fill in the subject for post graduate qualification');
        return false;
      }
    }

    return true;
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      mobileNumber: '',
      gender: '',
      maritalStatus: [],
      state: '',
      email: '',
      educationalQualification: '',
      subject1: '',
      subject2: '',
      subject3: '',
      subject: '',
      photo: null,
    });
    setUploadProgress(0);
    setIsUploading(false);
  };

  // Handle form submission - FIXED VERSION
  const handleSubmit = async () => {
    console.log('Submit button clicked - starting form submission');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setLoading(true);
    console.log('Form validation passed, starting submission process');

    try {
      let photoURL = null;

      // Upload photo if user has selected one
      if (formData.photo) {
        console.log('Photo detected, starting upload...');
        photoURL = await uploadImage(formData.photo);
        
        if (photoURL) {
          console.log('Photo uploaded successfully, URL:', photoURL);
        } else {
          console.log('Photo upload failed, proceeding without photo');
        }
      } else {
        console.log('No photo selected, proceeding without photo');
      }

      // Build user data object
      const userData = {
        name: formData.name.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        state: formData.state,
        email: formData.email.trim().toLowerCase(),
        educationalQualification: formData.educationalQualification,
        photoURL: photoURL,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      // Add education-specific fields
      if (formData.educationalQualification === 'Graduate') {
        userData.subjects = {
          subject1: formData.subject1.trim(),
          subject2: formData.subject2.trim(),
          subject3: formData.subject3.trim(),
        };
      } else if (formData.educationalQualification === 'Post Graduate') {
        userData.subject = formData.subject.trim();
      }

      console.log('Saving user data to Firestore:', userData);

      // Save user to Firestore
      const docRef = await firestore().collection('users').add(userData);
      console.log('User data saved successfully with ID:', docRef.id);

      // Show success alert with options
      Alert.alert(
        'Registration Successful!',
        photoURL
          ? 'User profile with photo has been saved to the database successfully!'
          : 'User profile has been saved to the database successfully!',
        [
          {
            text: 'View Users',
            onPress: () => {
              resetForm();
              navigation.navigate('FetchScreen');
            },
          },
          {
            text: 'Add Another',
            onPress: () => resetForm(),
            style: 'cancel',
          },
        ]
      );

      return true;
    } catch (error) {
      console.error('Error saving data:', error);

      if (error.code === 'firestore/permission-denied') {
        Alert.alert(
          'Permission Error',
          'You do not have permission to save data. Please check Firestore rules.'
        );
      } else if (error.code === 'firestore/unavailable') {
        Alert.alert(
          'Network Error',
          'Database is currently unavailable. Please check your internet connection.'
        );
      } else {
        Alert.alert('Error', `Failed to save user data: ${error.message}`);
      }

      return false;
    } finally {
      setLoading(false);
      // Reset upload states if not currently uploading
      if (!isUploading) {
        setUploadProgress(0);
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    Alert.alert(
      'Cancel Registration',
      'Are you sure you want to cancel? All entered data will be lost.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: resetForm }
      ]
    );
  };

  // Render educational fields based on qualification
  const renderEducationalFields = () => {
    if (formData.educationalQualification === 'Graduate') {
      return (
        <View style={styles.educationSection}>
          <Text style={styles.educationLabel}>Subjects for Graduate *</Text>
          
          <Text style={styles.subLabel}>Subject 1 *</Text>
          <TextInput
            style={styles.input}
            value={formData.subject1}
            onChangeText={(value) => updateFormData('subject1', value)}
            placeholder="Enter Subject 1"
            editable={!loading}
          />

          <Text style={styles.subLabel}>Subject 2 *</Text>
          <TextInput
            style={styles.input}
            value={formData.subject2}
            onChangeText={(value) => updateFormData('subject2', value)}
            placeholder="Enter Subject 2"
            editable={!loading}
          />

          <Text style={styles.subLabel}>Subject 3 *</Text>
          <TextInput
            style={styles.input}
            value={formData.subject3}
            onChangeText={(value) => updateFormData('subject3', value)}
            placeholder="Enter Subject 3"
            editable={!loading}
          />
        </View>
      );
    } else if (formData.educationalQualification === 'Post Graduate') {
      return (
        <View style={styles.educationSection}>
          <Text style={styles.educationLabel}>Subject for Post Graduate *</Text>
          <TextInput
            style={styles.input}
            value={formData.subject}
            onChangeText={(value) => updateFormData('subject', value)}
            placeholder="Enter Subject"
            editable={!loading}
          />
        </View>
      );
    }
    return null;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <Text style={styles.title}>User Registration</Text>

        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(value) => updateFormData('name', value)}
          placeholder="Enter your full name"
          editable={!loading}
        />

        <Text style={styles.label}>Mobile Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.mobileNumber}
          onChangeText={(value) => updateFormData('mobileNumber', value)}
          placeholder="Enter 10-digit mobile number"
          keyboardType="numeric"
          maxLength={10}
          editable={!loading}
        />

        <Text style={styles.label}>Gender *</Text>
        <View style={styles.radioContainer}>
          {['Male', 'Female', 'Other'].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.radioOption}
              onPress={() => updateFormData('gender', option)}
              disabled={loading}
            >
              <View style={styles.radioCircle}>
                {formData.gender === option && <View style={styles.selectedRadio} />}
              </View>
              <Text style={styles.radioText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Marital Status</Text>
        <View style={styles.checkboxContainer}>
          {maritalOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.checkboxOption}
              onPress={() => handleMaritalStatusChange(option)}
              disabled={loading}
            >
              <View style={styles.checkbox}>
                {formData.maritalStatus.includes(option) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.helperText}>You can select multiple options</Text>

        <Text style={styles.label}>State *</Text>
        <View style={[styles.pickerContainer, loading && styles.disabledInput]}>
          <Picker
            selectedValue={formData.state}
            onValueChange={(value) => updateFormData('state', value)}
            style={[styles.picker, { color: 'black' }]}
            dropdownIconColor="black"
            enabled={!loading}
          >
            {states.map((state) => (
              <Picker.Item key={state} label={state} value={state} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <Text style={styles.label}>Educational Qualification *</Text>
        <View style={[styles.pickerContainer, loading && styles.disabledInput]}>
          <Picker
            selectedValue={formData.educationalQualification}
            onValueChange={(value) => updateFormData('educationalQualification', value)}
            style={[styles.picker, { color: 'black' }]}
            dropdownIconColor="black"
            enabled={!loading}
          >
            <Picker.Item label="Select Qualification" value="" />
            <Picker.Item label="Graduate" value="Graduate" />
            <Picker.Item label="Post Graduate" value="Post Graduate" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        {renderEducationalFields()}

        <Text style={styles.label}>Profile Photo (Optional)</Text>
        <TouchableOpacity 
          style={[styles.photoButton, (loading || isUploading) && styles.disabledButton]} 
          onPress={showImagePicker}
          disabled={loading || isUploading}
        >
          <Text style={styles.photoButtonText}>
            {formData.photo ? '📷 Change Photo' : '📷 Upload Photo / Take Photo'}
          </Text>
        </TouchableOpacity>
        
        {formData.photo && (
          <View style={styles.photoPreviewContainer}>
            <Text style={styles.photoPreviewLabel}>Selected Photo:</Text>
            <Image source={{ uri: formData.photo.uri }} style={styles.previewImage} />
            <Text style={styles.photoInfo}>
              {formData.photo.fileName || 'Selected Image'}
            </Text>
            <TouchableOpacity 
              style={[styles.removePhotoButton, loading && styles.disabledButton]}
              onPress={() => updateFormData('photo', null)}
              disabled={loading}
            >
              <Text style={styles.removePhotoText}>❌ Remove Photo</Text>
            </TouchableOpacity>
          </View>
        )}

        {isUploading && uploadProgress > 0 && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Uploading photo: {uploadProgress.toFixed(0)}%
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, loading && styles.disabledButton]}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.submitButtonText}>Saving...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15,
    color: '#333',
  },
  subLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    marginTop: 10,
    color: '#555',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: -5,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadio: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '48%',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
  },
  checkmark: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  educationSection: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  educationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  photoButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  photoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  photoPreviewContainer: {
    alignItems: 'center',
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  photoPreviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  photoInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  removePhotoButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  removePhotoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 15,
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Details;