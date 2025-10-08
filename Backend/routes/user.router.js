import userController from "../controllers/user.contriller.js";

const userRouter = (router) => {
    router.get('/listuser', userController.gertAllUsers);

    router.get('/sakura', userController.hello);
}

export default userRouter;