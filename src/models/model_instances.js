import { DataTypes } from 'sequelize';
//const sequelize = new Sequelize('mysql::memory:');

/**/
const user = {
  name: 'User',
  attributes: {
    id: {
      type: DataTypes.TINYINT,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  options: {
    tableName: 'USER',
    timestamps: false,
  }
};

const list = {
  name: 'List',
  attributes: {
    id: {
      type: DataTypes.TINYINT,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name2: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  options: {
    tableName: 'LIST',
    timestamps: false,
  }
};

export {
  user,
  list,
};

/*
const User = sequelize.define(
  'User', // Name of the table in Sequelize
  {
    id: {
      type: DataTypes.TINYINT.UNSIGNED, // Ensure it's compatible with MySQL
      autoIncrement: true, // Enable auto-increment
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100), // Limit the size for efficiency
      allowNull: false,
    },
  },
  {
    tableName: 'USER', // Name of the table in MySQL
    timestamps: false, // Disable timestamps if unnecessary
  }
);

export {
  User,
  //list,
};*/