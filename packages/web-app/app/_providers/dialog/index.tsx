import { useMemo, useState, PropsWithChildren } from 'react';
import { DialogContext } from './context';
import { DialogWrapper } from '@/app/_ui/components/dialogs/dialog-wrapper';
import { ContributeDialog, SettingsDialog } from '@/app/_ui/components/dialogs';

type TDialogComponent = {
  (): JSX.Element;
  displayName: string;
};

const dialogComponents: TDialogComponent[] = [SettingsDialog, ContributeDialog];

export const DialogProvider = ({ children }: PropsWithChildren) => {
  const [openDialog, setOpenDialog] = useState('');

  const state = useMemo(() => {
    return {
      openDialog,
      open: setOpenDialog,
      close: () => {
        setOpenDialog('');
      },
    };
  }, [openDialog]);

  return (
    <DialogContext.Provider value={state}>
      {children}
      {dialogComponents.map((DialogComponent, index) => (
        <DialogWrapper
          key={DialogComponent.displayName}
          show={openDialog === DialogComponent.displayName}
          close={state.close}
        >
          <DialogComponent />
        </DialogWrapper>
      ))}
    </DialogContext.Provider>
  );
};
