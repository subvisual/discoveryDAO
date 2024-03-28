//create a dialog manager context
import { createContext, useContext, PropsWithChildren } from 'react';

type TDialogContextValue = {
  openDialog: string;
  open: (name: string) => void;
  close: () => void;
};

export const DialogContext = createContext<TDialogContextValue | null>(null);

export const useDialog = () => {
  const dialog = useContext(DialogContext);

  if (!dialog) {
    throw new Error('Dialog is not initialized');
  }

  return dialog;
};
