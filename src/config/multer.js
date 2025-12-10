import multer, { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir);

const storage = diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: (req, file, cb) => {
    // simple filter: accept images
    if (/image\/.*/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

export default upload;
