"use client";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { supplierService } from "@/services/supplier.service";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRef } from "react";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";

import TableCommon from "@/components/Table/table";
import { ProductForm } from "@/components/Form/productForm";
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";
import { formatLargeNumber, formatDateToInput } from '@/lib/formattingLib';

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import ProductResultModal from "@/components/Modal/productResultModal";
import Loader from "@/components/Loader/loader";
import DateInput from "@/components/Input/DateInput";

export default function Products() {
    // Data state
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);
    const [modalImportData, setModalImportData] = useState([]);
    const [modalImportOpen, setModalImportOpen] = useState(false);
    const [modalImportMessage, setModalImportMessage] = useState("");

    // Filter state
    const [filterProductName, setFilterProductName] = useState("");
    const [filterCode, setFilterCode] = useState("");
    const [filterSupplierId, setFilterSupplierId] = useState(null);
    const [filterCategoryId, setFilterCategoryId] = useState(null);
    const [filterisAvailable, setFilterisAvailable] = useState(null);
    const [filterFromWeightPerUnit, setFilterFromWeightPerUnit] = useState(0);
    const [filterToWeightPerUnit, setFilterToWeightPerUnit] = useState(0);
    const [filterFromCreatedDate, setFilterFromCreatedDate] = useState("");
    const [filterToCreatedDate, setFilterToCreatedDate] = useState("");

    const [errorToCreatedDate, setErrorToCreatedDate] = useState("");
    const [errorToWeightPerUnit, setErrorToWeightPerUnit] = useState("");

    //Autocomplete
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [supplierLoading, setSupplierLoading] = useState(false);
    const [categoryLoading, setCategoryLoading] = useState(false);

    // Pagination state
    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(5);
    const [totalCount, setTotalCount] = useState(0);

    // Loading state
    const { loading, setLoading } = useLoading();
    const { isLogin, user, refreshUserInfo } = useLogin();
    const router = useRouter();
    const buttonRef = useRef(null);
    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Manager"];

    // Table headers
    const headerData = [
        { key: "productId", label: "ID sản phẩm", customValue: (item) => item.productId && <div>{item.productId}</div> },
        { key: "productName", label: "Tên sản phẩm", customValue: (item) => item.productName && <div>{item.productName}</div> },
        { key: "code", label: "Mã sản phẩm", customValue: (item) => item.code && <div>{item.code}</div> },
        { key: "weightPerUnit", label: "Khối lượng", customValue: (item) => item.weightPerUnit && <div>{item.weightPerUnit}</div> },
        { key: "sellingPrice", label: "Giá bán", customValue: (item) => item.sellingPrice && <div>{formatLargeNumber(item.sellingPrice)}đ</div> },
        { key: "supplierName", label: "Nhà cung cấp", customValue: (item) => item.supplierName && <div>{item.supplierName}</div> },
        { key: "categoryName", label: "Danh mục", customValue: (item) => item.categoryName && <div>{item.categoryName}</div> },
        { key: "isAvailable", label: "Trạng thái", customValue: (item) => item.isAvailable === true ? <div className="text-green-600">Còn hàng</div> : <div className="text-red-600">Hết hàng</div> },
        { key: "createdAt", label: "Ngày tạo", customValue: (item) => item.createdAt && <div>{new Date(item.createdAt).toLocaleString('vi-VN')}</div> }
    ];

    // Pagination handlers
    const handleChangePage = (event, newPage) => setPageIndex(newPage);
    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    // Fetch products
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const body = {
                pageIndex: pageIndex + 1,
                pageSize: rowPerPage,
                productName: filterProductName,
                code: filterCode,
                supplierId: filterSupplierId,
                categoryId: filterCategoryId,
                isAvailable: filterisAvailable === "true" ? true : filterisAvailable === "false" ? false : null,
                minWeightPerUnit: filterFromWeightPerUnit === 0 || filterToWeightPerUnit === "" ? null : parseInt(filterFromWeightPerUnit),
                maxWeightPerUnit: filterToWeightPerUnit === 0 || filterToWeightPerUnit === "" ? null : parseInt(filterToWeightPerUnit),
                createdFrom: filterFromCreatedDate || null,
                createdTo: filterToCreatedDate || null
            };
            const response = await productService.getAllProducts(body);
            setProducts(response.data.items);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

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
                isActive: true,
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
        if (!pageReady) return;
        fetchSuppliers("");
        fetchCategories("");
    }, [pageReady]);

    useEffect(() => {
        refreshUserInfo();
    }, []);

    useEffect(() => {
        if (loading) return;

        if (!isLogin) {
            router.push("/login");
            return;
        }

        if (user?.roles && user.roles.some((r) => pageRole.includes(r))) {
            setPageReady(true);
        } else {
            router.push("/");
        }

    }, [isLogin, user, loading]);

    useEffect(() => {
        if (!pageReady) return;
        fetchProducts();
    }, [pageIndex, rowPerPage, pageReady]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            buttonRef.current?.click();
        }
    };

    const handleChangeDropdown = (item, field) => {
        if (item) {
            if (item.supplierId) {
                setSelectedSupplier(item);
                setFilterSupplierId(item.supplierId);
            } else if (item.categoryId) {
                setSelectedCategory(item);
                setFilterCategoryId(item.categoryId);
            }
        } else {
            if (field === "supplierId") {
                setSelectedSupplier(null);
                setFilterSupplierId(null);
            } else if (field === "categoryId") {
                setSelectedCategory(null);
                setFilterCategoryId(null);
            }
        }
    };

    useEffect(() => {
        validateFields();
    }, [filterFromWeightPerUnit, filterToWeightPerUnit, filterFromCreatedDate, filterToCreatedDate]);

    const validateFields = () => {
        if (filterFromWeightPerUnit < 0 || filterToWeightPerUnit < 0) {
            setErrorToWeightPerUnit("Khối lượng phải lớn hơn 0");
            return false;
        }
        if (filterToCreatedDate && filterToCreatedDate < filterFromCreatedDate) {
            setErrorToCreatedDate("Ngày tạo đến phải lớn hơn ngày tạo từ");
            return false;
        }
        if (filterToWeightPerUnit !== 0 && parseInt(filterToWeightPerUnit) < parseInt(filterFromWeightPerUnit)) {
            setErrorToWeightPerUnit("Khối lượng đến phải lớn hơn khối lượng từ");
            return false;
        }
        setErrorToCreatedDate("");
        setErrorToWeightPerUnit("");
        return true;
    }

    const handleApplyFilter = () => {
        if (validateFields()) {
            setPageIndex(0);
            fetchProducts();
        }
    };

    const handleClearFilter = () => {
        setSelectedSupplier(null);
        setSelectedCategory(null);
        setFilterProductName("");
        setFilterCode("");
        setFilterSupplierId(null);
        setFilterCategoryId(null);
        setFilterisAvailable(null);
        setFilterFromWeightPerUnit(0);
        setFilterToWeightPerUnit(0);
        setFilterFromCreatedDate("");
        setFilterToCreatedDate("");
        setErrorToCreatedDate("");
        setErrorToWeightPerUnit("");
        setPageIndex(0);
    };

    // Modal handlers
    const handleCreate = () => {
        setEditingProduct(null);
        setModalOpen(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setModalOpen(true);
    };

    const handleDelete = async (product) => {
        if (product.isAvailable === false) {
            setModalFailedMessage("Sản phẩm đã bị xóa từ trước");
            setModalFailedOpen(true);
            return;
        }
        setLoading(true);
        try {
            await productService.deleteProduct(product.productId);
            fetchProducts();
            setModalSuccessMessage("Xoá sản phẩm thành công");
            setModalSuccessOpen(true);
        } catch (error) {
            console.error("Error deleting product:", error);
            setModalFailedMessage("Có lỗi xảy ra, vui lòng thử lại sau");
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (productData) => {
        setLoading(true);
        try {
            if (editingProduct) {
                await productService.updateProduct(editingProduct.productId, productData);
                setModalSuccessMessage("Cập nhật sản phẩm thành công");
            } else {
                await productService.createProduct(productData);
                setModalSuccessMessage("Tạo sản phẩm thành công");
            }
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchProducts();
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const getFileNameFromDisposition = (disposition) => {
        if (!disposition) return "Mau_Phieu_San_Pham_NutriBarn.xlsx";

        // First try filename* (RFC 5987)
        const filenameStarMatch = disposition.match(/filename\*\=UTF-8''(.+?)(;|$)/);
        if (filenameStarMatch && filenameStarMatch[1]) {
            return decodeURIComponent(filenameStarMatch[1]);
        }

        // Fallback: normal filename=
        const filenameMatch = disposition.match(/filename="?(.+?)"?(;|$)/);
        if (filenameMatch && filenameMatch[1]) {
            return filenameMatch[1];
        }

        return "Mau_Phieu_San_Pham_NutriBarn.xlsx";
    };

    const handleDownloadTemplate = async () => {
        setLoading(true);
        try {
            const response = await productService.downloadProductTemplate();

            const disposition = response.headers["content-disposition"];
            const filename = getFileNameFromDisposition(disposition);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExcelImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            const result = await productService.importFromExcel(file);
            setModalImportData(result.data.importedProducts);
            setModalImportMessage("Tạo sản phẩm thành công");
            setModalImportOpen(true);
            fetchProducts();
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
            setModalFailedSubMessages(error.response.data.error.messages);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const removeLeadingZero = (number) => {
        if (number === null || isNaN(number) || number == 0) return 0;
        return number.toString().replace(/^0+/, '');
    }

    if (!pageReady) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col p-4">
            <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4 justify-between">
                <div className="flex flex-col mr-4">
                    <h1 className="text-2xl font-bold">Danh sách sản phẩm</h1>
                </div>
                <div className="flex flex-col gap-1">
                    <button className="background-primary text-white cursor-pointer rounded-xl px-4 py-2 font-semibold" onClick={handleCreate}>Thêm sản phẩm</button>

                    <label
                        htmlFor="excel-upload"
                        className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto text-center p-2 hover:bg-green-500"
                    >
                        Tải sản phẩm lên từ Excel
                    </label>
                    <input
                        id="excel-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={handleExcelImport}
                    />

                    <button className="block border bg-blue-500 text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto px-4" onClick={() => handleDownloadTemplate()}>Tải xuống mẫu nhập sản phẩm</button>
                </div>
            </div>

            {/* Filter sidebar */}
            <div className="p-4 rounded-2xl bg-white h-auto w-full mb-4">
                <h2 className="text-xl font-bold">Lọc sản phẩm</h2>
                <div className="flex items-center my-4 gap-2">
                    <div className="my-2 w-[24.5%]">
                        <label className="mr-2">Nhà cung cấp:</label>
                        <AutocompleteCommon
                            name="supplierId"
                            value={selectedSupplier}
                            loading={supplierLoading}
                            options={suppliers}
                            onSelect={(item) => handleChangeDropdown(item, "supplierId")}
                            onSearch={fetchSuppliers}
                            getOptionLabel={(option) => option.supplierName}
                            getOptionKey={(option) => option.supplierId}
                        />
                    </div>
                    <div className="my-2 w-[24.5%]">
                        <label className="mr-2">Danh mục:</label>
                        <AutocompleteCommon
                            name="categoryId"
                            value={selectedCategory}
                            loading={categoryLoading}
                            options={categories}
                            onSelect={(item) => handleChangeDropdown(item, "categoryId")}
                            onSearch={fetchCategories}
                            getOptionLabel={(option) => option.categoryName}
                            getOptionKey={(option) => option.categoryId}
                        />
                    </div>
                </div>
                <div className="flex items-center my-4 gap-2">
                    <div className="my-2 w-[24.5%]">
                        <label className="mr-2">Tên sản phẩm:</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterProductName}
                            onChange={(e) => setFilterProductName(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <div className="my-2 w-[24.5%]">
                        <label className="mr-2">Mã:</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterCode}
                            onChange={(e) => setFilterCode(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <div className="my-2 w-[24.5%] ml-2">
                        <label className="mr-2">Trạng thái:</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterisAvailable && filterisAvailable !== "null" ? filterisAvailable : "null"}
                            onChange={(e) => setFilterisAvailable(e.target.value)}
                            onKeyDown={handleKeyDown}
                        >
                            <option value="null">Tất cả</option>
                            <option value="true">Đang hoạt động</option>
                            <option value="false">Dừng hoạt động</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center my-4 gap-4">
                    <div className="my-2 w-full grid grid-cols-2 gap-2">
                        <div className="col-span-1">
                            <label className="mr-2">Khối lượng từ</label>
                            <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={removeLeadingZero(filterFromWeightPerUnit)}
                                onChange={(e) => setFilterFromWeightPerUnit(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="mr-2">Khối lượng đến</label>
                            <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={removeLeadingZero(filterToWeightPerUnit)}
                                onChange={(e) => setFilterToWeightPerUnit(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        {errorToWeightPerUnit && <span className="text-red-500">{errorToWeightPerUnit}</span>}
                    </div>
                    <div className="my-2 w-full grid grid-cols-2 gap-2">
                        <div className="col-span-1">
                            <label className="mr-2">Ngày tạo từ</label>
                            {/* <DateInput value={filterFromCreatedDate} onChange={(d) => setFilterFromCreatedDate(d)} className="w-full p-2 border border-gray-300 rounded" /> */}
                            <input
                                type="date"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={filterFromCreatedDate && formatDateToInput(filterFromCreatedDate)}
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    setFilterFromCreatedDate(date);
                                }}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="mr-2">Ngày tạo đến</label>
                            {/* <DateInput value={filterToCreatedDate} onChange={(d) => setFilterToCreatedDate(d)} className="w-full p-2 border border-gray-300 rounded" /> */}
                            <input
                                type="date"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={filterToCreatedDate && formatDateToInput(filterToCreatedDate)}
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    setFilterToCreatedDate(date);
                                }}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        {errorToCreatedDate && <span className="text-red-500">{errorToCreatedDate}</span>}
                    </div>
                </div>
                <div className="flex justify-center gap-2">
                    <button
                        className="px-4 py-2 background-primary text-white rounded cursor-pointer"
                        onClick={() => handleApplyFilter()}
                        ref={buttonRef}
                    >
                        Lọc
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer" onClick={() => handleClearFilter()}>Xóa bộ lọc</button>
                </div>
            </div>
            {/* Main content */}
            <TableCommon
                headers={headerData}
                tableData={products}
                defaultSortColumn="createdAt"
                defaultSortType="desc"
                rowPerPage={rowPerPage}
                pageIndex={pageIndex}
                totalCount={totalCount}
                rowPerPageOptions={[5, 10, 20]}
                handleChangePage={handleChangePage}
                handleChangeRowPerPage={handleChangeRowPerPage}
                navigateDetail={(item) => router.push(`/products/details/${item.productId}`)}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                messagePopupDelete="Bạn có muốn xóa sản phẩm này không?"
                usePagination={true}
                useAction={true}
            />
            <ProductForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={editingProduct}
            />
            <ProductResultModal isOpen={modalImportOpen} message={modalImportMessage} data={modalImportData} onClose={() => setModalImportOpen(false)} />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    );
}
