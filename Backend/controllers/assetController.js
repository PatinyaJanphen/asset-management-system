import { prisma } from "../config/databaseconnect.js";
import ExcelJS from 'exceljs';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';


//  Create Asset 
export const createAsset = async (req, res) => {
    const { code, name, description, serial_number, categoryId, roomId, ownerId, status, purchase_at, value, is_active } = req.body;

    if (!code || !name || !serial_number) {
        return res.json({ success: false, message: "รหัสและชื่อสินทรัพย์จำเป็นต้องกรอก" });
    }

    try {
        const existingAsset = await prisma.asset.findUnique({ where: { code } });
        if (existingAsset) return res.json({ success: false, message: "รหัสสินทรัพย์นี้มีอยู่แล้ว" });

        const existingSerial = await prisma.asset.findUnique({ where: { serial_number } });
        if (existingSerial) return res.json({ success: false, message: "หมายเลขซีเรียลนี้มีอยู่แล้ว" });

        const asset = await prisma.asset.create({
            data: {
                code,
                name,
                description,
                serial_number,
                categoryId: categoryId ? BigInt(categoryId) : null,
                roomId: roomId ? BigInt(roomId) : null,
                ownerId: ownerId ? BigInt(ownerId) : null,
                status: status || 'AVAILABLE',
                purchase_at: purchase_at ? new Date(purchase_at) : null,
                value: value ? parseFloat(value) : null,
                is_active: is_active !== undefined ? is_active : true,
                created_by: req.user?.id ? BigInt(req.user.id) : null
            },
            include: {
                category: true,
                room: true,
                owner: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true
                    }
                }
            }
        });

        return res.json({
            success: true,
            message: "สร้างสินทรัพย์สำเร็จ",
            data: {
                id: asset.id.toString(),
                code: asset.code,
                name: asset.name,
                description: asset.description,
                serial_number: asset.serial_number,
                categoryId: asset.categoryId?.toString(),
                roomId: asset.roomId?.toString(),
                ownerId: asset.ownerId?.toString(),
                status: asset.status,
                purchase_at: asset.purchase_at,
                value: asset.value,
                is_active: asset.is_active,
                category: asset.category,
                room: asset.room,
                owner: asset.owner
            }
        });
    } catch (error) {
        console.error('Error creating asset:', error);
        return res.json({ success: false, message: "เกิดข้อผิดพลาดในการสร้างสินทรัพย์", error: error.message });
    }
};

