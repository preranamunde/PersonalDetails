import React, { useState,useEffect,useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  
  ScrollView,
  StyleSheet,
  params,
  Alert,
  Image,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';


import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const PersonalDetails = ({ route }) => {
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
    nameError: false,
    mobileError: false,
    emailError: false,
    genderError: false,
    stateError: false,
    educationError: false,
    subject1Error: false,
    subject2Error: false,
    subject3Error: false,
    subjectError: false,
    // Add these new error message fields:
    nameErrorMsg: '',
    mobileErrorMsg: '',
    emailErrorMsg: '',
    genderErrorMsg: '',
    stateErrorMsg: '',
    educationErrorMsg: '',
    subject1ErrorMsg: '',
    subject2ErrorMsg: '',
    subject3ErrorMsg: '',
    subjectErrorMsg: '',
});
  const [editMode, setEditMode] = useState(false);
const [editUserId, setEditUserId] = useState(null);
    const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
const nameRef = useRef(null);
const mobileRef = useRef(null);
const emailRef = useRef(null);
const genderRef = useRef(null);
const stateRef = useRef(null);
const educationRef = useRef(null);
const subject1Ref = useRef(null);
const subject2Ref = useRef(null);
const subject3Ref = useRef(null);
const subjectRef = useRef(null);
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

  // Validate name input
  const validateNameInput = (text) => {
  // Allow only alphabets, spaces, dots, hyphens, and Roman numerals (both cases)
  const nameRegex = /^[A-Za-z\s\.\-IVXLCDM]*$/;
  
  if (!nameRegex.test(text)) {
    return false;
  }
  
  // Only check if first character is an alphabet (not necessarily capital)
  if (text.length > 0 && !/^[A-Za-z]/.test(text)) {
    return false;
  }
  
  return true;
};
  // Validate mobile number input
  const validateMobileInput = (text) => {
    // Allow only digits
    if (!/^\d*$/.test(text)) {
      return false;
    }
    
    // Check if first digit is 6, 7, 8, or 9
    if (text.length > 0 && !/^[6789]/.test(text)) {
      return false;
    }
    
    return true;
  };

 const updateFormData = (field, value) => {
  // Clear corresponding error state when user starts typing
  const errorField = field + 'Error';
  const errorMsgField = field + 'ErrorMsg';
  
  // Always clear errors when user starts typing/selecting
  if (formData[errorField]) {
    setFormData(prev => ({ 
      ...prev, 
      [errorField]: false,
      [errorMsgField]: ''
    }));
  }

  // Special handling for name field
  if (field === 'name') {
    if (!validateNameInput(value)) {
      Alert.alert('Invalid Input', 'Name must start with an alphabet and can only contain letters, spaces, dots, hyphens, and Roman numerals (I, V, X, L, C, D, M)');
      return;
    }
    if (value.length > 25) {
      Alert.alert('Character Limit', 'Name cannot exceed 25 characters');
      return;
    }
    const formattedName = value.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    setFormData(prev => ({ ...prev, [field]: formattedName }));
    return;
  }
  
  // Special handling for mobile number field
  if (field === 'mobileNumber') {
    if (!validateMobileInput(value)) {
      Alert.alert('Invalid Input', 'Mobile number must start with 6, 7, 8, or 9 and contain only digits');
      return;
    }
    if (value.length > 10) {
      return;
    }
  }
  
  // Special handling for subject fields to clear errors immediately
  if (field === 'subject1' || field === 'subject2' || field === 'subject3' || field === 'subject') {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      [field + 'Error']: false,
      [field + 'ErrorMsg']: ''
    }));
    return;
  }
  
  // For all other fields, just update the value
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

  // Save image locally to device storage
  const saveImageLocally = async (imageAsset) => {
    if (!imageAsset) {
      console.log('No image asset provided');
      return null;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Create unique filename
      const fileName = `user_photo_${Date.now()}.jpg`;
      const localPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      
      setUploadProgress(30);
      
      // Copy image from temp location to app's document directory
      await RNFS.copyFile(imageAsset.uri, localPath);
      
      setUploadProgress(90);

      console.log('Image saved locally at:', localPath);
      setUploadProgress(100);
      
      return localPath;
    } catch (error) {
      console.error('Error saving image locally:', error);
      Alert.alert('Error', 'Failed to save image locally');
      return null;
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  // Save image path to AsyncStorage for future reference
  const saveImagePathToStorage = async (imagePath, userId) => {
    try {
      await AsyncStorage.setItem(`user_image_${userId}`, imagePath);
      console.log('Image path saved to AsyncStorage');
    } catch (error) {
      console.error('Error saving image path to AsyncStorage:', error);
    }
  };

  // Form validation
 const validateForm = () => {
  // Reset all error states first
  setFormData(prev => ({
    ...prev,
    nameError: false,
    mobileError: false,
    emailError: false,
    genderError: false,
    stateError: false,
    educationError: false,
    subject1Error: false,
    subject2Error: false,
    subject3Error: false,
    subjectError: false,
    nameErrorMsg: '',
    mobileErrorMsg: '',
    emailErrorMsg: '',
    genderErrorMsg: '',
    stateErrorMsg: '',
    educationErrorMsg: '',
    subject1ErrorMsg: '',
    subject2ErrorMsg: '',
    subject3ErrorMsg: '',
    subjectErrorMsg: '',
  }));

  // Name validation
  if (!formData.name.trim()) {
    setFormData(prev => ({ 
      ...prev, 
      nameError: true,
      nameErrorMsg: 'This field is required'
    }));
    nameRef.current?.focus();
    return false;
  }
  
  if (!/^[A-Za-z]/.test(formData.name.trim())) {
    setFormData(prev => ({ 
      ...prev, 
      nameError: true,
      nameErrorMsg: 'Name must start with an alphabet'
    }));
    nameRef.current?.focus();
    return false;
  }
  
  if (formData.name.length > 25) {
    setFormData(prev => ({ 
      ...prev, 
      nameError: true,
      nameErrorMsg: 'Name cannot exceed 25 characters'
    }));
    nameRef.current?.focus();
    return false;
  }

  // Mobile number validation
  if (!formData.mobileNumber.trim()) {
    setFormData(prev => ({ 
      ...prev, 
      mobileError: true,
      mobileErrorMsg: 'This field is required'
    }));
    mobileRef.current?.focus();
    return false;
  }
  
  if (formData.mobileNumber.length !== 10) {
    setFormData(prev => ({ 
      ...prev, 
      mobileError: true,
      mobileErrorMsg: 'Mobile number must be exactly 10 digits'
    }));
    mobileRef.current?.focus();
    return false;
  }
  
  if (!/^[6789]/.test(formData.mobileNumber)) {
    setFormData(prev => ({ 
      ...prev, 
      mobileError: true,
      mobileErrorMsg: 'Mobile number must start with 6, 7, 8, or 9'
    }));
    mobileRef.current?.focus();
    return false;
  }

  // Gender validation
  if (!formData.gender) {
    setFormData(prev => ({ 
      ...prev, 
      genderError: true,
      genderErrorMsg: 'This field is required'
    }));
    return false;
  }

  // State validation
  if (!formData.state || formData.state === 'Select State') {
    setFormData(prev => ({ 
      ...prev, 
      stateError: true,
      stateErrorMsg: 'This field is required'
    }));
    return false;
  }

  // Email validation
  if (!formData.email.trim()) {
    setFormData(prev => ({ 
      ...prev, 
      emailError: true,
      emailErrorMsg: 'This field is required'
    }));
    emailRef.current?.focus();
    return false;
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(formData.email)) {
    setFormData(prev => ({ 
      ...prev, 
      emailError: true,
      emailErrorMsg: 'Please enter a valid email address'
    }));
    emailRef.current?.focus();
    return false;
  }

  // Educational qualification validation
  if (!formData.educationalQualification) {
    setFormData(prev => ({ 
      ...prev, 
      educationError: true,
      educationErrorMsg: 'This field is required'
    }));
    return false;
  }

  // Graduate subjects validation
  if (formData.educationalQualification === 'Graduate') {
    if (!formData.subject1.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        subject1Error: true,
        subject1ErrorMsg: 'This field is required'
      }));
      subject1Ref.current?.focus();
      return false;
    }
    
    if (!formData.subject2.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        subject2Error: true,
        subject2ErrorMsg: 'This field is required'
      }));
      subject2Ref.current?.focus();
      return false;
    }
    
    if (!formData.subject3.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        subject3Error: true,
        subject3ErrorMsg: 'This field is required'
      }));
      subject3Ref.current?.focus();
      return false;
    }
  }

  // Post Graduate subject validation
  if (formData.educationalQualification === 'Post Graduate') {
    if (!formData.subject.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        subjectError: true,
        subjectErrorMsg: 'This field is required'
      }));
      subjectRef.current?.focus();
      return false;
    }
  }

  return true;
};
  // Reset form data
  
  useEffect(() => {
  if (route.params?.editMode && route.params?.userData) {
    setEditMode(true);
    const userData = route.params.userData;
    setEditUserId(userData.id);

    // Pre-fill form
    setFormData({
      name: userData.name || '',
      mobileNumber: userData.mobileNumber || '',
      gender: userData.gender || '',
      maritalStatus: userData.maritalStatus || [],
      state: userData.state || '',
      email: userData.email || '',
      educationalQualification: userData.educationalQualification || '',
      subject1: userData.subjects?.subject1 || '',
      subject2: userData.subjects?.subject2 || '',
      subject3: userData.subjects?.subject3 || '',
      subject: userData.subject || '',
      photo: userData.localImagePath ? { uri: 'file://' + userData.localImagePath } : null,
    });
  }
}, [route.params]);

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
  setEditMode(false);      // ✅ Reset edit mode
  setEditUserId(null);     // ✅ Clear user ID
};


  // Handle form submission with local image storage
  const handleSubmit = async () => {
  console.log('Submit button clicked - starting form submission');

  if (!(await validateForm())) {
    console.log('Form validation failed');
    return;
  }

  setLoading(true);
  console.log('Form validation passed, starting submission process');

  try {
    let localImagePath = null;

    // Save photo locally if user has selected one
    if (formData.photo) {
      console.log('Photo detected, saving locally...');
      localImagePath = await saveImageLocally(formData.photo);

      if (localImagePath) {
        console.log('Photo saved locally at:', localImagePath);
      } else {
        console.log('Photo save failed, proceeding without photo');
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
      localImagePath: localImagePath || null,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };
    

    // Add conditional educational fields
    if (formData.educationalQualification === 'Graduate') {
      userData.subjects = {
        subject1: formData.subject1.trim(),
        subject2: formData.subject2.trim(),
        subject3: formData.subject3.trim(),
      };
    } else if (formData.educationalQualification === 'Post Graduate') {
      userData.subject = formData.subject.trim();
    }

    let docRef;

    if (editMode) {
      // ✅ Edit mode: update existing document
      await firestore().collection('users').doc(editUserId).update(userData);
      docRef = { id: editUserId };
      console.log('User data updated successfully with ID:', editUserId);
    } else {
      // ✅ Create mode: add new document
      docRef = await firestore()
        .collection('users')
        .add({
          ...userData,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      console.log('User data saved successfully with ID:', docRef.id);
    }

    // Save local image path (for both create/update)
    if (localImagePath) {
      await saveImagePathToStorage(localImagePath, docRef.id);
    }

    // ✅ Show success alert
    Alert.alert(
      editMode ? 'Update Successful!' : 'Registration Successful!',
      localImagePath
        ? (editMode
            ? 'User profile with photo updated successfully!'
            : 'User profile with photo has been saved locally to the device!')
        : (editMode
            ? 'User profile updated successfully!'
            : 'User profile has been saved to the database successfully!'),
      [
        {
          text: editMode ? 'Back to List' : 'View Users',
          onPress: () => {
            resetForm();
            navigation.navigate('Fetch Personal Details');
          },
        },
        {
          text: editMode ? 'Continue Editing' : 'Add Another',
          onPress: () => (editMode ? null : resetForm()),
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
          ref={subject1Ref}
          style={[styles.input, formData.subject1Error && styles.errorInput]}
          value={formData.subject1}
          onChangeText={(value) => updateFormData('subject1', value)}
          placeholder="Enter Subject 1"
          editable={!loading}
        />
        {renderErrorMessage(formData.subject1ErrorMsg)}

        <Text style={styles.subLabel}>Subject 2 *</Text>
        <TextInput
          ref={subject2Ref}
          style={[styles.input, formData.subject2Error && styles.errorInput]}
          value={formData.subject2}
          onChangeText={(value) => updateFormData('subject2', value)}
          placeholder="Enter Subject 2"
          editable={!loading}
        />
        {renderErrorMessage(formData.subject2ErrorMsg)}

        <Text style={styles.subLabel}>Subject 3 *</Text>
        <TextInput
          ref={subject3Ref}
          style={[styles.input, formData.subject3Error && styles.errorInput]}
          value={formData.subject3}
          onChangeText={(value) => updateFormData('subject3', value)}
          placeholder="Enter Subject 3"
          editable={!loading}
        />
        {renderErrorMessage(formData.subject3ErrorMsg)}
      </View>
    );
  } else if (formData.educationalQualification === 'Post Graduate') {
    return (
      <View style={styles.educationSection}>
        <Text style={styles.educationLabel}>Subject for Post Graduate *</Text>
        <TextInput
          ref={subjectRef}
          style={[styles.input, formData.subjectError && styles.errorInput]}
          value={formData.subject}
          onChangeText={(value) => updateFormData('subject', value)}
          placeholder="Enter Subject"
          editable={!loading}
        />
        {renderErrorMessage(formData.subjectErrorMsg)}
      </View>
    );
  }
  return null;
};
const renderErrorMessage = (errorMsg) => {
  if (errorMsg) {
    return (
      <Text style={styles.errorText}>
        {errorMsg}
      </Text>
    );
  }
  return null;
};
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
       <Text style={styles.label}>Name *</Text>
<TextInput
  ref={nameRef}
  style={[styles.input, formData.nameError && styles.errorInput]}
  value={formData.name}
  onChangeText={(value) => updateFormData('name', value)}
  placeholder="Enter your full name (max 25 chars)"
  editable={!loading}
  maxLength={25}
/>
{renderErrorMessage(formData.nameErrorMsg)}
<Text style={styles.helperText}>
  Must start with an alphabet, can contain letters, spaces, dots, hyphens, and Roman numerals (I, V, X, L, C, D, M)
</Text>
        <Text style={styles.label}>Mobile Number *</Text>
<TextInput
  ref={mobileRef}
  style={[styles.input, formData.mobileError && styles.errorInput]}
  value={formData.mobileNumber}
  onChangeText={(value) => updateFormData('mobileNumber', value)}
  placeholder="Enter 10-digit mobile number"
  keyboardType="numeric"
  maxLength={10}
  editable={!loading}
/>
{renderErrorMessage(formData.mobileErrorMsg)}
<Text style={styles.helperText}>
  Must start with 6, 7, 8, or 9 and be exactly 10 digits
</Text>

    <Text style={styles.label}>Gender *</Text>
<View style={[styles.radioContainer, formData.genderError && styles.errorContainer]}>
  {['Male', 'Female', 'Other'].map((option) => (
    <TouchableOpacity
      key={option}
      style={styles.radioOption}
      onPress={() => updateFormData('gender', option)}
      disabled={loading}
    >
      <View style={[styles.radioCircle, formData.genderError && styles.errorRadio]}>
        {formData.gender === option && <View style={styles.selectedRadio} />}
      </View>
      <Text style={styles.radioText}>{option}</Text>
    </TouchableOpacity>
  ))}
</View>
{renderErrorMessage(formData.genderErrorMsg)}

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
<View style={[
  styles.pickerContainer, 
  loading && styles.disabledInput,
  formData.stateError && styles.errorInput
]}>
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
{renderErrorMessage(formData.stateErrorMsg)}

       <Text style={styles.label}>Email *</Text>
<TextInput
  ref={emailRef}
  style={[styles.input, formData.emailError && styles.errorInput]}
  value={formData.email}
  onChangeText={(value) => updateFormData('email', value)}
  placeholder="Enter email address"
  keyboardType="email-address"
  autoCapitalize="none"
  editable={!loading}
/>
{renderErrorMessage(formData.emailErrorMsg)}

        <Text style={styles.label}>Educational Qualification *</Text>
<View style={[
  styles.pickerContainer, 
  loading && styles.disabledInput,
  formData.educationError && styles.errorInput
]}>
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
{renderErrorMessage(formData.educationErrorMsg)}
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
            <Text style={styles.localStorageNote}>
              📁 This photo will be saved locally on your device
            </Text>
            <TouchableOpacity 
              style={[styles.removePhotoButton, loading && styles.disabledButton]}
              onPress={() => updateFormData('photo', null)}
              disabled={loading}
            >
              
            </TouchableOpacity>
          </View>
        )}

        {isUploading && uploadProgress > 0 && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Saving photo locally: {uploadProgress.toFixed(0)}%
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
    marginTop: 5,
    marginBottom: 5,
  },
  localStorageNote: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
   errorInput: {
    borderColor: '#ff4444',
    borderWidth: 2,
  },
  errorContainer: {
  borderWidth: 2,
  borderColor: '#ff4444',
  borderRadius: 8,
  padding: 10,
  backgroundColor: '#fff5f5',
},
errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '500',
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
  errorRadio: {
  borderColor: '#ff4444',
  borderWidth: 2,
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
    marginBottom: 5,
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

export default PersonalDetails;