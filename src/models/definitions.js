import getSequelize from '../config/orm.js';
import {
  user,
  list,
  session,
  item,
  userList,
  productItem,
} from './instances.js';

const sequelize = getSequelize();

const User = sequelize.define(
  user.name,
  user.attributes,
  user.options,
);

const List = sequelize.define(
  list.name,
  list.attributes,
  list.options,
);

const Session = sequelize.define(
  session.name,
  session.attributes,
  session.options,
);

const Item = sequelize.define(
  item.name,
  item.attributes,
  item.options,
);

const UserList = sequelize.define(
  userList.name,
  userList.attributes,
  userList.options,
);

const ProductItem = sequelize.define(
  productItem.name,
  productItem.attributes,
  productItem.options,
);

export {
  User,
  List,
  Session,
  Item,
  UserList,
  ProductItem,
  sequelize,
};

/*
Model Definition Template
const Model_Name = sequelize.define(
  ins_name.name,
  ins_name.attributes,
  ins_name.options,
);
*/