import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          PayStream
        </Link>
        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/payments" className="navbar-link">
                결제 목록
              </Link>
              <Link to="/payments/request" className="navbar-link">
                결제 요청
              </Link>
              <Link to="/payments/test" className="navbar-link">
                API 테스트
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                로그인
              </Link>
              <Link to="/signup" className="navbar-link">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

