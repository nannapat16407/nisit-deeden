"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  ConfirmPopUpState,
  ConfirmPopUpConfig,
  ConfirmPopUpContextType,
} from "@/types/popup.type";

const ConfirmPopUpContext = React.createContext<ConfirmPopUpContextType | undefined>(
  undefined
);

export const useConfirmPopUp = () => {
  const ctx = React.useContext(ConfirmPopUpContext);
  if (!ctx) throw new Error("useConfirmPopUp must be used within ConfirmPopUpUI");
  return ctx;
};

export const ConfirmPopUpUI: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, setState] = React.useState<ConfirmPopUpState>({
    open: false,
    title: "",
    message: "",
    confirmText: "ยืนยัน",
    cancelText: "ยกเลิก",
    isLoading: false,
  });

  const [callbacks, setCallbacks] = React.useState<{
    onConfirm: (() => void) | (() => Promise<void>);
    onCancel: (() => void) | (() => Promise<void>);
  }>({
    onConfirm: () => {},
    onCancel: () => {},
  });

  const trigger = (config: ConfirmPopUpConfig) => {
    setState((prev) => ({
      ...prev,
      open: true,
      title: config.title,
      message: config.message,
      confirmText: config.confirmText || "ยืนยัน",
      cancelText: config.cancelText || "ยกเลิก",
      isLoading: false,
    }));

    setCallbacks({
      onConfirm: config.onConfirm,
      onCancel: config.onCancel || (() => {}),
    });
  };

  const handleConfirm = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await callbacks.onConfirm();
    } catch (error) {
      console.error("Confirm action failed:", error);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false, open: false }));
    }
  };

  const handleCancel = async () => {
    try {
      await callbacks.onCancel();
    } finally {
      setState((prev) => ({ ...prev, open: false }));
    }
  };

  return (
    <ConfirmPopUpContext.Provider value={{ state, trigger }}>
      {children}

      <Dialog
        open={state.open}
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#1f2937",
            // borderBottom: "1px solid #e5e7eb",
          }}
        >
          {state.title}
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <p style={{ color: "#6b7280", fontSize: "1rem", lineHeight: "1.5" }}>
            {state.message}
          </p>
        </DialogContent>

        <DialogActions
          sx={{
            gap: 1,
            padding: "16px 24px",
            // borderTop: "1px solid #e5e7eb",
          }}
        >
          <Button
            onClick={handleCancel}
            disabled={state.isLoading}
            variant="outlined"
            sx={{
              color: "#6b7280",
              borderColor: "#d1d5db",
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "#f9fafb",
              },
            }}
          >
            {state.cancelText}
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={state.isLoading}
            variant="contained"
            sx={{
              backgroundColor: "#059669",
              "&:hover": {
                backgroundColor: "#047857",
              },
              "&:disabled": {
                backgroundColor: "#d1d5db",
              },
            }}
          >
            {state.isLoading ? "กำลังดำเนิน..." : state.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmPopUpContext.Provider>
  );
};
