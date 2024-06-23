import React from 'react';
import './Features.css';

const Features: React.FC = () => {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="feature-list">
          <div className="feature">
            <h3>Personalized Help.</h3>
            <p>Get homework help, but without getting the answers.</p>
          </div>
          <div className="feature">
            <h3>Tailored Reports.</h3>
            <p>Help teachers teach, by giving them detailed reports.</p>
          </div>
          <div className="feature">
            <h3>Teacher Dashboard.</h3>
            <p>Access detailed feedback based on AI responses.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;
