import { useState, useEffect } from "react";
import { Modal } from "@mui/material";
import { formatLargeNumber } from "@/lib/formattingLib";

export function PayrollForm({
    isOpen,
    onClose,
    onConfirm,
    initialData,
    month,
    year
}) {
    const [form, setForm] = useState({});
    const [error, setError] = useState("");

    useEffect(() => {
        if (initialData) {
            setForm({
                payrollId: initialData.payrollId,
                paymentMethod: initialData.paymentMethod || "",
                note: initialData.note || "",
            });
        }
        setError("");
    }, [initialData, isOpen]);

    const handleChange = (name, value) => {
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.paymentMethod === "") {
            setError("Vui lòng nhập thông tin bắt buộc.");
            return;
        }
        setError("");
        onConfirm(form);
        onClose();
    };

    return (
        <Modal open={isOpen} onClose={onClose}>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-1/2 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden">
                    <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0">
                        <h2 className="text-2xl font-bold my-auto">
                            Thanh toán lương - Mã bảng lương: {form.payrollId}
                        </h2>
                        <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1" onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="px-8 pt-8 w-full">
                        <div className="bg-gray-50 rounded p-4 border border-gray-300">
                            <p className="text-md font-bold">Nhân viên: {initialData?.employeeName}</p>
                            <p className="text-md font-bold">Tháng: {month}/{year}</p>
                            <p className="text-md font-bold">Tổng tiền lương: {formatLargeNumber(initialData?.totalAmount)}đ</p>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4 p-8">
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Phương thức thanh toán</label>
                                <p className="text-xs text-gray-500">Chọn phương thức thanh toán</p>
                            </div>
                            <select
                                name="paymentMethod"
                                value={form.paymentMethod}
                                onChange={(e) => handleChange("paymentMethod", e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                                required
                            >
                                <option value="">-- Nhập hình thức thanh toán --</option>
                                <option value="TienMat">Tiền mặt</option>
                                <option value="NganHang">Chuyển khoản</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Ghi chú</label>
                                <p className="text-xs text-gray-500">Nhập ghi chú</p>
                            </div>
                            <textarea
                                name="note"
                                value={form.note}
                                onChange={(e) => handleChange("note", e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        {error && <div className="text-red-600 text-md text-right">{error}</div>}
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer" onClick={onClose}>Hủy</button>
                            <button type="submit" className="px-4 py-2 rounded background-primary text-white background-hovered cursor-pointer">
                                Thanh toán
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}