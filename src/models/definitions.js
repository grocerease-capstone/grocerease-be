import { sequelize } from '../config/index.js';
import {
  user,
  list,
  session,
  userList,
  productItem,
  shareRequests,
} from './instances.js';

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

const ShareRequests = sequelize.define(
  shareRequests.name,
  shareRequests.attributes,
  shareRequests.options,
);

export {
  User,
  List,
  Session,
  UserList,
  ProductItem,
  ShareRequests,
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