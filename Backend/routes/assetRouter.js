import express from "express";
import { createAsset, getAllAssets, getAssetById, updateAsset, deleteAsset, } from "../controllers/assetController.js";
import userAuth from "../middleware/userAuth.js";

const assetRouter = express.Router();

// assetRouter.use(userAuth);

assetRouter.post("/", userAuth, createAsset);
assetRouter.get("/", userAuth, getAllAssets);
assetRouter.get("/:id", userAuth, getAssetById);
assetRouter.put("/:id", userAuth, updateAsset);
assetRouter.delete("/:id", userAuth, deleteAsset);

export default assetRouter;
