/* eslint-disable no-undef */
import { Sequelize } from 'sequelize';

const getSequelize = () => {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      port: process.env.DB_PORT || 3306,

      // dialectOptions: {
      //   socketPath: process.env.SOCKET_PATH + process.env.CONNECTION_NAME, // Optional for cloud-based MySQL
      // }, // Uncomment to connect via socket path/ Unix
      logging: console.log, // Enable logging for debugging
    }
  );

  return sequelize;
};

export default getSequelize;

/* // Connect via Unix
const connectionString = `mysql://${process.env.DB_USER}:` +
  `${process.env.DB_PASSWORD}@` +
  `${process.env.DB_HOST}/` +
  `?socketPath=${process.env.SOCKET_PATH}${process.env.CONNECTION_NAME}`;
const sequelize = new Sequelize(connectionString);


export default sequelize;*/
