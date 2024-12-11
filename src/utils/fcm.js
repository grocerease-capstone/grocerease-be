import { messaging } from '../config/firebase.js';

const message = async (token, title, body) => {
  const payload = {
    token: token,
    notification: {
      title,
      body,
    },
  };

  await messaging.send(payload);
};

export default message;