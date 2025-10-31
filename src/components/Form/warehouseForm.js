import { useState, useEffect } from "react";
import { Modal } from "@mui/material";

export function WarehouseForm({
    isOpen,
    onClose,
    onConfirm,
    initialData
}) {
    const [form, setForm] = useState({
        id: 0,
        WarehouseName: "",
        Location: "",
        Capacity: 0,
        Status: "Active",
        Note: "",
        CreatedAt: ""
    });
    const [error, setError] = useState("");
    const today = new Date().toISOString().slice(0, 16);

    useEffect(() => {
        if (initialData) {
            setForm({
                id: initialData.id || 0,
                WarehouseName: initialData.WarehouseName || "",
                Location: initialData.Location || "",
                Capacity: initialData.Capacity || 0,
                Status: initialData.Status || "Active",
                Note: initialData.Note || "",
                CreatedAt: initialData.CreatedAt || today
            });
        } else {
            setForm({
                id: 0,
                WarehouseName: "",
                Location: "",
                Capacity: 0,
                Status: "Active",
                Note: "",
                CreatedAt: today
            });
        }
        setError("");
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        if (name === "id" || name === "Capacity") newValue = parseInt(value);
        setForm((prev) => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.WarehouseName || !form.Location) {
            setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
            return;
        }
        setError("");
        onConfirm(form);
        onClose();
    };

    return (
        <Modal open={isOpen} onClose={onClose}>
            <div className="fixed inset-0 flex items-center justify-center z-50" onClick={onClose}>
                <div className="bg-white rounded-lg shadow-lg w-full max-w-1/2 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden">
                    <div className="w-full background-primary text-white p-4 sticky top-0">
                        <h2 className="text-2xl font-bold my-auto">
                            {initialData ? "Cập nhật nhà kho" : "Thêm nhà kho mới"}
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4 p-8">
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">ID</label>
                                <p className="text-xs text-gray-500">Nhập ID nhà kho</p>
                            </div>
                            <input type="number" name="id" value={form.id} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2" required />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Tên nhà kho</label>
                                <p className="text-xs text-gray-500">Nhập tên nhà kho</p>
                            </div>
                            <input type="text" name="WarehouseName" value={form.WarehouseName} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2" required />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Địa điểm</label>
                                <p className="text-xs text-gray-500">Nhập địa điểm nhà kho</p>
                            </div>
                            <input type="text" name="Location" value={form.Location} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2" required />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Sức chứa</label>
                                <p className="text-xs text-gray-500">Nhập sức chứa nhà kho</p>
                            </div>
                            <input type="number" name="Capacity" value={form.Capacity} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2" />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Trạng thái</label>
                                <p className="text-xs text-gray-500">Chọn trạng thái nhà kho</p>
                            </div>
                            <select name="Status" value={form.Status} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2">
                                <option value="Active">Hoạt động</option>
                                <option value="Inactive">Không hoạt động</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Ghi chú</label>
                                <p className="text-xs text-gray-500">Nhập ghi chú nhà kho</p>
                            </div>
                            <input type="text" name="Note" value={form.Note} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2" />
                        </div>
                        {error && <div className="text-red-600 text-md">{error}</div>}
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer" onClick={onClose}>Hủy</button>
                            <button type="submit" className="px-4 py-2 rounded background-primary text-white background-hovered cursor-pointer">
                                {initialData ? "Cập nhật" : "Tạo mới"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}
