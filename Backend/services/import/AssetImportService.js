import { prisma } from "../../config/databaseconnect.js";
import { BaseImportService } from "./BaseImportService.js";

export class AssetImportService {
    static async processImport(assets, userId, filename) {
        try {
            return await BaseImportService.processAllData(
                assets,
                this.processAssetRow.bind(this),
                'ASSET',
                userId,
                filename
            );
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

            const objectTypeErrors = BaseImportService.validateObjectTypes(
                assetData,
                ['ownerEmail', 'categoryName', 'roomCode'],
                rowNumber
            );
            validationErrors.push(...objectTypeErrors);

            if (objectTypeErrors.length > 0) continue;

            // ตรวจสอบ ownerEmail
            if (assetData.ownerEmail) {
                const ownerEmailStr = BaseImportService.sanitizeString(assetData.ownerEmail);

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
                const categoryNameStr = BaseImportService.sanitizeString(assetData.categoryName);
                const category = await prisma.category.findUnique({
                    where: { name: categoryNameStr }
                });
                if (!category) {
                    validationErrors.push(`แถว ${rowNumber}: ไม่พบหมวดหมู่ชื่อ "${categoryNameStr}" ในระบบ`);
                }
            }

            // ตรวจสอบ roomCode
            if (assetData.roomCode) {
                const roomCodeStr = BaseImportService.sanitizeString(assetData.roomCode);
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
            const requiredFields = ['code', 'name'];
            const requiredErrors = BaseImportService.validateRequiredFields(assetData, requiredFields, rowNumber);
            if (requiredErrors.length > 0) {
                return { success: false, error: requiredErrors[0] };
            }

            const objectTypeErrors = BaseImportService.validateObjectTypes(assetData, ['code', 'name'], rowNumber);
            if (objectTypeErrors.length > 0) {
                return { success: false, error: objectTypeErrors[0] };
            }

            // ตรวจสอบรหัสสินทรัพย์ซ้ำ
            const codeError = await BaseImportService.checkDuplicate('asset', 'code', assetData.code, rowNumber, 'รหัสสินทรัพย์');
            if (codeError) {
                return { success: false, error: codeError };
            }

            // ตรวจสอบหมายเลขซีเรียลซ้ำ
            if (assetData.serial_number) {
                const serialError = await BaseImportService.checkDuplicate('asset', 'serial_number', assetData.serial_number, rowNumber, 'หมายเลขซีเรียล');
                if (serialError) {
                    return { success: false, error: serialError };
                }
            }

            // ตรวจสอบและแปลงข้อมูล
            const processedData = await AssetImportService.processAssetData(assetData, rowNumber);
            if (!processedData.success) {
                return processedData;
            }

            return {
                success: true,
                data: processedData.data
            };

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

            let purchaseDate = null;
            if (assetData.purchase_at !== undefined && assetData.purchase_at !== null && assetData.purchase_at !== '') {

                const purchaseAtValue = assetData.purchase_at;
                let parsedDate;

                if (typeof purchaseAtValue === 'number' && purchaseAtValue > 25569) {
                    parsedDate = new Date((purchaseAtValue - 25569) * 86400000);
                } else {
                    parsedDate = new Date(purchaseAtValue);
                }

                if (isNaN(parsedDate.getTime())) {
                    return { success: false, error: `แถว ${rowNumber}: รูปแบบวันที่ purchase_at ไม่ถูกต้อง: "${purchaseAtValue}"` };
                }

                purchaseDate = parsedDate;
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
                    status: purchaseDate,
                    purchase_at: assetData.purchase_at ? new Date(assetData.purchase_at) : null,
                    value: assetData.value ? parseFloat(assetData.value) : null,
                    is_active: isActive,
                    created_by: null
                }
            };

        } catch (error) {
            return { success: false, error: `แถว ${rowNumber}: ${error.message}` };
        }
    }
}
