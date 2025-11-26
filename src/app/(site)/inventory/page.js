"use client";
import { inventoryService } from "@/services/inventory.service";
import { productService } from "@/services/product.service";
import { warehouseService } from "@/services/warehouse.service";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import TableCommon from "@/components/Table/table";
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";
import Loader from "@/components/Loader/loader";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";

export default function InventoryPage() {
    const router = useRouter();

    const navigate = (path) => {
        router.push(path);
    };

    //Data state
    const [inventories, setInventories] = useState([]);
    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Manager"];

    //Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");

    //Filter state
    const [filterWarehouseId, setFilterWarehouseId] = useState(null);
    const [filterProductId, setFilterProductId] = useState(null);

    //Autocomplete
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [warehouseLoading, setWarehouseLoading] = useState(false);
    const [productLoading, setProductLoading] = useState(false);

    //Pagination state
    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    //Loading state
    const { loading, setLoading } = useLoading();
    const { isLogin, user, refreshUserInfo } = useLogin();
    const buttonRef = useRef(null);

    // Check authorization
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

    //Table headers
    const headerData = [
        {
            key: "productId",
            label: "ID sản phẩm",
            customValue: (item) => item.productId && <div>{item.productId}</div>
        },
        {
            key: "productName",
            label: "Tên sản phẩm",
            customValue: (item) => item.productName && <div>{item.productName}</div>
        },
        {
            key: "productCode",
            label: "Mã sản phẩm",
            customValue: (item) => item.productCode && <div>{item.productCode}</div>
        },
        {
            key: "warehouseName",
            label: "Nhà kho",
            customValue: (item) => item.warehouseName && <div>{item.warehouseName}</div>
        },
        {
            key: "totalQuantity",
            label: "Số lượng",
            customValue: (item) => item.totalQuantity && <div>{item.totalQuantity}</div>
        },
        {
            key: "lastUpdated",
            label: "Ngày cập nhật",
            customValue: (item) => item.lastUpdated && <div>{new Date(item.lastUpdated).toLocaleString('vi-VN')}</div>
        }
    ];

    // Fetch data
    const fetchInventories = async () => {
        setLoading(true);
        try {
            const body = {
                pageIndex: pageIndex + 1,
                pageSize: rowPerPage,
                warehouseId: filterWarehouseId,
                productId: filterProductId
            };
            const response = await inventoryService.getAllInventories(body);
            setInventories(response.data.items);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async (value) => {
        setProductLoading(true);
        try {
            const body = { pageIndex: 1, pageSize: 1000, productName: value };
            const response = await productService.getProductAvailable(body);
            const products = response.data.items.sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((item) => ({ productId: item.productId, productName: item.productName, productCode: item.productCode }));
            setProducts(products);
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setProductLoading(false);
        }
    };

    const fetchWarehouses = async (value) => {
        setWarehouseLoading(true);
        try {
            const body = { pageIndex: 1, pageSize: 1000, warehouseName: value };
            const response = await warehouseService.getAllWarehouses(body);
            const warehouses = response.data.items.map((item) => ({ warehouseId: item.warehouseId, warehouseName: item.warehouseName }));
            setWarehouses(warehouses);
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setWarehouseLoading(false);
        }
    }

    useEffect(() => {
        if (!pageReady) return;
        fetchInventories();
    }, [pageIndex, rowPerPage, pageReady]);

    useEffect(() => {
        if (!pageReady) return;
        fetchProducts(null);
        fetchWarehouses(null);
    }, [pageReady]);

    // Pagination handlers
    const handleChangePage = (event, newPage) => setPageIndex(newPage);
    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            buttonRef.current?.click();
        }
    }

    const handleChangeDropdown = (item, field) => {
        if (item) {
            if (item.warehouseId) {
                setSelectedWarehouse(item);
                setFilterWarehouseId(item.warehouseId);
            } else if (item.productId) {
                setSelectedProduct(item);
                setFilterProductId(item.productId);
            }
        } else {
            if (field === "warehouseId") {
                setSelectedWarehouse(null);
                setFilterWarehouseId(null);
            } else if (field === "productId") {
                setSelectedProduct(null);
                setFilterProductId(null);
            }
        }
    };

    const handleApplyFilter = () => {
        setPageIndex(0);
        fetchInventories();
    };

    const handleClearFilter = () => {
        setSelectedWarehouse(null);
        setSelectedProduct(null);
        setFilterWarehouseId(null);
        setFilterProductId(null);
        setPageIndex(0);
    }

    if (!pageReady) return <Loader />;

    return (
        <div className="grid grid-cols-4 p-8 gap-4">
            {/* Filter sidebar */}
            <div className="col-span-1">
                <div className="p-4 rounded-2xl bg-white h-auto sticky top-0">
                    <h2 className="text-xl font-bold">Lọc tồn kho</h2>
                    <div className="flex flex-col items-center my-4">
                        <div className="my-2 w-full">
                            <label className="mr-2">Nhà kho:</label>
                            <AutocompleteCommon
                                name="warehouseId"
                                value={selectedWarehouse}
                                loading={warehouseLoading}
                                options={warehouses}
                                onSelect={(item) => handleChangeDropdown(item, "warehouseId")}
                                onSearch={fetchWarehouses}
                                getOptionLabel={(option) => option.warehouseName}
                                getOptionKey={(option) => option.warehouseId}
                            />
                        </div>
                        <div className="my-2 w-full">
                            <label className="mr-2">Sản phẩm:</label>
                            <AutocompleteCommon
                                name="productId"
                                value={selectedProduct}
                                loading={productLoading}
                                options={products}
                                onSelect={(item) => handleChangeDropdown(item, "productId")}
                                onSearch={fetchProducts}
                                getOptionLabel={(option) => option.productName}
                                getOptionKey={(option) => option.productId}
                            />
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
            </div>
            {/* Main content */}
            <div className="col-span-3">
                <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4">
                    <div className="flex flex-col w-3/4 mr-4">
                        <h1 className="text-2xl font-bold">Danh sách tồn kho</h1>
                    </div>
                </div>
                <TableCommon
                    headers={headerData}
                    tableData={inventories}
                    defaultSortColumn="lastUpdated"
                    defaultSortType="desc"
                    rowPerPage={rowPerPage}
                    pageIndex={pageIndex}
                    totalCount={totalCount}
                    rowPerPageOptions={[5, 10, 20]}
                    handleChangePage={handleChangePage}
                    handleChangeRowPerPage={handleChangeRowPerPage}
                    usePagination={true}
                />
            </div>
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}

