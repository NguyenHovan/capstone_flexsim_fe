import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography, Empty, Button, Skeleton, message } from "antd";
import { CertificateService } from "../../services/certificate.service";
import { DownloadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface MyCert {
  id: string;
  certificateName: string;
  createdAt: string; // ISO string
  fileUrl: string;
  courseName?: string;
  status?: "COMPLETED" | "IN_PROGRESS";
}

const MyCertificate: React.FC = () => {
  const [myCertificates, setMyCertificates] = useState<MyCert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchMyCertificates = async () => {
    try {
      setLoading(true);
      const response = await CertificateService.getMyCertificate();
      setMyCertificates(response || []);
    } catch (error: any) {
      console.log({ error });
      message.error(error?.response?.data?.message || "Lỗi tải danh sách chứng chỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCertificates();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (!myCertificates || myCertificates.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="Bạn chưa có chứng chỉ nào" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Chứng chỉ của tôi</Title>
      <Row gutter={[16, 16]}>
        {myCertificates.map((cert) => (
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
                cert.fileUrl ? (
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
                      style={{ width: "100%", height: "100%", border: 0 }}
                      frameBorder={0}
                      title={cert.certificateName}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      height: 300,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f0f2f5",
                      color: "#999",
                    }}
                  >
                    Không có bản xem trước
                  </div>
                )
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

              {cert.courseName && (
                <>
                  <Text type="secondary">Khoá học: </Text>
                  <Text>{cert.courseName}</Text>
                  <br />
                </>
              )}

              <Text type="secondary">Ngày cấp: </Text>
              <Text>{new Date(cert.createdAt).toLocaleDateString("vi-VN")}</Text>
              <br />

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                block
                style={{ marginTop: 16, borderRadius: 8 }}
                onClick={() => {
                  if (!cert.fileUrl) {
                    message.warning("Không tìm thấy tệp chứng chỉ để tải xuống");
                    return;
                  }
                  window.open(cert.fileUrl, "_blank");
                }}
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
