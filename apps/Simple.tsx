import { View, Text, useWindowDimensions, SafeAreaView, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from '@firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB, REALTIME_DB } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Dashboard from './screens/Dashboard';
import { onValue, ref } from 'firebase/database';
import Temperature from './screens/Temperature';
import Humidity from './screens/Humidity';
import Loudness from './screens/Loudness';
import Posture from './screens/Posture';

const Simple = () => {
    const navigation = useNavigation();
    const {height, width} = useWindowDimensions();
    const router = useRouter();
    const [temperatureRating, setTemperatureRating] = useState(0);
    const [temperatureComment, setTemperatureComment] = useState('');
    const [humidityRating, setHumidityRating] = useState(0);
    const [humidityComment, setHumidityComment] = useState('');
    const [loudnessRating, setLoudnessRating] = useState(0);
    const [loudnessComment, setLoudnessComment] = useState('');
    const [postureRating, setPostureRating] = useState(0);
    const [postureComment, setPostureComment] = useState('');
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [overallRating, setOverallRating] = useState(0);
    const [overallRatingComment, setOverallRatingComment] = useState('');
    const [userUID, setUserUID] = useState('');

    const simplifyTemperatureRating = (temperature) => {
        if (temperature >= 20 && temperature <= 25) return 2;
        else if (temperature >= 26 && temperature <= 30) return 4;
        else if (temperature >= 31 && temperature <= 35) return 2;
        else if (temperature >= 36 && temperature <= 40) return 1;
        else if (temperature >= 41 && temperature <= 50) return 1;
        else return 0; // Handle other cases as needed
    };

    const simplifyPostureRating = (posture) => {
        if (posture >= 0 && posture <= 2) return 1;
        else if (posture >= 3 && posture <= 4) return 1;
        else if (posture >= 5 && posture <= 6) return 2;
        else if (posture >= 7 && posture <= 8) return 3;
        else if (posture >= 9 && posture <= 10) return 4;
        else return 0; // Handle other cases as needed
    };
    
    const simplifyHumidityRating = (humidity) => {
        if (humidity >= 0 && humidity <= 20) return 1;
        else if (humidity >= 21 && humidity <= 40) return 2;
        else if (humidity >= 41 && humidity <= 60) return 4;
        else if (humidity >= 61 && humidity <= 80) return 2;
        else if (humidity >= 81 && humidity <= 100) return 1;
        else return 0; // Handle other cases as needed
    };
    
    const simplifyLoudnessRating = (loudness) => {
        if (loudness >= 0 && loudness <= 20) return 3;
        else if (loudness >= 21 && loudness <= 40) return 4;
        else if (loudness >= 41 && loudness <= 60) return 3;
        else if (loudness >= 61 && loudness <= 80) return 2;
        else if (loudness >= 81 && loudness <= 100) return 1;
        else return 0; // Handle other cases as needed
    };    

    const overallRatingComments = [
        {range: [1, 3], comment: 'Poor overall conditions. Consider addressing each aspect for better health.'},
        { range: [4, 6], comment: 'Suboptimal conditions. Focus on improving specific areas for a healthier environment.'},
        { range: [7, 9], comment: 'Moderate overall conditions. Room for improvement, but generally acceptable.'},
        { range: [10, 12], comment: 'Good overall conditions. Your environment is conducive to well-being.'},
        { range: [13, 15], comment: 'Excellent overall conditions. Keep up the good work for a healthy and comfortable space!'},
    ];

    useEffect(() => {
        // Calculate overall rating
        const calculateOverallRating = () => {
            // Calculate simplified ratings
            const simplifiedTemperatureRating = simplifyTemperatureRating(temperatureRating);
            const simplifiedPostureRating = simplifyPostureRating(postureRating);
            const simplifiedHumidityRating = simplifyHumidityRating(humidityRating);
            const simplifiedLoudnessRating = simplifyLoudnessRating(loudnessRating);

            // Calculate overall rating
            const overallRating = simplifiedTemperatureRating + simplifiedPostureRating + simplifiedHumidityRating + simplifiedLoudnessRating;

            setOverallRating(overallRating);
            console.log(overallRating)
        };

        // Set overall rating comment based on overall rating
        const setOverallRatingCommentBasedOnRating = () => {
            const foundComment = overallRatingComments.find(item => item.range[0] <= overallRating && overallRating <= item.range[1]);
            if (foundComment) {
                setOverallRatingComment(foundComment.comment);
            }
        };

        // Call the functions
        calculateOverallRating();
        setOverallRatingCommentBasedOnRating();
    }, [temperatureRating, postureRating, humidityRating, loudnessRating]);

    const getUsername = async (user: string) => {
        if (user) {
            const userEmail = user.email;
            const retrieveDoc = doc(FIRESTORE_DB, 'users', userEmail);

            const docSnapshot = await getDoc(retrieveDoc);
            const userData = docSnapshot.data();

            const retrievedUsername = userData.username;
            setUsername(retrievedUsername);
        } else {
            console.log('Error')
        }
    }

    useEffect(() => {
        getUsername(user);
      
        if (user && username) {
            const userUID = FIREBASE_AUTH.currentUser.uid;
            setUserUID(userUID);
          const averageRef = ref(REALTIME_DB, `UsersData/${userUID}/average`);
      
          onValue(averageRef, (snapshot) => {
            const averageData = snapshot.val();
      
            if (averageData) {
              setTemperatureRating(averageData.averageTemperatureRating || 0);
              setTemperatureComment(averageData.averageTemperatureComment || '');
      
              setHumidityRating(averageData.averageHumidityRating || 0);
              setHumidityComment(averageData.averageHumidityComment || '');
      
              setLoudnessRating(averageData.averageLoudnessRating || 0);
              setLoudnessComment(averageData.averageLoudnessComment || '');
      
              setPostureRating(averageData.averagePostureRating || 0);
              setPostureComment(averageData.averagePostureComment || '');
            }
          });
        }
    }, [user, username]);
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
        setUser(user);
        });

        
        return () => unsubscribe();
    }, []);

    const navigateToDashboard = () => {
        navigation.navigate('Dashboard');
    };
    
    const handleLogout = async () => {
        try {
            await signOut(FIREBASE_AUTH);
            console.log('User logged out successfully!');
            navigation.navigate('Welcome')
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    getUsername(user);

    return (
    <SafeAreaView style={{flex: 1, width: width, height: height, alignSelf: "center", justifyContent: 'center', borderWidth: 1, borderColor: "black", backgroundColor: "lightgreen"}}>
        <Text style={{alignSelf: "center", fontSize: 20, fontWeight: "bold", paddingBottom: 10}}>{username ? `Welcome, ${username}!` : 'Welcome!'}</Text>

        <View style={{borderWidth: 1, borderColor: "black", borderRadius: 20, alignSelf: "center", width: 310, padding: 10, backgroundColor: "#91e8fa"}}>
            <Text style={{alignSelf: "center", fontSize: 30, fontWeight: "bold"}}>Overall Rating:</Text>
            <View style={{flexDirection: "row", alignSelf: "center"}}>
            <Text style={{alignSelf: "center", fontSize: 20, fontStyle: "italic", textAlign:"center"}}>{overallRatingComment}</Text>
            </View>
        </View>

        <View style={{alignItems: 'center', marginTop: 10, borderRadius: 20, padding: 1}}>
            
            <View style={{flexDirection:"row", marginTop: 10, gap: 10}}>
            
            <View style={{borderWidth: 1, borderColor: "black", borderRadius: 20, padding: 10, alignSelf: "center", width: 150, backgroundColor: "#f7e4bd"}}>
                <View style={{alignSelf: "center"}}>
                <Image style={{width: 50, height: 50}} source={{uri: 'https://cdn.discordapp.com/attachments/1194934283433943050/1197838179726798878/Temperature.png?ex=65bcb8bc&is=65aa43bc&hm=df8c2c870700caee8f1e9335eb03a4e31b371c239b0fd309c3ed1306789fa6f5&' }} />
                </View>
                <View style={{alignSelf: "center"}}>
                <Text >Temperature</Text>
                <Text style={{alignSelf: "center"}}>{temperatureRating}°C</Text>
                </View>
            </View>

            <View style={{borderWidth: 1, borderColor: "black", borderRadius: 20, padding: 10, alignSelf: "center", width: 150, backgroundColor: "#f7e4bd"}}>
            <View style={{alignSelf: "center"}}>
                <Image style={{width: 50, height: 50}} source={{uri: 'https://media.discordapp.net/attachments/1194934283433943050/1197836883321962558/Humidity.png?ex=65bcb787&is=65aa4287&hm=c9897fa676ab889acf3e2b7276b60ed8765bfd55d1c5eb08a13b79bcf67350e4&=&format=webp&quality=lossless&width=640&height=640' }} />
                </View>
                <View style={{alignSelf: "center"}}>
                <Text>Humidity</Text>
                <Text style={{alignSelf: "center"}}>{humidityRating}%</Text>
                </View>
            </View>
            </View>

            <View style={{flexDirection:"row", marginTop: 10, marginBottom: 20, gap: 10}}>
            <View style={{borderWidth: 1, borderColor: "black", borderRadius: 20, padding: 10, alignSelf: "center", width: 150, backgroundColor: "#f7e4bd"}}>
                <View style={{alignSelf: "center"}}>
                <Image style={{width: 50, height: 50}} source={{uri: 'https://media.discordapp.net/attachments/1194934283433943050/1197836883586195496/Loudness.png?ex=65bcb787&is=65aa4287&hm=f5fe1850d7851ef2987a823d1c991692a6a60f09d1948f7bb058efb5fb6218aa&=&format=webp&quality=lossless&width=640&height=640' }} />
                </View>
                <View style={{alignSelf: "center"}}>
                <Text>Loudness</Text>
                <Text style={{alignSelf: "center"}}>{loudnessRating}db</Text>
                </View>
            </View>

            <View style={{borderWidth: 1, borderColor: "black", borderRadius: 20, padding: 10, alignSelf: "center", width: 150, backgroundColor: "#f7e4bd"}}>
                <View style={{alignSelf: "center"}}>
                <Image style={{width: 50, height: 50, }} source={{uri: 'https://cdn.discordapp.com/attachments/1194934283433943050/1197798223906082816/kisspng-poor-posture-human-back-low-back-pain-middle-back-old-how-it-works-study-in-australia-information-5b716872143556.7840094615341589620828.png?ex=65bc9386&is=65aa1e86&hm=745f6e11519e89b3f6339e97dce09f359114b0f15acab04ed550c1896c1a2dc9&' }} />
                </View>
                <View style={{alignSelf: "center"}}>
                <Text style={{alignSelf: "center"}}>Posture</Text>
                <Text style={{alignSelf: "center"}}>{postureRating}/10</Text>
                </View>
            </View>
            </View>
        </View>

        <TouchableOpacity onPress={navigateToDashboard} style={{alignSelf: "center", backgroundColor: "green", width: 130, height: 35, borderTopRightRadius: 10, borderTopLeftRadius: 10}}>
            <Text style={{textAlign: "center", paddingTop: 7, color: "white"}}>
                To Dashboard
            </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={{alignSelf: "center", backgroundColor: "red", width: 130, height: 35, borderBottomRightRadius: 10, borderBottomLeftRadius: 10}}>
            <Text style={{textAlign: "center", paddingTop: 7, color: "white"}}>
                Logout
            </Text>
        </TouchableOpacity>
    </SafeAreaView>
    )
}

export default Simple;