'use client';
import { payrollService } from '@/services/payroll.service';

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";

import TableCommon from "@/components/Table/table";
import { PayrollForm } from "@/components/Form/payrollForm";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import Loader from "@/components/Loader/loader";
import { formatLargeNumber } from '@/lib/formattingLib';

export default function Payrolls() {
    const months = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];

    const [payrolls, setPayrolls] = useState([]);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const { isLogin, user, refreshUserInfo } = useLogin();

    const [modalOpen, setModalOpen] = useState(false);

    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");

    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");

    //Pagination state
    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const { loading, setLoading } = useLoading();
    const [pageReady, setPageReady] = useState(false);
    const router = useRouter();
    const pageRole = ["Admin"];

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

    // Pagination handlers
    const handleChangePage = (event, newPage) => setPageIndex(newPage);
    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    const fetchPayrolls = async () => {
        try {
            const response = await payrollService.getAllPayroll(selectedYear, selectedMonth);
            setPayrolls(response.data);
            setTotalCount(response.data.length);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!pageReady) return;
        fetchPayrolls();
    }, [selectedMonth, selectedYear, pageReady]);

    const handleCreate = async (payroll) => {
        try {
            setLoading(true)
            const body = {
                employeeId: payroll.employeeId,
                month: selectedMonth,
                year: selectedYear,
                note: payroll.note || null
            }
            await payrollService.createPayroll(body);
            setModalSuccessMessage("Tạo bảng lương thành công");
            setModalSuccessOpen(true);
            await fetchPayrolls();
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handlePay = (payroll) => {
        setSelectedPayroll(payroll);
        setModalOpen(true);
    };

    const handleConfirm = async (payrollData) => {
        setLoading(true);
        try {
            const body = {
                payrollId: selectedPayroll.payrollId,
                paymentMethod: payrollData.paymentMethod,
                note: payrollData.note || null
            }
            await payrollService.payPayroll(body);
            setModalSuccessMessage("Thanh toán thành công");
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchPayrolls();
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const headerData = [
        {
            key: "employeeId",
            label: "ID nhân viên",
            customValue: (item) => item.employeeId && <div>{item.employeeId}</div>,
        },
        {
            key: "employeeName",
            label: "Tên nhân viên",
            customValue: (item) => item.employeeName && <div>{item.employeeName}</div>,
        },
        {
            key: "note",
            label: "Ghi chú",
            customValue: (item) => item.note ? <div>{item.note}</div> : <div>Không có</div>,
        },
        {
            key: "paidDate",
            label: "Ngày trả lương",
            customValue: (item) => item.paidDate ? <div>{new Date(item.paidDate).toLocaleString('vi-VN')}</div> : <div>Chưa có</div>,
        },
        {
            key: "totalAmount",
            label: "Tổng lương tạm tính",
            customValue: (item) => item.totalAmount && <div>{formatLargeNumber(item.totalAmount)}₫</div>,
        },
        {
            key: "status",
            label: "Trạng thái",
            customValue: (item) => item.status === "Chưa tạo bảng lương" ? <div className="text-yellow-500">{item.status}</div>
                : item.status === "Đã thanh toán" ? <div className="text-green-500">{item.status}</div>
                    : <div className="text-blue-500">{item.status}</div>,
        }
    ]

    const tableDetail = (id) => {
        if (payrolls.length === 0) return null;
        const detail = payrolls.find((item) => item.employeeId === id);
        const headers = [
            {
                key: "jobName",
                label: "Tên công việc",
                customValue: (item) => item.jobName && <div>{item.jobName}</div>
            },
            {
                key: "payType",
                label: "Hình thức tính",
                customValue: (item) => item.payType === "Per_Tan" ? <div>Theo số tấn</div> : item.payType === "Per_Ngay" ? <div>Theo số ngày</div> : <div>Chưa có</div>
            },
            {
                key: "rate",
                label: "Mức trả",
                customValue: (item) => item.rate && <div>{formatLargeNumber(item.rate)}₫{item.payType === "Per_Tan" ? "/tấn" : item.payType === "Per_Ngay" ? "/ngày" : ""}</div>
            },
            {
                key: "quantity",
                label: "Số công",
                customValue: (item) => item.quantity && <div>{item.quantity}</div>
            },
            {
                key: "amount",
                label: "Thành tiền (mức trả x số công)",
                customValue: (item) => item.amount && <div>{formatLargeNumber(item.amount)}₫</div>
            }
        ]

        return (
            <div className='flex flex-row gap-4 w-full border border-black p-4'>
                <div className="w-1/4">
                    <div className='bg-white px-4 py-2 rounded-xl bg-gray-100'>
                        <h1 className='text-xl font-bold'>Thông tin chi tiết</h1>
                        <p className='my-2'>Mã nhân viên: {detail.employeeId}</p>
                        <p className='my-2'>Tên nhân viên: {detail.employeeName}</p>
                        <div className='my-2 flex flex-row gap-2'>
                            <p>Trạng thái: </p>
                            {detail.status === "Chưa tạo bảng lương" ? <div className="text-yellow-500">{detail.status}</div>
                                : detail.status === "Đã thanh toán" ? <div className="text-green-500">{detail.status}</div>
                                    : <div className="text-blue-500">{detail.status}</div>}
                        </div>
                    </div>
                    <div className='bg-white px-4 py-2 w-full'>
                        {detail?.status === "Chưa tạo bảng lương" &&
                            <div>
                                <label className='my-2'>Ghi chú (có thể để trống):</label>
                                <textarea className='w-full rounded-xl p-2 border border-gray-300' onChange={(e) => detail.note = e.target.value}></textarea>
                            </div>
                        }
                        <div className='flex flex-row items-center gap-2'>
                            {detail?.status === "Chưa tạo bảng lương" && <button className='rounded-xl px-4 py-2 bg-blue-500 text-white' onClick={() => handleCreate(detail)}>Tạo bảng lương</button>}
                            {detail?.status === "Đã tạo bảng lương" && <button className='rounded-xl px-4 py-2 bg-green-500 text-white' onClick={() => handlePay(detail)}>Thanh toán</button>}
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    <h1 className='text-xl font-bold py-2'>Danh sách công việc</h1>
                    <TableCommon
                        headers={headers}
                        tableData={detail.jobDetails}
                    />
                </div>
            </div>
        )
    }

    if (!pageReady) {
        return <Loader />;
    }

    return (
        <div className="w-full p-8">
            <div className="flex flex-row gap-4 bg-white p-4 rounded-xl mb-4">
                <h1 className="text-2xl font-bold">Danh sách bảng lương</h1>
                <div className="flex gap-2">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="px-4 py-2 rounded-lg background-primary text-white"
                    >
                        {months.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>

                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="px-4 py-2 rounded-lg background-primary text-white"
                    >
                        {Array.from({ length: 11 }, (_, i) => selectedYear - 5 + i).map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>
            <TableCommon
                headers={headerData}
                tableData={payrolls}
                defaultSortColumn="employeeid"
                defaultSortType="asc"
                rowPerPage={rowPerPage}
                pageIndex={pageIndex}
                totalCount={totalCount}
                rowPerPageOptions={[5, 10, 20]}
                handleChangePage={handleChangePage}
                handleChangeRowPerPage={handleChangeRowPerPage}
                usePagination={true}
                fePagination={true}
                useDetail={true}
                tableDetail={tableDetail}
            />
            <PayrollForm isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleConfirm} initialData={selectedPayroll} month={selectedMonth} year={selectedYear} />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div >
    );
}