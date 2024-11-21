import { sequelize } from '../config/index.js';
import { user, list } from './model_instances.js';

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

export {
  User,
  List,
};



