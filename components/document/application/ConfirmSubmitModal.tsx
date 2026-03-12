"use client";

import React from "react";

interface ConfirmSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmSubmitModal: React.FC<ConfirmSubmitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay - พื้นหลังสีเข้มโปร่ง */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header - แถบสีเขียว - จัดกึ่งกลาง */}
        <div className="bg-primary px-6 py-4 text-center">
          <h3 className="text-white text-lg font-bold">ยืนยันการอนุมัติ</h3>
        </div>

        {/* Body - เนื้อหาข้อความ - จัดกึ่งกลาง */}
        <div className="px-6 py-8 text-center">
          <p className="text-gray-700 text-base leading-7">
            โปรดตรวจสอบข้อมูลอย่างละเอียด
            <br />
            เมื่อกดปุ่ม &quot;ยืนยัน&quot; แล้วไม่สามารถย้อนกลับได้
          </p>
        </div>

        {/* Footer - ปุ่มยกเลิก / ยืนยัน - จัดกึ่งกลาง */}
        <div className="px-6 py-4 bg-gray-50 flex justify-center gap-4">
          {/* ปุ่มยกเลิก - สีเหลือง */}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-yellow-400 text-gray-700 rounded-lg font-medium text-sm hover:bg-yellow-500 transition-colors"
          >
            ยกเลิก
          </button>

          {/* ปุ่มยืนยัน - สีเขียว */}
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSubmitModal;
