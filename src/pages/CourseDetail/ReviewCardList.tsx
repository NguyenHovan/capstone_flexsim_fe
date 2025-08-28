import { useEffect, useState } from "react";
import { Card, Rate, Typography, Divider, Avatar } from "antd";
import { useParams } from "react-router-dom";
import { ReviewService } from "../../services/review.service";

const { Text, Paragraph } = Typography;

interface Account {
  fullName: string;
  avtUrl?: string;
}

interface Review {
  id: string;
  accountId: string;
  account?: Account | null;
  description: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

const ReviewCardList = () => {
  const { id } = useParams();
  const [reviews, setReviews] = useState<Review[]>([]);

  const fetchData = async () => {
    try {
      if (!id) return setReviews([]);
      const response = await ReviewService.getReviewByCourse(id);
      setReviews(response);
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return (
    <div>
      <h2>Đánh giá của học sinh</h2>
      <Card title="Tất cả đánh giá" bordered style={{ width: "100%" }}>
        {reviews.length === 0 ? (
          <Text>Chưa có đánh giá nào</Text>
        ) : (
          reviews.map((review, index) => (
            <div key={review.id} style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                {review.account?.avtUrl && (
                  <Avatar
                    src={review.account.avtUrl}
                    size={40}
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text strong>
                  {review.account?.fullName || review.accountId}
                </Text>
              </div>
              <Rate disabled defaultValue={review.rating} />
              <Paragraph>{review.description}</Paragraph>
              <Text type="secondary">
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>

              {index < reviews.length - 1 && <Divider />}
            </div>
          ))
        )}
      </Card>
    </div>
  );
};

export default ReviewCardList;
