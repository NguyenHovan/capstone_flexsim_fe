import { Card, Button, Tooltip } from "antd";
import { UsergroupAddOutlined, PlayCircleOutlined } from "@ant-design/icons";

type Props = {
  imgUrl: string;
  courseName: string;
  description: string;
  students: number;
  lessons: number;
  onEnroll?: () => void;
};

const CourseCard = ({
  imgUrl,
  courseName,
  description,
  students,
  lessons,
  onEnroll,
}: Props) => {
  return (
    <Card
      hoverable
      cover={
        <img
          src={imgUrl}
          alt={courseName}
          style={{ height: 140, objectFit: "cover" }}
        />
      }
      bodyStyle={{ padding: "12px" }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{courseName}</div>
      <div style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>
        {description}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
          <UsergroupAddOutlined />
          {students}
        </div>

        {onEnroll ? (
          <Button size="small" onClick={onEnroll}>
            Enroll
          </Button>
        ) : (
          <Tooltip title="Lessons">
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <PlayCircleOutlined />
              {lessons}
            </div>
          </Tooltip>
        )}
      </div>
    </Card>
  );
};

export default CourseCard;
