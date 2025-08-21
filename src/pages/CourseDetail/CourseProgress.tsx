import React from "react";
import { Card, Progress, Typography, Space, Tag } from "antd";

const { Text } = Typography;

interface CourseProgressProps {
  data: {
    id: string;
    courseId: string;
    accountId: string;
    progressPercent: number;
    status: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
    deleteAt: string | null;
    account: any;
    course: any;
    statusNavigation: any;
  };
}

const CourseProgress: React.FC<CourseProgressProps> = ({ data }) => {
  const getStatusTag = (status: number) => {
    switch (status) {
      case 1:
        return <Tag color="default">Not Start</Tag>;
      case 2:
        return <Tag color="processing">Processing</Tag>;
      case 3:
        return <Tag color="success">Done</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  return (
    <Card title={"Course"} style={{ width: "100%", marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Text strong>Processing:</Text>
        <Progress percent={data.progressPercent} />

        <Text strong>Status:</Text>
        {getStatusTag(data.status)}

        <Text type="secondary">
          Start date: {new Date(data.createdAt).toLocaleDateString()}
        </Text>
      </Space>
    </Card>
  );
};

export default CourseProgress;
