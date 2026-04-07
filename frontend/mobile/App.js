import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, StatusBar, Clipboard, Image, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Required for the auth session to properly close the browser after redirect
WebBrowser.maybeCompleteAuthSession();

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
// When running in a web browser (Expo Web / localhost), the backend is always
// at localhost:5000. When running on a physical phone over WiFi, it uses the
// LAN IP from .env. This auto-detection fixes ERR_CONNECTION_TIMED_OUT on web.

const RAW_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.100:5000';
// On web, replace any LAN IP with localhost so the browser can reach the server
const BACKEND_URL =
  Platform.OS === 'web'
    ? RAW_BACKEND_URL.replace(/http:\/\/[\d.]+:/, 'http://localhost:')
    : RAW_BACKEND_URL;

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'PASTE_HERE';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'PASTE_HERE';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'PASTE_HERE';

const GlassCard = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const CustomButton = ({ title, onPress, variant = 'primary', icon }) => (
  <TouchableOpacity
    style={[styles.button, variant === 'secondary' && styles.buttonSecondary]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {icon && <Ionicons name={icon} size={20} color="#fff" style={styles.buttonIcon} />}
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const CustomInput = ({ placeholder, value, onChangeText, secureTextEntry, icon }) => (
  <View style={styles.inputContainer}>
    {icon && <Ionicons name={icon} size={20} color="#fff" style={styles.inputIcon} />}
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="rgba(255,255,255,0.6)"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
    />
  </View>
);

const Dropdown = ({ value, options, onSelect, isOpen, setIsOpen, icon }) => (
  <View style={styles.dropdownContainer}>
    <TouchableOpacity
      style={styles.dropdownButton}
      onPress={() => setIsOpen(!isOpen)}
      activeOpacity={0.8}
    >
      {icon && <Ionicons name={icon} size={20} color="#fff" style={styles.inputIcon} />}
      <Text style={styles.dropdownButtonText}>{value}</Text>
      <Ionicons
        name={isOpen ? 'chevron-up' : 'chevron-down'}
        size={20}
        color="#fff"
      />
    </TouchableOpacity>
    {isOpen && (
      <View style={styles.dropdownList}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dropdownItem}
            onPress={() => {
              onSelect(option);
              setIsOpen(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownItemText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [keywords, setKeywords] = useState('');
  const [mood, setMood] = useState('Funny');
  const [platform, setPlatform] = useState('Instagram');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const moods = ['Funny', 'Romantic', 'Sad', 'Motivational', 'Professional'];
  const platforms = ['Instagram', 'WhatsApp', 'LinkedIn', 'Twitter'];

  // ── Google OAuth request hook (from expo-auth-session) ──────────────────────
  const [request, googleResponse, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
  });

  // Log both the request and response for debugging
  useEffect(() => {
    console.log('Google Auth Request Loaded:', !!request);
    if (googleResponse) {
      console.log('Google Auth Response Type:', googleResponse.type);
      console.log('Google Auth Response Info:', JSON.stringify(googleResponse, null, 2));
    }
  }, [request, googleResponse]);


  useEffect(() => {
    // This will print the EXACT redirect URI in your terminal!
    if (request?.redirectUri) {
      console.log('──────────────────────────────────────────────────────');
      console.log('❗️ EXACT REDIRECT URI TO PUT IN GOOGLE CONSOLE ❗️');
      console.log(request.redirectUri);
      console.log('──────────────────────────────────────────────────────');
    }
  }, [request?.redirectUri]);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // ── Handle Google OAuth response ────────────────────────────────────────────
  // This effect fires whenever Google redirects back to the app
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { authentication } = googleResponse;
      handleGoogleToken(authentication.accessToken);
    } else if (googleResponse?.type === 'error') {
      Alert.alert('Google Sign-In Failed', googleResponse.error?.message || 'Please try again.');
    }
  }, [googleResponse]);

  const checkLoginStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
        setCurrentScreen('generator');
      }
    } catch (error) {
      console.log('Error checking login:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email,
        password,
      });
      const { user: userData, token } = response.data;
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', token);
      setUser(userData);
      setIsLoggedIn(true);
      setCurrentScreen('generator');
      setEmail('');
      setPassword('');
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Check your credentials.';
      Alert.alert('Login Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/signup`, {
        fullName,
        email,
        password,
      });
      const { user: userData, token } = response.data;
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', token);
      setUser(userData);
      setIsLoggedIn(true);
      setCurrentScreen('generator');
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      const msg = error.response?.data?.message || 'Signup failed. Please try again.';
      Alert.alert('Signup Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['user', 'token']);
    setUser(null);
    setIsLoggedIn(false);
    setCurrentScreen('login');
    setResults(null);
    setKeywords('');
  };

  // ── Called by Google OAuth flow once we have the access token ───────────────
  const handleGoogleToken = async (accessToken) => {
    setIsLoading(true);
    try {
      // Send Google access token to our backend to verify + get our own JWT
      const response = await axios.post(`${BACKEND_URL}/api/auth/google`, {
        accessToken,
      });
      const { user: userData, token } = response.data;
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', token);
      setUser(userData);
      setIsLoggedIn(true);
      setCurrentScreen('generator');
    } catch (error) {
      console.error('Google backend auth error:', error);
      const msg = error.response?.data?.message || 'Google sign-in failed. Please try again.';
      Alert.alert('Google Sign-In Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Triggers the Google sign-in browser popup ───────────────────────────────
  const handleGoogleLogin = async () => {
    try {
      await promptAsync();
    } catch (error) {
      Alert.alert('Error', 'Could not open Google Sign-In. Please try again.');
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleGenerate = async () => {
    if (!keywords) {
      Alert.alert('Error', 'Please enter keywords/topic');
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const response = await axios.post(`${BACKEND_URL}/generate`, {
        keywords,
        mood,
        platform,
      });

      setResults(response.data);
    } catch (error) {
      console.error('Generation error:', error);
      Alert.alert('Error', 'Failed to generate captions. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied!', 'Content copied to clipboard');
  };


  const renderLoginScreen = () => (
    <View style={styles.authContainer}>
      <GlassCard style={styles.authCard}>
        <Ionicons name="sparkles" size={60} color="#FFD700" style={styles.logo} />
        <Text style={styles.authTitle}>Welcome Back!</Text>
        <Text style={styles.authSubtitle}>Login to continue</Text>

        <CustomInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          icon="mail"
        />
        <CustomInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          icon="lock-closed"
        />

        <CustomButton title="Login" onPress={handleLogin} />
        <CustomButton
          title="Continue with Google"
          onPress={handleGoogleLogin}
          variant="secondary"
          icon="logo-google"
        />

        <TouchableOpacity onPress={() => setCurrentScreen('signup')}>
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkTextBold}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </GlassCard>
    </View>
  );


  const renderSignupScreen = () => (
    <View style={styles.authContainer}>
      <GlassCard style={styles.authCard}>
        <Ionicons name="sparkles" size={60} color="#131312" style={styles.logo} />
        <Text style={styles.authTitle}>Create Account</Text>
        <Text style={styles.authSubtitle}>Sign up to get started</Text>

        <CustomInput
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          icon="person"
        />
        <CustomInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          icon="mail"
        />
        <CustomInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          icon="lock-closed"
        />
        <CustomInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          icon="lock-closed"
        />

        <CustomButton title="Sign Up" onPress={handleSignup} />
        <CustomButton
          title="Continue with Google"
          onPress={handleGoogleLogin}
          variant="secondary"
          icon="logo-google"
        />

        <TouchableOpacity onPress={() => setCurrentScreen('login')}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkTextBold}>Login</Text>
          </Text>
        </TouchableOpacity>
      </GlassCard>
    </View>
  );


  const renderGeneratorScreen = () => (
    <View style={styles.container}>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={28} color="#b9b28c" />
          <Text style={styles.headerTitle}>Smart Caption Generator</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out" size={24} color="#fff" />
        </TouchableOpacity>
      </View>



      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <GlassCard style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>
            Hello, {user?.fullName || 'User'}!
          </Text>
          <Text style={styles.welcomeSubtext}>
            Let's create amazing captions for your content
          </Text>
        </GlassCard>


        <GlassCard style={styles.formCard}>
          <Text style={styles.sectionTitle}> Caption Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Keywords / Topic</Text>
            <CustomInput
              placeholder="e.g., Coffee morning, sunset beach..."
              value={keywords}
              onChangeText={setKeywords}
              icon="text"
            />
          </View>





          <View style={styles.formGroup}>
            <Text style={styles.label}>Mood</Text>
            <Dropdown
              value={mood}
              options={moods}
              onSelect={setMood}
              isOpen={showMoodDropdown}
              setIsOpen={setShowMoodDropdown}
              icon="happy"
            />
          </View>



          <View style={styles.formGroup}>
            <Text style={styles.label}>Platform</Text>
            <Dropdown
              value={platform}
              options={platforms}
              onSelect={setPlatform}
              isOpen={showPlatformDropdown}
              setIsOpen={setShowPlatformDropdown}
              icon="logo-instagram"
            />
          </View>



          <View style={styles.formGroup}>
            <Text style={styles.label}>Image (Optional)</Text>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={handleImagePick}
              activeOpacity={0.8}
            >
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              ) : (
                <View style={styles.imagePickerContent}>
                  <Ionicons name="image" size={40} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.imagePickerText}>Tap to select image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <CustomButton
            title={isLoading ? 'Generating...' : 'Generate Captions ✨'}
            onPress={handleGenerate}
            icon="flash"
          />
        </GlassCard>


        {isLoading && (
          <GlassCard style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#cbc9bf" />
            <Text style={styles.loadingText}>Creating magic for you...</Text>
          </GlassCard>
        )}


        {results && !isLoading && (
          <>

            {results.captions && results.captions.length > 0 && (
              <GlassCard style={styles.resultsCard}>
                <View style={styles.resultHeader}>
                  <Ionicons name="chatbubbles" size={24} color="#4ECDC4" />
                  <Text style={styles.resultTitle}>Captions</Text>
                </View>
                {results.captions.map((caption, index) => (
                  <View key={index} style={styles.captionItem}>
                    <Text style={styles.captionText}>{caption}</Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(caption)}
                      style={styles.copyButton}
                    >
                      <Ionicons name="copy" size={20} color="#4ECDC4" />
                    </TouchableOpacity>
                  </View>
                ))}
              </GlassCard>
            )}




            {results.hashtags && results.hashtags.length > 0 && (
              <GlassCard style={styles.resultsCard}>
                <View style={styles.resultHeader}>
                  <Ionicons name="pricetag" size={24} color="#FF6B6B" />
                  <Text style={styles.resultTitle}>Hashtags</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(results.hashtags.join(' '))}
                    style={styles.copyAllButton}
                  >
                    <Text style={styles.copyAllText}>Copy All</Text>
                    <Ionicons name="copy" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.hashtagContainer}>
                  {results.hashtags.map((tag, index) => (
                    <View key={index} style={styles.hashtagChip}>
                      <Text style={styles.hashtagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            )}



            {results.emojis && results.emojis.length > 0 && (
              <GlassCard style={styles.resultsCard}>
                <View style={styles.resultHeader}>
                  <Ionicons name="happy" size={24} color="#FFD700" />
                  <Text style={styles.resultTitle}>Emojis</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(results.emojis.join(''))}
                    style={styles.copyAllButton}
                  >
                    <Text style={styles.copyAllText}>Copy All</Text>
                    <Ionicons name="copy" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.emojiContainer}>
                  {results.emojis.map((emoji, index) => (
                    <Text key={index} style={styles.emojiText}>
                      {emoji}
                    </Text>
                  ))}
                </View>
              </GlassCard>
            )}
          </>
        )}


        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with  by Smart Caption Generator</Text>
        </View>
      </ScrollView>
    </View>
  );

  return (



    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['rgb(173, 149, 149)', 'rgb(77, 63, 92)', '#381d3b', '#3c7fb9']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {currentScreen === 'login' && renderLoginScreen()}
        {currentScreen === 'signup' && renderSignupScreen()}
        {currentScreen === 'generator' && renderGeneratorScreen()}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.3)',
    elevation: 10,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authCard: {
    width: '100%',
    maxWidth: 400,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#fff',
  },
  button: {
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    boxShadow: '0px 10px 15px rgba(255, 215, 0, 0.4)',
    elevation: 8,
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    boxShadow: '0px 0px 0px transparent',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  linkTextBold: {
    fontWeight: 'bold',
    color: '#FFD700',
  },
  welcomeCard: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  formCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
  },
  dropdownList: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    marginTop: 5,
    overflow: 'hidden',
    boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.3)',
    elevation: 10,
  },
  dropdownItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  imagePickerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  imagePickerText: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 10,
    fontSize: 14,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
  },
  resultsCard: {
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
    flex: 1,
  },
  copyAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyAllText: {
    color: '#fff',
    fontSize: 12,
    marginRight: 5,
    fontWeight: '600',
  },
  captionItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  captionText: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  copyButton: {
    padding: 8,
    marginLeft: 10,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hashtagChip: {
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  hashtagText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  emojiText: {
    fontSize: 36,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
});
