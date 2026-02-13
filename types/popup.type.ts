export type ConfirmPopUpState = {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isLoading: boolean;
};

export type ConfirmPopUpConfig = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (() => void) | (() => Promise<void>);
  onCancel?: (() => void) | (() => Promise<void>);
};

export type ConfirmPopUpContextType = {
  state: ConfirmPopUpState;
  trigger: (config: ConfirmPopUpConfig) => void;
};
