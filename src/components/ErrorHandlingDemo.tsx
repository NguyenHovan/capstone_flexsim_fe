// src/components/ErrorHandlingDemo.tsx
import React from 'react';
import { Button, Card, Space, Typography } from 'antd';
import { showErrorMessage, showSuccessMessage, showWarningMessage, showInfoMessage } from '../utils/errorHandler';

const { Title, Text } = Typography;

const ErrorHandlingDemo: React.FC = () => {
  
  // Demo các loại lỗi khác nhau
  const demoValidationError = () => {
    const mockError = {
      response: {
        status: 422,
        data: {
          message: "Validation failed",
          errors: {
            UserName: ["Tên đăng nhập đã tồn tại", "Tên đăng nhập phải có ít nhất 3 ký tự"],
            Email: ["Email không hợp lệ"],
            Phone: ["Số điện thoại phải có 10-11 chữ số"]
          }
        }
      }
    };
    showErrorMessage(mockError, "Tạo tài khoản thất bại");
  };

  const demoNetworkError = () => {
    const mockError = {
      code: 'NETWORK_ERROR',
      message: 'Network Error'
    };
    showErrorMessage(mockError, "Kết nối thất bại");
  };

  const demoServerError = () => {
    const mockError = {
      response: {
        status: 500,
        data: {
          message: "Internal server error - Database connection failed"
        }
      }
    };
    showErrorMessage(mockError, "Lỗi server");
  };

  const demoUnauthorizedError = () => {
    const mockError = {
      response: {
        status: 401,
        data: {
          message: "Token expired, please login again"
        }
      }
    };
    showErrorMessage(mockError, "Xác thực thất bại");
  };

  const demoConflictError = () => {
    const mockError = {
      response: {
        status: 409,
        data: {
          message: "Workspace name already exists in this organization"
        }
      }
    };
    showErrorMessage(mockError, "Tạo workspace thất bại");
  };

  const demoTimeoutError = () => {
    const mockError = {
      code: 'ECONNABORTED',
      message: 'timeout of 5000ms exceeded'
    };
    showErrorMessage(mockError, "Yêu cầu timeout");
  };

  const demoSuccessMessage = () => {
    showSuccessMessage("Tạo tài khoản thành công! Vui lòng kiểm tra email để xác thực.");
  };

  const demoWarningMessage = () => {
    showWarningMessage("Bạn chưa điền đầy đủ thông tin bắt buộc. Vui lòng kiểm tra lại.");
  };

  const demoInfoMessage = () => {
    showInfoMessage("Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng ngày mai. Vui lòng lưu ý.");
  };

  return (
    <Card title="Demo Error Handling System" style={{ margin: '20px' }}>
      <Title level={4}>Test các loại thông báo lỗi:</Title>
      
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card size="small" title="Validation Errors (422)">
          <Text>Test lỗi validation với nhiều field</Text>
          <br />
          <Button type="primary" danger onClick={demoValidationError} style={{ marginTop: 8 }}>
            Test Validation Error
          </Button>
        </Card>

        <Card size="small" title="Network Error">
          <Text>Test lỗi kết nối mạng</Text>
          <br />
          <Button type="primary" danger onClick={demoNetworkError} style={{ marginTop: 8 }}>
            Test Network Error
          </Button>
        </Card>

        <Card size="small" title="Server Error (500)">
          <Text>Test lỗi server internal</Text>
          <br />
          <Button type="primary" danger onClick={demoServerError} style={{ marginTop: 8 }}>
            Test Server Error
          </Button>
        </Card>

        <Card size="small" title="Unauthorized Error (401)">
          <Text>Test lỗi xác thực/token hết hạn</Text>
          <br />
          <Button type="primary" danger onClick={demoUnauthorizedError} style={{ marginTop: 8 }}>
            Test Unauthorized Error
          </Button>
        </Card>

        <Card size="small" title="Conflict Error (409)">
          <Text>Test lỗi dữ liệu đã tồn tại</Text>
          <br />
          <Button type="primary" danger onClick={demoConflictError} style={{ marginTop: 8 }}>
            Test Conflict Error
          </Button>
        </Card>

        <Card size="small" title="Timeout Error">
          <Text>Test lỗi timeout</Text>
          <br />
          <Button type="primary" danger onClick={demoTimeoutError} style={{ marginTop: 8 }}>
            Test Timeout Error
          </Button>
        </Card>

        <Title level={4} style={{ marginTop: 20 }}>Test các loại thông báo khác:</Title>

        <Space>
          <Button type="primary" onClick={demoSuccessMessage}>
            Success Message
          </Button>
          <Button onClick={demoWarningMessage}>
            Warning Message
          </Button>
          <Button type="dashed" onClick={demoInfoMessage}>
            Info Message
          </Button>
        </Space>
      </Space>
    </Card>
  );
};

export default ErrorHandlingDemo;
