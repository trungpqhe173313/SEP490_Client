import { Modal } from "@mui/material";

function ConfirmModal({ isOpen, onClose, onConfirm, onCancel, message }) {
  const handleClose = () => onClose();
  const handleConfirmClick = () => onConfirm();
  const handleCancelClick = () => onCancel();

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-black/50 bg-opacity-50 fixed inset-0 z-50" onClick={handleClose} />
        <div className="bg-white w-96 p-6 rounded-md shadow-md z-51">
          <p className="my-4">{message}</p>
          <div className="flex justify-end space-x-4 mt-8">
            <button className="px-4 py-2 bg-green-600 text-white rounded-md cursor-pointer" onClick={handleConfirmClick}>
              Xác nhận
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md cursor-pointer" onClick={handleCancelClick}>
              Hủy bỏ
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
