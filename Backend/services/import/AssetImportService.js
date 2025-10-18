import { prisma } from "../../config/databaseconnect.js";
import fs from 'fs';
import path from 'path';

export class AssetImportService {
    static async processImport(assets, userId, filename) {
        let errors = [];
        let successCount = 0;
        let failedCount = 0;

        try {
            // ตรวจสอบข้อมูลทั้งหมดก่อนเริ่มบันทึกข้อมูล
            const validationErrors = await this.validateAllData(assets);
            
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    message: "การอัปโหลดถูกยกเลิกเนื่องจากพบข้อมูลที่ไม่ถูกต้อง",
                    data: {
                        totalRows: assets.length,
                        successRows: 0,
                        failedRows: assets.length,
                        errors: validationErrors,
                        importId: null
                    }
                };
            }

            // ตรวจสอบและบันทึกข้อมูล
            for (let i = 0; i < assets.length; i++) {
                const assetData = assets[i];
                const rowNumber = i + 2; // +2 เพราะ header row และ array index เริ่มจาก 0
                
                try {
                    const result = await this.processAssetRow(assetData, rowNumber);
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
                    importType: 'ASSET',
                    importedBy: userId ? BigInt(userId) : null,
                    totalRows: assets.length,
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
                message: `นำเข้าข้อมูลเสร็จสิ้น: สำเร็จ ${successCount} รายการ, ล้มเหลว ${failedCount} รายการ`,
                data: {
                    totalRows: assets.length,
                    successRows: successCount,
                    failedRows: failedCount,
                    errors: errors,
                    importId: importRecord.id.toString()
                }
            };

        } catch (error) {
            console.error('Error in AssetImportService:', error);
            throw error;
        }
    }

    static async validateAllData(assets) {
        const validationErrors = [];
        
        for (let i = 0; i < assets.length; i++) {
            const assetData = assets[i];
            const rowNumber = i + 2;
            
            // ตรวจสอบ ownerEmail
            if (assetData.ownerEmail) {
                if (typeof assetData.ownerEmail === 'object') {
                    validationErrors.push(`แถว ${rowNumber}: ownerEmail เป็น object type ที่ไม่ถูกต้อง`);
                    continue;
                }
                
                const ownerEmailStr = String(assetData.ownerEmail).trim();
                
                if (!ownerEmailStr.includes('@') || ownerEmailStr.length < 5) {
                    validationErrors.push(`แถว ${rowNumber}: รูปแบบ Email ไม่ถูกต้อง "${ownerEmailStr}"`);
                    continue;
                }
                
                const owner = await prisma.user.findUnique({ 
                    where: { email: ownerEmailStr } 
                });
                if (!owner) {
                    validationErrors.push(`แถว ${rowNumber}: ไม่พบเจ้าของ Email "${ownerEmailStr}" ในระบบ`);
                }
            }

            // ตรวจสอบ categoryName
            if (assetData.categoryName) {
                if (typeof assetData.categoryName === 'object') {
                    validationErrors.push(`แถว ${rowNumber}: categoryName เป็น object type ที่ไม่ถูกต้อง`);
                    continue;
                }
                
                const categoryNameStr = String(assetData.categoryName).trim();
                const category = await prisma.category.findUnique({ 
                    where: { name: categoryNameStr } 
                });
                if (!category) {
                    validationErrors.push(`แถว ${rowNumber}: ไม่พบหมวดหมู่ชื่อ "${categoryNameStr}" ในระบบ`);
                }
            }

            // ตรวจสอบ roomCode
            if (assetData.roomCode) {
                if (typeof assetData.roomCode === 'object') {
                    validationErrors.push(`แถว ${rowNumber}: roomCode เป็น object type ที่ไม่ถูกต้อง`);
                    continue;
                }
                
                const roomCodeStr = String(assetData.roomCode).trim();
                const room = await prisma.room.findUnique({ 
                    where: { code: roomCodeStr } 
                });
                if (!room) {
                    validationErrors.push(`แถว ${rowNumber}: ไม่พบห้อง Code "${roomCodeStr}" ในระบบ`);
                }
            }
        }

        return validationErrors;
    }

    static async processAssetRow(assetData, rowNumber) {
        try {
            // ตรวจสอบข้อมูลที่จำเป็น
            if (!assetData.code || !assetData.name) {
                return { success: false, error: `แถว ${rowNumber}: รหัสและชื่อสินทรัพย์จำเป็นต้องกรอก` };
            }
            
            // ตรวจสอบว่า field หลักไม่ใช่ object
            if (typeof assetData.code === 'object' || typeof assetData.name === 'object') {
                return { success: false, error: `แถว ${rowNumber}: รหัสหรือชื่อสินทรัพย์เป็น object type ที่ไม่ถูกต้อง` };
            }

            // ตรวจสอบรหัสสินทรัพย์ซ้ำ
            const existingAsset = await prisma.asset.findUnique({ 
                where: { code: assetData.code } 
            });
            if (existingAsset) {
                return { success: false, error: `แถว ${rowNumber}: รหัสสินทรัพย์ "${assetData.code}" มีอยู่แล้ว` };
            }

            // ตรวจสอบหมายเลขซีเรียลซ้ำ (ถ้ามี)
            if (assetData.serial_number) {
                const existingSerial = await prisma.asset.findUnique({ 
                    where: { serial_number: assetData.serial_number } 
                });
                if (existingSerial) {
                    return { success: false, error: `แถว ${rowNumber}: หมายเลขซีเรียล "${assetData.serial_number}" มีอยู่แล้ว` };
                }
            }

            // ตรวจสอบและแปลงข้อมูล
            const processedData = await this.processAssetData(assetData, rowNumber);
            if (!processedData.success) {
                return processedData;
            }

            // สร้างสินทรัพย์
            await prisma.asset.create({
                data: processedData.data
            });

            return { success: true };

        } catch (error) {
            return { success: false, error: `แถว ${rowNumber}: ${error.message}` };
        }
    }

    static async processAssetData(assetData, rowNumber) {
        try {
            // ตรวจสอบ categoryId หรือ categoryName
            let categoryId = null;
            if (assetData.categoryId && assetData.categoryId !== '' && assetData.categoryId !== 'null') {
                const category = await prisma.category.findUnique({ 
                    where: { id: BigInt(assetData.categoryId) } 
                });
                if (!category) {
                    return { success: false, error: `แถว ${rowNumber}: ไม่พบหมวดหมู่ ID ${assetData.categoryId}` };
                }
                categoryId = BigInt(assetData.categoryId);
            } else if (assetData.categoryName) {
                const categoryNameStr = String(assetData.categoryName).trim();
                const category = await prisma.category.findUnique({ 
                    where: { name: categoryNameStr } 
                });
                if (category) {
                    categoryId = category.id;
                }
            }

            // ตรวจสอบ roomId หรือ roomCode
            let roomId = null;
            if (assetData.roomId) {
                const room = await prisma.room.findUnique({ 
                    where: { id: BigInt(assetData.roomId) } 
                });
                if (!room) {
                    return { success: false, error: `แถว ${rowNumber}: ไม่พบห้อง ID ${assetData.roomId}` };
                }
                roomId = BigInt(assetData.roomId);
            } else if (assetData.roomCode) {
                const roomCodeStr = String(assetData.roomCode).trim();
                const room = await prisma.room.findUnique({ 
                    where: { code: roomCodeStr } 
                });
                if (room) {
                    roomId = room.id;
                }
            }

            // ตรวจสอบ ownerId, ownerEmail หรือ ownerName
            let ownerId = null;
            if (assetData.ownerId) {
                const owner = await prisma.user.findUnique({ 
                    where: { id: BigInt(assetData.ownerId) } 
                });
                if (!owner) {
                    return { success: false, error: `แถว ${rowNumber}: ไม่พบเจ้าของ ID ${assetData.ownerId}` };
                }
                ownerId = BigInt(assetData.ownerId);
            } else if (assetData.ownerEmail) {
                const ownerEmailStr = String(assetData.ownerEmail).trim();
                const owner = await prisma.user.findUnique({ 
                    where: { email: ownerEmailStr } 
                });
                if (owner) {
                    ownerId = owner.id;
                }
            } else if (assetData.ownerName) {
                const ownerNameStr = String(assetData.ownerName).trim();
                const nameParts = ownerNameStr.split(' ');
                if (nameParts.length >= 2) {
                    const firstname = nameParts[0];
                    const lastname = nameParts.slice(1).join(' ');
                    
                    const owner = await prisma.user.findFirst({
                        where: {
                            firstname: firstname,
                            lastname: lastname
                        }
                    });
                    
                    if (!owner) {
                        return { success: false, error: `แถว ${rowNumber}: ไม่พบเจ้าของชื่อ "${ownerNameStr}"` };
                    }
                    ownerId = owner.id;
                } else {
                    return { success: false, error: `แถว ${rowNumber}: ชื่อเจ้าของต้องเป็น "ชื่อ นามสกุล"` };
                }
            }

            // แปลง is_active เป็น boolean
            let isActive = true;
            if (assetData.is_active !== undefined && assetData.is_active !== null && assetData.is_active !== '') {
                const isActiveStr = String(assetData.is_active).toLowerCase().trim();
                isActive = isActiveStr === 'true' || isActiveStr === '1' || isActiveStr === 'yes';
            }

            return {
                success: true,
                data: {
                    code: String(assetData.code).trim(),
                    name: String(assetData.name).trim(),
                    description: assetData.description ? String(assetData.description).trim() : null,
                    serial_number: assetData.serial_number ? String(assetData.serial_number).trim() : null,
                    categoryId: categoryId,
                    roomId: roomId,
                    ownerId: ownerId,
                    status: assetData.status,
                    purchase_at: assetData.purchase_at ? new Date(assetData.purchase_at) : null,
                    value: assetData.value ? parseFloat(assetData.value) : null,
                    is_active: isActive,
                    created_by: null // จะถูกกำหนดใน controller
                }
            };

        } catch (error) {
            return { success: false, error: `แถว ${rowNumber}: ${error.message}` };
        }
    }
}
