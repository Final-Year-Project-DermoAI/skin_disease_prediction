import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import ConsultationChatSession from './ConsultationChatSession';
import User from './User';

class ConsultationMessage extends Model {
  public id!: string;
  public sessionId!: string;
  public senderId!: string;
  public senderRole!: 'patient' | 'doctor';
  public content!: string;
  public mediaUrl!: string | null;
  public mediaType!: 'image' | 'pdf' | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConsultationMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: ConsultationChatSession, key: 'id' },
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: 'id' },
    },
    senderRole: {
      type: DataTypes.ENUM('patient', 'doctor'),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true, // Content can be empty if only sending an image/pdf
    },
    mediaUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mediaType: {
      type: DataTypes.ENUM('image', 'pdf'),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'ConsultationMessage',
    tableName: 'consultation_messages',
  }
);


export default ConsultationMessage;
