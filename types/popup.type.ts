import { DocType } from "./document..type";

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

export type EditDocListState = {
  open: boolean;
  title: string;
  message: string;
  currentDocs: DocType[];
  newDocName: string;
  isLoading: boolean;
};

export type EditDocListConfig = {
  title: string;
  message: string;
  currentDocs?: DocType[];
  confirmText?: string;
  cancelText?: string;
  onConfirm: (docs: DocType[]) => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
};

export type EditDocListContextType = {
  state: EditDocListState;
  trigger: (config: EditDocListConfig) => void;
};

export type PDFUploadPopUpState = {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isLoading: boolean;
  selectedFileName: string;
};

export type PDFUploadPopUpConfig = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (file: File | null) => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
};

export type PDFUploadPopUpContextType = {
  state: PDFUploadPopUpState;
  trigger: (config: PDFUploadPopUpConfig) => void;
};
