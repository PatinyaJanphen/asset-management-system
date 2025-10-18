import express from "express";
import userAuth from "../middleware/userAuth.js";
import { generateAnnualReport, generateAnnualByUserReport, exportReportCSV, exportAnnualByUserReportCSV } from "../controllers/reportController.js";

const reportRouter = express.Router();

reportRouter.post('/annual', userAuth, generateAnnualReport);
reportRouter.post('/annual-by-user', userAuth, generateAnnualByUserReport);
reportRouter.post('/export/excel', userAuth, exportReportCSV);
reportRouter.post('/export/annual-by-user/excel', userAuth, exportAnnualByUserReportCSV);

export default reportRouter;
