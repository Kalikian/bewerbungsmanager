import multer from 'multer';

// Configure Multer to store files in memory
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
    files: 1, // allow only 1 file per request
  },
});
