import React from "react";
import { Card, Rate, Tag } from "antd";
import { DeleteFilled, EditOutlined } from "@ant-design/icons";

interface CardCourseProps {
  title: string;
  author: string;
  rating: number;
  coverUrl: string;
  onEdit?: () => void;
  onDelete: () => void;
}

const CardCourse: React.FC<CardCourseProps> = ({
  title,
  author,
  rating,
  coverUrl,
  onEdit,
  onDelete,
}) => {
  return (
    <Card
      hoverable
      style={{
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        position: "relative",
      }}
      cover={
        <img
          alt={title}
          src={coverUrl}
          style={{ width: "100%", height: 300, objectFit: "cover" }}
        />
      }
    >
      {/* <Tag
        color="red"
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          fontWeight: "bold",
        }}
      >
        {rating}
      </Tag> */}
      <Rate value={rating} />
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          fontSize: 18,
          cursor: "pointer",
          color: "black",
          backgroundColor: "white",
          borderRadius: "50%",
          padding: 8,
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onEdit}
      >
        <EditOutlined />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 64,
          fontSize: 18,
          cursor: "pointer",
          color: "black",
          backgroundColor: "white",
          borderRadius: "50%",
          padding: 8,
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <DeleteFilled />
      </div>

      <div style={{ marginTop: 8 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
        <p style={{ margin: 0, color: "rgba(0,0,0,0.45)" }}>{author}</p>
      </div>
    </Card>
  );
};

export default CardCourse;
