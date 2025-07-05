import { useState } from "react";
import { Table, Input, Button, Space, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import "./class-manage.css";
import type { ClassItem } from "../../../types/class";

const initialData: ClassItem[] = Array(6)
  .fill(null)
  .map((_, index) => ({
    key: String(index + 1),
    name: `Class ${index + 1}`,
    description: "This is a sample class description",
    numberOfStudents: 25 + index,
  }));

const ManageClass = () => {
  const [dataSource] = useState<ClassItem[]>(initialData);

  const columns: ColumnsType<ClassItem> = [
    {
      title: "Class Name",
      dataIndex: "name",
    },
    {
      title: "Class Description",
      dataIndex: "description",
    },
    {
      title: "Number of Students",
      dataIndex: "numberOfStudents",
    },
    {
      title: "Action",
      render: () => (
        <Space size="middle">
          <Tooltip title="Edit">
            <EditOutlined style={{ cursor: "pointer" }} />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="manage-class-wrapper">
      <div className="header-section">
        <Input.Search placeholder="Search class" style={{ width: 250 }} />
        <Button type="primary" icon={<PlusOutlined />}>
          Add new Class
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 6 }}
        bordered
      />
    </div>
  );
};

export default ManageClass;
