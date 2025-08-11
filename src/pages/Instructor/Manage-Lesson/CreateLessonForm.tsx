import { useEffect, useState } from "react";
import { Form, Input, Select, Button, Card } from "antd";
import { TopicService } from "../../../services/topic.service";
import { LessonService } from "../../../services/lesson.service";
import { toast } from "sonner";

const { Option } = Select;

const CreateLessonForm = ({ onCreated }: { onCreated: () => void }) => {
  const [topics, setTopics] = useState([]);

  const fetchTopics = async () => {
    try {
      const res = await TopicService.getAllTopics();
      setTopics(res);
    } catch (err) {
      console.error("Error fetching topics", err);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const onFinish = async (values: any) => {
    const payload = {
      ...values,
      status: 1,
    };

    try {
      await LessonService.createLesson(payload);
      toast.success("Tạo bài học thành công");
      onCreated?.();
    } catch (err) {
      console.error("Tạo bài học thất bại", err);
      toast.error("Tạo bài học thất bại");
    }
  };

  return (
    <Card title="Tạo bài học mới" style={{ marginBottom: 24 }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Chủ đề"
          name="topicId"
          rules={[{ required: true, message: "Chọn chủ đề" }]}
        >
          <Select placeholder="Chọn chủ đề">
            {topics.map((t: any) => (
              <Option key={t.id} value={t.id}>
                {t.topicName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Tên bài học"
          name="lessonName"
          rules={[{ required: true, message: "Nhập tên bài học" }]}
        >
          <Input placeholder="VD: Bài học 1" />
        </Form.Item>

        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: "Nhập tiêu đề" }]}
        >
          <Input placeholder="VD: Giới thiệu bài học" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ required: true, message: "Nhập mô tả" }]}
        >
          <Input.TextArea rows={3} placeholder="Nhập mô tả bài học" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Tạo bài học
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateLessonForm;
