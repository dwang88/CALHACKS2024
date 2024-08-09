import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';
import './Features.css'; 

const Hero: React.FC = () => {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="text-content">
            <h1>Transform your classroom experience.</h1>
            <p>
              AI for Students. Insights for Educators. Create a better classroom with ease, speed, and beauty.
            </p>
            <Link to="/login">
              <button className="btn-primary">Get Started →</button>
            </Link>
          </div>
          <div className="image-content">
            <img src="https://cdn-icons-png.flaticon.com/512/404/404672.png" alt="Mobile app preview" />
          </div>
        </div>
      </section>
    </>
  );
}

export default Hero;
