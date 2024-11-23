import getSequelize from '../config/orm.js';
import {
  user,
  list,
  session
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

export {
  User,
  List,
  Session,
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