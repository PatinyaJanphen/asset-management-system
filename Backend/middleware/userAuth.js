import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.json({
            success: false,
            message: "Access denied! Please login to continue",
        });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        if (tokenDecode) {
            req.user = tokenDecode;
            next();
        }
        else {
            return res.json({
                success: false,
                message: "Not Authorized Login to again"
            })
        }
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export default userAuth;
