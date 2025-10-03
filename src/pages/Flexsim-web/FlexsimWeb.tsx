import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Result, Button, Spin } from "antd";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";

const FLEXSIM_URL =
  "https://logisimeduprojectbe-byejdhh9gqcsd5a0.southeastasia-01.azurewebsites.net/flexsim-ui/#";

const HEADER_HEIGHT = 74;

export default function FlexsimWeb() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const timerRef = useRef<number | null>(null);
  const redirectedRef = useRef(false);

  // Guest -> toast rồi mới chuyển trang (đợi 1 frame để Toaster chắc chắn render)
  useEffect(() => {
    if (isLoggedIn === false && !redirectedRef.current) {
      redirectedRef.current = true;

      // 1) bắn toast vào queue
      toast.error("Vui lòng đăng nhập để truy cập");

      // 2) đợi 1 khung hình cho React commit + Toaster mount
      requestAnimationFrame(() => {
        navigate("/login", { replace: true, state: { redirectTo: "/flexsim-web" } });
      });
    }
  }, [isLoggedIn, navigate]);

  // Nếu guest -> giữ component sống trong 1 tick để toast kịp hiện
  if (isLoggedIn === false) {
    return <div style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }} />;
  }

  useEffect(() => {
    timerRef.current = window.setTimeout(() => {
      if (loading) setBlocked(true);
    }, 3000);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [loading]);

  if (blocked) {
    return (
      <div
        style={{
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#0b1220",
        }}
      >
        <Result
          status="info"
          title="Không thể nhúng FlexSim Web vào trang do cấu hình bảo mật."
          subTitle="Bạn có thể mở trực tiếp FlexSim Web hoặc quay về trang chủ."
          extra={[
            <Button key="open" type="primary" onClick={() => (window.location.href = FLEXSIM_URL)}>
              Mở trực tiếp
            </Button>,
            <Button key="home" onClick={() => navigate("/")}>
              Quay về LOGISIM EDU
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", background: "#0b1220" }}>
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
        style={{
          border: "none",
          width: "100%",
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          background: "#fff",
          display: "block",
        }}
        onLoad={() => {
          setLoading(false);
          if (timerRef.current) window.clearTimeout(timerRef.current);
        }}
        allow="clipboard-read; clipboard-write; fullscreen"
        loading="eager"
      />
    </div>
  );
}
