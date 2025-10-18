import { prisma } from "../../config/databaseconnect.js";
import fs from 'fs';
import path from 'path';

export class BaseImportService {
    // สร้าง import record ในฐานข้อมูล
    static async createImportRecord(filename, importType, userId, totalRows, successRows, failedRows, errorLogUrl = null) {
        return await prisma.excelImport.create({
            data: {
                filename: filename,
                importType: importType,
                importedBy: userId ? BigInt(userId) : null,
                totalRows: totalRows,
                successRows: successRows,
                failedRows: failedRows,
                errorLogUrl: errorLogUrl
            }
        });
    }

    // สร้างไฟล์ error log
    static async createErrorLog(errors) {
        if (errors.length === 0) return null;

        const errorLogPath = path.join(process.cwd(), 'uploads', `errors_${Date.now()}.txt`);
        fs.writeFileSync(errorLogPath, errors.join('\n'));
        return path.basename(errorLogPath);
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    static validateRequiredFields(data, requiredFields, rowNumber) {
        const errors = [];

        for (const field of requiredFields) {
            if (!data[field] || data[field] === '') {
                errors.push(`แถว ${rowNumber}: ฟิลด์ "${field}" จำเป็นต้องกรอก`);
            }
        }

        return errors;
    }

    // ตรวจสอบ object type
    static validateObjectTypes(data, fields, rowNumber) {
        const errors = [];

        for (const field of fields) {
            if (data[field] && typeof data[field] === 'object') {
                errors.push(`แถว ${rowNumber}: ฟิลด์ "${field}" เป็น object type ที่ไม่ถูกต้อง`);
            }
        }

        return errors;
    }

    // ตรวจสอบข้อมูลซ้ำ
    static async checkDuplicate(model, field, value, rowNumber, fieldName) {
        const existing = await prisma[model].findUnique({
            where: { [field]: value }
        });

        if (existing) {
            return `แถว ${rowNumber}: ${fieldName} "${value}" มีอยู่แล้ว`;
        }

        return null;
    }

    // ตรวจสอบ foreign key
    static async validateForeignKey(model, field, value, rowNumber, fieldName) {
        if (!value) return null;

        const existing = await prisma[model].findUnique({
            where: { [field]: value }
        });

        if (!existing) {
            return `แถว ${rowNumber}: ไม่พบ${fieldName} "${value}" ในระบบ`;
        }

        return null;
    }

    // แปลงข้อมูลเป็น string และ trim
    static sanitizeString(value) {
        if (value === null || value === undefined || value === '') return null;
        return String(value).trim();
    }

    // แปลงข้อมูลเป็น boolean
    static sanitizeBoolean(value) {
        if (value === null || value === undefined || value === '') return true;
        const str = String(value).toLowerCase().trim();
        return str === 'true' || str === '1' || str === 'yes';
    }

    // แปลงข้อมูลเป็น number
    static sanitizeNumber(value) {
        if (value === null || value === undefined || value === '') return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    }

    // แปลงข้อมูลเป็น date
    static sanitizeDate(value) {
        if (value === null || value === undefined || value === '') return null;
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }

    // ประมวลผลข้อมูลแถว
    static async processRow(data, rowNumber, processor) {
        try {
            return await processor(data, rowNumber);
        } catch (error) {
            return { success: false, error: `แถว ${rowNumber}: ${error.message}` };
        }
    }

    // ประมวลผลข้อมูลทั้งหมดด้วย Transaction
    static async processAllData(dataArray, processor, importType, userId, filename) {
        let errors = [];
        let successCount = 0;
        let failedCount = 0;
        let processedData = [];

        for (let i = 0; i < dataArray.length; i++) {
            const rowData = dataArray[i];
            const rowNumber = i + 2;

            const result = await this.processRow(rowData, rowNumber, processor);

            if (result.success) {
                successCount++;
                processedData.push(result.data);
            } else {
                errors.push(result.error);
                failedCount++;
            }
        }

        try {
            const result = await prisma.$transaction(async (tx) => {
                // บันทึกข้อมูลที่ประมวลผลสำเร็จ
                for (const data of processedData) {
                    await tx[importType.toLowerCase()].create({
                        data: data
                    });
                }

                // สร้างไฟล์ error log
                const errorLogUrl = await this.createErrorLog(errors);

                // บันทึกข้อมูลการ import
                const importRecord = await tx.excelImport.create({
                    data: {
                        filename: filename,
                        importType: importType,
                        importedBy: userId ? BigInt(userId) : null,
                        totalRows: dataArray.length,
                        successRows: successCount,
                        failedRows: failedCount,
                        errorLogUrl: errorLogUrl
                    }
                });

                return importRecord;
            });

            return {
                success: true,
                message: `นำเข้าข้อมูลเสร็จสิ้น: สำเร็จ ${successCount} รายการ, ล้มเหลว ${failedCount} รายการ`,
                data: {
                    totalRows: dataArray.length,
                    successRows: successCount,
                    failedRows: failedCount,
                    errors: errors,
                    importId: result.id.toString()
                }
            };

        } catch (error) {
            console.error('Transaction error:', error);
            throw new Error(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message}`);
        }
    }
}
