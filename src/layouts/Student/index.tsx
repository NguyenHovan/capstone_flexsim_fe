import { Outlet } from "react-router-dom";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import FloatingDualChat from "../../components/chatbox";

const LayoutMain = () => {
  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
      <FloatingDualChat />
    </div>
  );
};

export default LayoutMain;
