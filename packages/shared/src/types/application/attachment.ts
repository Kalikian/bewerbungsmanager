export type AttachmentRow = {
  id: number;
  application_id: number;
  filename_original: string;
  mime_type: string;
  size_bytes: number;
  storage_key: string;
  checksum_sha256: string;
  uploaded_at: Date;
  deleted_at: Date | null;
};

/** API shape (what the client receives/sends) */
export type AttachmentDTO = {
  id: number;
  application_id: number;
  filename_original: string;     // human filename the user uploaded
  mime_type: string;
  size_bytes: number;
  storage_key: string; 
  checksum_sha256: string;
  uploaded_at: string;  
  deleted_at: string | null; 
};
