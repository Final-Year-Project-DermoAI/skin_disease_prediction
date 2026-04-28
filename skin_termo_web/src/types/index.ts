export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  lastDiagnosis: string;
  prediction: string;
  date: string;
  status: 'Pending' | 'Consulted' | 'Emergency';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'doctor';
  text: string;
  timestamp: string;
}
