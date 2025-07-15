import React, { useState, useEffect } from "react";
import { Table, Button, Modal, message } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import type { Workspace } from "../../../types/workspace";
import { WorkspaceService } from "../../../services/workspace.service";

const WorkspaceManager: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const data = await WorkspaceService.getAll();
      if (Array.isArray(data)) {
        setWorkspaces(data);
      } else {
        console.error("API response is not an array:", data);
        setWorkspaces([]);
      }
    } catch (error) {
      message.error("Failed to fetch workspaces");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      const updatedWorkspace = await WorkspaceService.updateWorkspace(id, {
        isActive: true,
        updatedAt: new Date().toISOString(),
      });
      setWorkspaces(
        workspaces.map((ws) => (ws.id === id ? updatedWorkspace : ws))
      );
      message.success("Workspace approved successfully");
    } catch (error) {
      message.error("Failed to approve workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setLoading(true);
    try {
      const updatedWorkspace = await WorkspaceService.updateWorkspace(id, {
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
      setWorkspaces(
        workspaces.map((ws) => (ws.id === id ? updatedWorkspace : ws))
      );
      message.success("Workspace rejected successfully");
    } catch (error) {
      message.error("Failed to reject workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: Workspace) => {
    setSelectedWorkspace(record);
    setIsModalVisible(true);
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Workspace Name",
      dataIndex: "workSpaceName",
      key: "workSpaceName",
    },
    { title: "Order ID", dataIndex: "orderId", key: "orderId" },
    {
      title: "Organization ID",
      dataIndex: "organizationId",
      key: "organizationId",
    },
    {
      title: "Number of Accounts",
      dataIndex: "numberOfAccount",
      key: "numberOfAccount",
    },
    {
      title: "Image URL",
      dataIndex: "imgUrl",
      key: "imgUrl",
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            View
          </a>
        ) : (
          "N/A"
        ),
    },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (isActive ? "Yes" : "No"),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text: string) =>
        text ? new Date(text).toLocaleDateString() : "N/A",
    },
    {
      title: "Deleted At",
      dataIndex: "deleteAt",
      key: "deleteAt",
      render: (text: string) =>
        text ? new Date(text).toLocaleDateString() : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Workspace) => (
        <div>
          <Button
            icon={<CheckOutlined />}
            style={{ marginRight: 8 }}
            onClick={() => handleApprove(record.id)}
            disabled={record.isActive}
          >
            Approve
          </Button>
          <Button
            icon={<CloseOutlined />}
            danger
            onClick={() => handleReject(record.id)}
            disabled={!record.isActive}
          >
            Reject
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => handleView(record)}>
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2>Workspace Manager</h2>
      <Table
        columns={columns}
        dataSource={workspaces}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1500 }}
      />
      <Modal
        title="Workspace Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedWorkspace && (
          <div>
            <p>
              <strong>ID:</strong> {selectedWorkspace.id}
            </p>
            <p>
              <strong>Workspace Name:</strong> {selectedWorkspace.workSpaceName}
            </p>
            <p>
              <strong>Order ID:</strong> {selectedWorkspace.orderId}
            </p>
            <p>
              <strong>Organization ID:</strong>{" "}
              {selectedWorkspace.organizationId}
            </p>
            <p>
              <strong>Number of Accounts:</strong>{" "}
              {selectedWorkspace.numberOfAccount}
            </p>
            <p>
              <strong>Image URL:</strong>{" "}
              {selectedWorkspace.imgUrl ? (
                <a
                  href={selectedWorkspace.imgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              ) : (
                "N/A"
              )}
            </p>
            <p>
              <strong>Description:</strong> {selectedWorkspace.description}
            </p>
            <p>
              <strong>Active:</strong>{" "}
              {selectedWorkspace.isActive ? "Yes" : "No"}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(selectedWorkspace.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Updated At:</strong>{" "}
              {selectedWorkspace.updatedAt
                ? new Date(selectedWorkspace.updatedAt).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <strong>Deleted At:</strong>{" "}
              {selectedWorkspace.deleteAt
                ? new Date(selectedWorkspace.deleteAt).toLocaleDateString()
                : "N/A"}
            </p>
            <Button onClick={() => setIsModalVisible(false)}>Close</Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WorkspaceManager;
