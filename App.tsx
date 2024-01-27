import 'react-native-gesture-handler';
import { View, Text, TextInput, Button, ScrollView, ActivityIndicator, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, NavigationContainerRefContext, useFocusEffect, usePreventRemoveContext } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import { DrawerContentScrollView, DrawerItemList, createDrawerNavigator } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB, firebase } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';

import Home from './apps/Welcome';
import Simple from './apps/Simple';
import Dashboard from './apps/screens/Dashboard';
import Profile from './apps/screens/ProfileScreen/Profile';
import Posture from './apps/screens/Posture';
import Humidity from './apps/screens/Humidity';
import Loudness from './apps/screens/Loudness';
import Temperature from './apps/screens/Temperature';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function CustomDrawerContent(props: any) {
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState('');
  const [image, setImage] = useState('');
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const [username, setUsername] = useState('');

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      console.log('User logged out successfully!');
      navigation.navigate('Welcome');
      // You may want to redirect the user to the login screen or perform other actions after logout.
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      setUser(user);

      const userEmail = user.email;
      console.log('Email', user.email)
      const profileImageRef = firebase.storage().ref().child(`${userEmail}`);   

      const downloadURL = await profileImageRef.getDownloadURL();
      setProfileImage(downloadURL);
    });

    return () => unsubscribe();
  }, [updateTrigger]);

  const getUsername = async (user: string) => {
    if (user) {
        const userEmail = user.email;
        const retrieveDoc = doc(FIRESTORE_DB, 'users', userEmail);

        const docSnapshot = await getDoc(retrieveDoc);
        const userData = docSnapshot.data();

        const retrievedUsername = userData.username;
        setUsername(retrievedUsername);
    } else {
        console.log(error)
    }
  }

  const fetchProfileImage = async () => {
    const authUser = FIREBASE_AUTH.currentUser;
  
    if (authUser) {
      const userEmail = authUser.email;
  
      const storageRef = firebase.storage().ref().child(`${userEmail}`);
      try {
        const downloadURL = await storageRef.getDownloadURL();
        setProfileImage(downloadURL);
      } catch (error) {
        const placeholderRef = firebase.storage().ref().child('placeholder.jpg');
        const placeholderURL = await placeholderRef.getDownloadURL().catch(() => '');
        setProfileImage(placeholderURL);
      }
    }
  };

  const navigation = useNavigation();
  fetchProfileImage();
  getUsername(user);

  return (
    <SafeAreaView style={{flex: 1}}>
      <DrawerContentScrollView {...props} options={{headerStyle: {backgroundColor:"lightgreen"}}}>
        <View style={{flexDirection: "row", alignSelf:"center", marginTop: 20, paddingLeft: 50, paddingRight: 50, paddingTop: 20, paddingBottom: 20, borderBottomWidth: 1, borderTopWidth: 1, borderColor: "black"}}>
          <View style={{marginRight: 10, marginLeft: -10}}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image 
                source={profileImage ? { uri: profileImage } : {uri: 'placeholder'}} 
                style={{width: 80, height: 80, borderWidth: 1, borderColor: 'black', borderRadius: 50}}
              />
            </TouchableOpacity>
          </View>
          <View style={{alignSelf: "center"}}>
            <Text style={{fontWeight: "bold", margin: 10, fontSize: 20}}>
              {user ? `${username}` : 'Not Logged In'}
            </Text>
            <Button title="Logout" onPress={handleLogout} color="#e74c3c" />
          </View>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={{padding: 20, borderTopWidth: 1, borderColor: "black"}}>
        <Text>DeskSense</Text>
      </View>
    </SafeAreaView>
  )
}

const App = () => {

  return (
    <NavigationContainer>
      <Drawer.Navigator screenOptions={{drawerStyle:{backgroundColor: "lightgrey"}}} drawerContent={CustomDrawerContent} initialRouteName='Welcome' >
        <Drawer.Screen name="Welcome" component={Home} options={{headerShown: false, drawerItemStyle: { display: 'none'}}}/>
        <Drawer.Screen name="Basic View" component={Simple} options={{headerShown: false, 
          drawerIcon: ({ size, color }) => (
            <Ionicons name="book" size={size} color={color} />
          )}} />
        <Drawer.Screen name="Profile" component={Profile} options={{drawerItemStyle: { display: 'none' }, headerStyle: {backgroundColor:"lightgreen"}}}/>

        <Drawer.Screen name="Dashboard" component={Dashboard} options={{
            headerStyle: {backgroundColor:"lightgreen"}, 
            headerTintColor: "black", 
            drawerActiveTintColor:"black",
            drawerIcon: ({ size, color }) => (
              <Ionicons name="home" size={size} color={color} />
            )
          }}/>
        <Drawer.Screen name="Posture" component={Posture} options={{
            headerStyle: {backgroundColor:"lightgreen"}, 
            headerTintColor: "black", 
            drawerActiveTintColor:"black",
            drawerIcon: ({ size, color }) => (
              <Ionicons name="body" size={size} color={color} />
            )
          }}/>
        <Drawer.Screen name="Temperature" component={Temperature} options={{
            headerStyle: {backgroundColor:"lightgreen"}, 
            headerTintColor: "black", 
            drawerActiveTintColor:"black",
            drawerIcon: ({ size, color }) => (
              <Ionicons name="thermometer" size={size} color={color} />
            )
          }}/>
        <Drawer.Screen name="Loudness" component={Loudness} options={{
            headerStyle: {backgroundColor:"lightgreen"}, 
            headerTintColor: "black", 
            drawerActiveTintColor:"black",
            drawerIcon: ({ size, color }) => (
              <Ionicons name="megaphone" size={size} color={color} />
            )
          }}/>
        <Drawer.Screen name="Humidity" component={Humidity} options={{
            headerStyle: {backgroundColor:"lightgreen"}, 
            headerTintColor: "black", 
            drawerActiveTintColor:"black",
            drawerIcon: ({ size, color }) => (
              <Ionicons name="cloudy" size={size} color={color} />
            )
          }}/>

      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default App;

