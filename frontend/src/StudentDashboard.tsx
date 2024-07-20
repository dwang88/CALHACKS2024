import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Class } from './types';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setClasses([
      {
        id: 1,
        name: 'Math 101',
        assignments: [
          { id: 1, name: 'Homework 1', content: 'Solve integrals', pdfUrl: '/pdfs/math101_hw2.pdf' },
          { id: 2, name: 'Homework 2', content: 'Solve differentials', pdfUrl: '/pdfs/math101_hw2.pdf' }
        ]
      },
      {
        id: 2,
        name: 'History 201',
        assignments: [
          { id: 1, name: 'Homework 1', content: 'Write an essay on WWII', pdfUrl: '/pdfs/math101_hw2.pdf' },
          { id: 2, name: 'Homework 2', content: 'Explain the causes of the Great Depression', pdfUrl: '/pdfs/math101_hw2.pdf' }
        ]
      }
    ]);
  }, []);

  const handleClassSelect = (classId: number) => {
    navigate(`/assignments/${classId}`);
  };

  return (
    <div className="student-dashboard">
      <h2>Select a Class</h2>
      <div className="class-grid">
        {classes.map(cls => (
          <div key={cls.id} className="class-card" onClick={() => handleClassSelect(cls.id)}>
            <h3>{cls.name}</h3>
            <p>{cls.assignments.length} assignments</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;