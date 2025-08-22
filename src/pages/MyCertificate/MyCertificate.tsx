import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tag, Typography, Empty, Button } from "antd";
import { CertificateService } from "../../services/certificate.service";

const { Title, Text } = Typography;

interface Certificate {
  id: string;
  name: string;
  courseName: string;
  issuedDate: string;
  status: "COMPLETED" | "IN_PROGRESS";
}

const MyCertificate: React.FC = () => {
  const [myCertificates, setMyCertificates] = useState<Certificate[]>([]);
  const fetchMyCertificates = async () => {
    try {
      const response = await CertificateService.getMyCertificate();
      setMyCertificates(response);
    } catch (error) {
      console.log({ error });
    }
  };
  useEffect(() => {
    fetchMyCertificates();
  }, []);
  if (!myCertificates || myCertificates.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="Bạn chưa có chứng chỉ nào" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>My Certificates</Title>
      <Row gutter={[16, 16]}>
        {myCertificates?.map((cert) => (
          <Col xs={24} sm={12} md={8} key={cert.id}>
            <Card
              title={cert.name}
              bordered
              style={{ borderRadius: 12, minHeight: 180 }}
              extra={
                <Tag color={cert.status === "COMPLETED" ? "green" : "orange"}>
                  {cert.status === "COMPLETED" ? "Hoàn thành" : "Đang học"}
                </Tag>
              }
            >
              <Text strong>Khóa học: </Text>
              <Text>{cert.courseName}</Text>
              <br />
              <Text strong>Ngày cấp: </Text>
              <Text>{new Date(cert.issuedDate).toLocaleDateString()}</Text>
              <br />
              {cert.status === "COMPLETED" && (
                <Button
                  type="primary"
                  style={{ marginTop: 12 }}
                  onClick={() => alert(`Download chứng chỉ: ${cert.name}`)}
                >
                  Tải về
                </Button>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MyCertificate;
