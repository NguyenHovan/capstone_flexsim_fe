import { useEffect, useState } from "react";
import { Table, Button, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CreateLessonForm from "./CreateLessonForm";
import { LessonService } from "../../../services/lesson.service";

const LessonManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await LessonService.getAllLessons();
      setLessons(res);
    } catch (err) {
      console.error("Error fetching lessons", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const columns = [
    {
      title: "Tên bài học",
      dataIndex: "lessonName",
      key: "lessonName",
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (value) => (value === 1 ? "Hoạt động" : "Ẩn"),
    },
  ];

  return (
    <Card
      title="Quản lý Bài học"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Đóng" : "Thêm bài học"}
        </Button>
      }
    >
      {showForm && (
        <CreateLessonForm
          onCreated={() => {
            setShowForm(false);
            fetchLessons();
          }}
        />
      )}

      <Table
        dataSource={lessons}
        columns={columns}
        rowKey="id"
        loading={loading}
        style={{ marginTop: 24 }}
      />
    </Card>
  );
};

export default LessonManagement;
