import express from "express"
import { createCategory, getAllCategory, getCategory, updateCategory } from '../controllers/categoryController.js'
import userAuth from "../middleware/userAuth.js"

const categoryRouter = express.Router()

categoryRouter.get("/", userAuth, getCategory)
categoryRouter.get("/all", userAuth, getAllCategory)
categoryRouter.post("/create-category", userAuth, createCategory)
categoryRouter.post("/update-category", userAuth, updateCategory)

export default categoryRouter