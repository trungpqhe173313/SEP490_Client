import { useState, useEffect } from "react";
import { Modal } from "@mui/material";
import { categoryService } from "@/services/category.service";

export function CategoryForm({
    isOpen,
    onClose,
    onConfirm,
    initialData
}) {
    const [form, setForm] = useState({});
    const [error, setError] = useState("");
    const today = new Date();

    // data for check exist
    const [categories, setCategories] = useState([]);

    const fetchCategories = async () => {
        try {
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                categoryName: ""
            };
            const response = await categoryService.getAllCategories(body);
            const categoryData = response.data.items.map((category) => ({
                categoryName: category.categoryName
            }));
            setCategories(categoryData);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

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
        clearErrors();
        fetchCategories();
    }, [initialData, isOpen]);

    const clearErrors = () => {
        setError("");
        setValidCategoryName(true);
        setErrorCategoryName("");
    };

    //Validation
    const [validCategoryName, setValidCategoryName] = useState(true);

    const [errorCategoryName, setErrorCategoryName] = useState("");

    const handleChange = (name, value) => {
        let newValue = value;
        switch (name) {
            case "isActive":
                newValue = value === "true";
                break;
            case "categoryName":
                const checkingCategoryName = value.trim().replace(/\s\s+/g, ' ');
                if (value.length > 60 || value.length < 6) {
                    setValidCategoryName(false);
                    setErrorCategoryName("Tên danh mục phải trong khoảng 6 đến 60 ky tự.");
                }
                const isExistingCategoryName = categories.find(category => category.categoryName.toLowerCase() === checkingCategoryName.toLowerCase() && category.categoryName !== initialData?.categoryName);
                if (isExistingCategoryName) {
                    setValidCategoryName(false);
                    setErrorCategoryName(`Danh mục "${checkingCategoryName}" đã tồn tại, vui lòng nhập tên khác.`);
                } else {
                    setValidCategoryName(true);
                    setErrorCategoryName("");
                }
                break;
            default:
                break;
        }
        setForm((prev) => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.categoryName === "") {
            setError("Vui lòng nhập tên danh mục.");
            return;
        }
        const invalidForms = !validCategoryName;
        if (invalidForms) {
            setError("Có nhập liệu không hợp lệ, vui lòng thử lại");
            return
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
                            <input
                                type="text"
                                name="categoryName"
                                value={form.categoryName}
                                onChange={(e) => handleChange("categoryName", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2 ${!validCategoryName ? "border-red-500" : "border-green-500"}`}
                                required
                            />
                            {!validCategoryName && <p className="text-red-500 text-xs">{errorCategoryName}</p>}
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Mô tả</label>
                                <p className="text-xs text-gray-500">Nhập mô tả</p>
                            </div>
                            <input type="text" name="description" value={form.description} onChange={(e) => handleChange("description", e.target.value)} className="w-full bg-white border border-gray-300 rounded px-3 py-2" />
                        </div>
                        {initialData && <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Trạng thái</label>
                                <p className="text-xs text-gray-500">Nhập trạng thái danh mục</p>
                            </div>
                            <select name="isActive" value={form.isActive ? "true" : "false"} onChange={(e) => handleChange("isActive", e.target.value)} className="w-full bg-white border border-gray-300 rounded px-3 py-2">
                                <option value="true">Đang hoạt động</option>
                                <option value="false">Dừng hoạt động</option>
                            </select>
                        </div>
                        }
                        {error && <div className="text-red-600 text-md text-right">{error}</div>}
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
