import express from "express";
import { createRoom, getAllRoom, getRoom, updateRoom } from '../controllers/roomController.js';
import userAuth from "../middleware/userAuth.js";

const roomRouter = express.Router();

roomRouter.get('/', userAuth, getRoom);
roomRouter.get('/all', userAuth, getAllRoom);
roomRouter.post('/create-room', userAuth, createRoom);
roomRouter.post('/update-room', userAuth, updateRoom);

export default roomRouter;