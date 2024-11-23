import { DataTypes } from 'sequelize';

const user = {
  name: 'User',
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  options: {
    tableName: 'USER',
    timestamps: true,
  }
};

const session = {
  name: 'Session',
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    token: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  options: {
    tableName: 'SESSION',
    timestamps: true,
  }
};

const list = {
  name: 'List',
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  options: {
    tableName: 'LIST',
    timestamps: true,
  }
};

export {
  user,
  list,
  session,
};