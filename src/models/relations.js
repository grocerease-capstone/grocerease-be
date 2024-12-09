import {
  User,
  List,
  Session,
  UserList,
  ProductItem,
  TempUserList
} from './definitions.js';

User.hasMany(List, { onDelete: 'CASCADE', hooks: true });
List.belongsTo(User, {
  foreignKey: 'UserId',
  onUpdate: 'CASCADE',
});

Session.belongsTo(User, { 
  foreignKey: 'UserId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

List.hasMany(ProductItem, { onDelete: 'CASCADE', hooks: true });
ProductItem.belongsTo(List, {
  foreignKey: 'ListId',
  onUpdate: 'CASCADE',
});

User.belongsToMany(List, { 
  through: UserList, 
  foreignKey: 'InvitedId', 
  onDelete: 'CASCADE', 
  hooks: true 
});

List.belongsToMany(User, { 
  through: UserList, 
  foreignKey: 'ListId', 
  onDelete: 'CASCADE', 
  hooks: true 
});

User.belongsToMany(List, { 
  through: TempUserList, 
  foreignKey: 'InvitedId', 
  onDelete: 'CASCADE', 
  hooks: true  });
List.belongsToMany(User, { 
  through: TempUserList,
  foreignKey: 'ListId', 
  onDelete: 'CASCADE', 
  hooks: true 
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