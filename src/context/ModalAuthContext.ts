import { createContext } from 'react';

export interface ModalAuthContextValue {
  isOpenModalAuth: boolean;
  setIsOpenModalAuth(value: boolean): void;
}

export const ModalAuthContext = createContext<ModalAuthContextValue | null>(null);
