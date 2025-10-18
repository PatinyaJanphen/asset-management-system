import express from 'express';
import multer from 'multer';
import path from 'path';
import userAuth from "../middleware/userAuth.js";
import {
    importAssets,
    importRooms,
    importCategories,
    importUsers,
    downloadTemplate,
    getImportHistory,
    getImportDetail
} from '../controllers/importController.js';

const importRouter = express.Router();

// กำหนด multer สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.xlsx', '.xls', '.csv'];
        const fileExtension = path.extname(file.originalname).toLowerCase();

        if (allowedTypes.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error('รองรับเฉพาะไฟล์ .xlsx, .xls และ .csv เท่านั้น'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

// Import routes
importRouter.post("/asset", userAuth, upload.single('file'), importAssets);
importRouter.post("/room", userAuth, upload.single('file'), importRooms);
importRouter.post("/category", userAuth, upload.single('file'), importCategories);
importRouter.post("/user", userAuth, upload.single('file'), importUsers);

// Template routes
importRouter.get("/template/:type", userAuth, downloadTemplate);

// History routes
importRouter.get("/history", userAuth, getImportHistory);
importRouter.get("/detail/:id", userAuth, getImportDetail);

export default importRouter;
