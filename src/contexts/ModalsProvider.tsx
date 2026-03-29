/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ModalState {
  [key: string]: boolean;
}

interface ModalsContextValue {
  modals: ModalState;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  setModalOpen: (modalId: string, isOpen: boolean) => void;
  toggleModal: (modalId: string) => void;
  isModalOpen: (modalId: string) => boolean;
}

const ModalsContext = createContext<ModalsContextValue | undefined>(undefined);

interface ModalsProviderProps {
  children: ReactNode;
}

export function ModalsProvider({ children }: ModalsProviderProps) {
  const [modals, setModals] = useState<ModalState>({});

  const openModal = useCallback((modalId: string) => {
    setModals((prev) => ({ ...prev, [modalId]: true }));
  }, []);

  const closeModal = useCallback((modalId: string) => {
    setModals((prev) => ({ ...prev, [modalId]: false }));
  }, []);

  const setModalOpen = useCallback((modalId: string, isOpen: boolean) => {
    setModals((prev) => ({ ...prev, [modalId]: isOpen }));
  }, []);

  const toggleModal = useCallback((modalId: string) => {
    setModals((prev) => ({ ...prev, [modalId]: !prev[modalId] }));
  }, []);

  const isModalOpen = useCallback(
    (modalId: string) => {
      return modals[modalId] ?? false;
    },
    [modals]
  );

  const value: ModalsContextValue = {
    modals,
    openModal,
    closeModal,
    setModalOpen,
    toggleModal,
    isModalOpen,
  };

  return (
    <ModalsContext.Provider value={value}>{children}</ModalsContext.Provider>
  );
}

export function useModalsContext() {
  const context = useContext(ModalsContext);
  if (context === undefined) {
    throw new Error('useModalsContext must be used within a ModalsProvider');
  }
  return context;
}

export function useModalState(modalId: string) {
  const { isModalOpen, openModal, closeModal, setModalOpen, toggleModal } =
    useModalsContext();

  return {
    isOpen: isModalOpen(modalId),
    open: () => openModal(modalId),
    close: () => closeModal(modalId),
    setOpen: (nextOpen: boolean) => setModalOpen(modalId, nextOpen),
    toggle: () => toggleModal(modalId),
  };
}
