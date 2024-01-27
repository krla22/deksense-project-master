import { View, Text, TextInput, Button, ScrollView, ActivityIndicator } from 'react-native';
import React,  { useEffect, useState } from 'react';
import styles from '../stylesheets/loginstyle';
import 'react-native-gesture-handler';
import AuthenticatedScreen from './Simple';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { FIREBASE_APP, FIRESTORE_DB, REALTIME_DB } from '../firebaseConfig';
import { collection, doc, setDoc, getDoc, ref, set, get } from 'firebase/firestore';
import { push, ref as rtdbRef, set as rtdbSet } from 'firebase/database';

const AuthScreen = ({ email, setEmail, password, setPassword, isLogin, setIsLogin, handleAuthentication, username, setUsername, isLoading }: any) => {
  return (
    <View style={styles.overallContainer}>
      <View style={styles.authContainer}>
        <Text style={styles.welcome}>Welcome to Desksense</Text>
        <Text style={styles.title}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
        
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
        />

        {!isLogin && (
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            autoCapitalize="none"
          />
        )}

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />
        <View style={styles.buttonContainer}>
          <Button title={isLogin ? 'Sign In' : 'Sign Up'} onPress={handleAuthentication} color="#3498db" />
        </View>

        {isLoading && <ActivityIndicator size="large" color="#3498db" />}
        
        <View style={styles.bottomContainer}>
          <Text style={styles.toggleText} onPress={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const Home = () => {
  const auth = getAuth(FIREBASE_APP);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        const userEmail = user.email;

        // Check if the folder with user's email exists in the Realtime Database
        const rtdbUserRef = rtdbRef(REALTIME_DB, userEmail);
        const rtdbSnapshot = await get(rtdbUserRef);

        if (!rtdbSnapshot.exists()) {
          // If the folder doesn't exist, create it
          await rtdbSet(rtdbUserRef, { username: username || '' });
        }

        // Check if the username is not null in the Firestore database
        const retrieveDoc = doc(FIRESTORE_DB, 'users', userEmail);
        const docSnapshot = await getDoc(retrieveDoc);

        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          const retrievedUsername = userData.username;
          setUsername(retrievedUsername);
        }

        setIsLoading(false);
      } else {
        // User is not authenticated
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, username]);

  const createDoc = async (email: string, username: string) => {
    const addDoc = doc(collection(FIRESTORE_DB, 'users'), email);

    await setDoc(addDoc, {
      username,
    });
  }

  const handleAuthentication = async () => {
    try {
      setIsLoading(true);

      if (user) {
        // If the user is already authenticated, log out
        console.log('User logged out successfully!');
        await signOut(auth);
      } else {
        // Sign in or sign up
        if (isLogin) {
          // Sign in
          await signInWithEmailAndPassword(auth, email, password);
          console.log('User signed in successfully!');
        } else {
          // Sign up
          await createUserWithEmailAndPassword(auth, email, password);

          // Create a new folder in the Realtime Database with user's email
          const rtdbUserRef = rtdbRef(REALTIME_DB, username);
          await rtdbSet(rtdbUserRef, { username });

          // Create or update the user document in Firestore
          const userDocRef = doc(FIRESTORE_DB, 'users', email);
          await setDoc(userDocRef, { username });

          console.log('User created successfully!');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading ? (
        // Display loading indicator
        <ActivityIndicator size="large" color="#3498db" />
      ) : user ? (
        // User is authenticated and has a username in the database
        <AuthenticatedScreen handleAuthentication={handleAuthentication} />
      ) : (
        // User is not authenticated or does not have a username in the database
        <AuthScreen
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          handleAuthentication={handleAuthentication}
          username={username}
          setUsername={setUsername}
          isLoading={isLoading}
        />
      )}
    </ScrollView>
  );
}

export default Home;

