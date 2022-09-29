var ImageKit = require("imagekit");

const publicKey: string = process.env.IMG_KIT_PUBLIC_KEY;

const privateKey: string = process.env.IMG_KIT_PRIVATE_KEY;

const urlEndpoint: string = process.env.IMG_KIT_URL_ENDPOINT;


var imagekit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint
});

export default imagekit

export const imageFileFilter = (req: any, file: any, callback: any) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
};

export const deleteFile = (fileId: string) => {
    return new Promise((resolve, reject) => {
        imagekit.deleteFile(fileId, function (error, result) {
            if (error) {
                resolve({
                    delete: false,
                    error: error
                })
            }
            resolve({
                delete: true,
            })
        });
    });
}