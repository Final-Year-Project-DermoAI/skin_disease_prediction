import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import DoctorProfile from './DoctorProfile';

class ConsultationChatSession extends Model {
  public id!: string;
  public patientId!: string;
  public doctorId!: string;
  public status!: 'pending' | 'accepted' | 'active' | 'rejected' | 'closed';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConsultationChatSession.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: 'id' },
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: DoctorProfile, key: 'id' },
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'active', 'rejected', 'closed'),
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    modelName: 'ConsultationChatSession',
    tableName: 'consultation_chat_sessions',
  }
);


export default ConsultationChatSession;
