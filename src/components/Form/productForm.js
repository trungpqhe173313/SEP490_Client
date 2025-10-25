import { useState, useEffect } from "react";
import { Modal } from "@mui/material";

export function ProductForm({
    isOpen,
    onClose,
    onConfirm,
    initialData
}) {
    const [form, setForm] = useState({
        id: 0,
        ProductName: "",
        ImageURL: "https://picsum.photos/200",
        Code: "",
        WeightPerUnit: "",
        Description: "",
        IsAvailable: 1,
        SupplierID: "",
        CategoryID: "",
        CreatedAt: "",
        UpdatedAt: ""
    });
    const [error, setError] = useState("");
    const today = new Date();

    useEffect(() => {
        if (initialData) {
            setForm({
                id: initialData.id || 0,
                ProductName: initialData.ProductName || "",
                ImageURL: initialData.ImageURL || "https://picsum.photos/200",
                Code: initialData.Code || "",
                WeightPerUnit: initialData.WeightPerUnit || "",
                Description: initialData.Description || "",
                IsAvailable: initialData.IsAvailable ?? 1,
                SupplierID: initialData.SupplierID || "",
                CategoryID: initialData.CategoryID || "",
                CreatedAt: initialData.CreatedAt || "",
                UpdatedAt: today
            });
        } else {
            setForm({
                id: 0,
                ProductName: "",
                ImageURL: "https://picsum.photos/200",
                Code: "",
                WeightPerUnit: "",
                Description: "",
                IsAvailable: 1,
                SupplierID: "",
                CategoryID: "",
                CreatedAt: today,
                UpdatedAt: today
            });
        }
        setError("");
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        if (["id", "WeightPerUnit"].includes(name)) {
            newValue = parseInt(value);
        }
        setForm((prev) => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.ProductName || !form.Code || !form.WeightPerUnit) {
            setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
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
            <div className="fixed inset-0 flex items-center justify-center z-50" onClick={onClose}>
                <div className="bg-white rounded-lg shadow-lg w-full max-w-1/2 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden">
                    <div className="w-full bg-green-600 text-white p-4">
                        <h2 className="text-2xl font-bold my-auto" id="product-modal-title">
                            {initialData ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 p-8">
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">ID </label>
                                <p className="text-xs text-gray-500">Nhập ID sản phẩm</p>
                            </div>
                            <input
                                type="number"
                                name="id"
                                value={form.id}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Tên sản phẩm *</label>
                                <p className="text-xs text-gray-500">Nhập tên sản phẩm</p>
                            </div>
                            <input
                                type="text"
                                name="ProductName"
                                value={form.ProductName}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Mã </label>
                                <p className="text-xs text-gray-500">Nhập mã sản phẩm</p>
                            </div>
                            <input
                                type="text"
                                name="Code"
                                value={form.Code}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Khối lượng </label>
                                <p className="text-xs text-gray-500">Nhập khối lượng sản phẩm</p>
                            </div>
                            <input
                                type="number"
                                name="WeightPerUnit"
                                value={form.WeightPerUnit}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Mô tả </label>
                                <p className="text-xs text-gray-500">Nhập mô tả sản phẩm</p>
                            </div>
                            <input
                                type="text"
                                name="Description"
                                value={form.Description}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Nhà cung cấp</label>
                                <p className="text-xs text-gray-500">Nhập tên nhà cung cấp</p>
                            </div>
                            <input
                                type="text"
                                name="SupplierID"
                                value={form.SupplierID}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Danh mục</label>
                                <p className="text-xs text-gray-500">Nhập tên danh mục</p>
                            </div>
                            <input
                                type="text"
                                name="CategoryID"
                                value={form.CategoryID}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Trạng thái</label>
                                <p className="text-xs text-gray-500">Nhập trạng thái sản phẩm</p>
                            </div>
                            <select
                                name="IsAvailable"
                                value={form.IsAvailable}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                            >
                                <option value={1}>Còn hàng</option>
                                <option value={0}>Hết hàng</option>
                            </select>
                        </div>
                        {error && <div className="text-red-600 text-md">{error}</div>}
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
                                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                            >
                                {initialData ? "Cập nhật" : "Tạo mới"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    )
}       
