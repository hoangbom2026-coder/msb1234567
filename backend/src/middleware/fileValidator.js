import fs from 'fs';
import path from 'path';
const FILE_SIGNATURES = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    gif: [0x47, 0x49, 0x46],
    webp: [0x52, 0x49, 0x46, 0x46] // RIFF header for WebP
};

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Kiểm tra magic bytes của file
 */
export const validateMagicBytes = (filePath) => {
    try {
        const buffer = Buffer.alloc(10);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, 10);
        fs.closeSync(fd);

        // Kiểm tra JPEG
        if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
            return 'jpeg';
        }

        // Kiểm tra PNG
        if (buffer[0] === 0x89 && buffer[1] === 0x50 &&
            buffer[2] === 0x4E && buffer[3] === 0x47) {
            return 'png';
        }

        // Kiểm tra GIF
        if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
            return 'gif';
        }

        // Kiểm tra WebP (RIFF header)
        if (buffer[0] === 0x52 && buffer[1] === 0x49 &&
            buffer[2] === 0x46 && buffer[3] === 0x46) {
            return 'webp';
        }

        return null;
    } catch (err) {
        console.error('[MAGIC BYTES CHECK ERROR]', err);
        return null;
    }
};

/**
 * Validate file upload middleware
 */
export const validateFileUpload = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);

    // Kiểm tra phần mở rộng tệp
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        fs.unlinkSync(file.path); // Xóa file nếu không hợp lệ
        return res.status(400).json({
            status: false,
            message: `Loại file không được phép. Chấp nhận: ${ALLOWED_EXTENSIONS.join(', ')}`
        });
    }

    // Kiểm tra MIME type
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
        fs.unlinkSync(file.path);
        return res.status(400).json({
            status: false,
            message: `MIME type không hợp lệ: ${file.mimetype}`
        });
    }

    // Kiểm tra kích thước file
    if (file.size > MAX_FILE_SIZE) {
        fs.unlinkSync(file.path);
        return res.status(400).json({
            status: false,
            message: `Kích thước file vượt quá giới hạn ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        });
    }

    // Kiểm tra magic bytes
    const detectedType = validateMagicBytes(file.path);
    if (!detectedType) {
        fs.unlinkSync(file.path);
        return res.status(400).json({
            status: false,
            message: 'File không phải là hình ảnh hợp lệ (magic bytes không khớp)'
        });
    }

    // Kiểm tra xem extension và magic bytes có phù hợp không
    const expectedExtension = detectedType === 'jpeg' ? ['jpg', 'jpeg'] : [detectedType];
    if (!expectedExtension.includes(fileExtension)) {
        fs.unlinkSync(file.path);
        return res.status(400).json({
            status: false,
            message: `Loại file không khớp. File là ${detectedType} nhưng có extension ${fileExtension}`
        });
    }

    // Ghi file valid vào req object để dùng sau
    req.fileValidated = true;
    req.file.detectedType = detectedType;

    next();
};

/**
 * Middleware để xóa file nếu request thất bại
 */
export const cleanupFileOnError = (err, req, res, next) => {
    if (req.file && !req.fileValidated) {
        try {
            fs.unlinkSync(req.file.path);
        } catch (e) {
            console.error('[FILE CLEANUP ERROR]', e);
        }
    }
    next(err);
};
