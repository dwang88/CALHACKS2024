// src/firebaseConfig.tsx
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { useState } from "react";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "canvas-gpt.firebaseapp.com",
  projectId: "canvas-gpt",
  storageBucket: "canvas-gpt.appspot.com",
  messagingSenderId: "244500042332",
  appId: "1:244500042332:web:e96d6c28f4a2876a4ecc99",
  measurementId: "G-9J6KVLJXMG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const SignInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error during sign-in with Google: ", error);
    throw error;
  }
};

const doSignOut = () => {
  return auth.signOut();
}

export { app, auth, SignInWithGoogle, doSignOut };
