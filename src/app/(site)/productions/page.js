"use client";
import { productionService } from "@/services/production.service";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useLogin } from "@/context/LoginContext";
import DateInput from "@/components/Input/DateInput";

import TableCommon from "@/components/Table/table";
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";
import { getProductionStatus, getProductionStatusText } from '@/lib/getStatus';
import { formatDateToInput } from '@/lib/formattingLib';

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import Loader from "@/components/Loader/loader";

export default function Productions() {
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = new useLogin();

    const navigate = (path) => {
        router.push(path);
    };

    //Data state
    const [productions, setProductions] = useState([]);
    const [productionDetails, setProductionDetails] = useState([]);

    //Modal state
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");

    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

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
            key: "id",
            label: "ID sản xuất",
            customerValue: (item) => item.id && <div>{item.id}</div>
        },
        {
            key: "statusName",
            label: "Trạng thái",
            customValue: (item) => getProductionStatus(item.status)
        },
        {
            key: "note",
            label: "Ghi chú",
            customValue: (item) => item.note && <div>{item.note}</div>
        },
        {
            key: "startDate",
            label: "Ngày bắt đầu",
            customValue: (item) => item.startDate ? <div>{new Date(item.startDate).toLocaleString('vi-VN')}</div> : <div>Chưa có</div>
        },
        {
            key: "endDate",
            label: "Ngày hoàn thành",
            customValue: (item) => item.endDate ? <div>{new Date(item.endDate).toLocaleString('vi-VN')}</div> : <div>Chưa có</div>
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

    const fetchProductions = async () => {
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
            const response = await productionService.getAllProductions(body);
            setProductions(response.data.items);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
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
                const response = await productionService.getProductionDetail(production.id);
                detailsArr.push(response.data);
            } catch (error) {
                setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message}`);
                setModalFailedOpen(true);
            }
        }
        setProductionDetails(detailsArr);
    };

    // Fetch details when productions change (including on first load)
    useEffect(() => {
        if (!productions || productions.length === 0) {
            setProductionDetails([]);
            return;
        }
        fetchAllProductionDetails(productions);
    }, [productions])

    useEffect(() => {
        if (!pageReady) return;
        fetchProductions();
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
            fetchProductions();
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

    const handleUpdateToProcessing = async (id) => {
        try {
            await productionService.updateProductionToProcessing(id);
            setModalSuccessMessage(`Sản phẩm đang được sản xuất`);
            setModalSuccessOpen(true);
            fetchProductions();
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        }
    }

    const handleUpdateToFinish = async (id) => {
        window.open(`/productions/modify/update/${id}`, "_blank");
    }

    const handleUpdateToCancel = async (id) => {
        try {
            await productionService.updateProductionToCancel(id);
            setModalSuccessMessage(`Hủy sản xuất thành công`);
            setModalSuccessOpen(true);
            fetchProductions();
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        }
    }

    const tableDetail = (id) => {
        const production = productionDetails.find((production) => production.id === id);
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
                key: "quantity",
                label: "Số lượng",
                customValue: (item) => item.quantity && <div>{item.quantity}</div>
            }
        ]

        return (
            <div className='flex flex-row gap-4 w-full border border-black'>
                <div className="p-4">
                    <div className='bg-white px-4 py-2 rounded-xl bg-gray-100'>
                        <h1 className='text-xl font-bold'>Thông tin chi tiết</h1>
                        <p className='my-2'>Mã phiếu sản xuất: {production.id}</p>
                        <p className='my-2'>Ngày tạo phiếu sản xuất: {new Date(production.createdAt).toLocaleString('vi-VN')}</p>
                        <p className='my-2'>Ghi chú: {production.note}</p>
                        <div className='my-2 flex flex-row gap-2'>
                            <p>Trạng thái: </p>
                            {getProductionStatus(production.status)}
                        </div>
                    </div>
                    <div className='bg-white px-4 py-2'>
                        <h1 className='text-xl font-bold'>Nguyên liệu</h1>
                        <p className='my-2'>Mã sản phẩm: {material.productCode}</p>
                        <p className='my-2'>Tên sản phẩm: {material.productName}</p>
                        <p className='my-2'>Nhà kho: {material.warehouseName}</p>
                        <p className='my-2'>Số lượng: {material.quantity}</p>
                    </div>
                    <div className='bg-white px-4 py-2 w-[120%]'>
                        <div className='flex flex-row items-center gap-2'>
                            {production?.status === 0 && <button className='rounded-xl px-4 py-2 bg-blue-500 text-white' onClick={() => handleUpdateToProcessing(production.id)}>Bắt đầu sản xuất</button>}
                            {production?.status === 1 && <button className='rounded-xl px-4 py-2 bg-green-500 text-white' onClick={() => handleUpdateToFinish(production.id)}>Hoàn thành sản xuất</button>}
                            {production?.status === 0 && <button className='rounded-xl px-4 py-2 bg-red-500 text-white' onClick={() => handleUpdateToCancel(production.id)}>Hủy phiếu</button>}
                        </div>
                    </div>
                </div>
                <div className="p-4 w-full">
                    <h1 className='text-xl font-bold py-2'>Danh sách thành phẩm</h1>
                    <TableCommon
                        headers={headers}
                        tableData={production.finishProducts}
                    />
                </div>
            </div>
        )
    };

    if (!pageReady) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col p-4">
            <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4 justify-between">
                <div className="flex flex-col mr-4">
                    <h1 className="text-2xl font-bold">Danh sách phiếu sản xuất</h1>
                </div>
                <div className="flex flex-col gap-2">
                    <button className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto px-4" onClick={() => navigate("/productions/modify/create")}>Tạo phiếu sản xuất mới</button>
                </div>
            </div>

            {/* Filter sidebar */}
            <div className="p-4 rounded-2xl bg-white h-auto w-full mb-4">
                <h2 className="text-xl font-bold">Lọc phiếu sản xuất</h2>
                <div className="flex items-center my-4 gap-4">
                    <div className="mt-2 w-[24.25%]">
                        <label className="mr-2">Ngày bắt đầu từ:</label>
                        {/* <DateInput
                            className="w-full p-1.5 border border-gray-300 rounded block"
                            value={filterStartDateFrom}
                            onChange={(e) => setFilterStartDateFrom(e)}
                        /> */}
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
                        <label className="mr-2">Đến:</label>
                        {/* <DateInput
                            className="w-full p-1.5 border border-gray-300 rounded block"
                            value={filterStartDateTo}
                            onChange={(e) => setFilterStartDateTo(e)}
                            onKeyDown={handleKeyDown}
                        /> */}
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
                        <label className="mr-2">Ngày hoàn thành từ:</label>
                        {/* <DateInput
                            className="w-full p-1.5 border border-gray-300 rounded block"
                            value={filterEndDateFrom}
                            onChange={(e) => setFilterEndDateFrom(e)}
                        /> */}
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
                        <label className="mr-2">Đến:</label>
                        {/* <DateInput
                            className="w-full p-1.5 border border-gray-300 rounded block"
                            value={filterEndDateTo}
                            onChange={(e) => setFilterEndDateTo(e)}
                            onKeyDown={handleKeyDown}
                        /> */}
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
                        <label className="mr-2">Trạng thái:</label>
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
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}