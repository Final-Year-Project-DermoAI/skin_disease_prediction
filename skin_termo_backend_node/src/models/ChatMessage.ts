import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import ChatSession from './ChatSession';

class ChatMessage extends Model {
  public id!: string;
  public sessionId!: string;
  public role!: string;
  public content!: string;
  public imageUrl!: string | null;
  public timestamp!: string;
}

ChatMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ChatSession,
        key: 'id',
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'ChatMessage',
    tableName: 'chat_messages',
    timestamps: false,
  }
);


export default ChatMessage;
