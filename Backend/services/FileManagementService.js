import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);
const statAsync = promisify(fs.stat);
const mkdirAsync = promisify(fs.mkdir);

export class FileManagementService {
    static UPLOAD_DIR = 'uploads';
    static ERROR_LOG_DIR = 'uploads/error-logs';
    static TEMP_DIR = 'uploads/temp';

    // สร้างโฟลเดอร์ที่จำเป็น 
    static async ensureDirectories() {
        const directories = [
            this.UPLOAD_DIR,
            this.ERROR_LOG_DIR,
            this.TEMP_DIR
        ];

        for (const dir of directories) {
            try {
                await mkdirAsync(dir, { recursive: true });
            } catch (error) {
                if (error.code !== 'EEXIST') {
                    throw error;
                }
            }
        }
    }

    // สร้างไฟล์ error log
    static async createErrorLog(errors, filename = null) {
        if (errors.length === 0) return null;

        await this.ensureDirectories();

        const timestamp = Date.now();
        const errorFilename = filename || `errors_${timestamp}.txt`;
        const errorLogPath = path.join(this.ERROR_LOG_DIR, errorFilename);

        const errorContent = errors.join('\n');
        fs.writeFileSync(errorLogPath, errorContent, 'utf8');

        return path.basename(errorLogPath);
    }


    //  ลบไฟล์
    static async deleteFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                await unlinkAsync(filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }


    // ลบไฟล์ชั่วคราว
    static async cleanupTempFiles() {
        try {
            await this.ensureDirectories();
            const files = fs.readdirSync(this.TEMP_DIR);
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            for (const file of files) {
                const filePath = path.join(this.TEMP_DIR, file);
                const stats = await statAsync(filePath);

                if (now - stats.mtime.getTime() > maxAge) {
                    await this.deleteFile(filePath);
                }
            }
        } catch (error) {
            console.error('Error cleaning up temp files:', error);
        }
    }


    //  ตรวจสอบขนาดไฟล์
    static validateFileSize(filePath, maxSizeInMB = 10) {
        try {
            const stats = fs.statSync(filePath);
            const fileSizeInMB = stats.size / (1024 * 1024);
            return fileSizeInMB <= maxSizeInMB;
        } catch (error) {
            return false;
        }
    }

    // ตรวจสอบประเภทไฟล์ 
    static validateFileType(filename, allowedTypes = ['.xlsx', '.xls', '.csv']) {
        const ext = path.extname(filename).toLowerCase();
        return allowedTypes.includes(ext);
    }

    // สร้างชื่อไฟล์ที่ไม่ซ้ำ
    static generateUniqueFilename(originalName) {
        const ext = path.extname(originalName);
        const name = path.basename(originalName, ext);
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1E9);
        return `${name}_${timestamp}_${random}${ext}`;
    }

    // ตรวจสอบไฟล์ที่อัปโหลด
    static validateUploadedFile(file) {
        const errors = [];

        if (!this.validateFileType(file.originalname)) {
            errors.push('รองรับเฉพาะไฟล์ .xlsx, .xls และ .csv เท่านั้น');
        }

        if (!this.validateFileSize(file.path)) {
            errors.push('ขนาดไฟล์ต้องไม่เกิน 10MB');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // จัดการไฟล์ที่อัปโหลด
    static async handleUploadedFile(file, userId) {
        try {
            const validation = this.validateUploadedFile(file);
            if (!validation.isValid) {
                await this.deleteFile(file.path);
                return {
                    success: false,
                    errors: validation.errors
                };
            }

            const uniqueFilename = this.generateUniqueFilename(file.originalname);
            const newPath = path.join(this.TEMP_DIR, uniqueFilename);

            fs.renameSync(file.path, newPath);

            return {
                success: true,
                filePath: newPath,
                filename: uniqueFilename,
                originalName: file.originalname
            };

        } catch (error) {
            console.error('Error handling uploaded file:', error);
            await this.deleteFile(file.path);
            return {
                success: false,
                errors: ['เกิดข้อผิดพลาดในการจัดการไฟล์']
            };
        }
    }

    //  ลบไฟล์หลังจากประมวลผลเสร็จ
    static async cleanupAfterProcessing(filePath) {
        try {
            await this.deleteFile(filePath);
            return true;
        } catch (error) {
            console.error('Error cleaning up file:', error);
            return false;
        }
    }
}
