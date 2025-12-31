import React, { useState, useEffect } from "react";
import { Modal } from "@mui/material";
import { formatDateToInput } from "@/lib/formattingLib";

export function ActualQuantityForm({
    isOpen,
    onClose,
    onConfirm,
    products = []
}) {
    const [form, setForm] = useState({
        products: [],
        note: ""
    });
    const [error, setError] = useState("");
    const today = new Date();

    useEffect(() => {
        // Initialize form with products and their ordered quantities as default actual quantities
        const initialProducts = products.map(product => ({
            productId: product.productId,
            productName: product.productName,
            orderedQuantity: product.quantity,
            actualQuantity: product.quantity, // Default to ordered quantity
            weightPerUnit: product.weightPerUnit,
            unitPrice: product.unitPrice
        }));
        
        setForm({ 
            products: initialProducts,
            note: "" 
        });
        setError("");
    }, [isOpen, products]);

    const handleQuantityChange = (productId, actualQuantity) => {
        const updatedProducts = form.products.map(product => {
            if (product.productId === productId) {
                return { ...product, actualQuantity: parseInt(actualQuantity) || 0 };
            }
            return product;
        });
        setForm({ ...form, products: updatedProducts });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Check if all products have actual quantities
        const hasInvalidQuantity = form.products.some(p => 
            p.actualQuantity === undefined || 
            p.actualQuantity === null || 
            p.actualQuantity < 0
        );
        
        if (hasInvalidQuantity) {
            setError("Vui lòng nhập số lượng thực tế hợp lệ cho tất cả sản phẩm.");
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
            aria-labelledby="actual-quantity-modal-title"
            aria-describedby="actual-quantity-modal-description"
        >
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl relative max-h-95/100 overflow-y-auto">
                    <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0 z-10">
                        <h2 className="text-2xl font-bold my-auto" id="actual-quantity-modal-title">
                            Nhập số lượng thực tế nhận hàng
                        </h2>
                        <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1 rounded" onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800">
                                <strong>Lưu ý:</strong> Số lượng trong đơn sẽ được cập nhật theo số lượng thực tế bạn nhập. Sau khi gửi phê duyệt, đơn sẽ chuyển sang trạng thái "Chờ phê duyệt kho". Ngày hết hạn sẽ được nhập bởi quản kho khi phê duyệt.
                            </p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Ghi chú
                                </label>
                                <textarea
                                    name="note"
                                    value={form.note || ""}
                                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                                    placeholder="Nhập ghi chú về những thay đổi số lượng (nếu có)..."
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-bold mb-3">Danh sách sản phẩm</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border border-gray-300">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 border-b text-left text-sm font-semibold">Tên sản phẩm</th>
                                                <th className="px-4 py-2 border-b text-center text-sm font-semibold">Số lượng đơn (Bao)</th>
                                                <th className="px-4 py-2 border-b text-center text-sm font-semibold">Số lượng thực tế (Bao) <span className="text-red-500">*</span></th>
                                                <th className="px-4 py-2 border-b text-center text-sm font-semibold">Chênh lệch</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {form.products.map((product, index) => {
                                                const difference = product.actualQuantity - product.orderedQuantity;
                                                return (
                                                    <tr key={product.productId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="px-4 py-2 border-b text-sm">{product.productName}</td>
                                                        <td className="px-4 py-2 border-b text-center text-sm">{product.orderedQuantity}</td>
                                                        <td className="px-4 py-2 border-b text-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={product.actualQuantity}
                                                                onChange={(e) => handleQuantityChange(product.productId, e.target.value)}
                                                                className="w-24 p-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </td>
                                                        <td className={`px-4 py-2 border-b text-center text-sm font-semibold ${
                                                            difference > 0 ? 'text-green-600' : 
                                                            difference < 0 ? 'text-red-600' : 
                                                            'text-gray-600'
                                                        }`}>
                                                            {difference > 0 && '+'}{difference}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
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
                                    className="px-6 py-2 rounded background-primary background-hovered text-white cursor-pointer transition-colors"
                                >
                                    Gửi phê duyệt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
