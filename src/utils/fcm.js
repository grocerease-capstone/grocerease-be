import { messaging } from '../config/index.js';

const sendNotification = async (token, title, body) => {
  const payload = {
    token: token,
    notification: {
      title,
      body,
    },
  };

  await messaging.send(payload);
};

export default sendNotification;