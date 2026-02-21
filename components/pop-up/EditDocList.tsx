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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  EditDocListState,
  EditDocListConfig,
  EditDocListContextType,
} from "@/types/popup.type";
import { DocType } from "@/types/document..type";

const EditDocListContext = React.createContext<
  EditDocListContextType | undefined
>(undefined);

export const useEditDocListPopUp = () => {
  const ctx = React.useContext(EditDocListContext);
  if (!ctx)
    throw new Error(
      "useEditDocListPopUp must be used within EditDocListPopUpUI",
    );
  return ctx;
};

const FILE_EXTENSIONS = [
  { value: ".pdf", label: "PDF" },
  { value: ".doc", label: "Word" },
  { value: ".docx", label: "Word (.docx)" },
  { value: ".xls", label: "Excel" },
  { value: ".xlsx", label: "Excel (.xlsx)" },
  { value: ".jpg", label: "Image (JPG)" },
  { value: ".png", label: "Image (PNG)" },
  { value: "", label: "Any (No extension)" },
];

export const EditDocListPopUpUI: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, setState] = React.useState<EditDocListState>({
    open: false,
    title: "",
    message: "",
    currentDocs: [],
    newDocName: "",
    isLoading: false,
  });

  const [selectedFileExtension, setSelectedFileExtension] =
    React.useState<string>(".pdf");

  const [callbacks, setCallbacks] = React.useState<{
    onConfirm: (docs: DocType[]) => void | Promise<void>;
    onCancel: () => void | Promise<void>;
  }>({
    onConfirm: () => {},
    onCancel: () => {},
  });

  const trigger = (config: EditDocListConfig) => {
    setState({
      open: true,
      title: config.title,
      message: config.message,
      currentDocs: config.currentDocs || [],
      newDocName: "",
      isLoading: false,
    });

    setSelectedFileExtension(".pdf"); // Reset to default
    setCallbacks({
      onConfirm: config.onConfirm,
      onCancel: config.onCancel || (() => {}),
    });
  };

  const handleAddDoc = () => {
    const docName = state.newDocName.trim();
    if (!docName) return;

    // Check for duplicate
    const isDuplicate = state.currentDocs.some(
      (doc) => doc.name.toLowerCase() === docName.toLowerCase(),
    );

    if (isDuplicate) {
      console.warn(`Document "${docName}" already exists in the list`);
      return;
    }

    // Create new DocType object
    const newDoc: DocType = {
      name: docName,
      fileExtension: selectedFileExtension,
      isTemplateType: false,
    };

    setState((prev) => ({
      ...prev,
      currentDocs: [...prev.currentDocs, newDoc],
      newDocName: "",
    }));
    setSelectedFileExtension(".pdf"); // Reset to default
  };

  const handleRemoveDoc = (index: number) => {
    const doc = state.currentDocs[index];
    if (doc.isTemplateType) {
      console.warn(`Cannot remove template type document: ${doc.name}`);
      return;
    }

    setState((prev) => ({
      ...prev,
      currentDocs: prev.currentDocs.filter((_, i) => i !== index),
    }));
  };

  const handleConfirm = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await callbacks.onConfirm(state.currentDocs);
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
    <EditDocListContext.Provider value={{ state, trigger }}>
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
          {state.message && (
            <Typography
              sx={{
                color: "#6b7280",
                fontSize: "0.95rem",
                lineHeight: "1.5",
                marginBottom: "1.5rem",
              }}
            >
              {state.message}
            </Typography>
          )}

          {/* Current Documents List Section */}
          <Box sx={{ marginBottom: "2rem" }}>
            <Typography
              sx={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "1rem",
              }}
            >
              เอกสารที่ต้องการ ({state.currentDocs.length})
            </Typography>

            {state.currentDocs.length === 0 ? (
              <Box
                sx={{
                  padding: "1.5rem",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "8px",
                  textAlign: "center",
                  border: "2px dashed #d1d5db",
                }}
              >
                <Typography sx={{ color: "#9ca3af", fontSize: "0.9rem" }}>
                  ยังไม่มีเอกสารในรายการ
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  maxHeight: "250px",
                  overflowY: "auto",
                  paddingRight: "0.5rem",
                }}
              >
                {state.currentDocs.map((doc, index) => {
                  const isRemovable = !doc.isTemplateType;
                  const displayName = doc.fileExtension
                    ? `${doc.name}${doc.fileExtension}`
                    : doc.name;

                  return (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.875rem 1rem",
                        backgroundColor: doc.isTemplateType
                          ? "#fef3c7"
                          : "#f0fdf4",
                        border: doc.isTemplateType
                          ? "1px solid #fcd34d"
                          : "1px solid #bbf7d0",
                        borderRadius: "8px",
                        transition: "all 0.2s",
                        "&:hover": {
                          backgroundColor: doc.isTemplateType
                            ? "#fde68a"
                            : "#dcfce7",
                          borderColor: doc.isTemplateType
                            ? "#fbbf24"
                            : "#86efac",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          flex: 1,
                        }}
                      >
                        <Box
                          sx={{
                            fontSize: "1.5rem",
                            color: doc.isTemplateType ? "#b45309" : "#059669",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "24px",
                          }}
                        >
                          📄
                        </Box>
                        <Box>
                          <Typography
                            sx={{
                              color: doc.isTemplateType ? "#92400e" : "#166534",
                              fontSize: "0.95rem",
                              fontWeight: 500,
                            }}
                          >
                            {displayName}
                          </Typography>
                          {doc.isTemplateType && (
                            <Typography
                              sx={{
                                color: "#b45309",
                                fontSize: "0.75rem",
                                fontStyle: "italic",
                                marginTop: "0.25rem",
                              }}
                            >
                              (Template)
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(index)}
                        disabled={state.isLoading || !isRemovable}
                        style={{
                          background:
                            isRemovable && !state.isLoading
                              ? "#ff4141"
                              : "#ffabaa",
                          border: "none",
                          color: "white",
                          cursor:
                            state.isLoading || !isRemovable
                              ? "not-allowed"
                              : "pointer",
                          fontSize: "1.25rem",
                          padding: "0",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "4px",
                          opacity: state.isLoading || !isRemovable ? 0.5 : 1,
                          transition: "background-color 0.2s",
                          fontWeight: "bold",
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          if (isRemovable && !state.isLoading) {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "#991b1b";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isRemovable && !state.isLoading) {
                            (
                              e.target as HTMLButtonElement
                            ).style.backgroundColor = "#dc2626";
                          }
                        }}
                        title={
                          !isRemovable
                            ? "Cannot remove template documents"
                            : "ลบเอกสาร"
                        }
                      >
                        ✕
                      </button>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Add New Document Section */}
          <Box>
            <Typography
              sx={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "1rem",
              }}
            >
              เพิ่มเอกสารใหม่
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-end",
                }}
              >
                <TextField
                  placeholder="ชื่อเอกสาร"
                  value={state.newDocName}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      newDocName: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddDoc();
                    }
                  }}
                  disabled={state.isLoading}
                  size="small"
                  variant="outlined"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                      "&:hover fieldset": {
                        borderColor: "#059669",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#059669",
                      },
                    },
                  }}
                />
                <FormControl
                  variant="outlined"
                  size="small"
                  disabled={state.isLoading}
                  sx={{
                    minWidth: "150px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                      "&:hover fieldset": {
                        borderColor: "#059669",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#059669",
                      },
                    },
                  }}
                >
                  <InputLabel>File Type</InputLabel>
                  <Select
                    value={selectedFileExtension}
                    onChange={(e) => setSelectedFileExtension(e.target.value)}
                    label="File Type"
                  >
                    {FILE_EXTENSIONS.map((ext) => (
                      <MenuItem key={ext.value} value={ext.value}>
                        {ext.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: "0.75rem",
                }}
              >
                <button
                  type="button"
                  onClick={handleAddDoc}
                  disabled={state.isLoading || !state.newDocName.trim()}
                  style={{
                    padding: "0.5rem 1.25rem",
                    backgroundColor:
                      state.newDocName.trim() && !state.isLoading
                        ? "#059669"
                        : "#d1d5db",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor:
                      state.newDocName.trim() && !state.isLoading
                        ? "pointer"
                        : "not-allowed",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    transition: "background-color 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    minHeight: "40px",
                    flex: 1,
                  }}
                  title="เพิ่มเอกสาร"
                >
                  <span>+</span> เพิ่ม
                </button>
              </Box>
            </Box>
          </Box>

          {/* Summary Box */}
          <Box
            sx={{
              marginTop: "1.5rem",
              padding: "1rem",
              backgroundColor: "#fef3c7",
              borderRadius: "8px",
              borderLeft: "4px solid #f59e0b",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.85rem",
                color: "#92400e",
              }}
            >
              รวมทั้งหมด: <strong>{state.currentDocs.length}</strong> เอกสาร
            </Typography>
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
            ยกเลิก
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={state.isLoading || state.currentDocs.length === 0}
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
            {state.isLoading ? "กำลังส่ง..." : "ยืนยันรายการ"}
          </Button>
        </DialogActions>
      </Dialog>
    </EditDocListContext.Provider>
  );
};