//  Get All Assets 
export const getAllAssets = async (req, res) => {
    try {
        const assets = await prisma.asset.findMany({
            include: {
                category: true,
                room: true,
                owner: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return res.json({
            success: true,
            data: assets.map(asset => ({
                id: asset.id.toString(),
                code: asset.code,
                name: asset.name,
                description: asset.description,
                serial_number: asset.serial_number,
                status: asset.status,
                categoryId: asset.categoryId?.toString(),
                roomId: asset.roomId?.toString(),
                ownerId: asset.ownerId?.toString(),
                purchase_at: asset.purchase_at,
                value: asset.value,
                is_active: asset.is_active,
                created_at: asset.created_at,
                updated_at: asset.updated_at,
                category: asset.category,
                room: asset.room,
                owner: asset.owner
            }))
        });
    } catch (error) {
        console.error('Error fetching assets:', error);
        return res.json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินทรัพย์", error: error.message });
    }
};

//  Get Asset By ID 
export const getAssetById = async (req, res) => {
    const { id } = req.params;

    try {
        const asset = await prisma.asset.findUnique({
            where: { id: BigInt(id) },
            include: {
                category: true,
                room: true,
                owner: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true
                    }
                }
            }
        });

        if (!asset) return res.json({ success: false, message: "ไม่พบสินทรัพย์" });

        return res.json({
            success: true,
            data: {
                id: asset.id.toString(),
                code: asset.code,
                name: asset.name,
                description: asset.description,
                serial_number: asset.serial_number,
                status: asset.status,
                categoryId: asset.categoryId?.toString(),
                roomId: asset.roomId?.toString(),
                ownerId: asset.ownerId?.toString(),
                purchase_at: asset.purchase_at,
                value: asset.value,
                is_active: asset.is_active,
                created_at: asset.created_at,
                updated_at: asset.updated_at,
                category: asset.category,
                room: asset.room,
                owner: asset.owner
            }
        })
    } catch (error) {
        console.error('Error fetching asset:', error);
        return res.json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินทรัพย์", error: error.message });
    }
};

//  Update Asset 
export const updateAsset = async (req, res) => {
    const { id } = req.params;
    const { code, name, description, serial_number, categoryId, roomId, ownerId, status, purchase_at, value, is_active } = req.body;

    try {
        const existingAsset = await prisma.asset.findUnique({ where: { id: BigInt(id) } });

        if (!existingAsset) {
            return res.json({ success: false, message: "ไม่พบสินทรัพย์" });
        }

        if (code && code !== existingAsset.code) {
            const duplicateCode = await prisma.asset.findUnique({ where: { code } });

            if (duplicateCode) return res.json({ success: false, message: "รหัสสินทรัพย์นี้มีอยู่แล้ว" });
        }

        if (serial_number && serial_number !== existingAsset.serial_number) {
            const duplicateSerial = await prisma.asset.findUnique({ where: { serial_number } });

            if (duplicateSerial) return res.json({ success: false, message: "หมายเลขซีเรียลนี้มีอยู่แล้ว" });
        }

        const asset = await prisma.asset.update({
            where: { id: BigInt(id) },
            data: {
                code: code || existingAsset.code,
                name: name || existingAsset.name,
                description: description !== undefined ? description : existingAsset.description,
                serial_number: serial_number !== undefined ? serial_number : existingAsset.serial_number,
                categoryId: categoryId ? BigInt(categoryId) : existingAsset.categoryId,
                roomId: roomId ? BigInt(roomId) : existingAsset.roomId,
                ownerId: ownerId ? BigInt(ownerId) : existingAsset.ownerId,
                status: status || existingAsset.status,
                purchase_at: purchase_at ? new Date(purchase_at) : existingAsset.purchase_at,
                value: value !== undefined ? parseFloat(value) : existingAsset.value,
                is_active: is_active !== undefined ? is_active : existingAsset.is_active
            },
            include: {
                category: true,
                room: true,
                owner: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true
                    }
                }
            }
        });

        return res.json({
            success: true,
            message: "อัปเดตสินทรัพย์สำเร็จ",
            data: {
                id: asset.id.toString(),
                code: asset.code,
                name: asset.name,
                description: asset.description,
                serial_number: asset.serial_number,
                status: asset.status,
                categoryId: asset.categoryId?.toString(),
                roomId: asset.roomId?.toString(),
                ownerId: asset.ownerId?.toString(),
                purchase_at: asset.purchase_at,
                value: asset.value,
                is_active: asset.is_active,
                category: asset.category,
                room: asset.room,
                owner: asset.owner
            }
        });
    } catch (error) {
        console.error('Error updating asset:', error);
        return res.json({ success: false, message: "เกิดข้อผิดพลาดในการอัปเดตสินทรัพย์", error: error.message });
    }
};

