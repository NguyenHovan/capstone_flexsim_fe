import { Outlet } from "react-router-dom";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import FloatingDualChat from "../../components/chatbox";

const LayoutMain = () => {
  const accessToken = localStorage.getItem("accessToken");
  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
      {accessToken && <FloatingDualChat />}
    </div>
  );
};

export default LayoutMain;
