import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { SignInWithGoogle } from './firebaseConfig';
import axios from "axios"

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [userType, setUserType] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUserType = (type: string) => {
    setUserType(type);
  };

  const handleStudentLogin = () => {
    SignInWithGoogle().then((user) => {
      if (user) {
        onLogin();

        const studentData = {
          uid: user.uid,
          name: user.displayName,
          classes: []
        }
        const result = axios.post("http://localhost:5000/add_student", studentData);
        console.log(result);
      }
    }).catch(error => {
      console.error(error)
    });
    navigate('/student');
  };

  const handleTeacherLogin = () => {
    SignInWithGoogle().then((user) => {
      if (user) {
        onLogin();

        const teacherData = {
          uid: user.uid,
          name: user.displayName,
          classes: []
        }
        const result = axios.post("http://localhost:5000/add_teacher", teacherData); // Assuming you have a TeacherDashboard
      }
    }).catch(error => {
      console.error(error)
    });
    navigate('/teacher');
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
          <button onClick={handleStudentLogin}>Sign In with Google</button>
        </div>
      )}

      {userType === 'teacher' && (
        <div>
          <p>Teacher Login</p>
          <button onClick={handleTeacherLogin}>Sign In with Google</button>
        </div>
      )}
    </div>
  );
};

export default Login;
