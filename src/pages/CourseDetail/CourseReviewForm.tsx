import { useEffect, useState } from "react";
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
  const [isEdit, setIsEdit] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);

  const { id } = useParams();

  useEffect(() => {
    const fetchReview = async () => {
      if (!id) return;
      try {
        const res = await ReviewService.getReviewByUserAndCourse(id);
        if (res) {
          setDescription(res.description);
          setRating(res.rating);
          setIsEdit(true);
          setReviewId(res.id);
        }
      } catch (error) {
        console.log("Không có review trước đó", error);
      }
    };
    fetchReview();
  }, [id]);

  const handleSubmit = async () => {
    if (!description) {
      toast.warning("Vui lòng nhập mô tả đánh giá");
      return;
    }
    if (rating === 0) {
      toast.warning("Vui lòng chọn số sao đánh giá");
      return;
    }
    if (!id) return;

    try {
      setLoading(true);

      if (isEdit && reviewId) {
        await ReviewService.updateReview(reviewId, { description, rating });

        toast.success("Cập nhật đánh giá thành công!");
      } else {
        await ReviewService.submitReviewCourse(id, { description, rating });
        toast.success("Gửi đánh giá thành công!");
        setIsEdit(true);
      }
    } catch (error: any) {
      console.log({ error });
      toast.error(error?.response?.data || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Đánh giá khóa học" style={{ margin: "0 auto" }}>
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
        {isEdit ? "Cập nhật đánh giá" : "Gửi đánh giá"}
      </Button>
    </Card>
  );
};

export default CourseReviewForm;
