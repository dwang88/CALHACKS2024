// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { useState } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyCMpdYucrFK2tqNMBg_qgDARTKb3efJhD0",
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

const SignInWithGoogle = () => {
  const [user,setUser] = useState<User | null>(null);

  const handleLogin = () => {
    try {
        signInWithPopup(auth, provider).
        then((res) => {
            setUser(res.user);
        }).catch((error)=> {
            console.error(error);
        });
      } catch (error) {
        console.error("Error during sign-in with Google: ", error);
        throw error;
      }
  }
  
  return (
    <>
        <button onClick={handleLogin}>Login</button>
        <p>Current user: {user?.displayName}</p>
    </>
  )
}

export { SignInWithGoogle };
