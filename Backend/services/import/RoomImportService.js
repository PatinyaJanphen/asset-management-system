import { prisma } from "../../config/databaseconnect.js";
import fs from 'fs';
import path from 'path';

export class RoomImportService {
    static async processImport(rooms, userId, filename) {
        let errors = [];
        let successCount = 0;
        let failedCount = 0;

        try {
            // ตรวจสอบและบันทึกข้อมูล
            for (let i = 0; i < rooms.length; i++) {
                const roomData = rooms[i];
                const rowNumber = i + 2; // +2 เพราะ header row และ array index เริ่มจาก 0
                
                try {
                    const result = await this.processRoomRow(roomData, rowNumber);
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
                    importType: 'ROOM',
                    importedBy: userId ? BigInt(userId) : null,
                    totalRows: rooms.length,
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
                message: `นำเข้าข้อมูลห้องเสร็จสิ้น: สำเร็จ ${successCount} รายการ, ล้มเหลว ${failedCount} รายการ`,
                data: {
                    totalRows: rooms.length,
                    successRows: successCount,
                    failedRows: failedCount,
                    errors: errors,
                    importId: importRecord.id.toString()
                }
            };

        } catch (error) {
            console.error('Error in RoomImportService:', error);
            throw error;
        }
    }

    static async processRoomRow(roomData, rowNumber) {
        try {
            // ตรวจสอบข้อมูลที่จำเป็น
            if (!roomData.code || !roomData.name) {
                return { success: false, error: `แถว ${rowNumber}: รหัสและชื่อห้องจำเป็นต้องกรอก` };
            }
            
            // ตรวจสอบว่า field หลักไม่ใช่ object
            if (typeof roomData.code === 'object' || typeof roomData.name === 'object') {
                return { success: false, error: `แถว ${rowNumber}: รหัสหรือชื่อห้องเป็น object type ที่ไม่ถูกต้อง` };
            }

            // ตรวจสอบรหัสห้องซ้ำ
            const existingRoom = await prisma.room.findUnique({ 
                where: { code: roomData.code } 
            });
            if (existingRoom) {
                return { success: false, error: `แถว ${rowNumber}: รหัสห้อง "${roomData.code}" มีอยู่แล้ว` };
            }

            // สร้างห้อง
            await prisma.room.create({
                data: {
                    code: String(roomData.code).trim(),
                    name: String(roomData.name).trim(),
                    description: roomData.description ? String(roomData.description).trim() : null
                }
            });

            return { success: true };

        } catch (error) {
            return { success: false, error: `แถว ${rowNumber}: ${error.message}` };
        }
    }
}
