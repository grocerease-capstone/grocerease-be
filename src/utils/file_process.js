import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

const convertFileName = (prefix, originalName) => {
  console.log('this is originalname ', originalName);
  const oldName = originalName.split('.');
  const newName = `${prefix}${uuidv4()}.${oldName[oldName.length - 1]}`;
  return newName;
};

const upload = multer({
  limits: {
    fileSize: 2000000,
  },
  fileFilter: (req, file, cb) => {
    const validMimeType = [
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];
    if (!validMimeType.includes(file.mimetype)) {
      cb(new Error('Invalid image format'), false);
    }
    cb(null, true);
  },
  storage: multer.memoryStorage(),
});

const imageUploads = upload.fields([
  { name: 'receipt_image', maxCount: 1 },
  { name: 'thumbnail_image', maxCount: 1 },
]);

export {
  convertFileName,
  imageUploads
};