import React from 'react';
import './Login.css';
import { SignInWithGoogle } from './firebaseConfig';

const Login: React.FC = () => {
  return (
    <div className="login-page">
      <h2>Login</h2>
      <SignInWithGoogle />
    </div>
  );
};

export default Login;
