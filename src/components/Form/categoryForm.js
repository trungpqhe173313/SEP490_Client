import { useState, useEffect } from "react";
import { Modal } from "@mui/material";

export function CategoryForm({
    isOpen,
    onClose,
    onConfirm,
    initialData
}) {
    const [form, setForm] = useState({
        categoryName: "",
        description: "",
        isActive: true,
        createdAt: "",
        updatedAt: ""
    });
    const [error, setError] = useState("");
    const today = new Date();

    useEffect(() => {
        if (initialData) {
            setForm({
                categoryName: initialData.categoryName || "",
                description: initialData.description || "",
                isActive: initialData.isActive || true,
                createdAt: initialData.createdAt || today,
                updatedAt: today
            });
        } else {
            setForm({
                categoryName: "",
                description: "",
                createdAt: today
            });
        }
        setError("");
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        if (name === "isActive") newValue = value === "true";
        setForm((prev) => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.categoryName) {
            setError("Vui lòng nhập tên danh mục.");
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
                    <div className="w-full bg-green-600 text-white p-4 flex-row flex justify-between sticky top-0">
                        <h2 className="text-2xl font-bold my-auto">
                            {initialData ? "Cập nhật danh mục" : "Thêm danh mục mới"}
                        </h2>
                        <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1" onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4 p-8">
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Tên danh mục *</label>
                                <p className="text-xs text-gray-500">Nhập tên danh mục</p>
                            </div>
                            <input type="text" name="categoryName" value={form.categoryName} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2" required />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Mô tả</label>
                                <p className="text-xs text-gray-500">Nhập mô tả</p>
                            </div>
                            <input type="text" name="description" value={form.description} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2" />
                        </div>
                        {initialData && <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Trạng thái</label>
                                <p className="text-xs text-gray-500">Nhập trạng thái danh mục</p>
                            </div>
                            <select name="isActive" value={form.isActive ? "true" : "false"} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2">
                                <option value="true">Đang hoạt động</option>
                                <option value="false">Dừng hoạt động</option>
                            </select>
                        </div>
                        }
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
