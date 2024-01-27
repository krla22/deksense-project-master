import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView } from 'react-native';
import styles from '../../stylesheets/datastyles';
import { FIREBASE_AUTH, FIRESTORE_DB, REALTIME_DB } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { off, onValue, ref, update } from 'firebase/database';

const Temperature = () => {
  const [temperatureRating, settemperatureRating] = useState(null);
  const [temperatureComment, settemperatureComment] = useState('');
  const [temperatureHistory, settemperatureHistory] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [averageComment, setAverageComment] = useState('');
  const [updateCounter, setUpdateCounter] = useState(0);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [userUID, setUserUID] = useState('');

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
    const foundComment = temperatureComments.find(
      (item) => item.range[0] <= temperatureRating && temperatureRating <= item.range[1]
    );
  
    setTemperatureComment(foundComment ? foundComment.comment : '');
  
    const newEntry = {
      rating: temperatureRating,
      comment: foundComment ? foundComment.comment : '',
    };
  
    setTemperatureHistory((prevHistory) => [...prevHistory.slice(1), newEntry].slice(-10));
    setUpdateCounter((prevCounter) => prevCounter + 1);
  }, [temperatureRating]);
  
  
  useEffect(() => {
    const lastTenRatings = temperatureHistory.slice(-10);
    console.log(`temperature history:`, temperatureHistory);
  
    const validRatings = lastTenRatings.map(item => ({...item,
      rating: parseFloat(item.rating) || 0, // Convert to number, default to 0 if not a valid number
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
    { range: [0, 20], comment: 'Extremely dry conditions. Consider moisturizing.' },
    { range: [21, 40], comment: 'Low temperature. Skin and respiratory care advised.' },
    { range: [41, 60], comment: 'Optimal temperature for comfort and well-being.' },
    { range: [61, 80], comment: 'Moderate temperature. Watch for potential discomfort.' },
    { range: [81, 100], comment: 'High temperature levels. Be mindful of respiratory effects.' },
  ];

  const averageRatingComments = [
    { range: [0, 20], comment: 'Extremely dry air.' },
    { range: [21, 40], comment: 'Dry air. Consider using a humidifier.' },
    { range: [41, 60], comment: 'Comfortable temperature levels.' },
    { range: [61, 80], comment: 'Humid air. Be cautious with respiratory issues.' },
    { range: [81, 100], comment: 'Very humid. May cause discomfort and respiratory issues.' },
  ];

  return (
    <ScrollView style={styles.outerContainer}>
      <View style={styles.middleContainer}>
        <Text style={styles.dataTitle}>Temperature</Text>
      </View>

      <View style={styles.middleContainer}>
        <View style={styles.innerContainer}>
          <Text style={styles.historyText}>Temperature Level</Text>
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
              <Text style={styles.dataRating}>{`Temperature Level: ${item.rating !== null ? `${item.rating}%` : 'N/A'}`}</Text>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
};

export default Temperature;


  

  