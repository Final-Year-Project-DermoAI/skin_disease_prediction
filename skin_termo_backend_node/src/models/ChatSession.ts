import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class ChatSession extends Model {
  public id!: string;
  public userId!: string;
  public title!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatSession.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'ChatSession',
    tableName: 'chat_sessions',
  }
);


export default ChatSession;
