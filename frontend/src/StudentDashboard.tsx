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
      <ul className="class-list">
        {classes.map(cls => (
          <li key={cls.id} onClick={() => handleClassSelect(cls.id)}>
            {cls.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentDashboard;
