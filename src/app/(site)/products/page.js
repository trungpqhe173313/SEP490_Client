"use client";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { supplierService } from "@/services/supplier.service";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRef } from "react";

import TableCommon from "@/components/Table/table";
import { ProductForm } from "@/components/Form/productForm";
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";

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
    const [rowPerPage, setRowPerPage] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    // Loading state
    const { setLoading } = useLoading();
    const buttonRef = useRef(null);

    // Table headers
    const headerData = [
        { key: "productId", label: "Mã sản phẩm", customValue: (item) => item.productId && <div>{item.productId}</div> },
        { key: "productName", label: "Tên sản phẩm", customValue: (item) => item.productName && <div>{item.productName}</div> },
        { key: "code", label: "Mã", customValue: (item) => item.code && <div>{item.code}</div> },
        { key: "weightPerUnit", label: "Khối lượng", customValue: (item) => item.weightPerUnit && <div>{item.weightPerUnit}</div> },
        { key: "supplierName", label: "Nhà cung cấp", customValue: (item) => item.supplierName && <div>{item.supplierName}</div> },
        { key: "categoryName", label: "Danh mục", customValue: (item) => item.categoryName && <div>{item.categoryName}</div> },
        { key: "isAvailable", label: "Trạng thái", customValue: (item) => item.isAvailable === true ? <div className="text-green-600">Còn hàng</div> : <div className="text-red-600">Hết hàng</div> },
        { key: "createdAt", label: "Ngày tạo", customValue: (item) => item.createdAt && <div>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</div> }
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
        const body = {
            pageIndex: pageIndex + 1,
            pageSize: rowPerPage,
            productName: filterProductName,
            code: filterCode,
            supplierId: filterSupplierId,
            categoryId: filterCategoryId,
            isAvailable: filterisAvailable === "true" ? true : filterisAvailable === "false" ? false : null,
            minWeightPerUnit: filterFromWeightPerUnit === 0 ? null : filterFromWeightPerUnit,
            maxWeightPerUnit: filterToWeightPerUnit === 0 ? null : filterToWeightPerUnit,
            createdFrom: filterFromCreatedDate || null,
            createdTo: filterToCreatedDate || null
        };
        const response = await productService.getAllProducts(body);
        setProducts(response.data.items);
        setTotalCount(response.data.totalCount);
        setLoading(false);
    };

    const fetchSuppliers = async (value) => {
        try {
            setSupplierLoading(true);
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                isAvailable: true,
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
                isAvailable: true,
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
        fetchSuppliers("");
        fetchCategories("");
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [pageIndex, rowPerPage]);

    const formatDateToInput = (dt) => {
        return dt.toISOString().split('T')[0];
    }

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
        if (parseInt(filterToWeightPerUnit) < parseInt(filterFromWeightPerUnit)) {
            setErrorToWeightPerUnit("Khối lượng đến phải lớn hơn khối lượng từ");
            return false;
        }
        setErrorToCreatedDate("");
        setErrorToWeightPerUnit("");
        return true;
    }

    const handleApplyFilter = () => {
        if (validateFields()) {
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
        fetchProducts();
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
        await productService.deleteProduct(product.productId);
        fetchProducts();
        setModalSuccessMessage("Xoá sản phẩm thành công");
        setModalSuccessOpen(true);
        setLoading(false);
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
            setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-4 p-8 gap-4">
            {/* Filter sidebar */}
            <div className="col-span-1">
                <div className="p-4 rounded-2xl bg-white h-auto sticky top-0">
                    <h2 className="text-xl font-bold">Lọc sản phẩm</h2>
                    <div className="flex flex-col items-center my-4">
                        <div className="my-2 w-full">
                            <label className="mr-2">Tên sản phẩm:</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={filterProductName}
                                onChange={(e) => setFilterProductName(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className="my-2 w-full">
                            <label className="mr-2">Mã:</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={filterCode}
                                onChange={(e) => setFilterCode(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className="my-2 w-full grid grid-cols-2 gap-2">
                            <div className="col-span-1">
                                <label className="mr-2">Khối lượng từ</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={filterFromWeightPerUnit || ""}
                                    onChange={(e) => setFilterFromWeightPerUnit(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="mr-2">Khối lượng đến</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={filterToWeightPerUnit || ""}
                                    onChange={(e) => setFilterToWeightPerUnit(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                        </div>
                        {errorToWeightPerUnit && <span className="text-red-500">{errorToWeightPerUnit}</span>}
                        <div className="my-2 w-full">
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
                        <div className="my-2 w-full">
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
                        <div className="my-2 w-full">
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
                        <div className="my-2 w-full grid grid-cols-2 gap-2">
                            <div className="col-span-1">
                                <label className="mr-2">Ngày tạo từ</label>
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
                        </div>
                        {errorToCreatedDate && <span className="text-red-500">{errorToCreatedDate}</span>}
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
            </div>
            {/* Main content */}
            <div className="col-span-3">
                <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4">
                    <div className="flex flex-col w-3/4 mr-4">
                        <h1 className="text-2xl font-bold">Danh sách sản phẩm</h1>
                    </div>
                    <div className="flex flex-col w-1/4">
                        <button className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto" onClick={handleCreate}>Thêm sản phẩm</button>
                    </div>
                </div>
                <TableCommon
                    headers={headerData}
                    tableData={products}
                    defaultSortColumn="productId"
                    rowPerPage={rowPerPage}
                    pageIndex={pageIndex}
                    totalCount={totalCount}
                    rowPerPageOptions={[5, 10, 20]}
                    handleChangePage={handleChangePage}
                    handleChangeRowPerPage={handleChangeRowPerPage}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    messagePopupDelete="Bạn có muốn xóa sản phẩm này không?"
                    usePagination={true}
                    useAction={true}
                />
            </div>
            <ProductForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={editingProduct}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    );
}
