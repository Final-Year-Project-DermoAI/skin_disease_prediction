import sequelize from '../config/database';
import User from './User';
import DoctorProfile from './DoctorProfile';
import AnalysisHistory from './AnalysisHistory';
import ChatSession from './ChatSession';
import ChatMessage from './ChatMessage';
import ConsultationChatSession from './ConsultationChatSession';
import ConsultationMessage from './ConsultationMessage';

// User <-> DoctorProfile (One-to-One)
User.hasOne(DoctorProfile, { foreignKey: 'userId', as: 'profile' });
DoctorProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> AnalysisHistory (One-to-Many)
User.hasMany(AnalysisHistory, { foreignKey: 'userId', as: 'analyses' });
AnalysisHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> ChatSession (One-to-Many)
User.hasMany(ChatSession, { foreignKey: 'userId', as: 'sessions' });
ChatSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ChatSession <-> ChatMessage (One-to-Many)
ChatSession.hasMany(ChatMessage, { foreignKey: 'sessionId', as: 'messages' });
ChatMessage.belongsTo(ChatSession, { foreignKey: 'sessionId', as: 'session' });

// User <-> ConsultationChatSession (Patient relation)
User.hasMany(ConsultationChatSession, { foreignKey: 'patientId', as: 'consultations' });
ConsultationChatSession.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

// DoctorProfile <-> ConsultationChatSession (Doctor relation)
DoctorProfile.hasMany(ConsultationChatSession, { foreignKey: 'doctorId', as: 'consultations' });
ConsultationChatSession.belongsTo(DoctorProfile, { foreignKey: 'doctorId', as: 'doctor' });

// ConsultationChatSession <-> ConsultationMessage (One-to-Many)
ConsultationChatSession.hasMany(ConsultationMessage, { foreignKey: 'sessionId', as: 'messages' });
ConsultationMessage.belongsTo(ConsultationChatSession, { foreignKey: 'sessionId', as: 'session' });

// User <-> ConsultationMessage (Sender relation)
User.hasMany(ConsultationMessage, { foreignKey: 'senderId', as: 'sentMessages' });
ConsultationMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

export {
  sequelize,
  User,
  DoctorProfile,
  AnalysisHistory,
  ChatSession,
  ChatMessage,
  ConsultationChatSession,
  ConsultationMessage,
};
