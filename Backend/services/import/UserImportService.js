import { prisma } from "../../config/databaseconnect.js";
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export class UserImportService {
    static async processImport(users, userId, filename) {
        let errors = [];
        let successCount = 0;
        let failedCount = 0;

        try {
            // ตรวจสอบและบันทึกข้อมูล
            for (let i = 0; i < users.length; i++) {
                const userData = users[i];
                const rowNumber = i + 2; // +2 เพราะ header row และ array index เริ่มจาก 0
                
                try {
                    const result = await this.processUserRow(userData, rowNumber);
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
                    importType: 'USER',
                    importedBy: userId ? BigInt(userId) : null,
                    totalRows: users.length,
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
                message: `นำเข้าข้อมูลผู้ใช้เสร็จสิ้น: สำเร็จ ${successCount} รายการ, ล้มเหลว ${failedCount} รายการ`,
                data: {
                    totalRows: users.length,
                    successRows: successCount,
                    failedRows: failedCount,
                    errors: errors,
                    importId: importRecord.id.toString()
                }
            };

        } catch (error) {
            console.error('Error in UserImportService:', error);
            throw error;
        }
    }

    static async processUserRow(userData, rowNumber) {
        try {
            // ตรวจสอบข้อมูลที่จำเป็น
            if (!userData.firstname || !userData.lastname || !userData.email) {
                return { success: false, error: `แถว ${rowNumber}: ชื่อ นามสกุล และอีเมลจำเป็นต้องกรอก` };
            }
            
            // ตรวจสอบว่า field หลักไม่ใช่ object
            if (typeof userData.firstname === 'object' || typeof userData.lastname === 'object' || typeof userData.email === 'object') {
                return { success: false, error: `แถว ${rowNumber}: ข้อมูลผู้ใช้เป็น object type ที่ไม่ถูกต้อง` };
            }

            // ตรวจสอบรูปแบบอีเมล
            const emailStr = String(userData.email).trim();
            if (!emailStr.includes('@') || emailStr.length < 5) {
                return { success: false, error: `แถว ${rowNumber}: รูปแบบอีเมลไม่ถูกต้อง "${emailStr}"` };
            }

            // ตรวจสอบอีเมลซ้ำ
            const existingUser = await prisma.user.findUnique({ 
                where: { email: emailStr } 
            });
            if (existingUser) {
                return { success: false, error: `แถว ${rowNumber}: อีเมล "${emailStr}" มีอยู่แล้ว` };
            }

            // ตรวจสอบ username ซ้ำ
            if (userData.username) {
                const usernameStr = String(userData.username).trim();
                const existingUsername = await prisma.user.findUnique({ 
                    where: { username: usernameStr } 
                });
                if (existingUsername) {
                    return { success: false, error: `แถว ${rowNumber}: ชื่อผู้ใช้ "${usernameStr}" มีอยู่แล้ว` };
                }
            }

            // แปลง role
            let userRole = 'OWNER'; // default
            if (userData.role) {
                const roleStr = String(userData.role).toUpperCase().trim();
                if (['ADMIN', 'ASSET_STAFF', 'OWNER'].includes(roleStr)) {
                    userRole = roleStr;
                }
            }

            // สร้างรหัสผ่านเริ่มต้น (ถ้าไม่มี)
            const defaultPassword = 'password123';
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);

            // สร้างผู้ใช้
            await prisma.user.create({
                data: {
                    firstname: String(userData.firstname).trim(),
                    lastname: String(userData.lastname).trim(),
                    email: emailStr,
                    username: userData.username ? String(userData.username).trim() : null,
                    password: hashedPassword,
                    phone: userData.phone ? String(userData.phone).trim() : null,
                    role: userRole,
                    is_active: true,
                    isAccountVerified: false
                }
            });

            return { success: true };

        } catch (error) {
            return { success: false, error: `แถว ${rowNumber}: ${error.message}` };
        }
    }
}
