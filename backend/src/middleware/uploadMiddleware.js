import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'src/public/uploads/recharge/';
    if (file.fieldname === 'avatar') {
      uploadPath = 'src/public/uploads/avatar/';
    } else if (file.fieldname === 'chat') {
      uploadPath = 'src/public/uploads/chat/';
    } else if (file.fieldname === 'image' || file.fieldname === 'proof') {
      uploadPath = 'src/public/uploads/recharge/';
    }
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const multerUpload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Tăng lên 10MB để sharp xử lý
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: File upload only supports the following filetypes - " + filetypes));
  }
});

export const upload = multerUpload;

// Middleware xử lý ảnh sau khi upload để tối ưu dung lượng mà KHÔNG làm đổi màu
export const optimizeUploadedImage = async (req, res, next) => {
  if (!req.file) return next();

  const filePath = req.file.path;
  const tempPath = filePath + '.tmp';

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Giữ nguyên Metadata (ICC Profile) để không làm đổi màu
    let pipeline = image.withMetadata();

    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      await pipeline.jpeg({ quality: 85, mozjpeg: true }).toFile(tempPath);
    } else if (metadata.format === 'png') {
      await pipeline.png({ quality: 85, palette: true }).toFile(tempPath);
    } else if (metadata.format === 'webp') {
      await pipeline.webp({ quality: 85 }).toFile(tempPath);
    } else {
      return next(); // Không hỗ trợ thì bỏ qua
    }

    // Ghi đè file cũ bằng file đã tối ưu
    fs.renameSync(tempPath, filePath);
    next();
  } catch (error) {
    console.error('Error optimizing image:', error);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    next(); // Vẫn tiếp tục nếu lỗi tối ưu, giữ nguyên file gốc
  }
};
