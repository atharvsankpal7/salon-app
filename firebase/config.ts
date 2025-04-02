// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWhRmfs2xpEXzbX6O0Yc9Z1uI-OWXTlIE",
  authDomain: "bookmysalon-1e450.firebaseapp.com",
  projectId: "bookmysalon-1e450",
  storageBucket: "chat-app-2023-d2091.appspot.com",
  messagingSenderId: "135983289644",
  appId: "1:135983289644:android:b1ccc57de4af1f2c600889",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);
