
import React, { useState } from 'react';
import {
  Card,
  Radio,
  InputNumber,
  Button,
  Row,
  Col,
  Typography,
} from 'antd';
import './OrganizationOrder.css';

const { Title, Text, Paragraph } = Typography;

interface PackageType {
  id: string;
  packageName: string;
  description: string;
  price: number;
}

// Dữ liệu MOCK
const MOCK_PACKAGES: PackageType[] = [
  {
    id: 'basic',
    packageName: 'Basic',
    description: '2 Workspaces, 10 Courses, Standard Support',
    price: 8,
  },
  {
    id: 'standard',
    packageName: 'Standard',
    description: '6 Workspaces, 30 Courses, Advanced Analytics',
    price: 12,
  },
  {
    id: 'premium',
    packageName: 'Premium',
    description: 'Unlimited Workspaces, Unlimited Courses, Priority Support',
    price: 20,
  },
];

export default function OrganizationOrder() {
  // state giữ mock data
  const [packages] = useState<PackageType[]>(MOCK_PACKAGES);
  const [selectedId, setSelectedId] = useState<string>(MOCK_PACKAGES[0].id);
  const [quantity, setQuantity] = useState<number>(1);

  const selectedPkg = packages.find(p => p.id === selectedId)!;
  const total = selectedPkg.price * quantity;

  const onProceed = () => {
    // hiển thị alert tạm
    alert(
      `Proceeding to payment:\n
       Package: ${selectedPkg.packageName}\n
       Unit Price: $${selectedPkg.price}\n
       Quantity: ${quantity}\n
       TOTAL: $${total}`
    );
    // TODO: khi có API, replace bằng gọi `api.post(...)`
  };

  return (
    <div className="order-container">
      <Title level={3}>Upgrade Subscription</Title>
      <Row gutter={24}>
        {/* left: chọn gói */}
        <Col xs={24} lg={14}>
          <Card className="order-card">
            <Title level={5}>Choose a Package</Title>
            <Radio.Group
              onChange={e => setSelectedId(e.target.value)}
              value={selectedId}
              className="package-radio-group"
            >
              <Row gutter={[16, 16]}>
                {packages.map(pkg => (
                  <Col xs={24} sm={12} key={pkg.id}>
                    <Radio.Button
                      value={pkg.id}
                      className={`package-card ${
                        selectedId === pkg.id ? 'selected' : ''
                      }`}
                    >
                      <Title level={5}>{pkg.packageName}</Title>
                      <Paragraph ellipsis={{ rows: 2 }}>
                        {pkg.description}
                      </Paragraph>
                      <Text strong className="pkg-price">
                        ${pkg.price.toFixed(2)}
                      </Text>
                    </Radio.Button>
                  </Col>
                ))}
              </Row>
            </Radio.Group>

            <div className="qty-input">
              <Text>Quantity:</Text>
              <InputNumber
                min={1}
                value={quantity}
                onChange={val => setQuantity(val || 1)}
                className="qty-number"
              />
            </div>
          </Card>
        </Col>

        {/* right: tóm tắt đơn hàng */}
        <Col xs={24} lg={10}>
          <Card className="summary-card">
            <Title level={5}>Order Summary</Title>
            <div className="sum-row">
              <Text>Package:</Text>
              <Text strong>{selectedPkg.packageName}</Text>
            </div>
            <div className="sum-row">
              <Text>Unit Price:</Text>
              <Text>${selectedPkg.price.toFixed(2)}</Text>
            </div>
            <div className="sum-row">
              <Text>Quantity:</Text>
              <Text>{quantity}</Text>
            </div>
            <div className="sum-row total">
              <Text>Total:</Text>
              <Text strong>${total.toFixed(2)}</Text>
            </div>

            <Button
              type="primary"
              block
              size="large"
              onClick={onProceed}
            >
              Proceed to Payment
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
