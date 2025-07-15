import React from "react";
import { Layout } from "antd";
import Sidebar from "./Sidebar";

const { Sider, Content } = Layout;

type Props = {
  children: React.ReactNode;
};

const ProfileLayout: React.FC<Props> = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={220} style={{ background: "#fff" }}>
        <Sidebar />
      </Sider>
      <Layout>
        <Content style={{ margin: "16px", padding: 24, background: "#fff" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProfileLayout;
