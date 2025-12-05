"use client";
import { returnService } from "@/services/return.service";
import { useLogin } from "@/context/LoginContext";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import TableCommon from "@/components/Table/table";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import Loader from "@/components/Loader/loader";


export default function Returns({ params }) {
    const router = useRouter();
    const { type } = React.use(params);
    const navigate = (path) => {
        router.push(path);
    };
    //Data state
    const [returns, setReturns] = useState([]);

    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");

    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    //Pagination state
    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const pageRole = ["Manager"];
    const { loading, setLoading } = useLoading();
    const { isLogin, user, refreshUserInfo } = useLogin();
    const buttonRef = useRef(null);
    const [pageReady, setPageReady] = useState(false);

    const headerData = [
        {
            key: "returnTransactionId",
            label: "Mã trả hàng",
            customValue: (item) => item.returnTransactionId && <div>{item.returnTransactionId}</div>
        },
        {
            key: "transactionId",
            label: "Mã giao dịch",
            customValue: (item) => item.transactionId && <div>{item.transactionId}</div>
        },
        {
            key: "warehouseName",
            label: "Nhà kho",
            customValue: (item) => item.warehouseName && <div>{item.warehouseName}</div>
        },
        type === "import" && {
            key: "supplierName",
            label: "Nhà cung cấp",
            customValue: (item) => item.supplierName && <div>{item.supplierName === "N/A" ? "Chuyển kho" : item.supplierName}</div>
        },
        type === "export" && {
            key: "customerName",
            label: "Khách hàng",
            customValue: (item) => item.customerName && <div>{item.customerName}</div>
        },
        {
            key: "reason",
            label: "Lí do trả hàng",
            customValue: (item) => item.reason ? <div>{item.reason}</div> : <div>Không có</div>
        },
        {
            key: "transactionDate",
            label: "Ngày giao dịch",
            customValue: (item) => item.transactionDate && <div>{new Date(item.transactionDate).toLocaleString('vi-VN')}</div>
        },
        {
            key: "createdAt",
            label: "Ngày tạo",
            customValue: (item) => item.createdAt && <div>{new Date(item.createdAt).toLocaleString('vi-VN')}</div>
        },
        {
            key: "action",
            label: "Hành động",
            customValue: (item) => item.returnTransactionId ? <button className="text-white bg-cyan-500 px-4 py-2 rounded-xl" onClick={() => navigate(`/returns/details/${item.returnTransactionId}`)}>Chi tiết</button> : <div>Không có</div>
        },
    ]

    //Pagination handlers
    const handleChangePage = (event, newPage) => setPageIndex(newPage);
    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const body = {
                pageIndex: pageIndex + 1,
                pageSize: rowPerPage,
                type: type
            }
            const response = await returnService.getAllReturns(body);
            setReturns(response.data.items);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    }

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
        fetchReturns();
    }, [pageIndex, rowPerPage, pageReady]);

    if (!pageReady) return <Loader />;

    return (
        <div className="flex flex-col p-4">
            <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4 justify-between">
                <div className="flex flex-col mr-4">
                    <h1 className="text-2xl font-bold">Danh sách phiếu trả hàng {type === "import" ? "nhập" : "xuất"}</h1>
                </div>
            </div>

            {/* Main content */}
            <TableCommon
                headers={headerData}
                tableData={returns}
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