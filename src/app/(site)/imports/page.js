"use client";
import { importService } from "@/services/import.service";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import TableCommon from "@/components/Table/table";
import { ImportForm } from "@/components/Form/importForm";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import ImportResultModal from "@/components/Modal/importResultModal";

export default function Imports() {
    const router = useRouter();

    const navigate = (path) => {
        setLoading(true);
        router.push(path);
    };

    //Data state
    const [imports, setImports] = useState([]);
    const [editingImport, setEditingImport] = useState(null);

    //Modal state
    const [modalOpen, setModalOpen] = useState(false);

    const [modalImportOpen, setModalImportOpen] = useState(false);
    const [modalImportMessage, setModalImportMessage] = useState("");
    const [modalImportData, setModalImportData] = useState([]);

    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");

    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    //Filter state
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterType, setFilterType] = useState("");
    const [filterTransactionFromDate, setFilterTransactionFromDate] = useState("");
    const [filterTransactionToDate, setFilterTransactionToDate] = useState("");

    //Pagination state
    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(5);
    const [totalCount, setTotalCount] = useState(0);

    const { setLoading } = useLoading();
    const buttonRef = useRef(null);

    const headerData = [
        {
            key: "transactionId",
            label: "Mã giao dịch",
            customValue: (item) => item.transactionId && <div>{item.transactionId}</div>
        },
        {
            key: "customerId",
            label: "Mã khách hàng",
            customValue: (item) => item.customerId && <div>{item.customerId}</div>
        },
        {
            key: "supplierId",
            label: "Mã nhà cung cấp",
            customValue: (item) => item.supplierId && <div>{item.supplierId}</div>
        },
        {
            key: "warehouseId",
            label: "Mã nhà kho",
            customValue: (item) => item.warehouseId && <div>{item.warehouseId}</div>
        },
        {
            key: "status",
            label: "Trạng thái",
            customValue: (item) => item.status && <div>{item.status}</div>
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
    ]

    //Pagination handlers
    const handleChangePage = (event, newPage) => setPageIndex(newPage);
    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    const fetchImports = async () => {
        setLoading(true);
        const body = {
            pageIndex: pageIndex + 1,
            pageSize: rowPerPage,
            status: filterStatus || null,
            type: filterType || null,
            transactionFromDate: filterTransactionFromDate || null,
            transactionToDate: filterTransactionToDate || null
        };
        const response = await importService.getAllImports(body);
        setImports(response.data.items);
        setTotalCount(response.data.totalCount);
        setLoading(false);
    };

    useEffect(() => {
        fetchImports();
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

    const handleCreate = () => {
        setEditingImport(null);
        setModalOpen(true);
    };

    const handleConfirm = async (importData) => {
        setLoading(true);
        try {
            if (editingImport) {
                await importService.updateImport(editingImport.importId, importData);
                setModalSuccessMessage("Cập nhật phiếu nhập kho thành công");
            } else {
                await importService.createImport(importData);
                setModalSuccessMessage("Tạo phiếu nhập kho thành công");
            }
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchImports();
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
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




    return (
        <div className="flex flex-col p-4">
            <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4">
                <div className="flex flex-col w-3/4 mr-4">
                    <h1 className="text-2xl font-bold">Danh sách phiếu nhập</h1>
                </div>
                <div className="flex flex-col w-1/4 gap-2">
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

                    <button className="block border bg-blue-500 text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto" onClick={() => handleDownloadTemplate()}>Tải xuống mẫu phiếu nhập</button>
                </div>
            </div>

            {/* Filter sidebar */}
            <div className="p-4 rounded-2xl bg-white h-auto w-full mb-4">
                <h2 className="text-xl font-bold">Lọc phiếu nhập</h2>
                <div className="flex items-center my-4 gap-4">
                    <div className="mt-2 w-full">
                        <label className="mr-2">Trạng thái:</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterStatus || ""}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <div className="mt-2 w-full">
                        <label className="mr-2">Loại phiếu:</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <div className="mt-2 w-full">
                        <label className="mr-2">Giao dịch từ ngày:</label>
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
                    <div className="mt-2 w-full">
                        <label className="mr-2">Đến ngày:</label>
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
                <div className="flex justify-center">
                    <button
                        className="px-4 py-2 background-primary text-white rounded mx-auto cursor-pointer"
                        onClick={() => fetchImports()}
                        ref={buttonRef}
                    >
                        Lọc
                    </button>
                </div>
            </div>

            {/* Main content */}
            <TableCommon
                headers={headerData}
                tableData={imports}
                defaultSortColumn="transactionId"
                rowPerPage={rowPerPage}
                pageIndex={pageIndex}
                totalCount={totalCount}
                rowPerPageOptions={[5, 10, 20]}
                handleChangePage={handleChangePage}
                handleChangeRowPerPage={handleChangeRowPerPage}
                navigateDetail={(item) => navigate(`/imports/details/${item.transactionId}`)}
                handleEdit={(item) => console.log(`Edit ${item}`)}
                handleDelete={(item) => console.log(`Delete ID: ${item.transactionId}`)}
                messagePopupDelete="Bạn có muốn xóa phiếu nhập này không?"
                usePagination={true}
                useAction={true}
            />
            {/* <ImportForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={editingImport}
            /> */}
            <ImportResultModal isOpen={modalImportOpen} message={modalImportMessage} data={modalImportData} onClose={() => setModalImportOpen(false)} />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}