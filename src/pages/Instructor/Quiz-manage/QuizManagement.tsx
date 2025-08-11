import { useEffect, useState } from "react";
import { Table, Button, Card, Space, Popconfirm } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CreateQuizForm from "./CreateQuizForm";
import { QuizService } from "../../../services/quiz.service";

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await QuizService.getAllQuizzes();
      setQuizzes(res);
    } catch (err) {
      console.error("Fetch quiz failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const columns = [
    {
      title: "Tên Quiz",
      dataIndex: "quizName",
      key: "quizName",
    },
    {
      title: "Bài học",
      dataIndex: "lessonName",
      key: "lessonName",
      render: (text) => text || "Không có",
    },
    {
      title: "Tổng điểm",
      dataIndex: "totalScore",
      key: "totalScore",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Popconfirm title="Bạn chắc chắn muốn xóa?">
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Quản lý Quiz"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Đóng" : "Thêm Quiz"}
        </Button>
      }
    >
      {showForm && (
        <CreateQuizForm
          onCreated={() => {
            setShowForm(false);
            fetchQuizzes();
          }}
        />
      )}

      <Table
        dataSource={quizzes}
        columns={columns}
        rowKey="id"
        loading={loading}
        style={{ marginTop: 24 }}
      />
    </Card>
  );
};

export default QuizManagement;
