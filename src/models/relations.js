import {
  List,
  ProductItem,
  Session,
  ShareRequests,
  User,
  UserList,
} from "./definitions.js";

User.hasMany(List, { onDelete: "CASCADE", hooks: true });
List.belongsTo(User, {
  foreignKey: "UserId",
  onUpdate: "CASCADE",
});

Session.belongsTo(User, {
  foreignKey: "UserId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

List.hasMany(ProductItem, { onDelete: "CASCADE", hooks: true });
ProductItem.belongsTo(List, {
  foreignKey: "ListId",
  onUpdate: "CASCADE",
});

User.belongsToMany(List, {
  through: UserList,
  foreignKey: "InvitedId",
  onDelete: "CASCADE",
  hooks: true,
});

List.belongsToMany(User, {
  through: UserList,
  foreignKey: "ListId",
  onDelete: "CASCADE",
  hooks: true,
});

User.belongsToMany(List, {
  through: ShareRequests,
  foreignKey: "InvitedId",
  onDelete: "CASCADE",
  hooks: true,
});
List.belongsToMany(User, {
  through: ShareRequests,
  foreignKey: "ListId",
  onDelete: "CASCADE",
  hooks: true,
});

// ShareRequests.belongsTo(User, {
//   foreignKey: "InvitedId",
// });
// ShareRequests.belongsTo(List, {
//   foreignKey: "ListId",
// });

export { List, ProductItem, Session, ShareRequests, User, UserList };

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
