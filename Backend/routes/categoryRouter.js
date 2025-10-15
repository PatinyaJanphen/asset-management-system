import express from "express"
import { createCategory, getAllCategory, getCategory, updateCategory } from '../controllers/categoryController.js'
import userAuth from "../middleware/userAuth.js"

const categoryRouter = express.Router()

categoryRouter.get("/all", userAuth, getAllCategory)
categoryRouter.get("/get/:id", userAuth, getCategory)
categoryRouter.post("/create", userAuth, createCategory)
categoryRouter.put("/update/:id", userAuth, updateCategory)

export default categoryRouter