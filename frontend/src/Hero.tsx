import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="container">
        <h1>Personalized Learning for Students, Insightful Teaching for Educators</h1>
        <div>
          <Link to="/login">
            <button className="btn-primary">Get Started</button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
