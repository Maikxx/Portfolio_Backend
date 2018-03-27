export interface ImageType {
    _id: string,
    image?: {
        originalname: string,
        destination: string,
        filename: string,
        path: string,
        size: string,
    },
    name?: string,
    description?: string,
    location?: string,
}
