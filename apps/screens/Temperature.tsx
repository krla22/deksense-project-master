import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView } from 'react-native';
import styles from '../../stylesheets/datastyles';
import { FIREBASE_AUTH, FIRESTORE_DB, REALTIME_DB } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, update, onValue, off } from 'firebase/database';

const Temperature = () => {
  const [temperatureRating, setTemperatureRating] = useState(0);
  const [temperatureComment, setTemperatureComment] = useState('');
  const [temperatureHistory, setTemperatureHistory] = useState(Array.from({ length: 10 }, () => ({ rating: 0, comment: '' })));
  const [averageRating, setAverageRating] = useState(0);
  const [averageComment, setAverageComment] = useState('');
  const [updateCounter, setUpdateCounter] = useState(0);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [userUID, setUserUID] = useState('');
  const hasZeroRating = temperatureHistory.some(item => item.rating === 0);

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
    const setAuth = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      setUser(user);
      getUsername(user);
    });
  }, []);

  useEffect(() => {
    if (user && username) {
      const userDataRef = ref(REALTIME_DB, `UsersData/${userUID}/average`);
      const averageData = {
        averageTemperatureRating: averageRating,
        averageTemperatureComment: averageComment,
      };

      update(userDataRef, averageData)
        .then(() => {
          console.log('Average data sent to Firebase successfully');
        })
        .catch((error) => {
          console.error('Error sending average data to Firebase: ', error);
        });
    }
  }, [user, username, averageRating, averageComment]);

  useEffect(() => {
    if (user && username) {
      setUserUID(FIREBASE_AUTH.currentUser.uid);
      const temperatureRef = ref(REALTIME_DB, `UsersData/${userUID}/readings/temperature`);

      const onDataChange = (snapshot) => {
        const temperatureValue = snapshot.val();
        if (temperatureValue !== null && !isNaN(temperatureValue)) {
          setTemperatureRating(temperatureValue);
        }
      };

      onValue(temperatureRef, onDataChange);

      return () => {
        off(temperatureRef, onDataChange);
      };
    }
  }, [user, username, userUID]);

  useEffect(() => {
    console.log(temperatureRating)
    const foundComment = temperatureComments.reduce((closest, current) => {
      const currentDiff = Math.min(
        Math.abs(temperatureRating - current.range[0]),
        Math.abs(temperatureRating - current.range[1])
      );
      const closestDiff = Math.min(
        Math.abs(temperatureRating - closest.range[0]),
        Math.abs(temperatureRating - closest.range[1])
      );
  
      return currentDiff < closestDiff ? current : closest;
    }, temperatureComments[0]);
    console.log('Found Comment:', foundComment);
  
    setTemperatureComment(foundComment ? foundComment.comment : '');
    console.log(temperatureComment)
  
    const newArray = Array.from({ length: 1 }, (_, index) => ({
      rating: temperatureRating,
      comment: foundComment ? foundComment.comment : '',
    }));
  
    setTemperatureHistory((prevHistory) => [...prevHistory.slice(1), ...newArray].slice(-10))
    setUpdateCounter((prevCounter) => prevCounter + 1);
  }, [temperatureRating]);
  
  useEffect(() => {
    const lastTenRatings = temperatureHistory.slice(-10);
  
    const validRatings = lastTenRatings.map(item => ({...item,
      rating: parseFloat(item.rating) || 0,
    }));
  
    const sumRating = validRatings.reduce((sum, item) => sum + item.rating, 0);
    const numRatings = Math.max(validRatings.length, 1); // Ensure a minimum of 1 rating
  
    const avgRating = sumRating / numRatings; // Calculate average
    console.log('Avg Rating:', avgRating);
  
    const foundAvgComment = averageRatingComments.reduce((closest, current) => {
      const currentDiff = Math.abs(avgRating - (current.range[0] + current.range[1]) / 2);
      const closestDiff = Math.abs(avgRating - (closest.range[0] + closest.range[1]) / 2);
  
      return currentDiff < closestDiff ? current : closest;
    });
  
    setAverageRating(parseFloat(avgRating.toFixed(2)));
    setAverageComment(foundAvgComment.comment);
  }, [temperatureHistory, updateCounter]);

  const temperatureComments = [
    { range: [20, 25], comment: 'It is too cold, consider warming up.' },
    { range: [26, 30], comment: 'The temperature is comfortable.' },
    { range: [31, 35], comment: 'It is getting warm, stay cool.' },
    { range: [36, 40], comment: 'It is hot, make sure to stay hydrated.' },
    { range: [41, 50], comment: 'It is extremely hot, take necessary precautions.' },
  ];

  const averageRatingComments = [
    { range: [20, 25], comment: 'Consider warming yourself up!' },
    { range: [26, 30], comment: 'The temperatures are comfortable and good!' },
    { range: [31, 35], comment: 'The room is getting hotter' },
    { range: [36, 40], comment: 'Consider cooling your room to prevent health risks!' },
    { range: [41, 50], comment: 'Health Risk! Please get out of the room!' },
  ];
  
  return (
    <ScrollView style={styles.outerContainer}>
      {hasZeroRating ? (
        // Loading view when there's a rating of zero in the history
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Gathering humidity data...</Text>
        </View>
      ) : (
        // Display humidity data
        <>
          <View style={styles.middleContainer}>
            <View style={styles.innerContainer}>
              <Text style={styles.historyText}>Temperature</Text>
              <Text style={styles.dataRating}>Rating: {temperatureRating}%</Text>
              <Text style={styles.dataComment}>{temperatureComment}</Text>
            </View>
            <View style={styles.innerContainer}>
              <View style={styles.averageRatingContainer}>
                <Text style={styles.dataRating}>Average Rating: {Math.round(averageRating)}%</Text>
                <Text style={styles.dataComment}>{averageComment}</Text>
              </View>    
            </View>
          </View>

          <View style={styles.historyContainer}>
            <Text style={styles.historyText}>History</Text>
            <FlatList
              data={temperatureHistory.slice().reverse()}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.historyDataContainer}>
                  <Text style={styles.dataRating}>{`Temperature Readings: ${item.rating !== null ? `${item.rating}%` : 0}`}</Text>
                </View>
              )}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default Temperature;
