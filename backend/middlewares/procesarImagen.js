const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Configura tus credenciales de Cloudinary
cloudinary.config({
    cloud_name: 'dlo5rmtuh',
    api_key: '133595229585753',
    api_secret: 'ciASc0Z1Z73INOnrJ2jJ2RNLSQU'
});

// 2. Configuramos dónde y cómo se guardará la imagen
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'saccarum_avatars', // Así se llamará la carpeta en tu nube
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'] // Formatos permitidos
    }
});

// 3. Creamos el middleware que atrapará el archivo
const upload = multer({ storage: storage });

module.exports = upload;