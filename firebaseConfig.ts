import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase, ref, set } from 'firebase/database';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

const firebaseConfig = {
    apiKey: "AIzaSyA0EwZpKXhEo00JYPq7_5H1Q9uiMtUomsk",
    authDomain: "desksense-project.firebaseapp.com",
    projectId: "desksense-project", 
    storageBucket: "desksense-project.appspot.com", 
    messagingSenderId: "834745453959",  
    appId: "1:834745453959:web:5881d74930449b2fcc1722",
    measurementId: "G-0P0EMSQLJM",
    databaseURL: "https://desksense-project-default-rtdb.asia-southeast1.firebasedatabase.app"  
};
  
if(firebase.apps.length===0){firebase.initializeApp(firebaseConfig)}

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
export const REALTIME_DB = getDatabase(FIREBASE_APP);

const createUserDocument = async (email, username) => {
  const userRef = doc(FIRESTORE_DB, 'users', email);
  await setDoc(userRef, { username });
};

const getUserDocument = async (email) => {
  const userRef = doc(FIRESTORE_DB, 'users', email);
  const userDoc = await getDoc(userRef);
  return userDoc.data();
};

export { firebase, createUserDocument, getUserDocument };
