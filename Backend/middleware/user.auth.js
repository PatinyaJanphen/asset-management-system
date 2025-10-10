import jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({
            success: false,
            message: "Access Denied! Login to continue"
        })
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if (tokenDecode) {
            req.body.userId = tokenDecode.id;
            next();
        }
        else {
            return res.json({
                success: false,
                message: "Not Authorized Login to again"
            })
        }

    } catch (error) {
        return res.json({
            success: false,
            message: "Invalid Token"
        })
    }
}

export default userAuth;