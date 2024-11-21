/* eslint-disable no-undef */
import { Sequelize } from 'sequelize';

// const serverConnection = `mysql://${process.env.DB_USER}:` +

const sequelize = new Sequelize(
  process.env.DB_NAME, // Database name
  process.env.DB_USER, // Username
  process.env.DB_PASSWORD, // Password
  {
    host: process.env.DB_HOST, // Database host
    dialect: 'mysql', // Dialect (MySQL)
    dialectOptions: {
      socketPath: process.env.SOCKET_PATH + process.env.CONNECTION_NAME, // Optional for cloud-based MySQL
    },
    logging: console.log, // Enable logging for debugging
  }
);

export default sequelize;

/*
const sequelize = new Sequelize(
  `mysql://${process.env.DB_USER}:` +
  `${process.env.DB_PASSWORD}@` +
  `${process.env.DB_HOST}/` +
  `?socketPath=${process.env.SOCKET_PATH}${process.env.CONNECTION_NAME}`
);

export default sequelize;*/