import React from 'react';
import './Features.css';

const Features: React.FC = () => {
  return (
    <div id="features">
    <section className="features" id="features">
      <div className="container">
        <div className="feature-list">
          <div className="feature">
            <h3>Personalized Help.</h3>
            <p>Get homework help, but step by step instructions and hints.</p>
          </div>
          <div className="feature">
            <h3>Tailored Reports.</h3>
            <p>Help teachers teach, by giving them detailed reports using AI.</p>
          </div>
          <div className="feature">
            <h3>Analyze Quicker.</h3>
            <p>Access detailed feedback on your classes based on student questions.</p>
          </div>
        </div>
      </div>
    </section>
    
    </div>
  );
}

export default Features;
