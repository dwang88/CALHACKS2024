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
          <li><Link to="/features">Placeholder 2</Link></li>
          <li><Link to="/login">Login</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
