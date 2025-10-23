import { useState, useEffect } from "react";
import { Modal } from "@mui/material";

export function ProductForm({
    isOpen,
    onClose,
    onConfirm,
    initialData
}) {
    const [form, setForm] = useState({
        ProductName: "",
        Code: "",
        WeightPerUnit: "",
        StockQuantity: "",
        IsAvailable: 1,
        SupplierID: "",
        CategoryID: ""
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (initialData) {
            setForm({
                ProductName: initialData.ProductName || "",
                Code: initialData.Code || "",
                WeightPerUnit: initialData.WeightPerUnit || "",
                StockQuantity: initialData.StockQuantity || "",
                IsAvailable: initialData.IsAvailable ?? 1,
                SupplierID: initialData.SupplierID || "",
                CategoryID: initialData.CategoryID || ""
            });
        } else {
            setForm({
                ProductName: "",
                Code: "",
                WeightPerUnit: "",
                StockQuantity: "",
                IsAvailable: 1,
                SupplierID: "",
                CategoryID: ""
            });
        }
        setError("");
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.ProductName || !form.Code || !form.WeightPerUnit || !form.StockQuantity) {
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
            <div className="fixed inset-0 flex items-center justify-center rounded-xl z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-lg relative">
                    <div className="w-full bg-green-600 text-white p-4">
                        <h2 className="text-2xl font-bold my-auto" id="product-modal-title">
                            {initialData ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 p-8">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tên sản phẩm *</label>
                            <input
                                type="text"
                                name="ProductName"
                                value={form.ProductName}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Mã *</label>
                            <input
                                type="text"
                                name="Code"
                                value={form.Code}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium mb-1">Khối lượng *</label>
                                <input
                                    type="number"
                                    name="WeightPerUnit"
                                    value={form.WeightPerUnit}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium mb-1">Số lượng *</label>
                                <input
                                    type="number"
                                    name="StockQuantity"
                                    value={form.StockQuantity}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium mb-1">Nhà cung cấp</label>
                                <input
                                    type="text"
                                    name="SupplierID"
                                    value={form.SupplierID}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium mb-1">Danh mục</label>
                                <input
                                    type="text"
                                    name="CategoryID"
                                    value={form.CategoryID}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Trạng thái</label>
                            <select
                                name="IsAvailable"
                                value={form.IsAvailable}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            >
                                <option value={1}>Còn hàng</option>
                                <option value={0}>Hết hàng</option>
                            </select>
                        </div>
                        {error && <div className="text-red-600 text-sm">{error}</div>}
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
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
    );
}
