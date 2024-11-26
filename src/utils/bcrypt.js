//import { createBcrypt, checkBcrypt } from './bcrypt.js';

import bcrypt from 'bcrypt';

const saltRound = 10;

const encrypt = async (password) => {
  const salt = await bcrypt.genSalt(saltRound);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const verifyEncryption = async (hashedPassword, password) => {
  const result = await bcrypt.compare(password, hashedPassword);
  return result;
};

export { encrypt, verifyEncryption };