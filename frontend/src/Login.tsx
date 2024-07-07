import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { SignInWithGoogle } from './firebaseConfig';
import { onLog } from 'firebase/app';
import { METHODS } from 'http';

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [userType, setUserType] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUserType = (type: string) => {
    setUserType(type);
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

        const request = await fetch("http://localhost:5000/add_student", {
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
        }).then(() => {
          onLogin();
          navigate('/student', { state: { classes: dummyClasses } });
        })
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleTeacherLogin = async () => {
    try {
      const user = await SignInWithGoogle();
      if (user) {
        const request = await fetch("http://localhost:5000/add_teacher", {
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
        }).then(() => {
          onLogin();
          navigate('/teacher'); // Assuming you have a TeacherDashboard
        })
      }
    } catch (error) {
      console.error(error);
    }
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
