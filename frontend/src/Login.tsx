import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { SignInWithGoogle } from './firebaseConfig';

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [userType, setUserType] = useState<string | null>(null);
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();

  const handleUserType = (type: string) => {
    setUserType(type);
    setShowButton(false);
    setTimeout(() => setShowButton(true), 50);
  };

  const handleStudentLogin = async () => {
    try {
      const user = await SignInWithGoogle();
      if (user) {
        const dummyClasses = [
          {
            id: 1,
            name: 'Math 101',
            assignments: [
              { id: 1, name: 'Homework 1', content: 'Solve integrals', pdfUrl: 'path/to/math101_hw1.pdf' }
            ]
          },
          {
            id: 2,
            name: 'History 201',
            assignments: [
              { id: 2, name: 'Homework 1', content: 'Write an essay on WWII', pdfUrl: 'path/to/history201_hw1.pdf' }
            ]
          }
        ];
        await fetch("http://localhost:5000/add_student", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            student_id: user.uid,
            name: user.displayName,
            classes: [],
            report: [],
            questions: []
          })
        });
        onLogin();
        navigate('/student', { state: { classes: dummyClasses } });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleTeacherLogin = async () => {
    try {
      const user = await SignInWithGoogle();
      if (user) {
        await fetch("http://localhost:5000/add_teacher", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            teacher_id: user.uid,
            name: user.displayName,
            students: [],
            classes: []
          })
        });
        onLogin();
        navigate('/teacher');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="login-page">
      <h2>Pick your role</h2>
      <div className="role-selection">
        <div className="role-card" onClick={() => handleUserType('student')}>
          <img src="https://cdn-icons-png.flaticon.com/512/2784/2784403.png" alt="Student" />
          <p>I'm a student</p>
        </div>
        <div className="role-card" onClick={() => handleUserType('teacher')}>
          <img src="https://cdn-icons-png.flaticon.com/512/1995/1995574.png" alt="Teacher" />
          <p>I'm a teacher</p>
        </div>
      </div>
      {userType && (
        <div className={`login-button-container ${showButton ? 'show' : ''}`}>
          <button onClick={userType === 'student' ? handleStudentLogin : handleTeacherLogin}>
            Sign In with Google
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;