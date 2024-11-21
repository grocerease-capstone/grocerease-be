import {
  User,
  List,
} from './model_definitions.js';

User.hasMany(List);
List.belongsTo(User, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export { User, List };