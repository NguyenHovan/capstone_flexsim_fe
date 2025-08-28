import { useState } from "react";
import { Card, Rate, Typography, Input, Button } from "antd";
import { ReviewService } from "../../services/review.service";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const { Paragraph } = Typography;
const { TextArea } = Input;

const CourseReviewForm = () => {
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const handleSubmit = async () => {
    if (!description) {
      toast.warning("Vui lòng nhập mô tả đánh giá");
      return;
    }
    if (rating === 0) {
      toast.warning("Vui lòng chọn số sao đánh giá");
      return;
    }
    if (!id) {
      return;
    }
    try {
      setLoading(true);

      await ReviewService.submitReviewCourse(id, { description, rating });

      toast.success("Gửi đánh giá thành công!");
      setDescription("");
      setRating(0);
    } catch (error: any) {
      console.log({ error });
      toast.error(error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Viết đánh giá cho khóa học" style={{ margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <Paragraph>Mô tả:</Paragraph>
        <TextArea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập nhận xét của bạn..."
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <Paragraph>Đánh giá:</Paragraph>
        <Rate value={rating} onChange={(value) => setRating(value)} />
      </div>
      <Button type="primary" loading={loading} onClick={handleSubmit}>
        Gửi đánh giá
      </Button>
    </Card>
  );
};

export default CourseReviewForm;
