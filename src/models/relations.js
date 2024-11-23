import {
  User,
  List,
  Session,
} from './definitions.js';

User.hasMany(List);
List.belongsTo(User, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Session.belongsTo(User, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export {
  User,
  List,
  Session
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