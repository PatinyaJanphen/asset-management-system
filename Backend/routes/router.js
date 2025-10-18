import express from 'express';
import authRouter from './authRouter.js';
import userRouter from './userRouter.js';
import assetRouter from './assetRouter.js';
import roomRouter from './roomRouter.js';
import categoryRouter from './categoryRouter.js';
import dashboardRouter from './dashboardRouter.js';
import importRouter from './importRouter.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/asset', assetRouter);
router.use('/room', roomRouter);
router.use('/category', categoryRouter);
router.use('/dashboard', dashboardRouter);
router.use('/import', importRouter);

export default router;