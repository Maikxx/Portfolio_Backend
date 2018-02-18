import * as jwt from 'jsonwebtoken';

export function checkAuth (req: any, res: any, next: any) {
    try {
        // Get the token from the client via headers and remove the Bearer piece of it.
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({
            message: 'Authentication failed',
        });
    }
};