// Import Assets from Excel/CSV
export const importAssets = async (req, res) => {
    if (!req.file) {
        return res.json({ success: false, message: "กรุณาเลือกไฟล์ที่ต้องการนำเข้า" });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const filename = req.file.originalname;

    let assets = [];
    let errors = [];
    let successCount = 0;
    let failedCount = 0;

    try {
        // อ่านข้อมูลจากไฟล์ตามประเภท
        if (fileExtension === '.csv') {
            assets = await readCSVFile(filePath);
        } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
            assets = await readExcelFile(filePath);
        } else {
            // ลบไฟล์ที่อัปโหลด
            fs.unlinkSync(filePath);
            return res.json({ success: false, message: "รองรับเฉพาะไฟล์ .xlsx, .xls และ .csv เท่านั้น" });
        }

        // ตรวจสอบข้อมูลทั้งหมดก่อนเริ่มบันทึกข้อมูล
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

        // ถ้ามี validation errors ให้ยกเลิกการอัปโหลดทั้งหมด
        if (validationErrors.length > 0) {
            // ลบไฟล์ที่อัปโหลด
            fs.unlinkSync(filePath);
            
            return res.json({
                success: false,
                message: "การอัปโหลดถูกยกเลิกเนื่องจากพบข้อมูลที่ไม่ถูกต้อง",
                data: {
                    totalRows: assets.length,
                    successRows: 0,
                    failedRows: assets.length,
                    errors: validationErrors,
                    importId: null
                }
            });
        }

        // ตรวจสอบและบันทึกข้อมูล
        for (let i = 0; i < assets.length; i++) {
            const assetData = assets[i];
            const rowNumber = i + 2; // +2 เพราะ header row และ array index เริ่มจาก 0
            
            try {
                // ตรวจสอบข้อมูลที่จำเป็น
                if (!assetData.code || !assetData.name) {
                    errors.push(`แถว ${rowNumber}: รหัสและชื่อสินทรัพย์จำเป็นต้องกรอก`);
                    failedCount++;
                    continue;
                }
                
                // ตรวจสอบว่า field หลักไม่ใช่ object
                if (typeof assetData.code === 'object' || typeof assetData.name === 'object') {
                    errors.push(`แถว ${rowNumber}: รหัสหรือชื่อสินทรัพย์เป็น object type ที่ไม่ถูกต้อง`);
                    failedCount++;
                    continue;
                }

                // ตรวจสอบรหัสสินทรัพย์ซ้ำ
                const existingAsset = await prisma.asset.findUnique({ 
                    where: { code: assetData.code } 
                });
                if (existingAsset) {
                    errors.push(`แถว ${rowNumber}: รหัสสินทรัพย์ "${assetData.code}" มีอยู่แล้ว`);
                    failedCount++;
                    continue;
                }

                // ตรวจสอบหมายเลขซีเรียลซ้ำ (ถ้ามี)
                if (assetData.serial_number) {
                    const existingSerial = await prisma.asset.findUnique({ 
                        where: { serial_number: assetData.serial_number } 
                    });
                    if (existingSerial) {
                        errors.push(`แถว ${rowNumber}: หมายเลขซีเรียล "${assetData.serial_number}" มีอยู่แล้ว`);
                        failedCount++;
                        continue;
                    }
                }

                // ตรวจสอบ categoryId หรือ categoryName (ถ้ามี)
                let categoryId = null;
                if (assetData.categoryId && assetData.categoryId !== '' && assetData.categoryId !== 'null') {
                    const category = await prisma.category.findUnique({ 
                        where: { id: BigInt(assetData.categoryId) } 
                    });
                    if (!category) {
                        errors.push(`แถว ${rowNumber}: ไม่พบหมวดหมู่ ID ${assetData.categoryId}`);
                        failedCount++;
                        continue;
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

                // ตรวจสอบ roomId หรือ roomCode (ถ้ามี)
                let roomId = null;
                if (assetData.roomId) {
                    const room = await prisma.room.findUnique({ 
                        where: { id: BigInt(assetData.roomId) } 
                    });
                    if (!room) {
                        errors.push(`แถว ${rowNumber}: ไม่พบห้อง ID ${assetData.roomId}`);
                        failedCount++;
                        continue;
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

                // ตรวจสอบ ownerId, ownerEmail หรือ ownerName (ถ้ามี)
                let ownerId = null;
                if (assetData.ownerId) {
                    const owner = await prisma.user.findUnique({ 
                        where: { id: BigInt(assetData.ownerId) } 
                    });
                    if (!owner) {
                        errors.push(`แถว ${rowNumber}: ไม่พบเจ้าของ ID ${assetData.ownerId}`);
                        failedCount++;
                        continue;
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
                            errors.push(`แถว ${rowNumber}: ไม่พบเจ้าของชื่อ "${ownerNameStr}"`);
                            failedCount++;
                            continue;
                        }
                        ownerId = owner.id;
                    } else {
                        errors.push(`แถว ${rowNumber}: ชื่อเจ้าของต้องเป็น "ชื่อ นามสกุล"`);
                        failedCount++;
                        continue;
                    }
                }

                // แปลง is_active เป็น boolean
                let isActive = true;
                if (assetData.is_active !== undefined && assetData.is_active !== null && assetData.is_active !== '') {
                    const isActiveStr = String(assetData.is_active).toLowerCase().trim();
                    isActive = isActiveStr === 'true' || isActiveStr === '1' || isActiveStr === 'yes';
                }

                // สร้างสินทรัพย์
                await prisma.asset.create({
                    data: {
                        code: String(assetData.code).trim(),
                        name: String(assetData.name).trim(),
                        description: assetData.description ? String(assetData.description).trim() : null,
                        serial_number: assetData.serial_number ? String(assetData.serial_number).trim() : null,
                        categoryId: categoryId,
                        roomId: roomId,
                        ownerId: ownerId,
                        status: assetData.status || 'AVAILABLE',
                        purchase_at: assetData.purchase_at ? new Date(assetData.purchase_at) : null,
                        value: assetData.value ? parseFloat(assetData.value) : null,
                        is_active: isActive,
                        created_by: req.user?.id ? BigInt(req.user.id) : null
                    }
                });

                successCount++;

            } catch (error) {
                errors.push(`แถว ${rowNumber}: ${error.message}`);
                failedCount++;
            }
        }

        // บันทึกข้อมูลการ import
        const importRecord = await prisma.excelImport.create({
            data: {
                filename: filename,
                importedBy: req.user?.id ? BigInt(req.user.id) : null,
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

        // ลบไฟล์ที่อัปโหลด
        fs.unlinkSync(filePath);

        return res.json({
            success: true,
            message: `นำเข้าข้อมูลเสร็จสิ้น: สำเร็จ ${successCount} รายการ, ล้มเหลว ${failedCount} รายการ`,
            data: {
                totalRows: assets.length,
                successRows: successCount,
                failedRows: failedCount,
                errors: errors,
                importId: importRecord.id.toString()
            }
        });

    } catch (error) {
        console.error('Error importing assets:', error);
        
        // ลบไฟล์ที่อัปโหลด
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return res.json({ 
            success: false, 
            message: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล", 
            error: error.message 
        });
    }
};



// ฟังก์ชันอ่านไฟล์ CSV
const readCSVFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                // แปลงข้อมูลให้เป็น String สำหรับ field ที่ต้องการ
                const processedData = {};
                Object.keys(data).forEach(key => {
                    let value = data[key];

                    // จัดการกับ object types ที่อาจมาจาก CSV parser
                    if (typeof value === 'object' && value !== null) {
                        console.warn(`CSV: Unexpected object type for field ${key}:`, value);
                        value = null;
                    }

                    if (value !== null && value !== undefined && value !== '') {
                        // แปลงเป็น String สำหรับ field ที่เป็น code หรือ name
                        if (key.toLowerCase().includes('code') ||
                            key.toLowerCase().includes('name') ||
                            key.toLowerCase().includes('email')) {
                            processedData[key] = String(value).trim();
                        } else if (key.toLowerCase() === 'is_active') {
                            // แปลง is_active เป็น string เพื่อให้ง่ายต่อการประมวลผล
                            processedData[key] = String(value).trim();
                        } else {
                            processedData[key] = value;
                        }
                    } else {
                        processedData[key] = value;
                    }
                });
                results.push(processedData);
            })
            .on('end', () => resolve(results))
            .on('error', reject);
    });
};

// ฟังก์ชันอ่านไฟล์ Excel
const readExcelFile = (filePath) => {
    return new Promise(async (resolve, reject) => {
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);

            const worksheet = workbook.getWorksheet(1); // ใช้ worksheet แรก
            const results = [];

            // ข้าม header row
            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber === 1) return; // ข้าม header

                const rowData = {};
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    const header = worksheet.getRow(1).getCell(colNumber).value;
                    if (header) {
                        let value = cell.value;

                        // จัดการกับ object types ที่อาจมาจาก Excel
                        if (typeof value === 'object' && value !== null) {
                            if (value.text !== undefined) {
                                // Rich text object
                                value = value.text;
                            } else if (value.formula !== undefined) {
                                // Formula result
                                value = value.result || value.formula;
                            } else if (value.error !== undefined) {
                                // Error cell
                                value = null;
                            } else {
                                // Other object types - convert to string or null
                                console.warn(`Unexpected object type for cell value:`, value);
                                value = null;
                            }
                        }

                        // แปลงข้อมูลให้เป็น String สำหรับ field ที่ต้องการ
                        if (value !== null && value !== undefined && value !== '') {
                            if (header.toLowerCase().includes('code') ||
                                header.toLowerCase().includes('name') ||
                                header.toLowerCase().includes('email')) {
                                rowData[header] = String(value).trim();
                            } else if (header.toLowerCase() === 'is_active') {
                                // แปลง is_active เป็น string เพื่อให้ง่ายต่อการประมวลผล
                                rowData[header] = String(value).trim();
                            } else {
                                rowData[header] = value;
                            }
                        } else {
                            rowData[header] = value;
                        }
                    }
                });

                // ตรวจสอบว่ามีข้อมูลในแถว
                if (Object.values(rowData).some(value => value !== null && value !== undefined && value !== '')) {
                    results.push(rowData);
                }
            });

            resolve(results);
        } catch (error) {
            reject(error);
        }
    });
};

