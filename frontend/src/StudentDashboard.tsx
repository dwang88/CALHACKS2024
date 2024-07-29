import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import './StudentDashboard.css';

type Class = {
  _id: string;
  class_id: string;
  name: string;
  students: string[];
  class_report: string;
  Teacher: string;
};

type Student = {
  _id: string;
  student_id: string;
  name: string;
  classes: string[];
  report: string[];
  questions: string[];
};

const StudentDashboard = () => {
  const [studentClasses, setStudentClasses] = useState<Class[]>([]);
  const [classIdToAdd, setClassIdToAdd] = useState('');
  const [studentId, setStudentId] = useState<string | null>(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setStudentId(user.uid);
      } else {
        // User is signed out, redirect to login
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  useEffect(() => {
    if (studentId) {
      fetchStudentClasses();
    }
  }, [studentId]);

  const fetchStudentClasses = async () => {
    if (!studentId) return;

    try {
      const studentResponse = await fetch(`http://127.0.0.1:5000/get_student/${studentId}/`);
      if (!studentResponse.ok) {
        throw new Error('Failed to fetch student information');
      }
      const studentData: { Student: Student } = await studentResponse.json();

      const classPromises = studentData.Student.classes.map(classId =>
        fetch(`http://127.0.0.1:5000/get_class/${classId}/`).then(res => res.json())
      );
      const classesData = await Promise.all(classPromises);

      setStudentClasses(classesData.map(data => data.Class));
    } catch (error) {
      console.error('Error fetching student classes:', error);
      alert('Failed to fetch classes. Please try again.');
    }
  };

  const handleClassSelect = (classId: string) => {
    navigate(`/assignments/${classId}`);
  };

  const handleAddClass = async () => {
    if (!classIdToAdd || !studentId) {
      alert('Please enter a class ID');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/enroll_student/${classIdToAdd}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student_id: studentId })
      });

      if (!response.ok) {
        throw new Error('Failed to enroll in class');
      }

      await fetchStudentClasses();
      setClassIdToAdd('');
      alert('Successfully enrolled in class');
    } catch (error) {
      console.error('Error enrolling in class:', error);
      alert('Failed to enroll in class. Please try again.');
    }
  };

  if (!studentId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="student-dashboard">
      <h2>Select a Class</h2>
      <div className="add-class-form">
        <input
          type="text"
          value={classIdToAdd}
          onChange={(e) => setClassIdToAdd(e.target.value)}
          placeholder="Enter Class ID"
        />
        <button onClick={handleAddClass}>Enroll in Class</button>
      </div>
      <div className="class-grid">
        {studentClasses.map(cls => (
          <div key={cls._id} className="class-card" onClick={() => handleClassSelect(cls.class_id)}>
            <h3>{cls.name}</h3>
            <p>{cls.students.length} students</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;