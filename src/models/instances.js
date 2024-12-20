﻿import { DataTypes } from 'sequelize';

const user = {
  name: 'User',
  attributes: {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    username: {
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
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fcmToken: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  options: {
    tableName: 'USER',
    timestamps: true,
  },
};

const session = {
  name: 'Session',
  attributes: {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  options: {
    tableName: 'SESSION',
    timestamps: true,
  },
};

const list = {
  name: 'List',
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    receiptImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    thumbnailImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    totalExpenses: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    totalItems: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    boughtAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  options: {
    tableName: 'LIST',
    timestamps: true,
  },
};

const productItem = {
  name: 'Product_Item',
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    totalPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  options: {
    tableName: 'product_item',
    timestamps: false,
  },
};

const userList = {
  name: 'user_list',
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  options: {
    tableName: 'user_list',
    timestamps: false,
  },
};

const shareRequests = {
  name: 'share_requests',
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  options: {
    tableName: 'share_requests',
    timestamps: false,
  },
};

export {
  list,
  productItem,
  session,
  shareRequests,
  user,
  userList,
};
