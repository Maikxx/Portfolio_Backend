import * as jwt from 'jsonwebtoken'

export function checkAuth (req: any, res: any, next: any) {
    try {
        // Get the token from the client via headers and remove the Bearer piece of it.
        const token = req.headers.authorization.split(' ')[1]

        // Verify the token via jsonwebtoken.
        const decoded = jwt.verify(token, process.env.JWT_KEY)

        // Assign the verified, decoded value to the request.
        req.userData = decoded

        // Continue the flow in the router.
        next()
    } catch (error) {
        console.error(error)
        return res.status(401).json({
            message: 'Authentication failed',
        })
    }
}
