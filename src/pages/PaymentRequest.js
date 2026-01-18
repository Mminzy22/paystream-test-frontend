import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortOne from '@portone/browser-sdk/v2';
import { paymentService } from '../services/api';

const PaymentRequest = () => {
  const [storeId, setStoreId] = useState('');
  const [channelKey, setChannelKey] = useState('');
  const [merchantUid, setMerchantUid] = useState('');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [orderId, setOrderId] = useState('');
  const [buyerInfo, setBuyerInfo] = useState(null); // 백엔드에서 받아온 구매자 정보
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadConfig();
    generateMerchantUid();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await paymentService.getConfig();
      const configData = response.data.data;
      setStoreId(configData.storeId);
      // 백엔드에서 Channel Key도 함께 받아옴
      if (configData.channelKey) {
        setChannelKey(configData.channelKey);
      }
    } catch (err) {
      console.error('Config load error:', err);
    }
  };

  const generateMerchantUid = () => {
    // 포트원 paymentId는 URL 경로에 사용되므로 간단한 형식 사용
    // UUID v4 형식 사용 (하이픈 포함)
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    setMerchantUid(uuid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 1. 서버에 결제 요청 생성 (구매자 정보는 백엔드에서 자동으로 설정됨)
      const createResponse = await paymentService.createPayment(
        merchantUid,
        parseInt(amount),
        name,
        orderId ? parseInt(orderId) : undefined
        // buyerName, buyerEmail, buyerTel은 전달하지 않음 (백엔드에서 UserServiceClient로 자동 조회)
      );

      // 백엔드에서 설정한 구매자 정보 가져오기
      const paymentData = createResponse.data.data;
      setBuyerInfo({
        name: paymentData.buyerName,
        email: paymentData.buyerEmail,
        tel: paymentData.buyerTel,
      });

      if (!storeId) {
        throw new Error('Store ID가 설정되지 않았습니다.');
      }

      if (!channelKey) {
        throw new Error('Channel Key를 입력해주세요.');
      }

      // 2. 포트원 결제창 호출 (V2 API)
      // 결제수단은 카드로 고정
      // 구매자 정보는 백엔드에서 설정한 정보 사용
      const payment = await PortOne.requestPayment({
        storeId: storeId,
        channelKey: channelKey,
        paymentId: merchantUid, // 가맹점 주문 번호
        orderName: name,
        totalAmount: parseInt(amount),
        currency: 'KRW',
        payMethod: 'CARD', // V2 API에서는 payMethod (단수) 필수
        customer: {
          fullName: paymentData.buyerName || undefined,
          email: paymentData.buyerEmail || undefined,
          phoneNumber: paymentData.buyerTel || undefined,
        },
        // customData는 추가 메타데이터가 필요한 경우에만 사용
        // paymentId로 이미 merchantUid를 전달하므로 중복 제거
      });

      // 디버깅: 포트원 응답 구조 확인
      console.log('PortOne payment response:', payment);

      // 4. 결제 오류 처리
      if (payment.code !== undefined) {
        setError(`결제 실패: ${payment.message}${payment.pgCode ? ` (PG 코드: ${payment.pgCode})` : ''}`);
        setLoading(false);
        return;
      }

      // 5. 결제 성공 시 서버에 승인 요청
      // 포트원 브라우저 SDK V2 응답에서 실제 결제 ID 확인
      // - payment.id: 포트원이 생성한 실제 결제 건 ID (GET /payments/{paymentId}에 사용)
      // - payment.paymentId: 요청 시 전달한 paymentId (merchantUid와 동일)
      // - payment.txId: 결제 시도 ID (transactionId)
      // 
      // 우선순위: payment.id > payment.paymentId > merchantUid
      const paymentId = payment.id || payment.paymentId || merchantUid;
      
      if (!paymentId) {
        console.error('포트원 결제 ID를 찾을 수 없습니다. payment 객체:', payment);
        setError('결제 ID를 찾을 수 없습니다. 관리자에게 문의하세요.');
        setLoading(false);
        return;
      }

      console.log('포트원 결제 응답 전체:', JSON.stringify(payment, null, 2));
      console.log('포트원 결제 ID (id):', payment.id);
      console.log('포트원 결제 ID (paymentId):', payment.paymentId);
      console.log('포트원 결제 ID (최종 사용):', paymentId);
      console.log('포트원 거래 ID (txId/transactionId):', payment.txId);
      console.log('주문 번호 (merchantUid):', merchantUid);
      const confirmResponse = await paymentService.confirmPayment(paymentId, merchantUid);
      setSuccess('결제가 완료되었습니다!');
      setTimeout(() => {
        navigate('/payments');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || err.message || '결제 요청에 실패했습니다.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '600px', margin: '50px auto' }}>
        <h1>결제 요청</h1>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit} className="card">
          {!channelKey && (
            <div className="alert alert-info" style={{ marginBottom: '20px' }}>
              서버에서 Channel Key를 로드하는 중입니다...
            </div>
          )}
          {channelKey && (
            <div className="form-group" style={{ display: 'none' }}>
              {/* Channel Key는 백엔드에서 자동으로 제공되므로 숨김 */}
              <input type="hidden" value={channelKey} />
            </div>
          )}

          <div className="form-group">
            <label>주문 번호</label>
            <input
              type="text"
              value={merchantUid}
              onChange={(e) => setMerchantUid(e.target.value)}
              required
            />
            <button 
              type="button" 
              onClick={generateMerchantUid} 
              className="btn btn-secondary"
              style={{ marginTop: '5px' }}
            >
              새로 생성
            </button>
          </div>

          <div className="form-group">
            <label>주문 ID (선택)</label>
            <input
              type="number"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="주문 서비스의 주문 ID (선택사항)"
            />
            <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
              주문 서비스와 연동된 경우 주문 ID를 입력하세요.
            </small>
          </div>

          <div className="form-group">
            <label>상품명 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>결제 금액 (원) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              required
            />
          </div>

          {buyerInfo && (
            <div className="card" style={{ marginTop: '20px', backgroundColor: '#f8f9fa', padding: '15px' }}>
              <h4 style={{ marginTop: 0 }}>구매자 정보</h4>
              <p style={{ margin: '5px 0' }}><strong>이름:</strong> {buyerInfo.name}</p>
              <p style={{ margin: '5px 0' }}><strong>이메일:</strong> {buyerInfo.email}</p>
              <p style={{ margin: '5px 0' }}><strong>전화번호:</strong> {buyerInfo.tel || '없음'}</p>
              <small style={{ color: '#6c757d' }}>
                구매자 정보는 로그인한 사용자 정보로 자동 설정됩니다.
              </small>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading} 
            style={{ width: '100%' }}
          >
            {loading ? '결제 진행 중...' : '결제 요청'}
          </button>
        </form>

        <div className="card" style={{ marginTop: '20px', backgroundColor: '#f8f9fa' }}>
          <h3>테스트 안내</h3>
          <p><strong>KG이니시스 테스트 카드:</strong></p>
          <ul>
            <li>카드번호: 1234-5678-9012-3456 또는 4111-1111-1111-1111</li>
            <li>유효기간: 12/34</li>
            <li>CVC: 123</li>
            <li>비밀번호: 123456</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentRequest;

