import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Result, Spin } from "antd";
import { ArrowLeftOutlined, ExportOutlined } from "@ant-design/icons";

const FLEXSIM_URL =
  "https://logisimeduprojectbe-byejdhh9gqcsd5a0.southeastasia-01.azurewebsites.net/flexsim-ui/#";

export default function FlexsimWeb() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Heuristic: nếu 3s không onLoad => có thể bị chặn nhúng (X-Frame-Options)
  useEffect(() => {
    timerRef.current = window.setTimeout(() => {
      if (loading) setBlocked(true);
    }, 3000);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [loading]);

  const handleBack = () => {
    // Nếu có lịch sử trước đó thì quay lại, không thì về trang chủ
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#0b1220" }}>
      {/* Thanh top với nút Quay về + nút mở trực tiếp */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          background: "rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          position: "sticky",
          top: 0,
          zIndex: 5,
        }}
      >
        <Button onClick={handleBack} icon={<ArrowLeftOutlined />} type="default">
          Quay về LOGISIM EDU
        </Button>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Button
            icon={<ExportOutlined />}
            onClick={() => window.open(FLEXSIM_URL, "_blank", "noopener,noreferrer")}
          >
            Mở FlexSim Web (tab mới)
          </Button>
          <Button
            type="primary"
            onClick={() => (window.location.href = FLEXSIM_URL)}
            title="Mở trực tiếp trong cùng tab"
          >
            Mở trực tiếp
          </Button>
        </div>
      </div>

      {/* Vùng nội dung */}
      <div style={{ flex: 1, position: "relative" }}>
        {blocked ? (
          <div style={{ padding: 24 }}>
            <Result
              status="info"
              title="Không thể nhúng FlexSim Web vào trang (có thể do cấu hình bảo mật)."
              subTitle="Bạn vẫn có thể mở trực tiếp FlexSim Web bằng các nút phía trên."
            />
          </div>
        ) : (
          <>
            {loading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <Spin size="large" tip="Đang tải FlexSim Web..." />
              </div>
            )}
            <iframe
              title="FlexSim Web"
              src={FLEXSIM_URL}
              style={{ width: "100%", height: "calc(100vh - 56px)", border: "none" }}
              onLoad={() => {
                setLoading(false);
                if (timerRef.current) window.clearTimeout(timerRef.current);
              }}
              allow="clipboard-read; clipboard-write; fullscreen"
              loading="eager"
            />
          </>
        )}
      </div>
    </div>
  );
}
