import { createContext } from 'react';

export interface ModalAuthContextValue {
  isOpenModalAuth: boolean;
  setAuthNotice?(value: string): void;
  setIsOpenModalAuth(value: boolean): void;
}

export const ModalAuthContext = createContext<ModalAuthContextValue | null>(null);
