import { Tabs } from "antd";
import type { TabsProps } from "antd";
import {
  InfoCircleOutlined,
  AppstoreOutlined,
  UserSwitchOutlined,
  StarOutlined,
} from "@ant-design/icons";

import DetailCoures from "./DetailCoures";
import ClassManagement from "../../Class-manage/Class-manage";
import EnrollManage from "../../Manage-Enrollment-Request/EnrollManage";
import ReviewCardList from "../../../CourseDetail/ReviewCardList";

const MenuCourse = () => {
  const onChange = (key: string) => console.log(key);

  const labelStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 500,
    letterSpacing: "0.5px",
  };

  const iconStyle: React.CSSProperties = {
    fontSize: 16,
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <span style={labelStyle}>
          <InfoCircleOutlined style={iconStyle} />
          <span style={{ fontWeight: 600 }}>CHI TIẾT KHÓA HỌC</span>
        </span>
      ),
      children: <DetailCoures />,
    },
    {
      key: "2",
      label: (
        <span style={labelStyle}>
          <AppstoreOutlined style={iconStyle} />
          <span style={{ fontWeight: 600 }}>LỚP HỌC</span>
        </span>
      ),
      children: <ClassManagement />,
    },
    {
      key: "3",
      label: (
        <span style={labelStyle}>
          <UserSwitchOutlined style={iconStyle} />
          <span style={{ fontWeight: 600 }}>YÊU CẦU GHI DANH</span>
        </span>
      ),
      children: <EnrollManage />,
    },
    {
      key: "4",
      label: (
        <span style={labelStyle}>
          <StarOutlined style={iconStyle} />
          <span style={{ fontWeight: 600 }}>ĐÁNH GIÁ</span>
        </span>
      ),
      children: <ReviewCardList />,
    },
  ];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 10px 24px rgba(0,0,0,.06)",
        padding: "16px 20px",
      }}
    >
      <Tabs
        defaultActiveKey="1"
        items={items}
        onChange={onChange}
        centered
        size="large"
        animated
        tabBarStyle={{
          marginBottom: 16,
          borderBottom: "none",
        }}
        tabBarGutter={16}
      />
    </div>
  );
};

export default MenuCourse;
