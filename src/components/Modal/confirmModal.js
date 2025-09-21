import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, question }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-black bg-opacity-50 fixed inset-0 z-50" onClick={onClose} />
      <div className="bg-white w-96 p-6 rounded-md shadow-md">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="my-4">{question}</p>
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-red-500 text-white rounded-md" onClick={onConfirm}>
            Xác nhận
          </button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded-md" onClick={onClose}>
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
