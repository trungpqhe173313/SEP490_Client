import React, { useState, useEffect } from "react";
import { Modal } from "@mui/material";

export function RejectForm({
    isOpen,
    onClose,
    onConfirm
}) {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        setReason("");
        setError("");
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!reason || reason.trim() === "") {
            setError("Vui lòng nhập lý do từ chối.");
            return;
        }

        setError("");
        onConfirm({ reason: reason.trim() });
        onClose();
    };

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby="reject-modal-title"
            aria-describedby="reject-modal-description"
        >
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative">
                    <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0">
                        <h2 className="text-2xl font-bold my-auto" id="reject-modal-title">
                            Từ chối phiếu nhập kho
                        </h2>
                        <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1 rounded" onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-800">
                                <strong>Lưu ý:</strong> Khi từ chối, đơn sẽ quay về trạng thái "Đang kiểm" để nhân viên có thể sửa lại số lượng. Vui lòng nhập rõ lý do từ chối.
                            </p>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Lý do từ chối <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Nhập lý do từ chối (ví dụ: Số lượng không khớp với phiếu xuất của nhà cung cấp, cần kiểm tra lại...)"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    rows="5"
                                    required
                                />
                            </div>

                            {error && <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">{error}</div>}
                            
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button
                                    type="button"
                                    className="px-6 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white cursor-pointer transition-colors"
                                    onClick={onClose}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-colors"
                                >
                                    Từ chối phiếu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
