import express from "express";
import { createAsset, getAllAssets, getAssetById, updateAsset, importAssets, downloadTemplate, getImportHistory, getImportDetail } from "../controllers/assetController.js";
import userAuth from "../middleware/userAuth.js";
import multer from "multer";
import path from "path";

const assetRouter = express.Router();

// assetRouter.use(userAuth);

// ตั้งค่า multer สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['.xlsx', '.xls', '.csv'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error('รองรับเฉพาะไฟล์ .xlsx, .xls และ .csv เท่านั้น'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // จำกัดขนาดไฟล์ 10MB
    }
});

assetRouter.get("/all", userAuth, getAllAssets);
assetRouter.get("/get/:id", userAuth, getAssetById);
assetRouter.post("/create", userAuth, createAsset);
assetRouter.put("/update/:id", userAuth, updateAsset);
assetRouter.post("/import", userAuth, upload.single('file'), importAssets);
assetRouter.get("/import/history", userAuth, getImportHistory);
assetRouter.get("/import/detail/:id", userAuth, getImportDetail);
assetRouter.get("/template", userAuth, downloadTemplate);

export default assetRouter;
