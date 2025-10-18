import { prisma } from "../../config/databaseconnect.js";
import { BaseImportService } from "./BaseImportService.js";

export class RoomImportService {
    static async processImport(rooms, userId, filename) {
        try {
            return await BaseImportService.processAllData(
                rooms,
                this.processRoomRow,
                'ROOM',
                userId,
                filename
            );
        } catch (error) {
            console.error('Error in RoomImportService:', error);
            throw error;
        }
    }

    static async processRoomRow(roomData, rowNumber) {
        try {
            const requiredFields = ['code', 'name'];
            const requiredErrors = BaseImportService.validateRequiredFields(roomData, requiredFields, rowNumber);
            if (requiredErrors.length > 0) {
                return { success: false, error: requiredErrors[0] };
            }
            
            const objectTypeErrors = BaseImportService.validateObjectTypes(roomData, ['code', 'name'], rowNumber);
            if (objectTypeErrors.length > 0) {
                return { success: false, error: objectTypeErrors[0] };
            }

            // ตรวจสอบรหัสห้องซ้ำ
            const codeError = await BaseImportService.checkDuplicate('room', 'code', roomData.code, rowNumber, 'รหัสห้อง');
            if (codeError) {
                return { success: false, error: codeError };
            }

            return { 
                success: true, 
                data: {
                    code: BaseImportService.sanitizeString(roomData.code),
                    name: BaseImportService.sanitizeString(roomData.name),
                    description: BaseImportService.sanitizeString(roomData.description)
                }
            };

        } catch (error) {
            return { success: false, error: `แถว ${rowNumber}: ${error.message}` };
        }
    }
}
