"use client";
import { importService } from "@/services/import.service";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRef } from "react";

import TableCommon from "@/components/Table/table";
import { ImportForm } from "@/components/Form/importForm";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";

export default function Imports() {
    //Data state
    const [imports, setImports] = useState([]);
    const [editingImport, setEditingImport] = useState(null);

    //Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedMessage, setModalFailedMessage] = useState("");

    //Filter state
    const [filterBatchId, setFilterBatchId] = useState(0);
    const [filterBatchCode, setFilterBatchCode] = useState("");

    //Pagination state
    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(5);
    const [totalCount, setTotalCount] = useState(0);

    const { setLoading } = useLoading();
    const buttonRef = useRef(null);

    const headerData = [
        {
            key: "batchId",
            label: "Mã lô",
            customValue: (item) => item.batchId && <div>{item.batchId}</div>
        },
        {
            key: "warehouseId",
            label: "Mã kho",
            customValue: (item) => item.warehouseId && <div>{item.warehouseId}</div>
        },
        {
            key: "productId",
            label: "Mã sản phẩm",
            customValue: (item) => item.productId && <div>{item.productId}</div>
        },
        {
            key: "transactionId",
            label: "Mã giao dịch",
            customValue: (item) => item.transactionId && <div>{item.transactionId}</div>
        },
        {
            key: "batchCode",
            label: "Code lô",
            customValue: (item) => item.batchCode && <div>{item.batchCode}</div>
        },
        {
            key: "importDate",
            label: "Ngày nhập",
            customValue: (item) => item.importDate && <div>{new Date(item.importDate).toLocaleDateString('vi-VN')}</div>
        },
        {
            key: "expireDate",
            label: "Ngày hết hạn",
            customValue: (item) => item.expireDate && <div>{new Date(item.expireDate).toLocaleDateString('vi-VN')}</div>
        },
        {
            key: "quantityIn",
            label: "Số lượng nhập",
            customValue: (item) => item.quantityIn && <div>{item.quantityIn}</div>
        },
        {
            key: "quantityOut",
            label: "Số lượng xuất",
            customValue: (item) => item.quantityOut && <div>{item.quantityOut}</div>
        },
        {
            key: "isActive",
            label: "Trạng thái",
            customValue: (item) => item.isActive == 1 ? <div className="text-green-600">Đang hoạt động</div> : <div className="text-red-600">Dừng hoạt động</div>
        },
        {
            key: "note",
            label: "Ghi chú",
            customValue: (item) => item.note && <div>{item.note}</div>
        },
        {
            key: "lastUpdated",
            label: "Ngày cập nhật",
            customValue: (item) => item.lastUpdated && <div>{new Date(item.lastUpdated).toLocaleDateString('vi-VN')}</div>
        }
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
            batchId: filterBatchId,
            batchCode: filterBatchCode
        };
        const response = await importService.getAllImports(body);
        setImports(response.data.items);
        setTotalCount(response.data.totalCount);
        setLoading(false);
    };


    useEffect(() => {
        fetchImports();
    }, [pageIndex, rowPerPage]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            buttonRef.current?.click();
        }
    };

    const handleConfirm = async (importData) => {
        setLoading(true);
        try {
            if (editingImport) {
                await importService.updateImport(editingImport.importId, importData);
                setModalSuccessMessage("Cập nhật danh mục thành công");
            } else {
                await importService.createImport(importData);
                setModalSuccessMessage("Tạo danh mục thành công");
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

    return (
        <div className="flex flex-col p-4">
            <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4">
                <div className="flex flex-col w-3/4 mr-4">
                    <h1 className="text-2xl font-bold">Danh sách phiếu nhập</h1>
                </div>
                <div className="flex flex-col w-1/4">
                    <button className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto" onClick={() => handleCreate()}>Tạo phiếu nhập mới</button>
                </div>
            </div>
            {/* Filter sidebar */}
            <div className="p-4 rounded-2xl bg-white h-auto w-full mb-4">
                <h2 className="text-xl font-bold">Lọc phiếu nhập</h2>
                <div className="flex items-center my-4 gap-4">
                    <div className="mt-2 w-50%">
                        <label className="mr-2">Mã lô:</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterBatchId}
                            onChange={(e) => setFilterBatchId(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <div className="mt-2 w-50%">
                        <label className="mr-2">Code lô:</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterBatchCode}
                            onChange={(e) => setFilterBatchCode(e.target.value)}
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
                defaultSortColumn="batchId"
                rowPerPage={rowPerPage}
                pageIndex={pageIndex}
                totalCount={totalCount}
                rowPerPageOptions={[5, 10, 20]}
                handleChangePage={handleChangePage}
                handleChangeRowPerPage={handleChangeRowPerPage}
                handleEdit={(item) => console.log(`Edit ${item}`)}
                handleDelete={(item) => console.log(`Delete ID: ${item.batchId}`)}
                messagePopupDelete="Bạn có muốn xóa phiếu nhập này không?"
                usePagination={true}
            />
            <ImportForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={editingImport}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}