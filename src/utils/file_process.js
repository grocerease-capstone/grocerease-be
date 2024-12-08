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
      return cb(new Error('Invalid image format'), false);
    }

    if (file.size > 2000000) {
      return cb(new Error('File size exceeds 2MB'), false);
    }

    return cb(null, true);
  },
  storage: multer.memoryStorage(),
});

const imageUploads = upload.fields([
  { name: 'receipt_image', maxCount: 1 },
  { name: 'thumbnail_image', maxCount: 1 },
]);

const profileUpload = upload.fields([
  { name: 'profile_image', maxCount: 1 },
]);

export {
  convertFileName,
  imageUploads,
  profileUpload,
};