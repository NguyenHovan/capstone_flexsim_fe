import { Table, Switch } from "antd";
import type { ColumnsType } from "antd/es/table";

interface ClassItem {
  key: string;
  name: string;
  course: number;
  students: number;
  instructor: string;
  joinDate: string;
  active: boolean;
}

const data: ClassItem[] = Array.from({ length: 8 }, (_, index) => ({
  key: index.toString(),
  name: "Forklift Sim",
  course: 15,
  students: 12,
  instructor: index === 0 ? "A" : "",
  joinDate: "2025-06-01",
  active: index === 0,
}));

const columns: ColumnsType<ClassItem> = [
  {
    title: "Class name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Course",
    dataIndex: "course",
    key: "course",
  },
  {
    title: "Number of student",
    dataIndex: "students",
    key: "students",
  },
  {
    title: "Instructor",
    dataIndex: "instructor",
    key: "instructor",
  },
  {
    title: "Joinning at",
    dataIndex: "joinDate",
    key: "joinDate",
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Switch
        defaultChecked={record.active}
        onChange={(checked) => {
          console.log(
            `Class ${record.name} is now ${checked ? "active" : "inactive"}`
          );
        }}
      />
    ),
  },
];

const MyClass = () => {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        My Classes
      </h2>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 8 }}
        bordered
      />
    </div>
  );
};

export default MyClass;
