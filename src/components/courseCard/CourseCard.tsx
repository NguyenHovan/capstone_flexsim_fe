import { Card, Button, Tooltip } from "antd";
import { UsergroupAddOutlined, PlayCircleOutlined } from "@ant-design/icons";

type Props = {
  image: string;
  title: string;
  organization: string;
  students: number;
  lessons: number;
  onEnroll?: () => void;
};

const CourseCard = ({
  image,
  title,
  organization,
  students,
  lessons,
  onEnroll,
}: Props) => {
  return (
    <Card
      hoverable
      cover={
        <img
          src={image}
          alt={title}
          style={{ height: 140, objectFit: "cover" }}
        />
      }
      bodyStyle={{ padding: "12px" }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <div style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>
        {organization}
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
