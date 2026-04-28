import { sequelize, User, DoctorProfile, ConsultationChatSession, ConsultationMessage } from './src/models';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // 1. Find or create a doctor
    let doctorUser = await User.findOne({ where: { role: 'DOCTOR' } });
    if (!doctorUser) {
      doctorUser = await User.create({
        firstName: 'Sarah',
        lastName: 'Connor',
        email: 'doctor@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'DOCTOR',
        isVerified: true
      });
      console.log('Created dummy doctor user.');
    }

    let doctorProfile = await DoctorProfile.findOne({ where: { userId: doctorUser.id } });
    if (!doctorProfile) {
      doctorProfile = await DoctorProfile.create({
        userId: doctorUser.id,
        specialization: 'Dermatologist',
        yearsExperience: 10,
        licenseNumber: 'MD123456',
        cityLocation: 'New York',
        minFee: 50,
        approvalStatus: 'Verified'
      });
      console.log('Created doctor profile.');
    }

    // 2. Find or create a patient
    let patientUser = await User.findOne({ where: { email: 'patient@example.com' } });
    if (!patientUser) {
      patientUser = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'patient@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'PATIENT'
      });
      console.log('Created dummy patient user.');
    }

    // 3. Create a consultation session
    let session = await ConsultationChatSession.findOne({ 
      where: { patientId: patientUser.id, doctorId: doctorProfile.id } 
    });
    
    if (!session) {
      session = await ConsultationChatSession.create({
        patientId: patientUser.id,
        doctorId: doctorProfile.id,
        status: 'pending'
      });
      console.log('Created Consultation Session!');
    } else {
      console.log('Session already exists.');
    }

    // 4. Create an initial message from the patient
    const msgCount = await ConsultationMessage.count({ where: { sessionId: session.id } });
    if (msgCount === 0) {
      await ConsultationMessage.create({
        sessionId: session.id,
        senderId: patientUser.id,
        senderRole: 'patient',
        content: 'Hello Doctor, I have this red rash on my arm for 3 days. Can you help?'
      });
      console.log('Created initial message from patient.');
    }

    console.log('Successfully seeded patient and consultation data!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
