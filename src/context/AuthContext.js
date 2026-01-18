import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 토큰이 있으면 사용자 정보 확인
    if (token) {
      // 토큰이 있으면 로그인 상태로 간주
      setUser({ token });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      // BaseResponse 구조: { code, status, message, data: TokenResponse }
      // axios는 response.data에 BaseResponse를 넣어줌
      // 따라서 response.data.data에 TokenResponse가 있음
      const tokenData = response.data?.data;
      
      if (!tokenData) {
        console.error('Token data not found in response:', response);
        return { 
          success: false, 
          error: '토큰 데이터를 받아오지 못했습니다.' 
        };
      }
      
      const { accessToken, refreshToken } = tokenData;
      
      if (!accessToken || !refreshToken) {
        console.error('Tokens not found in tokenData:', tokenData);
        return { 
          success: false, 
          error: '토큰을 받아오지 못했습니다.' 
        };
      }
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      setToken(accessToken);
      setUser({ token: accessToken });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || '로그인에 실패했습니다.' 
      };
    }
  };

  const signup = async (email, password, name, phone, termsOfServiceAgreed, privacyPolicyAgreed, marketingAgreed) => {
    try {
      await authService.signup(email, password, name, phone, termsOfServiceAgreed, privacyPolicyAgreed, marketingAgreed);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || '회원가입에 실패했습니다.' 
      };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

