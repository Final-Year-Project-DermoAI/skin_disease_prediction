import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class DoctorProfile extends Model {
  public id!: string;
  public userId!: string;
  
  // 👤 Personal Information (Shared data like firstName, lastName, email, phone is in User)
  public profilePhoto!: string;
  public dateOfBirth!: Date;
  public gender!: 'MALE' | 'FEMALE' | 'OTHER';
  
  // 🏥 Professional Information
  public registrationNumber!: string;
  public specialization!: string;
  public subSpecialization!: string;
  public qualification!: string;
  public yearOfExperience!: number;
  public currentWorkplace!: string;
  public designation!: string;
  public dignity!: string;
  public consultationFee!: number;
  
  // 📍 Address & Location
  public clinicName!: string;
  public clinicAddress!: string;
  public city!: string;
  public state!: string;
  public pincode!: string;
  public country!: string;
  public latitude!: number;
  public longitude!: number;
  public homeLocation!: string;
  
  // 📜 Identity & Verification Documents
  public idProofType!: 'AADHAAR' | 'PAN' | 'PASSPORT' | 'DL';
  public idProofNumber!: string;
  public idProofDocument!: string;
  public medicalLicenseNumber!: string;
  public medicalLicenseDoc!: string;
  public degreeCertificate!: string;
  public additionalCertificate!: string;
  
  // 🕐 Timestamps & Audit
  public verifiedAt!: Date;
  public verifiedBy!: string;
  public rejectionReason!: string;
  
  // ⏰ Availability
  public availableDays!: string; // Array stored as JSON string
  public startTime!: string;
  public endTime!: string;
  
  // 🌐 Social & Online Presence
  public website!: string;
  public bio!: string;
  public languages!: string; // Array stored as JSON string

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DoctorProfile.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: 'id' } },
    
    // Personal
    profilePhoto: { type: DataTypes.STRING, allowNull: true },
    dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
    gender: { type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'), allowNull: true },
    
    // Professional
    registrationNumber: { type: DataTypes.STRING, allowNull: true, unique: true },
    specialization: { type: DataTypes.STRING, allowNull: true },
    subSpecialization: { type: DataTypes.STRING, allowNull: true },
    qualification: { type: DataTypes.STRING, allowNull: true },
    yearOfExperience: { type: DataTypes.INTEGER, allowNull: true },
    currentWorkplace: { type: DataTypes.STRING, allowNull: true },
    designation: { type: DataTypes.STRING, allowNull: true },
    dignity: { type: DataTypes.STRING, allowNull: true },
    consultationFee: { type: DataTypes.DECIMAL, allowNull: true },
    
    // Location
    clinicName: { type: DataTypes.STRING, allowNull: true },
    clinicAddress: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    pincode: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, defaultValue: 'India' },
    latitude: { type: DataTypes.FLOAT, allowNull: true },
    longitude: { type: DataTypes.FLOAT, allowNull: true },
    homeLocation: { type: DataTypes.STRING, allowNull: true },
    
    // Documents
    idProofType: { type: DataTypes.ENUM('AADHAAR', 'PAN', 'PASSPORT', 'DL'), allowNull: true },
    idProofNumber: { type: DataTypes.STRING, allowNull: true },
    idProofDocument: { type: DataTypes.STRING, allowNull: true },
    medicalLicenseNumber: { type: DataTypes.STRING, allowNull: true },
    medicalLicenseDoc: { type: DataTypes.STRING, allowNull: true },
    degreeCertificate: { type: DataTypes.STRING, allowNull: true },
    additionalCertificate: { type: DataTypes.STRING, allowNull: true },
    
    // Audit
    verifiedAt: { type: DataTypes.DATE, allowNull: true },
    verifiedBy: { type: DataTypes.UUID, allowNull: true },
    rejectionReason: { type: DataTypes.STRING, allowNull: true },
    
    // Availability
    availableDays: { type: DataTypes.JSON, allowNull: true },
    startTime: { type: DataTypes.TIME, allowNull: true },
    endTime: { type: DataTypes.TIME, allowNull: true },
    
    // Socials
    website: { type: DataTypes.STRING, allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    languages: { type: DataTypes.JSON, allowNull: true },
  },
  {
    sequelize,
    modelName: 'DoctorProfile',
    tableName: 'doctor_profiles',
  }
);


export default DoctorProfile;
