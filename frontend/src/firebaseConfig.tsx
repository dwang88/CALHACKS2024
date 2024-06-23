import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";

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

const SignInWithGoogle = (): Promise<User | null> => {
  return signInWithPopup(auth, provider)
    .then((result) => result.user)
    .catch((error) => {
      console.error("Error during sign-in with Google: ", error);
      return null;
    });
};

export { SignInWithGoogle };
