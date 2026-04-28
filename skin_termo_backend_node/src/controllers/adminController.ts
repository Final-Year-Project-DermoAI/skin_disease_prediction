import { Request, Response } from 'express';
import { User, DoctorProfile } from '../models';
import { getPasswordHash } from '../utils/auth';

export const getDoctorsList = async (req: Request, res: Response) => {
  try {
    const doctors = await User.findAll({
      where: { role: 'DOCTOR' },
      include: [{ model: DoctorProfile, as: 'profile' }],
      attributes: { exclude: ['password'] }
    });
    return res.json(doctors);
  } catch (error: any) {
    return res.status(500).json({ detail: error.message });
  }
};

export const getUsersList = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ detail: error.message });
  }
};

export const verifyDoctorStatus = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { status, rejectionReason } = req.body; // status: 'APPROVED' | 'REJECTED'

    const user = await User.findByPk(doctorId as string);
    if (!user) return res.status(404).json({ detail: 'User not found' });

    user.status = status;
    user.isVerified = (status === 'APPROVED');
    await user.save();

    const profile = await DoctorProfile.findOne({ where: { userId: doctorId as string } });
    if (profile) {
      profile.verifiedAt = (status === 'APPROVED' ? new Date() : null) as any;
      profile.verifiedBy = (req as any).user.id as string;
      profile.rejectionReason = rejectionReason || null;
      await profile.save();
    }

    return res.json({ message: `Doctor ${status.toLowerCase()} successfully`, user });
  } catch (error: any) {
    return res.status(500).json({ detail: error.message });
  }
};

export const createAdminUserEntry = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ detail: 'Email already exists' });
    
    const hashedPassword = getPasswordHash(password);
    const newUser = await User.create({ 
      firstName, 
      lastName, 
      email, 
      phone, 
      password: hashedPassword, 
      role 
    });
    
    return res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error: any) {
    return res.status(500).json({ detail: error.message });
  }
};

export const editUserDetails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phone, password } = req.body;

    const user = await User.findByPk(userId as string);
    if (!user) return res.status(404).json({ detail: 'User not found' });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (password) user.password = getPasswordHash(password);

    await user.save();
    return res.json({ message: 'User updated successfully', user });
  } catch (error: any) {
    return res.status(500).json({ detail: error.message });
  }
};

export const removeUserEntry = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId as string);
    if (!user) return res.status(404).json({ detail: 'User not found' });
    await user.destroy();
    return res.json({ message: 'User removed successfully' });
  } catch (error: any) {
    return res.status(500).json({ detail: error.message });
  }
};
