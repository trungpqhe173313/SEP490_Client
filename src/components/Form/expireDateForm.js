import React, { useState, useEffect } from "react";
import { Modal } from "@mui/material";
import { formatDateToInput } from "@/lib/formattingLib";

export function ExpireDateForm({
    isOpen,
    onClose,
    onConfirm
}) {
    const [form, setForm] = useState({});
    const [error, setError] = useState("");
    const today = new Date();
    const [validExpireDate, setValidExpireDate] = useState(true);

    useEffect(() => {
        const threeMonthsLater = new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000);
        setForm({ expireDate: threeMonthsLater });
        setError("");
        setValidExpireDate(true);
    }, [isOpen]);

    const handleChange = (date) => {
        if (date < today) {
            setError("Ngày hết hạn phải là tương lai");
            setValidExpireDate(false);
        } else {
            setError("");
            setValidExpireDate(true);
        }
        setForm({ ...form, expireDate: date });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.expireDate) {
            setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
            return;
        }
        if (!validExpireDate) return;
        setError("");
        onConfirm(form);
        onClose();
    };

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby="product-modal-title"
            aria-describedby="product-modal-description"
        >
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-1/4 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden">
                    <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0">
                        <h2 className="text-2xl font-bold my-auto" id="product-modal-title">
                            Phê duyệt nhập kho - Nhập ngày hết hạn
                        </h2>
                        <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1" onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-4">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                    Ngày hết hạn
                                </label>
                                <input
                                    type="date"
                                    name="expireDate"
                                    value={form.expireDate && formatDateToInput(form.expireDate)}
                                    onChange={(e) => {
                                        const date = new Date(e.target.value);
                                        handleChange(date);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                                    onClick={onClose}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded background-primary background-hovered text-white cursor-pointer"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

