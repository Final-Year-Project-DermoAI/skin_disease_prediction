import { Request, Response } from 'express';
import { ConsultationChatSession, ConsultationMessage, User, DoctorProfile } from '../models';

export const createConsultationSession = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.body;
    const patientId = (req as any).user.id; 
    
    // 1. Verify doctor profile exists
    const doctor = await DoctorProfile.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor profile not found' });
    }

    // 2. Check if session already exists
    let session = await ConsultationChatSession.findOne({ where: { patientId, doctorId }});
    if (!session) {
      session = await ConsultationChatSession.create({ 
        patientId, 
        doctorId, 
        status: 'pending' // Initial status is pending
      });
    }
    return res.status(201).json(session);
  } catch (error: any) {
    console.error('Create Consultation Error:', error);
    return res.status(500).json({ detail: error.message });
  }
};

export const updateConsultationStatus = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const { status } = req.body;
    
    const session = await ConsultationChatSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ detail: 'Session not found' });
    }

    session.status = status;
    await session.save();

    return res.json(session);
  } catch (error: any) {
    return res.status(500).json({ detail: error.message });
  }
};

export const getConsultationSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role?.toLowerCase();
    
    let sessions;
    if (role === 'doctor') {
      const profile = await DoctorProfile.findOne({ where: { userId }});
      sessions = await ConsultationChatSession.findAll({
        where: { doctorId: profile?.id },
        include: [{ model: User, as: 'patient' }]
      });
    } else {
      sessions = await ConsultationChatSession.findAll({
        where: { patientId: userId },
        include: [{ 
          model: DoctorProfile, 
          as: 'doctor', 
          include: [{ model: User, as: 'user' }] 
        }]
      });
    }

    const formattedSessions = sessions.map(s => {
      const session = s.toJSON() as any;
      if (role === 'doctor') {
        return {
          id: session.id,
          patient_name: `${session.patient?.firstName} ${session.patient?.lastName}`,
          status: session.status,
          created_at: session.createdAt
        };
      } else {
        const docUser = session.doctor?.user || {};
        return {
          id: session.id,
          doctor_name: `Dr. ${docUser.firstName} ${docUser.lastName}`,
          specialization: session.doctor?.specialization || 'Dermatologist',
          status: session.status,
          created_at: session.createdAt
        };
      }
    });

    return res.json(formattedSessions);
  } catch (error: any) {
    return res.status(500).json({ detail: error.message });
  }
};

export const addConsultationMessage = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const { content } = req.body;
    const senderId = (req as any).user.id;
    const senderRole = (req as any).user.role;
    
    let mediaUrl = null;
    let mediaType = null;
    
    // multer stores uploaded file in req.file
    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'pdf';
    }

    const message = await ConsultationMessage.create({
      sessionId,
      senderId,
      senderRole: senderRole?.toLowerCase() === 'doctor' ? 'doctor' : 'patient',
      content: content || '',
      mediaUrl,
      mediaType
    });

    return res.status(201).json(message);
  } catch (error: any) {
    return res.status(500).json({ detail: error.message });
  }
};

export const getConsultationMessages = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const messages = await ConsultationMessage.findAll({
      where: { sessionId },
      order: [['createdAt', 'ASC']]
    });
    return res.json(messages);
  } catch (error: any) {
    return res.status(500).json({ detail: error.message });
  }
};
