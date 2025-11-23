'use client';
import { inventoryService } from '@/services/inventory.service';
import { warehouseService } from '@/services/warehouse.service';

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useLogin } from "@/context/LoginContext";
import DateInput from "@/components/Input/DateInput";

import TableCommon from "@/components/Table/table";
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";
import { getInventoryStatus, getInventoryStatusText } from '@/lib/getInventoryStatus';
import { formatDateToInput } from '@/lib/formatDateToInput';

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import Loader from "@/components/Loader/loader";

export default function Inventory() {
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const navigate = (path) => {
        router.push(path);
    };

    //Data state
    const [inventories, setInventories] = useState([]);

    //Modal state
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");

    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    //Filter state
    const [filterWarehouseId, setFilterWarehouseId] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterFromDate, setFilterFromDate] = useState("");
    const [filterToDate, setFilterToDate] = useState("");

    const [errorToDate, setErrorToDate] = useState("");

    //Pagination state
    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    //Autocomplete
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [warehouseLoading, setWarehouseLoading] = useState(false);

    const { loading, setLoading } = useLoading();
    const buttonRef = useRef(null);
    const [pageReady, setPageReady] = useState(false);

    const pageRole = ["Manager"];

    useEffect(() => {
        if (loading) return;
        if (isLogin && user?.roles && user.roles.some((r) => pageRole.includes(r))) {
            setPageReady(true);
        } else if (!isLogin) {
            router.push("/login");
        } else if (!user?.roles?.some((r) => pageRole.includes(r))) {
            router.push("/");
        }
    }, [isLogin, user, router]);

    const headerData = [
        {
            key: "adjustmentId",
            label: "Mã kiểm kho",
            customValue: (item) => item.adjustmentId && <div>{item.adjustmentId}</div>
        },
        {
            key: "warehouseName",
            label: "Nhà kho",
            customValue: (item) => item.warehouseName && <div>{item.warehouseName}</div>
        },
        {
            key: "statusName",
            label: "Trạng thái",
            customValue: (item) => getInventoryStatus(item.status)
        },
        {
            key: "totalProducts",
            label: "Số sản phẩm của phiếu",
            customValue: (item) => item.totalProducts && <div>{item.totalProducts}</div>
        },
        {
            key: "createdAt",
            label: "Ngày tạo",
            customValue: (item) => item.createdAt && <div>{new Date(item.createdAt).toLocaleString('vi-VN')}</div>
        },
        {
            key: "resolvedAt",
            label: "Ngày xác nhận",
            customValue: (item) => item.resolvedAt ? <div>{new Date(item.resolvedAt).toLocaleString('vi-VN')} </div> : <div>Chưa có</div>
        },
        {
            key: "action",
            label: "Hành động",
            customValue: (item) => item.adjustmentId ? <button className="text-white bg-cyan-500 px-4 py-2 rounded-xl" onClick={() => navigate(`/inventory/details/${item.adjustmentId}`)}>Chi tiết</button> : <div>Không có</div>
        },
    ]

    const handleChangePage = (event, newPage) => setPageIndex(newPage);
    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    const fetchWarehouses = async (value) => {
        try {
            setWarehouseLoading(true);
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                warehouseName: value
            };
            const response = await warehouseService.getAllWarehouses(body);
            const warehouseData = response.data.items.map((warehouse) => ({
                warehouseId: warehouse.warehouseId,
                warehouseName: warehouse.warehouseName
            }));
            setWarehouses(warehouseData);
        } catch (error) {
            console.error("Error fetching warehouses:", error);
        } finally {
            setWarehouseLoading(false);
        }
    }

    useEffect(() => {
        if (!pageReady) return;
        fetchWarehouses("");
    }, [pageReady]);

    const fetchInventories = async () => {
        setLoading(true);
        try {
            const body = {
                pageIndex: pageIndex + 1,
                pageSize: rowPerPage,
                warehouseId: filterWarehouseId || null,
                status: parseInt(filterStatus) || null,
                fromDate: filterFromDate || null,
                toDate: filterToDate || null
            };
            const response = await inventoryService.getAllStockAdjustments(body);
            setInventories(response.data.items);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!pageReady) return;
        fetchInventories();
    }, [pageIndex, rowPerPage, pageReady]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            buttonRef.current?.click();
        }
    };

    const handleChangeDropdown = (item) => {
        if (item) {
            setSelectedWarehouse(item);
            setFilterWarehouseId(item.warehouseId);

        } else {
            setSelectedWarehouse(null);
            setFilterWarehouseId(null);
        }
    };

    useEffect(() => {
        validateFields();
    }, [filterFromDate, filterToDate]);

    const validateFields = () => {
        if (filterToDate && filterFromDate > filterToDate) {
            setErrorToDate("Ngày giao dịch đến phải lớn hơn ngày giao dịch từ");
            return false;
        }
        setErrorToDate("");
        return true;
    };

    const handleApplyFilter = () => {
        if (validateFields()) {
            setPageIndex(0);
            fetchInventories();
        }
    };

    const handleClearFilter = () => {
        setFilterWarehouseId(null);
        setSelectedWarehouse(null);
        setFilterStatus(null);
        setFilterFromDate("");
        setFilterToDate("");
        setErrorToDate("");
        setPageIndex(0);
    };

    if (!pageReady) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col p-4">
            <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4 justify-between">
                <div className="flex flex-col mr-4">
                    <h1 className="text-2xl font-bold">Danh sách phiếu kiểm</h1>
                </div>
                <div className="flex flex-col gap-2">
                    <button className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto px-4" onClick={() => navigate("/inventory/modify/create")}>Tạo phiếu kiểm mới</button>
                </div>
            </div>

            {/* Filter sidebar */}
            <div className="p-4 rounded-2xl bg-white h-auto w-full mb-4">
                <h2 className="text-xl font-bold">Lọc phiếu kiểm</h2>
                <div className="flex items-center my-4 gap-4">
                    <div className="mt-2 w-[24.25%]">
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
                    <div className="mt-2 w-[24.25%]">
                        <label className="mr-2">Trạng thái:</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterStatus || ""}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            onKeyDown={handleKeyDown}
                        >
                            <option value="">Tất cả</option>
                            <option value={1}>{getInventoryStatusText(1)}</option>
                            <option value={2}>{getInventoryStatusText(2)}</option>
                        </select>
                    </div>
                    <div className="mt-2 w-[24.25%]">
                        <label className="mr-2">Lọc từ ngày:</label>
                        <DateInput
                            className="w-full p-1.5 border border-gray-300 rounded block"
                            value={filterFromDate}
                            onChange={(e) => setFilterFromDate(e)}
                        />
                        {/* <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterFromDate && formatDateToInput(filterFromDate)}
                            onChange={(e) => {
                                const date = new Date(e.target.value);
                                setFilterFromDate(date);
                            }}
                            onKeyDown={handleKeyDown}
                        /> */}
                    </div>
                    <div className="mt-2 w-[24.25%]">
                        <label className="mr-2">Đến ngày:</label>
                        <DateInput
                            className="w-full p-1.5 border border-gray-300 rounded block"
                            value={filterToDate}
                            onChange={(e) => setFilterToDate(e)}
                            onKeyDown={handleKeyDown}
                        />
                        {/* <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterToDate && formatDateToInput(filterToDate)}
                            onChange={(e) => {
                                const date = new Date(e.target.value);
                                setFilterToDate(date);
                            }}
                            onKeyDown={handleKeyDown}
                        /> */}
                    </div>
                </div>
                {/* <div className="flex items-center my-4 gap-4">

                </div> */}
                <div className="flex flex-col justify-center">
                    {errorToDate && <span className="text-red-500 text-center mb-2">{errorToDate}</span>}
                    <div className="flex flex-row items-center justify-center gap-4">
                        <button
                            className="px-4 py-2 background-primary text-white rounded cursor-pointer"
                            onClick={() => handleApplyFilter()}
                            ref={buttonRef}
                        >
                            Lọc
                        </button>
                        <button
                            className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
                            onClick={() => handleClearFilter()}
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <TableCommon
                headers={headerData}
                tableData={inventories}
                defaultSortColumn="createdAt"
                defaultSortType="desc"
                rowPerPage={rowPerPage}
                pageIndex={pageIndex}
                totalCount={totalCount}
                rowPerPageOptions={[5, 10, 20]}
                handleChangePage={handleChangePage}
                handleChangeRowPerPage={handleChangeRowPerPage}
                usePagination={true}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}

