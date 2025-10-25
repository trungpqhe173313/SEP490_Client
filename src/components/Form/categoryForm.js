import { useState, useEffect } from "react";
import { Modal } from "@mui/material";

export function CategoryForm({
    isOpen,
    onClose,
    onConfirm,
    initialData
}) {
    const [form, setForm] = useState({
        id: 0,
        CategoryName: "",
        Description: "",
        CreatedAt: ""
    });
    const [error, setError] = useState("");
    const today = new Date().toISOString().slice(0, 16);

    useEffect(() => {
        if (initialData) {
            setForm({
                id: initialData.id || 0,
                CategoryName: initialData.CategoryName || "",
                Description: initialData.Description || "",
                CreatedAt: initialData.CreatedAt || today
            });
        } else {
            setForm({
                id: 0,
                CategoryName: "",
                Description: "",
                CreatedAt: today
            });
        }
        setError("");
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        if (name === "id") newValue = parseInt(value);
        setForm((prev) => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.CategoryName) {
            setError("Vui lòng nhập tên danh mục.");
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
                    <div className="w-full bg-green-600 text-white p-4">
                        <h2 className="text-2xl font-bold my-auto">
                            {initialData ? "Cập nhật danh mục" : "Thêm danh mục mới"}
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4 p-8">
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">ID Danh mục</label>
                                <p className="text-xs text-gray-500">Nhập ID danh mục</p>
                            </div>
                            <input type="number" name="id" value={form.id} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2" required />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Tên danh mục *</label>
                                <p className="text-xs text-gray-500">Nhập tên danh mục</p>
                            </div>
                            <input type="text" name="CategoryName" value={form.CategoryName} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2" required />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Mô tả</label>
                                <p className="text-xs text-gray-500">Nhập mô tả</p>
                            </div>
                            <input type="text" name="Description" value={form.Description} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2" />
                        </div>
                        {error && <div className="text-red-600 text-md">{error}</div>}
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer" onClick={onClose}>Hủy</button>
                            <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 cursor-pointer">
                                {initialData ? "Cập nhật" : "Tạo mới"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}
