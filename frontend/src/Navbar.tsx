// Navbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();

  const handleScroll = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="logo">
          <Link to="/">DashSmart</Link>
        </div>
        <ul className="nav-links">
          <li>
            {location.pathname === '/' ? (
              <a href="#features" onClick={(e) => handleScroll(e, 'features')}>Features</a>
            ) : (
              <Link to="/#features">Features</Link>
            )}
          </li>
          <li><Link to="/login">Login</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
