import databaseconnect from "../config/databaseconnect.js";

const userController = {
    gertAllUsers: async (req, res) => {
        try {
            const db = await databaseconnect();
            const [usersData] = await db.query('SELECT * FROM users');
            if (!usersData) {
                return res.status(404).send({
                    success: false,
                    message: "No users found"
                });
            }
            res.status(200).send({
                success: true,
                message: "Users retrieved successfully",
                total: usersData.length,
                data: usersData
            });
        }
        catch (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: "Server Error",
                error: err
            });
        }
    },

    hello: (req, res) => {
        res.send("Hello, Sakura!");
    }
}

export default userController;