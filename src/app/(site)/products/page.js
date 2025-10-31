"use client";
import { productService } from "@/services/product.service";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRef } from "react";

import TableCommon from "@/components/Table/table";
import { ProductForm } from "@/components/Form/productForm";

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

    // Pagination state
    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(5);
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
            productName: filterProductName
        };
        const response = await productService.getAllProducts(body);
        setProducts(response.data.items);
        setTotalCount(response.data.totalCount);
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, [pageIndex, rowPerPage]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            buttonRef.current?.click();
        }
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
                <div className="p-4 rounded-2xl bg-white h-auto max-h-screen sticky top-0">
                    <h2 className="text-xl font-bold">Lọc sản phẩm</h2>
                    <div className="flex flex-col items-center my-4">
                        <div>
                            <label className="mr-2">Tên sản phẩm:</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={filterProductName}
                                onChange={(e) => setFilterProductName(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <button
                            className="px-4 py-2 background-primary text-white rounded mx-auto cursor-pointer"
                            onClick={() => fetchProducts()}
                            ref={buttonRef}
                        >
                            Lọc
                        </button>
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
