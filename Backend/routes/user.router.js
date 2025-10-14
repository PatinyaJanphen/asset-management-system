import express from 'express';
import userAuth from '../middleware/user.auth.js';
import { getAllUser, getUser, updateUser } from '../controllers/user.contriller.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUser);
userRouter.get('/all-data', userAuth, getAllUser);
userRouter.post('/update-data', userAuth, updateUser);

export default userRouter;