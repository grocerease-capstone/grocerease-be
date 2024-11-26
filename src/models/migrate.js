import { sequelize } from './definitions.js';
import './relations.js';

const initDatabaseMigration = async () => {
  try {
    console.log('Running migrations...');
    //await sequelize.sync(); // Uncomment to create new table only
    await sequelize.sync({ alter: true }); // Uncomment to alter and create new table
    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export default initDatabaseMigration;
