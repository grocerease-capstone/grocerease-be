import {
  User,
  List,
  Session,
  UserList,
  ProductItem,
  TempUserList
} from './definitions.js';

User.hasMany(List);
List.belongsTo(User, {
  foreignKey: 'UserId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Session.belongsTo(User, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

User.belongsToMany(List, { through: UserList });
List.belongsToMany(User, { through: UserList });

User.belongsToMany(List, { through: TempUserList });
List.belongsToMany(User, { through: TempUserList });

List.hasMany(ProductItem);
ProductItem.belongsTo(List, {
  foreignKey: 'ListId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export {
  User,
  List,
  Session,
  UserList,
  ProductItem,
  TempUserList
};

/*
Future Tables

// User to List relationship
User.hasMany(List);
List.belongsTo(User, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
*/
// UserList.hasMany(User);
// UserList.hasMany(List);