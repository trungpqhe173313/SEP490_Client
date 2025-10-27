import { useState, useEffect } from "react";
import { Modal } from "@mui/material";

export function ProductForm({
    isOpen,
    onClose,
    onConfirm,
    initialData
}) {
    const [form, setForm] = useState({
        productName: "",
        imageURL: "https://picsum.photos/200",
        code: "",
        weightPerUnit: "",
        quantity: 0,
        description: "",
        isAvailable: true,
        warehouseId: 1,
        supplierId: "",
        categoryId: "",
        updatedAt: ""
    });
    const [error, setError] = useState("");
    const today = new Date();

    useEffect(() => {
        if (initialData) {
            setForm({
                productName: initialData.productName || "",
                imageURL: initialData.imageURL || "https://picsum.photos/200",
                code: initialData.code || "",
                weightPerUnit: initialData.weightPerUnit || "",
                quantity: initialData.quantity || 0,
                description: initialData.description || "",
                isAvailable: initialData.isAvailable ?? true,
                warehouseId: initialData.warehouseId || 1,
                supplierId: initialData.supplierId || "",
                categoryId: initialData.categoryId || "",
                updatedAt: today
            });
        } else {
            setForm({
                productName: "",
                imageURL: "https://picsum.photos/200",
                code: "",
                weightPerUnit: "",
                quantity: 0,
                description: "",
                isAvailable: true,
                warehouseId: 1,
                supplierId: "",
                categoryId: "",
            });
        }
        setError("");
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        if (name === "isAvailable") {
            newValue = value === "true";
        } else if (["weightPerUnit"].includes(name)) {
            newValue = parseInt(value);
        }
        setForm((prev) => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.productName || !form.code || !form.weightPerUnit) {
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
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-1/2 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden">
                    <div className="w-full bg-green-600 text-white p-4 flex-row flex justify-between sticky top-0">
                        <h2 className="text-2xl font-bold my-auto" id="product-modal-title">
                            {initialData ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
                        </h2>
                        <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1" onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 p-8">
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Tên sản phẩm</label>
                                <p className="text-xs text-gray-500">Nhập tên sản phẩm</p>
                            </div>
                            <input
                                type="text"
                                name="productName"
                                value={form.productName}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Mã</label>
                                <p className="text-xs text-gray-500">Nhập mã sản phẩm</p>
                            </div>
                            <input
                                type="text"
                                name="code"
                                value={form.code}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Khối lượng</label>
                                <p className="text-xs text-gray-500">Nhập khối lượng sản phẩm</p>
                            </div>
                            <input
                                type="number"
                                name="weightPerUnit"
                                value={form.weightPerUnit}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Mô tả</label>
                                <p className="text-xs text-gray-500">Nhập mô tả sản phẩm</p>
                            </div>
                            <input
                                type="text"
                                name="description"
                                value={form.description}
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
                                type="number"
                                name="supplierId"
                                value={form.supplierId}
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
                                type="number"
                                name="categoryId"
                                value={form.categoryId}
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
                                name="isAvailable"
                                value={form.isAvailable ? "true" : "false"}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                            >
                                <option value="true">Còn hàng</option>
                                <option value="false">Hết hàng</option>
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
                                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white cursor-pointer"
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

