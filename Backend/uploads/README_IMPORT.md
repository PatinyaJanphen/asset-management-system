# คู่มือการใช้งานฟีเจอร์ Import Assets

## รูปแบบไฟล์ที่รองรับ
- **Excel**: .xlsx, .xls
- **CSV**: .csv

## โครงสร้างไฟล์

### Header ที่จำเป็น
ไฟล์ต้องมี header ตามลำดับดังนี้:

| Column | Description | Required | Example | Alternative |
|--------|-------------|----------|---------|-------------|
| code | รหัสสินทรัพย์ | ✅ | ASSET001 | - |
| name | ชื่อสินทรัพย์ | ✅ | คอมพิวเตอร์ | - |
| description | คำอธิบาย | ❌ | คอมพิวเตอร์สำหรับใช้งานทั่วไป | - |
| serial_number | หมายเลขซีเรียล | ❌ | SN123456 | - |
| categoryName | ชื่อหมวดหมู่ | ❌ | คอมพิวเตอร์ | categoryId |
| roomCode | รหัสห้อง | ❌ | ROOM001 | roomId |
| ownerEmail | อีเมลเจ้าของ | ❌ | admin@example.com | ownerId, ownerName |
| status | สถานะ | ❌ | AVAILABLE | - |
| purchase_at | วันที่ซื้อ | ❌ | 2024-01-01 | - |
| value | มูลค่า | ❌ | 25000 | - |
| is_active | สถานะใช้งาน | ❌ | true (หรือ 1, yes) | - |

### ทางเลือกสำหรับการระบุข้อมูล
- **หมวดหมู่**: ใช้ `categoryName` (แนะนำ) หรือ `categoryId`
- **ห้อง**: ใช้ `roomCode` (แนะนำ) หรือ `roomId`  
- **เจ้าของ**: ใช้ `ownerEmail` (แนะนำ), `ownerName` (รูปแบบ "ชื่อ นามสกุล") หรือ `ownerId`

### สถานะที่รองรับ (status)
- AVAILABLE (พร้อมใช้งาน)
- ASSIGNED (มอบหมายแล้ว)
- MAINTENANCE (ซ่อมบำรุง)
- RETIRED (ปลดระวาง)

## วิธีการใช้งาน

### 1. ดาวน์โหลด Template
```
GET /api/assets/template
```

### 2. Import ไฟล์
```
POST /api/assets/import
Content-Type: multipart/form-data

file: [ไฟล์ที่ต้องการนำเข้า]
```

## ตัวอย่างไฟล์ CSV
```csv
code,name,description,serial_number,categoryName,roomCode,ownerEmail,status,purchase_at,value,is_active
ASSET001,คอมพิวเตอร์,คอมพิวเตอร์สำหรับใช้งานทั่วไป,SN123456,คอมพิวเตอร์,ROOM001,admin@example.com,AVAILABLE,2024-01-01,25000,true
ASSET002,เครื่องพิมพ์,เครื่องพิมพ์เลเซอร์,SN789012,คอมพิวเตอร์,ROOM001,admin@example.com,AVAILABLE,2024-01-15,15000,true
```

## ตัวอย่างการใช้ทางเลือกอื่น
```csv
code,name,description,serial_number,categoryId,roomId,ownerName,status,purchase_at,value,is_active
ASSET001,คอมพิวเตอร์,คอมพิวเตอร์สำหรับใช้งานทั่วไป,SN123456,1,1,สมชาย ใจดี,AVAILABLE,2024-01-01,25000,true
ASSET002,เครื่องพิมพ์,เครื่องพิมพ์เลเซอร์,SN789012,1,1,สมชาย ใจดี,AVAILABLE,2024-01-15,15000,true
```

## ข้อกำหนด
- รหัสสินทรัพย์ (code) ต้องไม่ซ้ำกับที่มีอยู่แล้ว
- หมายเลขซีเรียล (serial_number) ต้องไม่ซ้ำกับที่มีอยู่แล้ว
- **หมวดหมู่**: categoryName ต้องเป็นชื่อที่มีอยู่จริง หรือ categoryId ต้องเป็น ID ที่มีอยู่จริง
- **ห้อง**: roomCode ต้องเป็นรหัสที่มีอยู่จริง หรือ roomId ต้องเป็น ID ที่มีอยู่จริง
- **เจ้าของ**: 
  - ownerEmail ต้องเป็นอีเมลที่มีอยู่จริงในระบบ (ถ้าใส่แล้ว)
  - ownerName ต้องเป็น "ชื่อ นามสกุล" ที่มีอยู่จริง หรือ ownerId ต้องเป็น ID ที่มีอยู่จริง
  - ถ้าไม่ใส่ ownerEmail จะบันทึกได้โดยไม่มีเจ้าของ
- วันที่ (purchase_at) ต้องเป็นรูปแบบ YYYY-MM-DD
- มูลค่า (value) ต้องเป็นตัวเลข
- is_active ต้องเป็น true/false, 1/0, yes/no (จะถูกแปลงเป็น boolean)

## ⚠️ สิ่งสำคัญ
- **การตรวจสอบแบบ All-or-Nothing**: ถ้าพบ email, categoryName หรือ roomCode ที่ไม่มีในระบบ จะยกเลิกการอัปโหลดทั้งหมด
- **ownerEmail**: ถ้าไม่ใส่จะบันทึกได้ แต่ถ้าใส่แล้วต้องมีอยู่ในระบบ

## การจัดการ Error
- ระบบจะตรวจสอบข้อมูลทั้งหมดก่อนเริ่มบันทึก
- ถ้าพบ email, categoryName หรือ roomCode ที่ไม่มีในระบบ จะยกเลิกการอัปโหลดทั้งหมด
- ถ้าไม่มีปัญหาในการตรวจสอบ ระบบจะบันทึกข้อมูลทั้งหมด
- ไฟล์ error log จะถูกสร้างขึ้นในกรณีที่มี error

## ข้อจำกัด
- ขนาดไฟล์สูงสุด: 10MB
- ไฟล์จะถูกลบหลังจากการประมวลผลเสร็จสิ้น
