import * as jwt from 'jsonwebtoken';

module.exports = (req: any, res: any, next: any) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userDate = decoded;

        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: 'Authentication failed',
        });
    }
};
