import React, { useState, useEffect } from "react";
import { Table, Button, message, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { Workspace } from "../../../types/workspace";
import { WorkspaceService } from "../../../services/workspace.service";

const WorkspaceManager: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const data = await WorkspaceService.getAll();
      setWorkspaces(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error("Failed to fetch workspaces");
      console.error("Fetch workspaces error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (record: Workspace) => {
    setWorkspaceToDelete(record);
    setIsDeleteConfirmVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!workspaceToDelete) return;
    setLoading(true);
    try {
      await WorkspaceService.deleteWorkspace(workspaceToDelete.id);
      setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceToDelete.id));
      message.success("Workspace deleted successfully");
    } catch (error: any) {
      message.error(error.message || "Failed to delete workspace");
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
      setIsDeleteConfirmVisible(false);
      setWorkspaceToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmVisible(false);
    setWorkspaceToDelete(null);
  };

  const handleView = (record: Workspace) => {
    setSelectedWorkspace(record);
    setIsModalVisible(true);
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Workspace Name", dataIndex: "workSpaceName", key: "workSpaceName" },
    { title: "Order ID", dataIndex: "orderId", key: "orderId" },
    { title: "Organization ID", dataIndex: "organizationId", key: "organizationId" },
    { title: "Number of Accounts", dataIndex: "numberOfAccount", key: "numberOfAccount" },
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
          <Button style={{ marginRight: 8 }} onClick={() => handleView(record)}>
            View
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record)}
            disabled={loading}
          >
            Delete
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
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedWorkspace && (
          <div>
            <p><strong>ID:</strong> {selectedWorkspace.id}</p>
            <p><strong>Workspace Name:</strong> {selectedWorkspace.workSpaceName}</p>
            <p><strong>Order ID:</strong> {selectedWorkspace.orderId}</p>
            <p><strong>Organization ID:</strong> {selectedWorkspace.organizationId}</p>
            <p><strong>Number of Accounts:</strong> {selectedWorkspace.numberOfAccount}</p>
            <p>
              <strong>Image URL:</strong>{" "}
              {selectedWorkspace.imgUrl ? (
                <a href={selectedWorkspace.imgUrl} target="_blank" rel="noopener noreferrer">View</a>
              ) : (
                "N/A"
              )}
            </p>
            <p><strong>Description:</strong> {selectedWorkspace.description}</p>
            <p><strong>Active:</strong> {selectedWorkspace.isActive ? "Yes" : "No"}</p>
            <p><strong>Created At:</strong> {new Date(selectedWorkspace.createdAt).toLocaleDateString()}</p>
            <p><strong>Updated At:</strong> {selectedWorkspace.updatedAt ? new Date(selectedWorkspace.updatedAt).toLocaleDateString() : "N/A"}</p>
            <p><strong>Deleted At:</strong> {selectedWorkspace.deleteAt ? new Date(selectedWorkspace.deleteAt).toLocaleDateString() : "N/A"}</p>
            <Button onClick={() => setIsModalVisible(false)}>Close</Button>
          </div>
        )}
      </Modal>
      {/* Custom Modal Confirm */}
      <Modal
        title="Confirm Delete Workspace"
        open={isDeleteConfirmVisible}
        onOk={handleConfirmDelete}
        okText="Yes, delete"
        okButtonProps={{ danger: true, loading }}
        onCancel={handleCancelDelete}
        cancelText="Cancel"
        maskClosable={false}
        closable={!loading}
        destroyOnClose
      >
        {workspaceToDelete && (
          <div>
            <p>
              <b>Are you sure you want to permanently delete this workspace?</b>
            </p>
            <p>
              <strong>Name:</strong> {workspaceToDelete.workSpaceName}<br/>
              <strong>ID:</strong> {workspaceToDelete.id}<br/>
              <strong>Number of Accounts:</strong> {workspaceToDelete.numberOfAccount}
            </p>
            <p style={{ color: "red" }}>
              This action <b>cannot be undone</b>. All related data will be permanently removed from the database.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WorkspaceManager;
