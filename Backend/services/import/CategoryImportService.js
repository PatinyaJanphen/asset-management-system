import { prisma } from "../../config/databaseconnect.js";
import fs from 'fs';
import path from 'path';

export class CategoryImportService {
    static async processImport(categories, userId, filename) {
        let errors = [];
        let successCount = 0;
        let failedCount = 0;

        try {
            // ตรวจสอบและบันทึกข้อมูล
            for (let i = 0; i < categories.length; i++) {
                const categoryData = categories[i];
                const rowNumber = i + 2; // +2 เพราะ header row และ array index เริ่มจาก 0
                
                try {
                    const result = await this.processCategoryRow(categoryData, rowNumber);
                    if (result.success) {
                        successCount++;
                    } else {
                        errors.push(result.error);
                        failedCount++;
                    }
                } catch (error) {
                    errors.push(`แถว ${rowNumber}: ${error.message}`);
                    failedCount++;
                }
            }

            // บันทึกข้อมูลการ import
            const importRecord = await prisma.excelImport.create({
                data: {
                    filename: filename,
                    importType: 'CATEGORY',
                    importedBy: userId ? BigInt(userId) : null,
                    totalRows: categories.length,
                    successRows: successCount,
                    failedRows: failedCount,
                    errorLogUrl: errors.length > 0 ? `errors_${Date.now()}.txt` : null
                }
            });

            // สร้างไฟล์ error log (ถ้ามี error)
            if (errors.length > 0) {
                const errorLogPath = path.join(process.cwd(), 'uploads', `errors_${Date.now()}.txt`);
                fs.writeFileSync(errorLogPath, errors.join('\n'));
            }

            return {
                success: true,
                message: `นำเข้าข้อมูลหมวดหมู่เสร็จสิ้น: สำเร็จ ${successCount} รายการ, ล้มเหลว ${failedCount} รายการ`,
                data: {
                    totalRows: categories.length,
                    successRows: successCount,
                    failedRows: failedCount,
                    errors: errors,
                    importId: importRecord.id.toString()
                }
            };

        } catch (error) {
            console.error('Error in CategoryImportService:', error);
            throw error;
        }
    }

    static async processCategoryRow(categoryData, rowNumber) {
        try {
            // ตรวจสอบข้อมูลที่จำเป็น
            if (!categoryData.name) {
                return { success: false, error: `แถว ${rowNumber}: ชื่อหมวดหมู่จำเป็นต้องกรอก` };
            }
            
            // ตรวจสอบว่า field หลักไม่ใช่ object
            if (typeof categoryData.name === 'object') {
                return { success: false, error: `แถว ${rowNumber}: ชื่อหมวดหมู่เป็น object type ที่ไม่ถูกต้อง` };
            }

            // ตรวจสอบชื่อหมวดหมู่ซ้ำ
            const existingCategory = await prisma.category.findUnique({ 
                where: { name: categoryData.name } 
            });
            if (existingCategory) {
                return { success: false, error: `แถว ${rowNumber}: ชื่อหมวดหมู่ "${categoryData.name}" มีอยู่แล้ว` };
            }

            // สร้างหมวดหมู่
            await prisma.category.create({
                data: {
                    name: String(categoryData.name).trim(),
                    description: categoryData.description ? String(categoryData.description).trim() : null
                }
            });

            return { success: true };

        } catch (error) {
            return { success: false, error: `แถว ${rowNumber}: ${error.message}` };
        }
    }
}
