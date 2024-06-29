import React from 'react';
import './TeacherDashboard.css';

const TeacherDashboard: React.FC = () => {
    const cards = [
        { id: 1, title: 'Students Enrolled', content: '32' },
        { id: 2, title: 'Most % Help Rate', content: 'Integrals' },
        { id: 3, title: 'Classes Taught', content: '3' },
        { id: 4, title: 'Average Test Score', content: '87%' },
        { id: 5, title: 'Upcoming Assignments', content: 'Physics Quiz' },
        { id: 6, title: 'Recent Feedback', content: 'Positive comments from parents' }
    ];
    

    return (
      <div>
        <h1 className='teacher'>Teacher Dashboard</h1>
        <div className="dashboard">
            <div className="card-grid">
                {cards.map(card => (
                    <div key={card.id} className="card">
                        <h3>{card.title}</h3>
                        <p>{card.content}</p>
                    </div>
                ))}
            </div>
        </div>
        </div>
    );
};

export default TeacherDashboard;