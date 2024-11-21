import { sequelize } from '../config/index.js';
//import './model_relations.js';
//import './model_instances.js';

const initDatabaseMigration = async () => {
  try {
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await sequelize.sync({ alter: true });
  } catch (error) {
    return error;
  }
  return true;
};

export default initDatabaseMigration;
