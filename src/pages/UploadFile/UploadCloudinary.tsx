import React, { useEffect, useState } from 'react';
import { Upload, Button, message, Image } from 'antd';
import type { UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axiosInstance from '../../services/main.service';
import { API } from '../../api';

export type UploadCloudProps = {
  value?: string;
  onChange?: (url: string) => void;
  disabled?: boolean;
  onUploadedRaw?: (raw: any) => void;
  /** trả file gốc cho FE để gửi vào API create/update */
  onFileChange?: (file: File | null) => void;
};

const UploadCloudinary: React.FC<UploadCloudProps> = ({ value, onChange, disabled, onUploadedRaw, onFileChange }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  const customRequest: UploadProps['customRequest'] = async ({ file, onError, onSuccess }) => {
    try {
      setUploading(true);

      // đưa file gốc ra ngoài
      onFileChange?.(file as File);

      const fd = new FormData();
      fd.append('file', file as File);
      fd.append('image', file as File);

      const { data } = await axiosInstance.post(API.UPLOAD_FILE, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url =
        (typeof data === 'string' && data) ||
        data?.url ||
        data?.secure_url ||
        data?.data?.url ||
        data?.data?.secure_url ||
        (typeof data?.data === 'string' ? data.data : undefined);

      if (!url || typeof url !== 'string') {
        console.error('[UploadCloudinary] Unexpected upload response:', data);
        throw new Error('Upload OK nhưng không thấy URL từ BE.');
      }

      setPreview(url);
      onChange?.(url);
      onUploadedRaw?.(data);
      onSuccess?.(data as any);
      message.success('Upload ảnh thành công');
    } catch (e: any) {
      console.error('[UploadCloudinary] Upload error:', e?.response?.data || e?.message || e);
      message.error('Upload ảnh thất bại');
      onError?.(e);
      onFileChange?.(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {preview && (
        <Image
          src={preview}
          alt="preview"
          width={180}
          height={110}
          style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
          preview
        />
      )}
      <Upload
        accept="image/*"
        showUploadList={false}
        customRequest={customRequest}
        disabled={disabled || uploading}
      >
        <Button icon={<UploadOutlined />} loading={uploading} disabled={disabled}>
          {preview ? 'Đổi ảnh' : 'Tải ảnh lên'}
        </Button>
      </Upload>
    </div>
  );
};

export default UploadCloudinary;