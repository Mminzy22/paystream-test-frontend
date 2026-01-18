import axios from 'axios';

// API Gateway를 통한 접근
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 시 로그아웃
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authService = {
  signup: (email, password, name, phone, termsOfServiceAgreed, privacyPolicyAgreed, marketingAgreed) => {
    return apiClient.post('/users/signup', {
      email,
      password,
      name,
      phone,
      termsOfServiceAgreed,
      privacyPolicyAgreed,
      marketingAgreed: marketingAgreed || false,
    });
  },

  login: (email, password) => {
    return apiClient.post('/users/login', {
      email,
      password,
    });
  },

  logout: (refreshToken) => {
    return apiClient.post('/users/logout', {
      refreshToken,
    });
  },
};

// 결제 관련 API
export const paymentService = {
  // 헬스체크
  ping: () => {
    return apiClient.get('/payments/ping');
  },

  // 포트원 설정 정보 조회
  getConfig: () => {
    return apiClient.get('/payments/config');
  },

  // 결제 요청 생성
  // 구매자 정보(buyerName, buyerEmail, buyerTel)는 백엔드에서 UserServiceClient로 자동 조회하여 설정됨
  createPayment: (merchantUid, amount, name, orderId) => {
    return apiClient.post('/payments/request', {
      merchantUid,
      amount,
      name,
      orderId,
      // buyerName, buyerEmail, buyerTel은 전달하지 않음 (백엔드에서 자동 설정)
    });
  },

  // 결제 승인
  confirmPayment: (impUid, merchantUid) => {
    return apiClient.post('/payments/confirm', {
      impUid,
      merchantUid,
    });
  },

  // 결제 목록 조회 (사용자별, 페이지네이션)
  getPayments: (page = 1, size = 20) => {
    return apiClient.get('/payments', {
      params: { page, size },
    });
  },

  // 결제 조회 (내부 ID로)
  getPayment: (id) => {
    return apiClient.get(`/payments/${id}`);
  },

  // 결제 조회 (포트원 ID로)
  getPaymentByImpUid: (impUid) => {
    return apiClient.get(`/payments/imp/${impUid}`);
  },

  // 결제 조회 (주문 ID로)
  getPaymentsByOrderId: (orderId) => {
    return apiClient.get(`/payments/order/${orderId}`);
  },

  // 결제 취소
  cancelPayment: (impUid, reason) => {
    return apiClient.post(`/payments/cancel/${impUid}`, null, {
      params: { reason },
    });
  },
};

export default apiClient;

