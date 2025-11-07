import { Modal, SvgIcon } from "@mui/material";
import ErrorIcon from '@mui/icons-material/Error';

function ConfirmModal({ isOpen, onClose, onConfirm, onCancel, message }) {
  const handleClose = () => onClose();
  const handleConfirmClick = () => onConfirm();
  const handleCancelClick = () => onCancel();

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-black/50 bg-opacity-50 fixed inset-0 z-50" onClick={handleClose} />
        <div className="bg-white w-96 p-6 rounded-md shadow-md z-51 flex flex-col text-center">
          <h2 className="text-2xl font-semibold mb-2">Thông báo</h2>
          <SvgIcon component={ErrorIcon} sx={{ color: 'orange', fontSize: 80, border: '2px solid orange', borderRadius: '50%', marginTop: 1, marginBottom: 2 , padding: 1, marginX: 'auto' }} />
          <p className="mb-4">{message}</p>
          <div className="flex justify-end space-x-4">
            <button className="px-4 py-2 background-primary text-white rounded-md cursor-pointer" onClick={handleConfirmClick}>
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
