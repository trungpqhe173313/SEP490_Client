'use client';
import React, { useState, useEffect } from 'react'
import { exportService } from '@/services/export.service';
import { paymentService } from '@/services/payment.service';
import { payrollService } from '@/services/payroll.service';
import { numberToVietnamese } from '@/lib/numberToVietnamese';
import { convertKgToTon, formatLargeNumber } from '@/lib/formattingLib';
import { useLoading } from '@/context/LoadingContext';
import TableCommon from "@/components/Table/table";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader/loader";
import SuccessModal from '@/components/Modal/successModal';
import FailedModal from '@/components/Modal/failedModal';
import { getFinancialTransactionType, getPaymentMethod } from '@/lib/getStatus';


export default function ExportDetail({ params }) {
    const { loading, setLoading } = useLoading();
    const { id } = React.use(params);
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    const [payment, setPayment] = useState({});

    const [transaction, setTransaction] = useState(null);
    const [payroll, setPayroll] = useState(null);

    const [pageReady, setPageReady] = useState(false);
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

    const fetchPayment = async () => {
        try {
            if (!id) return;
            setLoading(true);
            const res = await paymentService.getDetail(id);
            setPayment(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!pageReady) return;
        fetchPayment();
    }, [pageReady])

    if (!pageReady) return <Loader />;

    const renderTransaction = () => {
        if (!transaction) return null;
        return (
            <div className='w-full bg-white p-4 rounded-xl'>
                <h1 className='text-2xl font-semibold'>Chi tiết giao dịch</h1>
            </div>
        );
    }

    const renderPayroll = () => {
        if (!payroll) return null;
        return (
            <div className='w-full bg-white p-4 rounded-xl'>
                <h1 className='text-2xl font-semibold'>Chi tiết bảng lương</h1>
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-4 w-full p-4'>
            <div className='rounded-xl w-full bg-white p-4'>
                <div className='flex items-center justify-between mb-4'>
                    <h1 className='text-2xl font-semibold'>Chi tiết giao dịch</h1>
                    <button className='background-primary text-white px-4 py-2 rounded-md' onClick={() => setModalOpen(true)}>Chỉnh sửa giao dịch</button>
                </div>
                <table className="w-full">
                    <tbody className="striped-table">
                        <tr>
                            <td className="p-4">Mã giao dịch</td>
                            <td className="p-4 w-8/10">{payment.financialTransactionId}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Loại giao dịch</td>
                            <td className="p-4 w-8/10">{getFinancialTransactionType(payment.typeInt)}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Mô tả</td>
                            <td className="p-4 w-8/10">{payment.description || "Không có"}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Số tiền</td>
                            <td className="p-4 w-8/10"><div className={payment.amount > 0 ? "text-green-500" : "text-red-500"}>{formatLargeNumber(payment.amount)}₫</div></td>
                        </tr>
                        <tr>
                            <td className="p-4">Phương thức thanh toán</td>
                            <td className="p-4 w-8/10">{getPaymentMethod(payment.paymentMethod)}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Người tạo</td>
                            <td className="p-4 w-8/10">{payment.createdByName || "Không rõ"}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Ngày giao dịch</td>
                            <td className="p-4 w-8/10">{new Date(payment.transactionDate).toLocaleString("vi-VN")}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            {renderTransaction()}
            {renderPayroll()}
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}
