import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [termsOfServiceAgreed, setTermsOfServiceAgreed] = useState(false);
  const [privacyPolicyAgreed, setPrivacyPolicyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const result = await signup(email, password, name, phone, termsOfServiceAgreed, privacyPolicyAgreed, marketingAgreed);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '50px auto' }}>
        <h1>회원가입</h1>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>전화번호 (선택사항)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={termsOfServiceAgreed}
                  onChange={(e) => setTermsOfServiceAgreed(e.target.checked)}
                  required
                  style={{ marginRight: '8px' }}
                />
                <span>서비스 이용약관 동의 (필수)</span>
              </label>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={privacyPolicyAgreed}
                  onChange={(e) => setPrivacyPolicyAgreed(e.target.checked)}
                  required
                  style={{ marginRight: '8px' }}
                />
                <span>개인정보 처리방침 동의 (필수)</span>
              </label>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={marketingAgreed}
                  onChange={(e) => setMarketingAgreed(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <span>마케팅 정보 수신 동의 (선택)</span>
              </label>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || !termsOfServiceAgreed || !privacyPolicyAgreed} 
            style={{ width: '100%' }}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

