import { useState, useEffect, useRef } from "react";
import { Modal } from "@mui/material";
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";
import { supplierService } from "@/services/supplier.service";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import { useRequiredHighlight } from "@/hooks/useRequiredHighlight";
import Image from "next/image";

export function ProductForm({
    isOpen,
    onClose,
    onConfirm,
    initialData
}) {
    const [form, setForm] = useState({});
    const [error, setError] = useState("");
    const today = new Date();

    //data for check exist
    const [products, setProducts] = useState([]);

    //Autocomplete
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [supplierLoading, setSupplierLoading] = useState(false);
    const [categoryLoading, setCategoryLoading] = useState(false);

    const fetchProducts = async () => {
        try {
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                productName: ""
            };
            const response = await productService.getAllProducts(body);
            const productData = response.data.items.map((product) => ({
                productName: product.productName,
                code: product.code
            }));
            setProducts(productData);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    const fetchSuppliers = async (value) => {
        try {
            setSupplierLoading(true);
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                isActive: true,
                supplierName: value
            };
            const response = await supplierService.getAllSuppliers(body);
            const supplierData = response.data.items.map((supplier) => ({
                supplierId: supplier.supplierId,
                supplierName: supplier.supplierName
            }));
            setSuppliers(supplierData);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        } finally {
            setSupplierLoading(false);
        }
    }

    const fetchCategories = async (value) => {
        try {
            setCategoryLoading(true);
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                categoryName: value
            };
            const response = await categoryService.getAllCategories(body);
            const categoryData = response.data.items.map((category) => ({
                categoryId: category.categoryId,
                categoryName: category.categoryName
            }));
            setCategories(categoryData);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setCategoryLoading(false);
        }
    }

    useEffect(() => {
        fetchCategories();
        fetchSuppliers();
        if (initialData) {
            setForm({
                productName: initialData.productName || "",
                image: initialData.image || "",
                code: initialData.code || "",
                weightPerUnit: initialData.weightPerUnit || "",
                sellingPrice: initialData.sellingPrice || 0,
                description: initialData.description || "",
                isAvailable: initialData.isAvailable ?? true,
                quantity: initialData.quantity || 0,
                supplierId: suppliers.find(supplier => supplier.supplierName === initialData.supplierName)?.supplierId || "",
                categoryId: categories.find(category => category.categoryName === initialData.categoryName)?.categoryId || "",
                updatedAt: today
            });
            setSelectedSupplier(initialData);
            setSelectedCategory(initialData);
        } else {
            setForm({
                productName: "",
                image: "",
                code: "",
                weightPerUnit: "",
                sellingPrice: 0,
                description: "",
                isAvailable: true,
                supplierId: "",
                categoryId: "",
            });
        }
        setError("");
        fetchProducts();
    }, [initialData, isOpen]);

    //Vallidation
    const formRef = useRef(null);
    const { handleSubmitCheck, clearOnInput } = useRequiredHighlight();

    const [validWeightPerUnit, setValidWeightPerUnit] = useState(true);
    const [validCode, setValidCode] = useState(true);
    const [validProductName, setValidProductName] = useState(true);
    const [validSellingPrice, setValidSellingPrice] = useState(true);

    const [errorWeightPerUnit, setErrorWeightPerUnit] = useState("");
    const [errorCode, setErrorCode] = useState("");
    const [errorProductName, setErrorProductName] = useState("");
    const [errorSellingPrice, setErrorSellingPrice] = useState("");

    const handleChange = (name, value) => {
        let newValue = value;
        switch (name) {
            case "isAvailable":
                newValue = value === "true";
                break;
            case "weightPerUnit":
                newValue = parseInt(value);
                if (newValue < 0) {
                    setValidWeightPerUnit(false);
                    setErrorWeightPerUnit("Khối lượng của sản phẩm phải lớn hơn 0");
                } else {
                    setValidWeightPerUnit(true);
                    setErrorWeightPerUnit("");
                }
                break;
            case "sellingPrice":
                newValue = parseInt(value);
                if (newValue < 0) {
                    setValidSellingPrice(false);
                    setErrorSellingPrice("Giá bán phải lớn hơn 0");
                } else {
                    setValidSellingPrice(true);
                    setErrorSellingPrice("");
                }
                break;
            case "code":
                const checkingCode = value.trim().replace(/\s\s+/g, ' ');
                const isExistingCode = products.find(product => product.code.toLowerCase() === checkingCode.toLowerCase() && product.code !== initialData?.code);
                if (isExistingCode) {
                    setValidCode(false);
                    setErrorCode(`Mã "${checkingCode}" đã tồn tại, vui lòng nhập mã khác`);
                } else {
                    setValidCode(true);
                    setErrorCode("");
                }
                break;
            case "productName":
                const checkingProductName = value.trim().replace(/\s\s+/g, ' ');
                if (value.length > 60 || value.length < 6) {
                    setValidProductName(false);
                    setErrorProductName("Tên sản phẩm phải trong khoảng 6 đến 60 ký tự");
                }
                const isExistingProductName = products.find(product => product.productName.toLowerCase() === checkingProductName.toLowerCase() && product.productName !== initialData?.productName);
                if (isExistingProductName) {
                    setValidProductName(false);
                    setErrorProductName(`Sản phẩm "${checkingProductName}" đã tồn tại, vui lòng nhập tên khác`);
                } else {
                    setValidProductName(true);
                    setErrorProductName("");
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

    const handleChangeDropdown = (item) => {
        if (item) {
            if (item.supplierId) {
                setSelectedSupplier(item);
                handleChange("supplierId", item.supplierId);
            } else if (item.categoryId) {
                setSelectedCategory(item);
                handleChange("categoryId", item.categoryId);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const valid = handleSubmitCheck(formRef.current);
        if (!valid) {
            setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
            return
        }
        const invalidForms = !validWeightPerUnit || !validCode || !validProductName;
        if (invalidForms) {
            setError("Có nhập liệu không hợp lệ, vui lòng thử lại")
            return
        }
        setError("");
        onConfirm(form);
        onClose();
    };

    const handleFileChange = (file) => {
        if (!file) return;
        const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedImageTypes.includes(file.type)) {
            setError("Chỉ chấp nhận định dạng ảnh: JPG, PNG, GIF, WEBP");
            return;
        }
        setError("");
        handleChange('image', file);
    };

    const formatImageUrl = (url) => typeof url === 'string' ? url : URL.createObjectURL(url);

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby="product-modal-title"
            aria-describedby="product-modal-description"
        >
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-1/2 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden">
                    <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0">
                        <h2 className="text-2xl font-bold my-auto" id="product-modal-title">
                            {initialData ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
                        </h2>
                        <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1" onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} ref={formRef} onInput={clearOnInput} className="space-y-4 p-8">
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Hình ảnh</label>
                                <p className="text-xs text-gray-500">Chọn hình ảnh cho sản phẩm (JPG, PNG, GIF, WEBP)</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <label
                                    htmlFor="image"
                                    className="px-3 py-2 rounded-md background-primary text-white cursor-pointer"
                                >
                                    Chọn hình ảnh
                                </label>
                                {form.image && <button
                                    type="button"
                                    className="px-3 py-2 rounded-md bg-red-600 text-white cursor-pointer"
                                    onClick={() => handleChange("image", "")}
                                >
                                    Xóa hình ảnh
                                </button>}
                            </div>
                            <input
                                id="image"
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={(e) => handleFileChange(e.target.files?.[0])}
                                hidden
                            />
                            {form.image && (
                                <div className="mt-2 flex justify-center">
                                    <Image src={formatImageUrl(form.image)} alt="Preview" width={400} height={400} className="w-1/2 h-auto rounded-full aspect-square object-cover border border-black" />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Tên sản phẩm</label>
                                <p className="text-xs text-gray-500">Nhập tên sản phẩm</p>
                            </div>
                            <input
                                type="text"
                                name="productName"
                                value={form.productName}
                                onChange={(e) => handleChange("productName", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2 ${!validProductName ? "border-red-500" : "border-green-500"}`}
                                required
                            />
                            {!validProductName && <p className="text-red-500 text-xs italic">{errorProductName}</p>}
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
                                onChange={(e) => handleChange("code", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2 ${!validCode ? "border-red-500" : "border-green-500"}`}
                                required
                            />
                            {!validCode && <p className="text-red-500 text-xs italic">{errorCode}</p>}
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Khối lượng</label>
                                <p className="text-xs text-gray-500">Nhập khối lượng sản phẩm</p>
                            </div>
                            <input
                                type="number"
                                name="weightPerUnit"
                                value={form.weightPerUnit || ""}
                                onChange={(e) => handleChange("weightPerUnit", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2 ${!validWeightPerUnit ? "border-red-500" : "border-green-500"}`}
                                required
                            />
                            {!validWeightPerUnit && <p className="text-red-500 text-xs italic">{errorWeightPerUnit}</p>}
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Giá bán</label>
                                <p className="text-xs text-gray-500">Nhập giá bán sản phẩm</p>
                            </div>
                            <input
                                type="number"
                                name="sellingPrice"
                                value={form.sellingPrice || ""}
                                onChange={(e) => handleChange("sellingPrice", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2 ${!validSellingPrice ? "border-red-500" : "border-green-500"}`}
                                required
                            />
                            {!validSellingPrice && <p className="text-red-500 text-xs italic">{errorSellingPrice}</p>}
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
                                onChange={(e) => handleChange("description", e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Nhà cung cấp</label>
                                <p className="text-xs text-gray-500">Nhập tên nhà cung cấp</p>
                            </div>
                            <AutocompleteCommon
                                name="supplierId"
                                value={selectedSupplier}
                                loading={supplierLoading}
                                options={suppliers}
                                onSelect={(item) => handleChangeDropdown(item)}
                                onSearch={fetchSuppliers}
                                getOptionLabel={(option) => option.supplierName}
                                getOptionKey={(option) => option.supplierId}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Danh mục</label>
                                <p className="text-xs text-gray-500">Nhập tên danh mục</p>
                            </div>
                            <AutocompleteCommon
                                name="categoryId"
                                value={selectedCategory}
                                loading={categoryLoading}
                                options={categories}
                                onSelect={(item) => handleChangeDropdown(item)}
                                onSearch={fetchCategories}
                                getOptionLabel={(option) => option.categoryName}
                                getOptionKey={(option) => option.categoryId}
                            />
                        </div>
                        {initialData && <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Trạng thái</label>
                                <p className="text-xs text-gray-500">Nhập trạng thái sản phẩm</p>
                            </div>
                            <select
                                name="isAvailable"
                                value={form.isAvailable ? "true" : "false"}
                                onChange={(e) => handleChange("isAvailable", e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                            >
                                <option value="true">Còn hàng</option>
                                <option value="false">Hết hàng</option>
                            </select>
                        </div>
                        }
                        {error && <div className="text-red-600 text-md text-right">{error}</div>}
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
                                {initialData ? "Cập nhật" : "Tạo mới"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    )
}

