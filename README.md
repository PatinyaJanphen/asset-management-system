# Asset Management System

โปรเจกต์นี้เป็นระบบจัดการสินทรัพย์ที่ประกอบด้วย **Backend** และ **Frontend** แยกกัน

## เทคโนโลยีที่ใช้

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **Prisma** - ORM สำหรับจัดการฐานข้อมูล
- **MariaDB** - ฐานข้อมูล
- **JWT** - Authentication
- **Nodemailer** - ส่งอีเมล
- **Multer** - อัปโหลดไฟล์
- **ExcelJS** - จัดการไฟล์ Excel

### Frontend
- **React 19** - Frontend Framework
- **Vite** - Build Tool
- **Material-UI** - UI Components
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP Client
- **React Table** - ตารางข้อมูล

## 📋 ฟีเจอร์หลัก

- **จัดการสินทรัพย์** - เพิ่ม แก้ไข ลบ และค้นหาสินทรัพย์
- **จัดการหมวดหมู่** - จัดการหมวดหมู่สินทรัพย์
- **จัดการห้อง** - จัดการห้องและสถานที่
- **จัดการผู้ใช้** - ระบบผู้ใช้และสิทธิ์
- **รายงาน** - สร้างรายงานการใช้งานสินทรัพย์
- **นำเข้าข้อมูล** - Import ข้อมูลจากไฟล์ Excel
- **Dashboard** - หน้าจอแสดงข้อมูลสรุป

## 🛠️ การติดตั้งและรัน

### ข้อกำหนดเบื้องต้น
- Node.js (เวอร์ชัน 18 ขึ้นไป)
- npm หรือ yarn
- MariaDB/MySQL

### ขั้นตอนการติดตั้ง

**1. โคลนโปรเจกต์จาก Git**
```bash
git clone <YOUR_REPOSITORY_URL>
cd asset-management-system
```

**2. ติดตั้งและรัน Backend**
```bash
cd Backend
npm install
npm run dev
```

**3. ติดตั้งและรัน Frontend**
```bash
cd ../Frontend
npm install
npm run dev
```

## การตั้งค่า Environment Variables

### Backend (.env)
```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
JWT_SECRET="your_jwt_secret_key"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_email_password"
PORT=your_port
```
