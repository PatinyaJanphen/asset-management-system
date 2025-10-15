import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getAllUser, getUser, updateUser } from '../controllers/userContriller.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUser);
userRouter.get('/all-data', userAuth, getAllUser);
userRouter.post('/update-data', userAuth, updateUser);

export default userRouter;