// Navbar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from './contexts/authContext';
import { doSignOut } from './firebase/firebaseConfig';

const Navbar: React.FC = () => {
  const { currentUser, signedIn, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleSignOut = () => {
    doSignOut();
    navigate("/");
  }

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
          {!signedIn && (
            <li><Link to="/login">Login</Link></li>
          )}
          {signedIn && (
            <li className="user-info">
              <span>{currentUser?.displayName || 'No User'}</span>
              <button onClick={handleSignOut}>Log Out</button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;