import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="logo">
          <Link to="/">React GPT</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><a href="#features">Features</a></li> {/* Use <a> for same-page sections */}
          <li><a href="#contact">Contact</a></li>   {/* Use <a> for same-page sections */}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
