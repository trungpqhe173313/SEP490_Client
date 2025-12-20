import React, { useState, useEffect } from "react";
import { Modal } from "@mui/material";
import { productionService } from "@/services/production.service";

export function DeviceForm({
    isOpen,
    onClose,
    onConfirm
}) {
    const [form, setForm] = useState({});
    const [error, setError] = useState("");
    const [devices, setDevices] = useState([]);

    const fetchDevices = async () => {
        try {
            const response = await productionService.getAllDevices();
            const deviceData = response.data
            setDevices(deviceData);
        } catch (error) {
            console.error("Error fetching devices:", error);
        } 
    }

    useEffect(() => {
        fetchDevices();
        setForm({});
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.deviceCode) {
            setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
            return;
        }
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
                            Chọn thiết bị
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
                                    Thiết bị cân:
                                </label>
                                <select
                                    id="name"
                                    name="deviceCode"
                                    value={form.deviceCode || ""}
                                    onChange={(e) => setForm({ ...form, deviceCode: e.target.value })}
                                    className="w-full p-2 border border-gray-400 rounded"
                                    required
                                >
                                    <option value="">-- Chọn thiết bị --</option>
                                    {devices.map((device) => (
                                        <option key={device.deviceCode} value={device.deviceCode}>
                                            {device.deviceName}
                                        </option>
                                    ))}
                                </select>
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

