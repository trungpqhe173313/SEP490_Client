"use client";
import { productionEmployeeService } from "@/services/productionEmployee.service";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useLogin } from "@/context/LoginContext";

import TableCommon from "@/components/Table/table";
import { DeviceForm } from "@/components/Form/deviceForm";
import { getProductionStatus, getProductionStatusText } from '@/lib/getStatus';
import { formatDateToInput } from '@/lib/formattingLib';

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import ConfirmModal from "@/components/Modal/confirmModal";
import Loader from "@/components/Loader/loader";

export default function MyProductions() {
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const navigate = (path) => {
        router.push(path);
    };

    //Data state
    const [productions, setProductions] = useState([]);
    const [productionDetails, setProductionDetails] = useState([]);
    const [processingId, setProcessingId] = useState(null);
    const [selectedProductionId, setSelectedProductionId] = useState(null);

    //Modal state
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");

    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
    const [modalConfirmMessage, setModalConfirmMessage] = useState("");
    const [modalConfirmAction, setModalConfirmAction] = useState(null);

    const [modalDeviceOpen, setModalDeviceOpen] = useState(false);

    //Filter state
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterStartDateFrom, setFilterStartDateFrom] = useState("");
    const [filterStartDateTo, setFilterStartDateTo] = useState("");
    const [filterEndDateFrom, setFilterEndDateFrom] = useState("");
    const [filterEndDateTo, setFilterEndDateTo] = useState("");

    const [errorStartDateTo, setErrorStartDateTo] = useState("");
    const [errorEndDateTo, setErrorEndDateTo] = useState("");

    //Pagination state
    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const { loading, setLoading } = useLoading();
    const buttonRef = useRef(null);
    const [pageReady, setPageReady] = useState(false);

    const pageRole = ["Employee"];

    useEffect(() => {
        refreshUserInfo();
    }, []);

    useEffect(() => {
        if (loading) return;
        
        if (isLogin && user?.roles && user.roles.some((r) => pageRole.includes(r))) {
            setPageReady(true);
        } else if (!isLogin) {
            router.push("/login");
        } else if (!user?.roles?.some((r) => pageRole.includes(r))) {
            router.push("/");
        }
    }, [isLogin, user, router, loading]);

    const headerData = [
        {
            key: "id",
            label: "ID sản xuất",
            customValue: (item) => item.id && <div>{item.id}</div>
        },
        {
            key: "statusName",
            label: "Trạng thái",
            customValue: (item) => getProductionStatus(item.status)
        },
        // {
        //     key: "note",
        //     label: "Ghi chú",
        //     customValue: (item) => item.note || <div className="text-gray-400">Không có</div>
        // },
        {
            key: "startDate",
            label: "Ngày bắt đầu",
            customValue: (item) => item.startDate ? <div>{new Date(item.startDate).toLocaleString('vi-VN')}</div> : <div className="text-gray-400">Chưa bắt đầu</div>
        },
        {
            key: "endDate",
            label: "Ngày hoàn thành",
            customValue: (item) => item.endDate ? <div>{new Date(item.endDate).toLocaleString('vi-VN')}</div> : <div className="text-gray-400">Chưa hoàn thành</div>
        },
        {
            key: "createdAt",
            label: "Ngày tạo",
            customValue: (item) => item.createdAt && <div>{new Date(item.createdAt).toLocaleString('vi-VN')}</div>
        }
    ]

    const handleChangePage = (event, newPage) => setPageIndex(newPage);
    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    const fetchMyProductions = async () => {
        setLoading(true);
        try {
            const body = {
                pageIndex: pageIndex + 1,
                pageSize: rowPerPage,
                status: parseInt(filterStatus) || null,
                startDateFrom: filterStartDateFrom || null,
                startDateTo: filterStartDateTo || null,
                endDateFrom: filterEndDateFrom || null,
                endDateTo: filterEndDateTo || null
            }
            const response = await productionEmployeeService.getMyProductionOrders(body);
            
            setProductions(response.data.items);
            setTotalCount(response.data.totalCount);
            
            // Check if there's already a production in processing
            const processing = response.data.items.find(item => item.status === 1);
            setProcessingId(processing?.id || null);
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message || 'Không thể tải dữ liệu'}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    }

    // Fetch details for all productions
    const fetchAllProductionDetails = async (productionList) => {
        const detailsArr = [];
        for (const production of productionList) {
            try {
                const response = await productionEmployeeService.getProductionDetail(production.id);
                const weightLog = await productionEmployeeService.getProductionWeight(production.id);
                const cart = response.data.finishProducts.map((item) => ({
                    productCode: item.productCode,
                    productName: item.productName,
                    warehouseName: item.warehouseName,
                    productId: item.productId,
                    quantity: weightLog.data.products.find((p) => p.productId === item.productId)?.totalBags || item.quantity,
                    actualWeight: weightLog.data.products.find((p) => p.productId === item.productId)?.totalWeight || 0,
                    weightPerUnit: item.weightPerUnit
                }));
                detailsArr.push({
                    ...response.data,
                    cart: cart
                });
            } catch (error) {
                console.error(`Error fetching detail for production ${production.id}:`, error);
            }
        }
        setProductionDetails(detailsArr);
    };

    useEffect(() => {
        if (!productions || productions.length === 0) {
            setProductionDetails([]);
            return;
        }
        fetchAllProductionDetails(productions);
    }, [productions])

    useEffect(() => {
        if (!pageReady) return;
        fetchMyProductions();
    }, [pageIndex, rowPerPage, pageReady]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            buttonRef.current?.click();
        }
    };

    useEffect(() => {
        validateFields();
    }, [filterEndDateTo, filterEndDateFrom, filterStartDateTo, filterStartDateFrom]);

    const validateFields = () => {
        if (filterEndDateTo && filterEndDateFrom > filterEndDateTo) {
            setErrorEndDateTo("Ngày hoàn thành đến phải lớn hơn ngày hoàn thành từ");
            return false;
        } else {
            setErrorEndDateTo("");
        }

        if (filterStartDateTo && filterStartDateFrom > filterStartDateTo) {
            setErrorStartDateTo("Ngày bắt đầu đến phải lớn hơn ngày bắt đầu từ");
            return false;
        } else {
            setErrorStartDateTo("");
        }

        return true;
    };

    const handleApplyFilter = () => {
        if (validateFields()) {
            setPageIndex(0);
            fetchMyProductions();
        }
    };

    const handleClearFilter = () => {
        setFilterStatus(null);
        setFilterStartDateFrom("");
        setFilterStartDateTo("");
        setFilterEndDateFrom("");
        setFilterEndDateTo("");
        setErrorEndDateTo("");
        setErrorStartDateTo("");
        setPageIndex(0);
    };

    const handleStartProduction = async (id) => {
        if (processingId && processingId !== id) {
            setModalFailedMessage(`Bạn đang sản xuất phiếu với mã ${processingId}. Vui lòng hoàn thành phiếu đó trước`);
            setModalFailedOpen(true);
            return;
        }
        setSelectedProductionId(id);
        setModalDeviceOpen(true);
    }

    const handleConfirmStartProduction = async (data) => {
        if (!selectedProductionId) return;
        try {
            setLoading(true);
            await productionEmployeeService.startProduction(selectedProductionId, data);
            setModalSuccessMessage(`Đã bắt đầu sản xuất`);
            setModalSuccessOpen(true);
            fetchMyProductions();
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message || 'Không thể bắt đầu sản xuất'}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
            setModalDeviceOpen(false);
        }
    }

    const handleCompleteProduction = async (id) => {
        window.open(`/productions/modify/update/${id}`, "_blank");
    }

    const handleSubmitForApproval = (id) => {
        setModalConfirmMessage("Bạn có chắc chắn muốn gửi phiếu này để phê duyệt?");
        setModalConfirmAction(() => () => confirmSubmitForApproval(id));
        setModalConfirmOpen(true);
    }

    const confirmSubmitForApproval = async (id) => {
        try {
            setLoading(true);
            await productionEmployeeService.submitForApproval(id);
            setModalSuccessMessage(`Đã gửi phiếu sản xuất để chờ phê duyệt`);
            setModalSuccessOpen(true);
            fetchMyProductions();
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message || 'Không thể gửi phê duyệt'}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
            setModalConfirmOpen(false);
        }
    }

    const tableDetail = (id) => {
        const production = productionDetails.find((production) => production.id === id);

        if (!production) {
            return <div className="p-4 text-center">Đang tải chi tiết...</div>;
        }

        if (!production.materials || production.materials.length === 0) {
            return <div className="p-4 text-center">Không có dữ liệu nguyên liệu.</div>;
        }

        const material = production.materials[0];

        const headers = [
            {
                key: "productCode",
                label: "Mã sản phẩm",
                customValue: (item) => item.productCode && <div>{item.productCode}</div>
            },
            {
                key: "productName",
                label: "Tên sản phẩm",
                customValue: (item) => item.productName && <div>{item.productName}</div>
            },
            {
                key: "warehouseName",
                label: "Nhà kho",
                customValue: (item) => item.warehouseName && <div>{item.warehouseName}</div>
            },
            {
                key: "weightPerUnit",
                label: "Khối lượng/đơn vị",
                customValue: (item) => item.weightPerUnit && <div>{item.weightPerUnit} kg</div>
            },
            {
                key: "quantity",
                label: "Số lượng",
                customValue: (item) => production.status >= 2 && item.quantity > 0 ? <div>{item.quantity}</div> : <div className="text-gray-400">Chưa có</div>
            },
            {
                key: "totalWeight",
                label: "Khối lượng thành phẩm",
                customValue: (item) => {
                    if (production.status >= 2) {
                        const weight = item.actualWeight || (item.quantity * item.weightPerUnit);
                        return <div>{Math.round(weight * 1000) / 1000} kg</div>;
                    }
                    return <div className="text-gray-400">Chưa có</div>;
                }
            },
        ];

        return (
            <div className='flex flex-row gap-4 w-full border border-gray-200 rounded-lg bg-gray-50'>
                <div className="p-4 w-1/3">
                    <div className='bg-white px-4 py-2 rounded-xl shadow-sm mb-4'>
                        <h1 className='text-xl font-bold mb-3 text-gray-800'>Thông tin chi tiết</h1>
                        <p className='my-2'><span className="font-semibold">Mã phiếu:</span> {production.id}</p>
                        <p className='my-2'><span className="font-semibold">Ngày tạo:</span> {new Date(production.createdAt).toLocaleString('vi-VN')}</p>
                        <p className='my-2'><span className="font-semibold">Ghi chú:</span> {production.note || <span className="text-gray-400">Không có</span>}</p>
                        <div className='my-2 flex flex-row gap-2 items-center'>
                            <span className="font-semibold">Trạng thái:</span>
                            {getProductionStatus(production.status)}
                        </div>
                    </div>
                    <div className='bg-white px-4 py-2 rounded-xl shadow-sm mb-4'>
                        <h1 className='text-xl font-bold mb-3 text-gray-800'>Nguyên liệu</h1>
                        <p className='my-2'><span className="font-semibold">Mã:</span> {material.productCode}</p>
                        <p className='my-2'><span className="font-semibold">Tên:</span> {material.productName}</p>
                        <p className='my-2'><span className="font-semibold">Kho:</span> {material.warehouseName}</p>
                        <p className='my-2'><span className="font-semibold">Số lượng:</span> {material.quantity} bao</p>
                    </div>
                    <div className='bg-white px-4 py-2 rounded-xl shadow-sm'>
                        <h1 className='text-xl font-bold mb-3 text-gray-800'>Hành động</h1>
                        <div className='flex flex-col gap-2'>
                            {production?.status === 0 && (
                                <button 
                                    className='rounded-xl px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-all' 
                                    onClick={() => handleStartProduction(production.id)}
                                >
                                    🚀 Bắt đầu sản xuất
                                </button>
                            )}
                            {production?.status === 1 && (
                                <>
                                    <button 
                                        className='rounded-xl px-4 py-2 bg-green-500 text-white hover:bg-green-600 transition-all' 
                                        onClick={() => handleCompleteProduction(production.id)}
                                    >
                                        ✅ Hoàn thành sản xuất
                                    </button>
                                    <button 
                                        className='rounded-xl px-4 py-2 bg-purple-500 text-white hover:bg-purple-600 transition-all' 
                                        onClick={() => handleSubmitForApproval(production.id)}
                                    >
                                        📝 Gửi phê duyệt
                                    </button>
                                </>
                            )}
                            {production?.status === 3 && (
                                <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                                    <p className="text-yellow-800">⏳ Đang chờ Manager phê duyệt</p>
                                </div>
                            )}
                            {production?.status === 2 && (
                                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                                    <p className="text-green-800">✅ Đã hoàn thành</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-4 w-2/3">
                    <h1 className='text-xl font-bold py-2 text-gray-800'>Danh sách thành phẩm</h1>
                    <TableCommon
                        headers={headers}
                        tableData={production.cart || []}
                    />
                </div>
            </div>
        );
    };

    if (!pageReady) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col p-4">
            <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4 justify-between items-center shadow-sm">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-gray-800">Phiếu sản xuất của tôi</h1>
                    <p className="text-gray-600 text-sm mt-1">Quản lý các phiếu sản xuất được giao</p>
                </div>
                {processingId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
                        <p className="text-blue-800 text-sm">
                            🔄 Đang sản xuất phiếu: <strong>#{processingId}</strong>
                        </p>
                    </div>
                )}
            </div>

            {/* Filter sidebar */}
            <div className="p-4 rounded-2xl bg-white h-auto w-full mb-4 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800">Lọc phiếu sản xuất</h2>
                <div className="flex items-center my-4 gap-4">
                    <div className="mt-2 w-[24.25%]">
                        <label className="mr-2 font-semibold text-gray-700">Ngày bắt đầu từ:</label>
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterStartDateFrom && formatDateToInput(filterStartDateFrom)}
                            onChange={(e) => {
                                const date = new Date(e.target.value);
                                setFilterStartDateFrom(date);
                            }}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <div className="mt-2 w-[24.25%]">
                        <label className="mr-2 font-semibold text-gray-700">Đến:</label>
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterStartDateTo && formatDateToInput(filterStartDateTo)}
                            onChange={(e) => {
                                const date = new Date(e.target.value);
                                setFilterStartDateTo(date);
                            }}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <div className="mt-2 w-[24.25%]">
                        <label className="mr-2 font-semibold text-gray-700">Ngày hoàn thành từ:</label>
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterEndDateFrom && formatDateToInput(filterEndDateFrom)}
                            onChange={(e) => {
                                const date = new Date(e.target.value);
                                setFilterEndDateFrom(date);
                            }}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <div className="mt-2 w-[24.25%]">
                        <label className="mr-2 font-semibold text-gray-700">Đến:</label>
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterEndDateTo && formatDateToInput(filterEndDateTo)}
                            onChange={(e) => {
                                const date = new Date(e.target.value);
                                setFilterEndDateTo(date);
                            }}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </div>
                <div className="flex items-center my-4 gap-4">
                    <div className="mt-2 w-[24.25%]">
                        <label className="mr-2 font-semibold text-gray-700">Trạng thái:</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded"
                            value={filterStatus || ""}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            onKeyDown={handleKeyDown}
                        >
                            <option value="">Tất cả</option>
                            <option value={0}>{getProductionStatusText(0)}</option>
                            <option value={1}>{getProductionStatusText(1)}</option>
                            <option value={2}>{getProductionStatusText(2)}</option>
                            <option value={3}>{getProductionStatusText(3)}</option>
                        </select>
                    </div>
                </div>
                <div className="flex flex-col justify-center">
                    {errorStartDateTo && <span className="text-red-500 text-center mb-2">{errorStartDateTo}</span>}
                    {errorEndDateTo && <span className="text-red-500 text-center mb-2">{errorEndDateTo}</span>}
                    <div className="flex flex-row items-center justify-center gap-4">
                        <button
                            className="px-4 py-2 background-primary text-white rounded cursor-pointer hover:opacity-90 transition-all"
                            onClick={() => handleApplyFilter()}
                            ref={buttonRef}
                        >
                            🔍 Lọc
                        </button>
                        <button
                            className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer hover:bg-red-700 transition-all"
                            onClick={() => handleClearFilter()}
                        >
                            🗑️ Xóa bộ lọc
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <TableCommon
                headers={headerData}
                tableData={productions}
                defaultSortColumn="createdAt"
                defaultSortType="desc"
                rowPerPage={rowPerPage}
                pageIndex={pageIndex}
                totalCount={totalCount}
                rowPerPageOptions={[5, 10, 20]}
                handleChangePage={handleChangePage}
                handleChangeRowPerPage={handleChangeRowPerPage}
                usePagination={true}
                useDetail={true}
                tableDetail={tableDetail}
            />

            <DeviceForm 
                isOpen={modalDeviceOpen} 
                onClose={() => setModalDeviceOpen(false)} 
                onConfirm={handleConfirmStartProduction} 
            />
            <ConfirmModal 
                isOpen={modalConfirmOpen} 
                message={modalConfirmMessage} 
                onClose={() => setModalConfirmOpen(false)} 
                onConfirm={modalConfirmAction} 
            />
            <SuccessModal 
                isOpen={modalSuccessOpen} 
                message={modalSuccessMessage} 
                onClose={() => setModalSuccessOpen(false)} 
            />
            <FailedModal 
                isOpen={modalFailedOpen} 
                message={modalFailedMessage} 
                subMessages={modalFailedSubMessages} 
                onClose={() => setModalFailedOpen(false)} 
            />
        </div>
    )
}
