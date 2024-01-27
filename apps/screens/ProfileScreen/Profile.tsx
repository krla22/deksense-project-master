import { View, Text, TouchableOpacity, SafeAreaView, Alert, Image, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { FIREBASE_AUTH, firebase } from '../../../firebaseConfig';
import { useRouter } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [username, setUsername] = useState(null);
    const {height, width} = useWindowDimensions();
    const router = useRouter();
    const navigation = useNavigation();

    useEffect(() => {
        fetchProfileImage();

        return () => {
        };
    }, []);

    const fetchProfileImage = async () => {
        const authUser = FIREBASE_AUTH.currentUser;
      
        if (authUser) {
          const userEmail = authUser.email;
      
          const storageRef = firebase.storage().ref().child(`${userEmail}`);
          try {
            const downloadURL = await storageRef.getDownloadURL();
            setProfileImage(downloadURL);
          } catch (error) {
            console.error('Error fetching profile image:', error.message);
          }
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4,3],
            quality: 1,
        });

        if(!result.canceled) {
            setImage(result.assets[0].uri);
        }
    }

    const uploadMedia = async () => {
        setUploading(true);
        try {
            const { uri } = await FileSystem.getInfoAsync(image);
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    resolve(xhr.response);
                };
                xhr.onerror = (e) => {
                    reject(new TypeError('Network request failed'));
                };
                xhr.responseType = 'blob';
                xhr.open('GET', uri, true);
                xhr.send(null);
            });
            
            const authUser = FIREBASE_AUTH.currentUser;

            if (authUser) {
                const userEmail = authUser.email;
                const filename = userEmail;
                const newPhotoRef = firebase.storage().ref().child(filename);

                await newPhotoRef.put(blob);

                setProfileImage(null);
                
                setUploading(false);
                Alert.alert('Photo Uploaded');
                setImage(null)
              } else {
                console.error('No authenticated user');
              }
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    }; 

  return (
    <SafeAreaView style={{width: width, height: height, borderWidth: 1, borderColor: "black", padding: 10}}>
      <View style={{marginTop: 20}}>
        <View style={{alignItems: 'center', alignSelf: 'center', marginTop: 20}}>
          <Text style={{fontWeight: "bold", fontSize: 30}}>Change profile picture</Text>
        </View>

        <TouchableOpacity onPress={pickImage} style={{alignItems: 'center', borderWidth: 1, borderColor: "black", width: 150, alignSelf: 'center', marginTop: 20, borderRadius: 20, backgroundColor: "lightblue"}}>
          <Text style={{fontSize: 20, padding: 10}}>Select Image</Text>
        </TouchableOpacity>

        <View style={{alignItems: 'center', alignSelf: 'center', marginTop: 20}}>
          {image && <Image source={{uri: image}} style={{width: 300, height: 300, borderWidth: 1, borderColor: "black"}}/>}
        </View>

        <TouchableOpacity onPress={uploadMedia} style={{alignItems: 'center', borderWidth: 1, borderColor: "black", width: 150, alignSelf: 'center', marginTop: 20, borderRadius: 20, marginBottom: 20, backgroundColor: "lightblue"}}>
          <Text style={{fontSize: 20, padding: 10}}>Upload Image</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default Profile