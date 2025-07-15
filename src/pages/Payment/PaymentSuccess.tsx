import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#f0f2f5'
    }}>
      <Result
        status="success"
        title="Payment Successful"
        subTitle={`Your order #${orderId} has been successfully processed.`}
        extra={[
          <Button type="primary" key="view" onClick={() => navigate('/organization/orders')}>
            View Order History
          </Button>,
          <Button key="home" onClick={() => navigate('/organization')}>
            Back to Home
          </Button>,
        ]}
      />
    </div>
  );
};

export default PaymentSuccess;
