import { Timestamp } from 'firebase/firestore';

export interface AttendanceRecord {
  id: string;
  participantName: string;
  checkedInAt: Timestamp;
  method: 'code' | 'qr';
}
