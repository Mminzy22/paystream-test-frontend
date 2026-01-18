import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/api';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPayments();
      setPayments(response.data.data || []);
      setError('');
    } catch (err) {
      setError('결제 목록을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayment = async (impUid, merchantUid) => {
    if (!window.confirm('정말로 이 결제를 취소하시겠습니까?')) {
      return;
    }

    const reason = window.prompt('취소 사유를 입력해주세요:', '고객 요청');
    if (reason === null) {
      return; // 사용자가 취소한 경우
    }

    setCancellingId(impUid);
    try {
      await paymentService.cancelPayment(impUid, reason);
      alert('결제가 취소되었습니다.');
      loadPayments(); // 목록 새로고침
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || '결제 취소에 실패했습니다.';
      alert(`결제 취소 실패: ${errorMessage}`);
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PAID: { text: '결제완료', color: '#28a745' },
      READY: { text: '대기중', color: '#ffc107' },
      CANCELLED: { text: '취소됨', color: '#dc3545' },
      FAILED: { text: '실패', color: '#dc3545' },
    };
    const statusInfo = statusMap[status] || { text: status, color: '#6c757d' };
    return (
      <span style={{ 
        padding: '4px 8px', 
        borderRadius: '4px', 
        backgroundColor: statusInfo.color, 
        color: 'white',
        fontSize: '12px'
      }}>
        {statusInfo.text}
      </span>
    );
  };

  if (loading) {
    return <div className="container">로딩 중...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>결제 목록</h1>
        <button onClick={loadPayments} className="btn btn-secondary">
          새로고침
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {payments.length === 0 ? (
        <div className="card">
          <p>결제 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>주문번호</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>주문 ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>상품명</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>금액</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>상태</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>생성일</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.paymentId || payment.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{payment.merchantUid}</td>
                  <td style={{ padding: '12px' }}>{payment.orderId || '-'}</td>
                  <td style={{ padding: '12px' }}>{payment.name}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{formatAmount(payment.amount)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{getStatusBadge(payment.status)}</td>
                  <td style={{ padding: '12px' }}>{formatDate(payment.createdAt)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {payment.status === 'PAID' && payment.paymentId && (
                      <button
                        onClick={() => handleCancelPayment(payment.paymentId, payment.merchantUid)}
                        disabled={cancellingId === payment.paymentId}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: cancellingId === payment.paymentId ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          opacity: cancellingId === payment.paymentId ? 0.6 : 1,
                        }}
                      >
                        {cancellingId === payment.paymentId ? '취소 중...' : '결제 취소'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentList;

