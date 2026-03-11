"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import {
  PDFUploadPopUpState,
  PDFUploadPopUpConfig,
  PDFUploadPopUpContextType,
} from "@/types/popup.type";

const PDFUploadPopUpContext = React.createContext<
  PDFUploadPopUpContextType | undefined
>(undefined);

export const usePDFUploadPopUp = () => {
  const ctx = React.useContext(PDFUploadPopUpContext);
  if (!ctx) {
    throw new Error("usePDFUploadPopUp must be used within PDFUploadPopUpUI");
  }
  return ctx;
};

export const PDFUploadPopUpUI: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [state, setState] = React.useState<PDFUploadPopUpState>({
    open: false,
    title: "",
    message: "",
    confirmText: "อัปโหลด",
    cancelText: "ยกเลิก",
    isLoading: false,
    selectedFileName: "",
  });

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const [callbacks, setCallbacks] = React.useState<{
    onConfirm: (file: File | null) => void | Promise<void>;
    onCancel: () => void | Promise<void>;
  }>({
    onConfirm: () => {},
    onCancel: () => {},
  });

  const trigger = (config: PDFUploadPopUpConfig) => {
    setState((prev) => ({
      ...prev,
      open: true,
      title: config.title,
      message: config.message,
      confirmText: config.confirmText || "อัปโหลด",
      cancelText: config.cancelText || "ยกเลิก",
      isLoading: false,
      selectedFileName: "",
    }));

    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setCallbacks({
      onConfirm: config.onConfirm,
      onCancel: config.onCancel || (() => {}),
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setState((prev) => ({
      ...prev,
      selectedFileName: file?.name || "",
    }));
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setState((prev) => ({
      ...prev,
      selectedFileName: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirm = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await callbacks.onConfirm(selectedFile);
    } catch (error) {
      console.error("PDF upload confirm action failed:", error);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false, open: false }));
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancel = async () => {
    try {
      await callbacks.onCancel();
    } finally {
      setState((prev) => ({ ...prev, open: false }));
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <PDFUploadPopUpContext.Provider value={{ state, trigger }}>
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
          }}
        >
          {state.title}
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: "#6b7280", fontSize: "1rem", lineHeight: 1.5 }}>
            {state.message}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              sx={{ borderColor: "#d1d5db" }}
            >
              เลือกไฟล์ PDF
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                hidden
                onChange={handleFileChange}
              />
            </Button>

            <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ color: "#6b7280", fontSize: "0.9rem", flex: 1 }}>
                {state.selectedFileName || "ยังไม่ได้เลือกไฟล์"}
              </Typography>

              {state.selectedFileName && (
                <Button
                  variant="contained"
                  onClick={handleRemoveFile}
                  disabled={state.isLoading}
                  sx={{
                    minWidth: 40,
                    width: 40,
                    height: 40,
                    borderRadius: "8px",
                    padding: 0,
                    fontSize: "1rem",
                    lineHeight: 1,
                    backgroundColor: "#fecaca",
                    color: "#991b1b",
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "#fca5a5",
                      boxShadow: "none",
                    },
                  }}
                >
                  x
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            gap: 1,
            padding: "16px 24px",
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
            disabled={state.isLoading || !selectedFile}
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
    </PDFUploadPopUpContext.Provider>
  );
};
