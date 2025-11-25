"use client";
import { priceListService } from "@/services/priceList.service";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import { PriceListForm } from "@/components/Form/priceListForm";
import TableCommon from "@/components/Table/table";
import Loader from "@/components/Loader/loader";
import { formatDateToInput } from '@/lib/formatDateToInput';

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import DateInput from "@/components/Input/DateInput";

export default function PriceList() {
    //Data state
    const [priceLists, setPriceLists] = useState([]);
    const [editingPriceList, setEditingPriceList] = useState(null);
    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Manager"];

    //Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");

    //Filter state
    const [filterPriceListName, setFilterPriceListName] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");
    const [filterIsActive, setFilterIsActive] = useState(null);

    const [errorEndDate, setErrorEndDate] = useState("");

    //Pagination state
    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const { loading, setLoading } = useLoading();
    const { isLogin, user, refreshUserInfo } = useLogin();
    const router = useRouter();
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

    const headerData = [
        {
            key: "priceListId",
            label: "Mã bảng giá",
            customValue: (item) => item.priceListId && <div>{item.priceListId}</div>,
        },
        {
            key: "priceListName",
            label: "Tên bảng giá",
            customValue: (item) => item.priceListName && <div>{item.priceListName}</div>,
        },
        {
            key: "startDate",
            label: "Ngày hiệu lực",
            customValue: (item) => item.startDate && <div>{new Date(item.startDate).toLocaleString()}</div>,
        },
        {
            key: "endDate",
            label: "Ngày hết hiệu lực",
            customValue: (item) => item.endDate && <div>{new Date(item.endDate).toLocaleString()}</div>,
        },
        {
            key: "isActive",
            label: "Trạng thái",
            customValue: (item) => item.isActive ? <div className="text-green-600">Đang hoạt động</div> : <div className="text-red-600">Dừng hoạt động</div>
        },
        {
            key: "createdAt",
            label: "Ngày tạo",
            customValue: (item) => item.createdAt && <div>{new Date(item.createdAt).toLocaleString()}</div>,
        }
    ];

    // Pagination handlers
    const handleChangePage = (event, newPage) => setPageIndex(newPage);
    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    const fetchPriceLists = async () => {
        setLoading(true);
        try {
            const body = {
                pageIndex: pageIndex + 1,
                pageSize: rowPerPage,
                priceListName: filterPriceListName,
                startDate: filterStartDate || null,
                endDate: filterEndDate || null,
                isActive: filterIsActive === "true" ? true : filterIsActive === "false" ? false : null
            }
            const response = await priceListService.getAllPriceLists(body);
            setPriceLists(response.data.items);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!pageReady) return;
        fetchPriceLists();
    }, [pageIndex, rowPerPage, pageReady]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            buttonRef.current?.click();
        }
    };

    useEffect(() => {
        validateFields();
    }, [filterEndDate]);

    const validateFields = () => {
        if (filterEndDate && filterStartDate > filterEndDate) {
            setErrorEndDate("Ngày hết hiệu lực phải lớn hơn ngày có hiệu lực");
            return false;
        }
        setErrorEndDate("");
        return true;
    }

    const handleApplyFilter = () => {
        if (validateFields()) {
            setPageIndex(0);
            fetchPriceLists();
        }
    };

    const handleClearFilter = () => {
        setFilterPriceListName("");
        setFilterStartDate("");
        setFilterEndDate("");
        setFilterIsActive(null);
        setPageIndex(0);
    };

    const handleCreate = () => {
        setEditingPriceList(null);
        setModalOpen(true);
    };

    const handleEdit = (priceList) => {
        setEditingPriceList(priceList);
        setModalOpen(true);
    };

    const handleConfirm = async (priceListData) => {
        setLoading(true);
        try {
            if (editingPriceList) {
                await priceListService.updatePriceList(editingPriceList.priceListId, priceListData);
                setModalSuccessMessage("Cập nhật bảng giá thành công");
            } else {
                await priceListService.createPriceList(priceListData);
                setModalSuccessMessage("Tạo bảng giá thành công");
            }
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchPriceLists();
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error?.response?.data?.statusCode}: ${error?.response?.data?.error?.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (priceList) => {
        if (priceList.isActive === false) {
            setModalFailedMessage("Bảng giá đã bị xóa từ trước");
            setModalFailedOpen(true);
            return;
        }
        setLoading(true);
        try {
            await priceListService.deletePriceList(priceList.priceListId);
            fetchPriceLists();
            setModalSuccessMessage("Xóa bảng giá thành công");
            setModalSuccessOpen(true);
        } catch (error) {
            console.error("Error deleting price list:", error);
            setModalFailedMessage("Có lỗi xảy ra, vui lòng thử lại sau");
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };


    const navigate = (url) => {
        router.push(url);
    };

    if (!pageReady) {
        return <Loader />;
    }

    return (
        <div className="grid grid-cols-4 p-8 gap-4">
             {/* Filter sidebar */}
            <div className="col-span-1">
                <div className="p-4 rounded-2xl bg-white h-auto sticky top-0 w-full">
                    <h2 className="text-xl font-bold">Lọc bảng giá</h2>
                    <div className="flex flex-col items-center my-4">
                        <div className="mt-2 w-full">
                            <label className="mr-2">Tên bảng giá:</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={filterPriceListName}
                                onChange={(e) => setFilterPriceListName(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className="mt-2 w-full">
                            <label className="mr-2">Trạng thái:</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded"
                                value={filterIsActive && filterIsActive !== "null" ? filterIsActive : "null"}
                                onChange={(e) => setFilterIsActive(e.target.value)}
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
                            {/* <DateInput value={filterStartDate} onChange={(d) => setFilterStartDate(d)} className="w-full p-2 border border-gray-300 rounded"/> */}
                            <input
                                type="date"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={filterStartDate && formatDateToInput(filterStartDate)}
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    setFilterStartDate(date);
                                }}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="mr-2">Ngày tạo đến</label>
                            {/* <DateInput value={filterEndDate} onChange={(d) => setFilterEndDate(d)} className="w-full p-2 border border-gray-300 rounded"/> */}
                            <input
                                type="date"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={filterEndDate && formatDateToInput(filterEndDate)}
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    setFilterEndDate(date);
                                }}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        {errorEndDate && <span className="text-red-500">{errorEndDate}</span>}
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
                        <button
                            className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
                            onClick={handleClearFilter}
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            </div>
            {/* Main content */}
            <div className="col-span-3">
                <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4 justify-between">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold">Danh sách bảng giá</h1>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button className="px-4 py-2 background-primary text-white rounded-xl cursor-pointer" onClick={() => handleCreate()}>Tạo bảng giá mới</button>
                        <button className="px-4 py-2 bg-yellow-500 text-white rounded-xl cursor-pointer" onClick={() => router.push("/price-list/modify")}>Chỉnh sửa chi tiết bảng giá</button>
                    </div>
                </div>
                <TableCommon
                    headers={headerData}
                    tableData={priceLists}
                    defaultSortColumn="createdAt"
                    defaultSortType="desc"
                    rowPerPage={rowPerPage}
                    pageIndex={pageIndex}
                    totalCount={totalCount}
                    rowPerPageOptions={[5, 10, 20]}
                    handleChangePage={handleChangePage}
                    handleChangeRowPerPage={handleChangeRowPerPage}
                    navigateDetail={(item) => navigate(`price-list/details/${item.priceListId}`)}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    messagePopupDelete="Bạn có muốn xóa bảng giá này?"
                    usePagination={true}
                    useAction={true}
                />
            </div>
            <PriceListForm isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleConfirm} initialData={editingPriceList} />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    );
}