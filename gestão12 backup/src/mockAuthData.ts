// src/mockAuthData.ts
import { MOCK_LOGIN_PASSWORD } from "./constants";

export interface MockAuthUser {
  matricula: string;
  password: string;
}

export const MOCK_AUTH_CREDENTIALS: MockAuthUser[] = [
  { matricula: 'admin', password: MOCK_LOGIN_PASSWORD },
  { matricula: 'reserva', password: MOCK_LOGIN_PASSWORD },
  { matricula: 'user', password: MOCK_LOGIN_PASSWORD },
  // Keep other specific matriculas if they are still relevant for direct testing,
  // but ensure they use MOCK_LOGIN_PASSWORD if that's the desired simulated password for them.
  // For example, if 'user02' should also use 'senha123' for simulated login:
  { matricula: 'user02', password: MOCK_LOGIN_PASSWORD }, 
  { matricula: '123456789', password: MOCK_LOGIN_PASSWORD }, // Thiago Admin
  { matricula: '987654321', password: MOCK_LOGIN_PASSWORD }, // Thiago Reserva
  { matricula: '123456700', password: MOCK_LOGIN_PASSWORD }, // Thiago User1
  { matricula: '123456701', password: MOCK_LOGIN_PASSWORD }, // Thiago User2
  { matricula: '2024001', password: MOCK_LOGIN_PASSWORD }, // João Silva
  { matricula: '2024002', password: MOCK_LOGIN_PASSWORD }, // Maria Oliveira
  { matricula: '2024003', password: MOCK_LOGIN_PASSWORD }, // Carlos Pereira
  { matricula: '2024004', password: MOCK_LOGIN_PASSWORD }, // Ana Souza
];