// ดาวน์โหลด template ไฟล์
export const downloadTemplate = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Asset Template');

        // เพิ่ม header
        const headers = [
            'code', 'name', 'description', 'serial_number',
            'categoryName', 'roomCode', 'ownerEmail', 'status',
            'purchase_at', 'value', 'is_active'
        ];

        worksheet.addRow(headers);

        // กำหนด style สำหรับ header
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // เพิ่มข้อมูลตัวอย่าง
        const sampleData = [
            'ASSET001', 'คอมพิวเตอร์', 'คอมพิวเตอร์สำหรับใช้งานทั่วไป', 'SN123456',
            'คอมพิวเตอร์', 'ROOM001', 'admin@example.com', 'AVAILABLE', '2024-01-01', '25000', 'true'
        ];
        worksheet.addRow(sampleData);

        // ปรับความกว้างของคอลัมน์
        worksheet.columns.forEach(column => {
            column.width = 15;
        });

        // ส่งไฟล์
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=asset_template.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error creating template:', error);
        return res.json({ success: false, message: "เกิดข้อผิดพลาดในการสร้าง template", error: error.message });
    }
};

// ดึงประวัติการ import
export const getImportHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const imports = await prisma.excelImport.findMany({
            skip: offset,
            take: parseInt(limit),
            include: {
                user: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const total = await prisma.excelImport.count();

        return res.json({
            success: true,
            data: {
                imports: imports.map(importRecord => ({
                    id: importRecord.id.toString(),
                    filename: importRecord.filename,
                    importedBy: importRecord.user ? {
                        id: importRecord.user.id.toString(),
                        name: `${importRecord.user.firstname} ${importRecord.user.lastname}`,
                        email: importRecord.user.email
                    } : null,
                    totalRows: importRecord.totalRows,
                    successRows: importRecord.successRows,
                    failedRows: importRecord.failedRows,
                    errorLogUrl: importRecord.errorLogUrl,
                    created_at: importRecord.created_at
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching import history:', error);
        return res.json({ success: false, message: "เกิดข้อผิดพลาดในการดึงประวัติการ import", error: error.message });
    }
};

// ดึงรายละเอียดการ import
export const getImportDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const importRecord = await prisma.excelImport.findUnique({
            where: { id: BigInt(id) },
            include: {
                user: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        email: true
                    }
                }
            }
        });

        if (!importRecord) {
            return res.json({ success: false, message: "ไม่พบข้อมูลการ import" });
        }

        // อ่านไฟล์ error log ถ้ามี
        let errorLog = null;
        if (importRecord.errorLogUrl) {
            try {
                const errorLogPath = path.join(process.cwd(), 'uploads', importRecord.errorLogUrl);
                if (fs.existsSync(errorLogPath)) {
                    errorLog = fs.readFileSync(errorLogPath, 'utf8');
                }
            } catch (error) {
                console.error('Error reading error log:', error);
            }
        }

        return res.json({
            success: true,
            data: {
                id: importRecord.id.toString(),
                filename: importRecord.filename,
                importedBy: importRecord.user ? {
                    id: importRecord.user.id.toString(),
                    name: `${importRecord.user.firstname} ${importRecord.user.lastname}`,
                    email: importRecord.user.email
                } : null,
                totalRows: importRecord.totalRows,
                successRows: importRecord.successRows,
                failedRows: importRecord.failedRows,
                errorLogUrl: importRecord.errorLogUrl,
                errorLog: errorLog,
                created_at: importRecord.created_at
            }
        });
    } catch (error) {
        console.error('Error fetching import detail:', error);
        return res.json({ success: false, message: "เกิดข้อผิดพลาดในการดึงรายละเอียดการ import", error: error.message });
    }
};
