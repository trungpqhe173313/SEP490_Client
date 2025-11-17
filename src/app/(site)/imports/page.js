"use client";
import { importService } from "@/services/import.service";
import { warehouseService } from "@/services/warehouse.service";
import { supplierService } from "@/services/supplier.service";
import { useLogin } from "@/context/LoginContext";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { formatDateToInput } from '@/lib/formatDateToInput';
import DateInput from "@/components/Input/DateInput";

import TableCommon from "@/components/Table/table";
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";
import { getImportStatus, getImportStatusText } from "@/lib/getImportStatus";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import ImportResultModal from "@/components/Modal/importResultModal";
import Loader from "@/components/Loader/loader";

export default function Imports() {
    const router = useRouter();

    const navigate = (path) => {
        router.push(path);
    };

    //Data state
    const [imports, setImports] = useState([]);

    const [modalImportOpen, setModalImportOpen] = useState(false);
    const [modalImportMessage, setModalImportMessage] = useState("");
    const [modalImportData, setModalImportData] = useState([]);

    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");

    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    //Filter state
    const [filterSupplierId, setFilterSupplierId] = useState(null);
    const [filterWarehouseId, setFilterWarehouseId] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterType, setFilterType] = useState("");
    const [filterTransactionFromDate, setFilterTransactionFromDate] = useState("");
    const [filterTransactionToDate, setFilterTransactionToDate] = useState("");

    const [errorToTransactionDate, setErrorToTransactionDate] = useState("");

    //Pagination state
    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    //Autocomplete
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [supplierLoading, setSupplierLoading] = useState(false);
    const [warehouseLoading, setWarehouseLoading] = useState(false);

    const pageRole = ["Manager"];
    const { loading, setLoading } = useLoading();
    const { isLogin, user, refreshUserInfo } = useLogin();
    const buttonRef = useRef(null);
    const [pageReady, setPageReady] = useState(false);


    const headerData = [
        {
            key: "transactionId",
            label: "Mã giao dịch",
            customValue: (item) => item.transactionId && <div>{item.transactionId}</div>
        },
        {
            key: "type",
            label: "Loại phiếu",
            customValue: (item) => item.type && <div>{item.type === "Import" ? "Nhập kho" : "Chuyển kho"}</div>
        },
        {
            key: "supplierName",
            label: "Nhà cung cấp",
            customValue: (item) => item.supplierName && <div>{item.supplierName === "N/A" ? "Chuyển kho" : item.supplierName}</div>
        },
        {
            key: "warehouseName",
            label: "Nhà kho",
            customValue: (item) => item.warehouseName && <div>{item.warehouseName}</div>
        },
        {
            key: "status",
            label: "Trạng thái",
            customValue: (item) => getImportStatus(item.status)
        },
        {
            key: "transactionDate",
            label: "Ngày giao dịch",
            customValue: (item) => item.transactionDate && <div>{new Date(item.transactionDate).toLocaleDateString('vi-VN')}</div>
        },
        {
            key: "note",
            label: "Ghi chú",
            customValue: (item) => item.note ? <div>{item.note}</div> : <div>Không có</div>
        },
        {
            key: "action",
            label: "Hành động",
            customValue: (item) => item.transactionId ? <button className="text-white bg-cyan-500 px-4 py-2 rounded-xl" onClick={() => navigate(`/imports/details/${item.transactionId}`)}>Chi tiết</button> : <div>Không có</div>
        },
    ]

    //Pagination handlers
    const handleChangePage = (event, newPage) => setPageIndex(newPage);
    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
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
        fetchSuppliers("");
        fetchWarehouses("");
    }, [pageReady]);

    const fetchImports = async () => {
        setLoading(true);
        try {
            const body = {
                pageIndex: pageIndex + 1,
                pageSize: rowPerPage,
                supplierId: filterSupplierId || null,
                warehouseId: filterWarehouseId || null,
                status: parseInt(filterStatus) || null,
                type: filterType || null,
                transactionFromDate: filterTransactionFromDate || null,
                transactionToDate: filterTransactionToDate || null
            };
            const response = await importService.getAllImports(body);
            setImports(response.data.items);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error("Error fetching imports:", error);
        } finally {
            setLoading(false);
        }
    };

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
        fetchImports();
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
            } else if (item.warehouseId) {
                setSelectedWarehouse(item);
                setFilterWarehouseId(item.warehouseId);
            }
        } else {
            if (field === "supplierId") {
                setSelectedSupplier(null);
                setFilterSupplierId(null);
            } else if (field === "warehouseId") {
                setSelectedWarehouse(null);
                setFilterWarehouseId(null);
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
            fetchImports();
        }
    };

    const handleClearFilter = () => {
        setFilterSupplierId(null);
        setSelectedSupplier(null);
        setFilterWarehouseId(null);
        setSelectedWarehouse(null);
        setFilterStatus(null);
        setFilterType("");
        setFilterTransactionFromDate("");
        setFilterTransactionToDate("");
        setErrorToTransactionDate("");
        setPageIndex(0);
    };

    const handleDelete = async (item) => {
        if (item.status === "Đã ngưng hoạt động") {
            setModalFailedMessage("Phiếu nhập kho đã bị xóa từ trước");
            setModalFailedOpen(true);
            return;
        }
        setLoading(true);
        try {
            await importService.deleteImport(item.importId);
            fetchImports();
            setModalSuccessMessage("Xoá phiếu nhập kho thành công");
            setModalSuccessOpen(true);
        } catch (error) {
            console.log(error);
            setModalFailedMessage("Có lỗi xảy ra, vui lòng thử lại sau");
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const getFileNameFromDisposition = (disposition) => {
        if (!disposition) return "template.xlsx";

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

        return "template.xlsx";
    };

    const handleDownloadTemplate = async () => {
        setLoading(true);
        try {
            const response = await importService.downloadTemplate();

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
            const result = await importService.createImportWithExcel(file);
            setModalImportData(result.data.importedStockBatches);
            setModalImportMessage("Tạo phiếu nhập kho thành công");
            setModalImportOpen(true);
            fetchImports();
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
            setModalFailedSubMessages(error.response.data.error.messages);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };



    if (!pageReady) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col p-4">
            <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4 justify-between">
                <div className="flex flex-col mr-4">
                    <h1 className="text-2xl font-bold">Danh sách phiếu nhập</h1>
                </div>
                <div className="flex flex-col gap-2">
                    <button className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto" onClick={() => navigate("/imports/create")}>Tạo phiếu nhập mới</button>

                    <label
                        htmlFor="excel-upload"
                        className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto text-center p-2 hover:bg-green-500"
                    >
                        Tải phiếu nhập lên
                    </label>
                    <input
                        id="excel-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={handleExcelImport}
                    />

                    <button className="block border bg-blue-500 text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto px-4" onClick={() => handleDownloadTemplate()}>Tải xuống mẫu phiếu nhập</button>
                </div>
            </div>

            {/* Filter sidebar */}
            <div className="p-4 rounded-2xl bg-white h-auto w-full mb-4">
                <h2 className="text-xl font-bold">Lọc phiếu nhập</h2>
                <div className="flex items-center my-4 gap-4">
                    <div className="mt-2 w-[24.25%]">
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
                </div>
                <div className="flex items-center my-4 gap-4">
                    <div className="mt-2 w-full">
                        <label className="mr-2">Trạng thái:</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterStatus || ""}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            onKeyDown={handleKeyDown}
                        >
                            <option value="">Tất cả</option>
                            <option value={1}>{getImportStatusText(1)}</option>
                            <option value={2}>{getImportStatusText(2)}</option>
                            <option value={3}>{getImportStatusText(3)}</option>
                        </select>
                    </div>
                    <div className="mt-2 w-full">
                        <label className="mr-2">Loại phiếu:</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            onKeyDown={handleKeyDown}
                        >
                            <option value="">Tất cả</option>
                            <option value="Import">Phiếu nhập kho</option>
                            <option value="Transfer">Phiếu chuyển kho</option>
                        </select>
                    </div>
                    <div className="mt-2 w-full">
                        <label className="mr-2">Giao dịch từ ngày:</label>
                        <DateInput className="w-full p-2 border border-gray-300 rounded" value={filterTransactionFromDate} onChange={(d) => setFilterTransactionFromDate(d)} />
                        {/* <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterTransactionFromDate && formatDateToInput(filterTransactionFromDate)}
                            onChange={(e) => {
                                const date = new Date(e.target.value);
                                setFilterTransactionFromDate(date);
                            }}
                            onKeyDown={handleKeyDown}
                        /> */}
                    </div>
                    <div className="mt-2 w-full">
                        <label className="mr-2">Đến ngày:</label>
                        <DateInput className="w-full p-2 border border-gray-300 rounded" value={filterTransactionToDate} onChange={(d) => setFilterTransactionToDate(d)} />
                        {/* <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterTransactionToDate && formatDateToInput(filterTransactionToDate)}
                            onChange={(e) => {
                                const date = new Date(e.target.value);
                                setFilterTransactionToDate(date);
                            }}
                            onKeyDown={handleKeyDown}
                        /> */}
                    </div>
                </div>
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
                tableData={imports}
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
            <ImportResultModal isOpen={modalImportOpen} message={modalImportMessage} data={modalImportData} onClose={() => setModalImportOpen(false)} />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}