import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography, Empty, Button } from "antd";
import { CertificateService } from "../../services/certificate.service";
import { DownloadOutlined } from "@ant-design/icons";

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
        {myCertificates?.map((cert: any) => (
          <Col xs={24} sm={12} md={8} key={cert.id}>
            <Card
              hoverable
              style={{
                borderRadius: 16,
                overflow: "hidden",
                minHeight: 240,
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
              }}
              cover={
                <div
                  style={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f0f2f5",
                  }}
                >
                  <iframe
                    src={cert.fileUrl}
                    style={{ width: "100%", height: "100%", border: "0" }}
                    frameBorder="0"
                  ></iframe>
                </div>
              }
            >
              <div
                style={{
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Title level={5} style={{ margin: 0 }}>
                  {cert.certificateName}
                </Title>
              </div>

              <Text type="secondary">Ngày cấp: </Text>
              <Text>{new Date(cert.createdAt).toLocaleDateString()}</Text>
              <br />

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                block
                style={{ marginTop: 16, borderRadius: 8 }}
                onClick={() => window.open(cert.fileUrl, "_blank")}
              >
                Tải chứng chỉ
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MyCertificate;
