import { View, Text, Image, ScrollView, Dimensions  } from 'react-native'
import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from '@firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB, REALTIME_DB } from '../../firebaseConfig';
import YoutubePlayer from 'react-native-youtube-iframe'
import { doc, getDoc } from 'firebase/firestore';
import { onValue, ref } from 'firebase/database';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [temperatureRating, setTemperatureRating] = useState(0);
    const [temperatureComment, setTemperatureComment] = useState('');
    const [humidityRating, setHumidityRating] = useState(0);
    const [humidityComment, setHumidityComment] = useState('');
    const [loudnessRating, setLoudnessRating] = useState(0);
    const [loudnessComment, setLoudnessComment] = useState('');
    const [postureRating, setPostureRating] = useState(0);
    const [postureComment, setPostureComment] = useState('');
    const windowWidth = Dimensions.get('window').width;
    const [username, setUsername] = useState('');
    const [playing, setPlaying] = useState(false);
    const [userUID, setUserUID] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
          setUser(user);
        });
    
        return () => unsubscribe();
    }, []);

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
    
    const videos = [
        { title: 'The dangers of prolonged sitting posture', videoId: 'k1iZYaUz8uY' },
        { title: 'Why proper room temperature is important', videoId: 'RWiOhlqEDz4' },
        { title: 'What is humidity?', videoId: 'ZQDcitKup_4' },
        { title: 'Taking care of your ears', videoId: 'fOMBzdzh6tQ' },
    ];

    const scrollViewRef = useRef(null);

    const snapOffsets = Array.from({ length: videos.length }, (_, i) => i * windowWidth);


    return (
    <ScrollView style={{flex: 1, borderWidth: 1, borderColor: 'black'}}>
      <View style={{marginTop: 10}}>
        <View style={{borderWidth: 1, borderColor: "black", borderRadius: 20, alignSelf: "center", width: 310, padding: 10, backgroundColor: "#91e8fa"}}>
          <Text style={{alignSelf: "center", fontSize: 30, fontWeight: "bold"}}>Welcome back!</Text>
        </View>

        <View style={{alignItems: 'center', borderRadius: 20, padding: 1}}>
          <View style={{flexDirection:"row", marginTop: 10, gap: 10}}>
            <View style={{height: 190, borderWidth: 1, borderColor: "black", borderRadius: 20, padding: 10, alignSelf: "center", width: 150, backgroundColor: "#f7e4bd"}}>
              <View style={{alignSelf: "center"}}>
                <Image style={{width: 50, height: 50}} source={{uri: 'https://cdn.discordapp.com/attachments/1194934283433943050/1197838179726798878/Temperature.png?ex=65bcb8bc&is=65aa43bc&hm=df8c2c870700caee8f1e9335eb03a4e31b371c239b0fd309c3ed1306789fa6f5&' }} />
              </View>
              <View style={{alignSelf: "center", alignItems: "center"}}>
                <Text>Temperature</Text>
                <Text>{temperatureRating}°C</Text>
                <Text 
                  style={{
                    alignSelf: "center", 
                    padding: 10, 
                    justifyContent: "center",
                    textAlign: "center"
                  }}>
                  {temperatureComment}
                </Text>
              </View>
            </View>

            <View style={{height: 190, borderWidth: 1, borderColor: "black", borderRadius: 20, padding: 10, alignSelf: "center", width: 150, backgroundColor: "#f7e4bd"}}>
            <View style={{alignSelf: "center"}}>
                <Image style={{width: 50, height: 50}} source={{uri: 'https://media.discordapp.net/attachments/1194934283433943050/1197836883321962558/Humidity.png?ex=65bcb787&is=65aa4287&hm=c9897fa676ab889acf3e2b7276b60ed8765bfd55d1c5eb08a13b79bcf67350e4&=&format=webp&quality=lossless&width=640&height=640' }} />
              </View>
              <View style={{alignSelf: "center", alignItems: "center"}}>
                <Text>Humidity</Text>
                <Text>{humidityRating}%</Text>
                <Text 
                  style={{
                    alignSelf: "center", 
                    padding: 10, 
                    justifyContent: "center",
                    textAlign: "center"
                  }}>
                  {humidityComment}
                </Text>
              </View>
            </View>
          </View>

          <View style={{flexDirection:"row", marginTop: 10, marginBottom: 20, gap: 10}}>
            <View style={{height: 190, borderWidth: 1, borderColor: "black", borderRadius: 20, padding: 10, alignSelf: "center", width: 150, backgroundColor: "#f7e4bd"}}>
              <View style={{alignSelf: "center"}}>
                <Image style={{width: 50, height: 50}} source={{uri: 'https://media.discordapp.net/attachments/1194934283433943050/1197836883586195496/Loudness.png?ex=65bcb787&is=65aa4287&hm=f5fe1850d7851ef2987a823d1c991692a6a60f09d1948f7bb058efb5fb6218aa&=&format=webp&quality=lossless&width=640&height=640' }} />
              </View>
              <View style={{alignSelf: "center", alignItems: "center"}}>
                <Text>Loudness</Text>
                <Text>{loudnessRating}dB</Text>
                <Text 
                  style={{
                    alignSelf: "center", 
                    padding: 10, 
                    justifyContent: "center",
                    textAlign: "center"
                  }}>
                  {loudnessComment} 
                </Text>
              </View>
            </View>

            <View style={{height: 190, borderWidth: 1, borderColor: "black", borderRadius: 20, padding: 10, alignSelf: "center", width: 150, backgroundColor: "#f7e4bd"}}>
              <View style={{alignSelf: "center"}}>
                <Image style={{width: 50, height: 50, }} source={{uri: 'https://cdn.discordapp.com/attachments/1194934283433943050/1197798223906082816/kisspng-poor-posture-human-back-low-back-pain-middle-back-old-how-it-works-study-in-australia-information-5b716872143556.7840094615341589620828.png?ex=65bc9386&is=65aa1e86&hm=745f6e11519e89b3f6339e97dce09f359114b0f15acab04ed550c1896c1a2dc9&' }} />
              </View>
              <View style={{alignSelf: "center"}}>
                <Text style={{alignSelf: "center"}}>Posture</Text>
                <Text style={{alignSelf: "center"}}>{postureRating}/10</Text>
                <Text 
                  style={{
                    alignSelf: "center", 
                    padding: 10, 
                    justifyContent: "center",
                    textAlign: "center"
                  }}>
                  {postureComment}
                </Text>
              </View>
            </View>
          </View>

          <View style={{alignItems: "center", borderTopWidth: 1, borderBottomWidth: 1, borderColor: "black", marginBottom: 10}}>
            <Text style={{fontWeight: "bold"}}>Want to learn more for your health?</Text>
          </View>

          <ScrollView
            horizontal
            style={{ marginRight: 10, marginLeft: 10 }}
            snapToOffsets={snapOffsets}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / windowWidth);
              console.log('Snapped to video index:', index);
            }}
            ref={scrollViewRef}
          >
            {videos.map((video, index) => (
              <View key={index} style={{ width: windowWidth, alignItems: 'center', borderRadius: 20 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>{video.title}</Text>
                  <YoutubePlayer
                    height={225}
                    width={windowWidth}
                    play={playing}
                    videoId={video.videoId}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
          </View>
        </View>
    </ScrollView>
    )
}

export default Dashboard