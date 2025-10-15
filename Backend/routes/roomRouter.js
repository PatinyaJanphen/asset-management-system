import express from "express";
import { createRoom, getAllRoom, getRoom, updateRoom } from '../controllers/roomController.js';
import userAuth from "../middleware/userAuth.js";

const roomRouter = express.Router();

roomRouter.get('/all', userAuth, getAllRoom);
roomRouter.get('/get/:id', userAuth, getRoom);
roomRouter.post('/create', userAuth, createRoom);
roomRouter.put('/update/:id', userAuth, updateRoom);

export default roomRouter;