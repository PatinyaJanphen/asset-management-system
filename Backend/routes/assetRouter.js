import express from "express";
import { createAsset, getAllAssets, getAssetById, updateAsset } from "../controllers/assetController.js";
import userAuth from "../middleware/userAuth.js";

const assetRouter = express.Router();

assetRouter.get("/all", userAuth, getAllAssets);
assetRouter.get("/get/:id", userAuth, getAssetById);
assetRouter.post("/create", userAuth, createAsset);
assetRouter.put("/update/:id", userAuth, updateAsset);

export default assetRouter;
