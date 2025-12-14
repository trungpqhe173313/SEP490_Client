"use client";
import { transferService } from "@/services/transfer.service";
import { warehouseService } from "@/services/warehouse.service";
import { employeeService } from "@/services/employee.service";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useLogin } from "@/context/LoginContext";
import DateInput from "@/components/Input/DateInput";

import TableCommon from "@/components/Table/table";
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";
import { getTransferStatus, getTransferStatusText } from "@/lib/getStatus";
import { formatDateToInput } from '@/lib/formattingLib';

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import Loader from "@/components/Loader/loader";


export default function Transfer() {
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const navigate = (path) => {
        router.push(path);
    };

    //Data state
    const [transfers, setTransfers] = useState([]);

    //Modal state
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");

    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    //Filter state
    const [filterWarehouseId, setFilterWarehouseId] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterTransactionFromDate, setFilterTransactionFromDate] = useState("");
    const [filterTransactionToDate, setFilterTransactionToDate] = useState("");
    const [filterResponsibleId, setFilterResponsibleId] = useState(null);

    const [errorToTransactionDate, setErrorToTransactionDate] = useState("");
    //Pagination state
    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    //Autocomplete
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [warehouseLoading, setWarehouseLoading] = useState(false);

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [employeeLoading, setEmployeeLoading] = useState(false);

    const { loading, setLoading } = useLoading();
    const buttonRef = useRef(null);
    const [pageReady, setPageReady] = useState(false);

    const pageRole = ["Manager", "Employee"];

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
            key: "transactionId",
            label: "Mã giao dịch",
            customValue: (item) => item.transactionId && <div>{item.transactionId}</div>
        },
        {
            key: "warehouseName",
            label: "Vận chuyển từ",
            customValue: (item) => item.warehouseName && <div>{item.warehouseName}</div>
        },
        {
            key: "warehouseInName",
            label: "Vận chuyển đến",
            customValue: (item) => item.warehouseInName && <div>{item.warehouseInName}</div>
        },
        {
            key: "statusName",
            label: "Trạng thái",
            customValue: (item) => getTransferStatus(item.status)
        },
        {
            key: "transactionDate",
            label: "Ngày giao dịch",
            customValue: (item) => item.transactionDate && <div>{new Date(item.transactionDate).toLocaleString('vi-VN')}</div>
        },
        {
            key: "note",
            label: "Ghi chú",
            customValue: (item) => item.note ? <div>{item.note}</div> : <div>Chưa có</div>
        },
        {
            key: "responsibleName",
            label: "Nhân viên phụ trách",
            customValue: (item) => item.responsibleName ? <div>{item.responsibleName}</div> : <div>Chưa có</div>
        },
        {
            key: "action",
            label: "Hành động",
            customValue: (item) => item.transactionId ? <button className="text-white bg-cyan-500 px-4 py-2 rounded-xl" onClick={() => navigate(`/transfer/details/${item.transactionId}`)}>Chi tiết</button> : <div>Không có</div>
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
                isActive: true,
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

    const fetchEmployees = async (value) => {
        try {
            setEmployeeLoading(true);
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                isActive: true,
                employeeName: value
            };
            const response = await employeeService.getAllEmployees(body);
            const employeeData = response.data.items
            setEmployees(employeeData);
        } catch (error) {
            console.error("Error fetching employees:", error);
        } finally {
            setEmployeeLoading(false);
        }
    }

    useEffect(() => {
        if (!pageReady) return;
        fetchWarehouses("");
        fetchEmployees("");
    }, [pageReady]);

    const fetchTransfers = async () => {
        setLoading(true);
        try {
            const body = {
                pageIndex: pageIndex + 1,
                pageSize: rowPerPage,
                warehouseId: filterWarehouseId || null,
                status: parseInt(filterStatus) || null,
                transactionFromDate: filterTransactionFromDate || null,
                transactionToDate: filterTransactionToDate || null,
                responsibleId: user.roles.includes("Manager") ? filterResponsibleId || null : user.id
            };
            const response = await transferService.getAllTransfers(body);
            setTransfers(response.data.items);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!pageReady) return;
        fetchTransfers();
    }, [pageIndex, rowPerPage, pageReady]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            buttonRef.current?.click();
        }
    };

    const handleChangeDropdown = (item, field) => {
        if (item) {
            if (item.warehouseId) {
                setSelectedWarehouse(item);
                setFilterWarehouseId(item.warehouseId);
            } else if (item.userId) {
                setSelectedEmployee(item);
                setFilterResponsibleId(item.userId);
            }
        } else {
            if (field === "warehouseId") {
                setSelectedWarehouse(null);
                setFilterWarehouseId(null);
            } else if (field === "employeeId") {
                setSelectedEmployee(null);
                setFilterResponsibleId(null);
            }
        }
    };

    useEffect(() => {
        validateFields();
    }, [filterTransactionFromDate, filterTransactionToDate]);

    const validateFields = () => {
        if (filterTransactionToDate && filterTransactionFromDate > filterTransactionToDate) {
            setErrorToTransactionDate("Ngày giao dịch đến phải lớn hơn ngày giao dịch từ");
            return false;
        }
        setErrorToTransactionDate("");
        return true;
    };

    const handleApplyFilter = () => {
        if (validateFields()) {
            setPageIndex(0);
            fetchTransfers();
        }
    };

    const handleClearFilter = () => {
        setFilterWarehouseId(null);
        setSelectedWarehouse(null);
        setFilterStatus(null);
        setFilterResponsibleId(null);
        setSelectedEmployee(null);
        setFilterTransactionFromDate("");
        setFilterTransactionToDate("");
        setErrorToTransactionDate("");
        setPageIndex(0);
    };

    if (!pageReady) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col p-4">
            <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4 justify-between">
                <div className="flex flex-col mr-4">
                    <h1 className="text-2xl font-bold">Danh sách phiếu chuyển kho</h1>
                </div>
                <div className="flex flex-col gap-2">
                    <button className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto px-4" onClick={() => navigate("/transfer/modify/create")}>Tạo phiếu chuyển kho mới</button>
                </div>
            </div>

            {/* Filter sidebar */}
            <div className="p-4 rounded-2xl bg-white h-auto w-full mb-4">
                <h2 className="text-xl font-bold">Lọc phiếu chuyển</h2>
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
                            <option value={9}>{getTransferStatusText(9)}</option>
                            <option value={10}>{getTransferStatusText(10)}</option>
                            <option value={6}>{getTransferStatusText(6)}</option>
                        </select>
                    </div>
                    <div className="mt-2 w-[24.25%]">
                        <label className="mr-2">Giao dịch từ ngày:</label>
                        {/* <DateInput
                            className="w-full p-1.5 border border-gray-300 rounded block"
                            value={filterTransactionFromDate}
                            onChange={(e) => setFilterTransactionFromDate(e)}
                        /> */}
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterTransactionFromDate && formatDateToInput(filterTransactionFromDate)}
                            onChange={(e) => {
                                const date = new Date(e.target.value);
                                setFilterTransactionFromDate(date);
                            }}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <div className="mt-2 w-[24.25%]">
                        <label className="mr-2">Đến ngày:</label>
                        {/* <DateInput
                            className="w-full p-1.5 border border-gray-300 rounded block"
                            value={filterTransactionToDate}
                            onChange={(e) => setFilterTransactionToDate(e)}
                            onKeyDown={handleKeyDown}
                        /> */}
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterTransactionToDate && formatDateToInput(filterTransactionToDate)}
                            onChange={(e) => {
                                const date = new Date(e.target.value);
                                setFilterTransactionToDate(date);
                            }}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </div>
                {user.roles.includes("Manager") &&
                    <div className="flex items-center my-4 gap-4">
                        <div className="mt-2 w-[24.25%]">
                            <label className="mr-2">Nhân viên phụ trách:</label>
                            <AutocompleteCommon
                                name="employeeId"
                                value={selectedEmployee}
                                loading={employeeLoading}
                                options={employees}
                                onSelect={(item) => handleChangeDropdown(item, "employeeId")}
                                onSearch={fetchEmployees}
                                getOptionLabel={(option) => option.fullName}
                                getOptionKey={(option) => option.userId}
                            />
                        </div>
                    </div>
                }
                <div className="flex flex-col justify-center">
                    {errorToTransactionDate && <span className="text-red-500 text-center mb-2">{errorToTransactionDate}</span>}
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
                tableData={transfers}
                defaultSortColumn="transactionDate"
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

