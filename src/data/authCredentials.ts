import { AuthCredentials } from '../types';

// Hardcoded credentials for exclusive access
// Add new users here as needed
export const validCredentials: AuthCredentials[] = [
  { username: 'admin', pin: '1998' },
  { username: 'demo', pin: '0000' },
  { username: 'MEDAL001', pin: '0000' },
  { username: 'MEDAL002', pin: '0000' },
  { username: 'MEDAL003', pin: '0000' },
  { username: 'MEDAL004', pin: '0000' },
  { username: 'MEDAL005', pin: '0000' },
  { username: 'MEDAL006', pin: '0000' },
  { username: 'MEDAL007', pin: '0000' },
  { username: 'MEDAL008', pin: '0000' },
  { username: 'MEDAL009', pin: '0000' },
  { username: 'MEDAL010', pin: '0000' },
  { username: 'MEDAL011', pin: '0000' },
  { username: 'MEDAL012', pin: '0000' },
  { username: 'MEDAL013', pin: '0000' },
  { username: 'MEDAL014', pin: '0000' },
  { username: 'MEDAL015', pin: '0000' },
  { username: 'MEDAL016', pin: '0000' },
  { username: 'MEDAL017', pin: '0000' },
  { username: 'MEDAL018', pin: '0000' },
  { username: 'MEDAL019', pin: '0000' },
  { username: 'MEDAL020', pin: '0000' },
  { username: 'MEDAL021', pin: '0000' },
  { username: 'MEDAL022', pin: '0000' },
  { username: 'MEDAL023', pin: '0000' },
  { username: 'MEDAL024', pin: '0000' },
  { username: 'MEDAL025', pin: '0000' },
  { username: 'MEDAL026', pin: '0000' },
  { username: 'MEDAL027', pin: '0000' },
  { username: 'MEDAL028', pin: '0000' },
  { username: 'MEDAL029', pin: '0000' },
  { username: 'MEDAL030', pin: '0000' },
  { username: 'MEDAL031', pin: '0000' },
  { username: 'MEDAL032', pin: '0000' },
  { username: 'MEDAL033', pin: '0000' },
  { username: 'MEDAL034', pin: '0000' },
  { username: 'MEDAL035', pin: '0000' },
  { username: 'MEDAL036', pin: '0000' },
  { username: 'MEDAL037', pin: '0000' },
  { username: 'MEDAL038', pin: '0000' },
  { username: 'MEDAL039', pin: '0000' },
  { username: 'MEDAL040', pin: '0000' },
];

export const validateCredentials = (username: string, pin: string): boolean => {
  return validCredentials.some(
    cred => cred.username === username && cred.pin === pin
  );
};

export const getUserDisplayName = (username: string): string => {
  // You can customize display names here
  const displayNames: Record<string, string> = {
    'admin': 'Administrator',
    'user1': 'User One',
    'user2': 'User Two',
    'demo': 'Demo User',
  };
  
  return displayNames[username] || username;
};