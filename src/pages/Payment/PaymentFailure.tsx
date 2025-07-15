import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

const PaymentFailure: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#fff1f0'
    }}>
      <Result
        status="error"
        title="Payment Failed"
        subTitle={`Unfortunately, the payment for order #${orderId} could not be completed.`}
        extra={[
          <Button type="primary" key="retry" onClick={() => navigate(`/organization/order/${orderId}/retry`)}>
            Retry Payment
          </Button>,
          <Button key="support" onClick={() => navigate('/organization/support')}>
            Contact Support
          </Button>,
        ]}
      />
    </div>
  );
};

export default PaymentFailure;
