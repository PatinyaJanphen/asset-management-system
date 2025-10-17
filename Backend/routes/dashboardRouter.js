import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getDashboardSummary, getDashboardSummaryOwner } from "../controllers/dashboardController.js";

const dashboardRouter = express.Router();

dashboardRouter.get('/summary', userAuth, getDashboardSummary);
dashboardRouter.get('/summary/owner', userAuth, getDashboardSummaryOwner);

export default dashboardRouter;