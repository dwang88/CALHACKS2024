import React, { useState } from 'react';
import './Login.css';
import { SignInWithGoogle } from './firebaseConfig';

const Login: React.FC = () => {
  const [userType, setUserType] = useState<string | null>(null);

  const handleUserType = (type: string) => {
    setUserType(type);
  };

  return (
    <div className="login-page">

      {userType === null && (
        <div>
          <h2>Are you a Student or Teacher?</h2>

          <button className='sbut' onClick={() => handleUserType('student')}>Student</button>
          <button className='tbut' onClick={() => handleUserType('teacher')}>Teacher</button>
        </div>
      )}

      {userType === 'student' && (
        <div>
          <p>Student Login</p>
          <SignInWithGoogle />
          {/* Additional student-specific components or actions */}
        </div>
      )}

      {userType === 'teacher' && (
        <div>
          <p>Teacher Login</p>
          <SignInWithGoogle />
          {/* Additional teacher-specific components or actions */}
        </div>
      )}

    </div>
  );
};

export default Login;
