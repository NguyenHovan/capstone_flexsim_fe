// src/utils/errorHandler.ts
import { message } from 'antd';

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
      error?: string;
      details?: string;
    };
    status?: number;
    statusText?: string;
  };
  message?: string;
  code?: string;
}

export const getErrorMessage = (error: any): string => {
  // Nếu có response từ server
  if (error?.response?.data) {
    const data = error.response.data;
    
    // Ưu tiên message từ server
    if (data.message) {
      return data.message;
    }
    
    // Nếu có validation errors (Laravel style)
    if (data.errors && typeof data.errors === 'object') {
      const errorMessages = Object.values(data.errors)
        .flat()
        .join(', ');
      return errorMessages || 'Validation failed';
    }
    
    // Nếu có error field
    if (data.error) {
      return data.error;
    }
    
    // Nếu có details
    if (data.details) {
      return data.details;
    }
  }
  
  // Nếu có status code, hiển thị thông báo tương ứng
  if (error?.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Bad Request - Dữ liệu không hợp lệ';
      case 401:
        return 'Unauthorized - Bạn cần đăng nhập lại';
      case 403:
        return 'Forbidden - Bạn không có quyền thực hiện thao tác này';
      case 404:
        return 'Not Found - Không tìm thấy dữ liệu';
      case 409:
        return 'Conflict - Dữ liệu đã tồn tại';
      case 422:
        return 'Unprocessable Entity - Dữ liệu không hợp lệ';
      case 500:
        return 'Internal Server Error - Lỗi server, vui lòng thử lại sau';
      case 503:
        return 'Service Unavailable - Dịch vụ tạm thời không khả dụng';
      default:
        return `HTTP Error ${error.response.status}: ${error.response.statusText || 'Unknown error'}`;
    }
  }
  
  // Network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return 'Lỗi kết nối mạng - Vui lòng kiểm tra kết nối internet';
  }
  
  // Timeout errors
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'Timeout - Yêu cầu mất quá nhiều thời gian, vui lòng thử lại';
  }
  
  // Default fallback
  return error?.message || 'Có lỗi không xác định xảy ra';
};

export const showErrorMessage = (error: any, defaultMessage?: string): void => {
  const errorMessage = getErrorMessage(error);
  message.error(defaultMessage ? `${defaultMessage}: ${errorMessage}` : errorMessage);
};

export const showSuccessMessage = (msg: string): void => {
  message.success(msg);
};

export const showWarningMessage = (msg: string): void => {
  message.warning(msg);
};

export const showInfoMessage = (msg: string): void => {
  message.info(msg);
};

// Validation helpers
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} là bắt buộc`;
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email không hợp lệ';
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  const phoneRegex = /^[0-9]{10,11}$/;
  if (!phoneRegex.test(phone)) {
    return 'Số điện thoại phải có 10-11 chữ số';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự';
  }
  return null;
};

export const validateForm = (data: Record<string, any>, rules: Record<string, (value: any) => string | null>): string[] => {
  const errors: string[] = [];
  
  Object.keys(rules).forEach(field => {
    const error = rules[field](data[field]);
    if (error) {
      errors.push(error);
    }
  });
  
  return errors;
};
