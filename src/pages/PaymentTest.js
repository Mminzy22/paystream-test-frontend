import React, { useState } from 'react';
import { paymentService } from '../services/api';

const PaymentTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 입력 필드 상태
  const [paymentId, setPaymentId] = useState('');
  const [impUid, setImpUid] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderIdForPayment, setOrderIdForPayment] = useState('');
  const [merchantUid, setMerchantUid] = useState('');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [cancelReason, setCancelReason] = useState('고객 요청');
  const [page, setPage] = useState('1');
  const [size, setSize] = useState('20');

  const handleApiCall = async (apiCall, description) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await apiCall();
      setResult({
        description,
        status: response.status,
        data: response.data,
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'API 호출 실패');
      setResult({
        description,
        error: err.response?.data || err.message,
        status: err.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>결제 API 테스트</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Payment Service의 모든 API를 테스트할 수 있습니다.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* 왼쪽: API 호출 버튼들 */}
        <div>
          <h2>API 테스트</h2>

          {/* 헬스체크 */}
          <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px' }}>1. 헬스체크</h3>
            <button
              onClick={() => handleApiCall(() => paymentService.ping(), '헬스체크')}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              GET /payments/ping
            </button>
          </div>

          {/* 포트원 설정 조회 */}
          <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px' }}>2. 포트원 설정 조회</h3>
            <button
              onClick={() => handleApiCall(() => paymentService.getConfig(), '포트원 설정 조회')}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              GET /payments/config
            </button>
          </div>

          {/* 결제 목록 조회 */}
          <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px' }}>3. 결제 목록 조회 (사용자별)</h3>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Page:</label>
              <input
                type="number"
                value={page}
                onChange={(e) => setPage(e.target.value)}
                style={{ width: '100px', padding: '5px', marginRight: '10px' }}
              />
              <label style={{ display: 'inline-block', marginRight: '10px' }}>Size:</label>
              <input
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                style={{ width: '100px', padding: '5px' }}
              />
            </div>
            <button
              onClick={() => handleApiCall(
                () => paymentService.getPayments(parseInt(page), parseInt(size)),
                `결제 목록 조회 (page=${page}, size=${size})`
              )}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              GET /payments?page={page}&size={size}
            </button>
          </div>

          {/* 결제 조회 (ID) */}
          <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px' }}>4. 결제 조회 (내부 ID)</h3>
            <input
              type="number"
              placeholder="Payment ID"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              style={{ width: '200px', padding: '5px', marginRight: '10px' }}
            />
            <button
              onClick={() => handleApiCall(
                () => paymentService.getPayment(paymentId),
                `결제 조회 (ID: ${paymentId})`
              )}
              disabled={loading || !paymentId}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || !paymentId ? 'not-allowed' : 'pointer',
              }}
            >
              GET /payments/{paymentId}
            </button>
          </div>

          {/* 결제 조회 (포트원 ID) */}
          <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px' }}>5. 결제 조회 (포트원 ID)</h3>
            <input
              type="text"
              placeholder="imp_uid (예: imp_1234567890)"
              value={impUid}
              onChange={(e) => setImpUid(e.target.value)}
              style={{ width: '200px', padding: '5px', marginRight: '10px' }}
            />
            <button
              onClick={() => handleApiCall(
                () => paymentService.getPaymentByImpUid(impUid),
                `결제 조회 (포트원 ID: ${impUid})`
              )}
              disabled={loading || !impUid}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || !impUid ? 'not-allowed' : 'pointer',
              }}
            >
              GET /payments/imp/{impUid}
            </button>
          </div>

          {/* 결제 조회 (주문 ID) */}
          <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px' }}>6. 결제 조회 (주문 ID)</h3>
            <input
              type="number"
              placeholder="Order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={{ width: '200px', padding: '5px', marginRight: '10px' }}
            />
            <button
              onClick={() => handleApiCall(
                () => paymentService.getPaymentsByOrderId(orderId),
                `결제 조회 (주문 ID: ${orderId})`
              )}
              disabled={loading || !orderId}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || !orderId ? 'not-allowed' : 'pointer',
              }}
            >
              GET /payments/order/{orderId}
            </button>
          </div>

          {/* 결제 요청 생성 */}
          <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px' }}>7. 결제 요청 생성</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Merchant UID"
                value={merchantUid}
                onChange={(e) => setMerchantUid(e.target.value)}
                style={{ width: '100%', padding: '5px', marginBottom: '5px' }}
              />
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', padding: '5px', marginBottom: '5px' }}
              />
              <input
                type="text"
                placeholder="상품명"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '5px', marginBottom: '5px' }}
              />
              <input
                type="number"
                placeholder="Order ID (선택)"
                value={orderIdForPayment}
                onChange={(e) => setOrderIdForPayment(e.target.value)}
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <button
              onClick={() => handleApiCall(
                () => paymentService.createPayment(merchantUid, parseInt(amount), name, orderIdForPayment ? parseInt(orderIdForPayment) : undefined),
                `결제 요청 생성`
              )}
              disabled={loading || !merchantUid || !amount || !name}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || !merchantUid || !amount || !name ? 'not-allowed' : 'pointer',
              }}
            >
              POST /payments/request
            </button>
          </div>

          {/* 결제 승인 */}
          <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px' }}>8. 결제 승인</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="imp_uid"
                value={impUid}
                onChange={(e) => setImpUid(e.target.value)}
                style={{ width: '100%', padding: '5px', marginBottom: '5px' }}
              />
              <input
                type="text"
                placeholder="merchant_uid"
                value={merchantUid}
                onChange={(e) => setMerchantUid(e.target.value)}
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <button
              onClick={() => handleApiCall(
                () => paymentService.confirmPayment(impUid, merchantUid),
                `결제 승인`
              )}
              disabled={loading || !impUid || !merchantUid}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || !impUid || !merchantUid ? 'not-allowed' : 'pointer',
              }}
            >
              POST /payments/confirm
            </button>
          </div>

          {/* 결제 취소 */}
          <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px' }}>9. 결제 취소</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="imp_uid"
                value={impUid}
                onChange={(e) => setImpUid(e.target.value)}
                style={{ width: '100%', padding: '5px', marginBottom: '5px' }}
              />
              <input
                type="text"
                placeholder="취소 사유"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <button
              onClick={() => handleApiCall(
                () => paymentService.cancelPayment(impUid, cancelReason),
                `결제 취소`
              )}
              disabled={loading || !impUid}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || !impUid ? 'not-allowed' : 'pointer',
              }}
            >
              POST /payments/cancel/{impUid}
            </button>
          </div>
        </div>

        {/* 오른쪽: 결과 표시 */}
        <div>
          <h2>결과</h2>
          {loading && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#007bff' }}>
              로딩 중...
            </div>
          )}
          {error && (
            <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '5px', marginBottom: '15px' }}>
              <strong>에러:</strong> {error}
            </div>
          )}
          {result && (
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <h3 style={{ marginTop: 0 }}>{result.description}</h3>
              {result.status && (
                <p><strong>Status:</strong> {result.status}</p>
              )}
              <div style={{ marginTop: '15px' }}>
                <strong>Response:</strong>
                <pre style={{
                  backgroundColor: '#fff',
                  padding: '15px',
                  borderRadius: '5px',
                  overflow: 'auto',
                  maxHeight: '600px',
                  fontSize: '12px',
                  border: '1px solid #ddd',
                }}>
                  {formatJson(result.data || result.error)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentTest;

