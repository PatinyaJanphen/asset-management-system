import express from "express";
import userAuth from "../middleware/userAuth.js";
import { generateAnnualReport, exportReportCSV } from "../controllers/reportController.js";

const reportRouter = express.Router();

reportRouter.post('/annual', userAuth, generateAnnualReport);
reportRouter.post('/export/excel', userAuth, exportReportCSV);

export default reportRouter;
