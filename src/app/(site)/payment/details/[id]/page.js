'use client';
import React, { useState, useEffect } from 'react'
import { transactionService } from '@/services/transaction.service';
import { paymentService } from '@/services/payment.service';
import { payrollService } from '@/services/payroll.service';
import { formatLargeNumber } from '@/lib/formattingLib';
import { useLoading } from '@/context/LoadingContext';
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader/loader";
import SuccessModal from '@/components/Modal/successModal';
import FailedModal from '@/components/Modal/failedModal';
import { getFinancialTransactionType, getPaymentMethod } from '@/lib/getStatus';
import { PayrollModal } from '@/components/Modal/payrollModal';
import { TransactionModal } from '@/components/Modal/transactionModal';
import { PaymentForm } from "@/components/Form/paymentForm";

export default function ExportDetail({ params }) {
    const { loading, setLoading } = useLoading();
    const { id } = React.use(params);
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalPayrollOpen, setModalPayrollOpen] = useState(false);
    const [modalTransactionOpen, setModalTransactionOpen] = useState(false);


    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    const [payment, setPayment] = useState({});

    const [transaction, setTransaction] = useState(null);
    const [payroll, setPayroll] = useState(null);

    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Manager"];

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
            res.data.payrollId && await fetchPayroll(res.data.payrollId);
            res.data.relatedTransactionId && await fetchTransaction(res.data.relatedTransactionId);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const fetchPayroll = async (id) => {
        try {
            if (!id) return;
            setLoading(true);
            const res = await payrollService.getPayrollById(id);
            setPayroll(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const fetchTransaction = async (id) => {
        try {
            if (!id) return;
            setLoading(true);
            const res = await transactionService.getTransactionDetail(id);
            setTransaction(res.data);
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

    const handleConfirm = async (paymentData) => {
        if (!paymentData) return;
        setLoading(true);
        try {
            const body = {
                type: paymentData.type,
                amount: paymentData.amount,
                description: paymentData.description,
                paymentMethod: paymentData.paymentMethod,
                createdBy: user.id
            }
            await paymentService.updatePayment(id, body);
            setModalSuccessMessage("Cập nhật giao dịch thành công");
            setModalSuccessOpen(true);
            setModalOpen(false);
            await fetchPayment();
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    }

    if (!pageReady) return <Loader />;

    return (
        <div className='flex flex-col gap-4 w-full p-4'>
            <div className='rounded-xl w-full bg-white p-4'>
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
                        {payroll && <tr>
                            <td className="p-4">Bảng lương liên quan</td>
                            <td className="p-4 w-8/10"><button className='background-primary text-white px-4 py-2 rounded-md' onClick={() => setModalPayrollOpen(true)}>Xem bảng lương</button></td>
                        </tr>}
                        {transaction && <tr>
                            <td className="p-4">Phiếu liên quan</td>
                            <td className="p-4 w-8/10"><button className='background-primary text-white px-4 py-2 rounded-md' onClick={() => setModalTransactionOpen(true)}>Xem phiếu</button></td>
                        </tr>}
                    </tbody>
                </table>
            </div>
            {payroll && <PayrollModal isOpen={modalPayrollOpen} handleClose={() => setModalPayrollOpen(false)} payroll={payroll} />}
            {transaction && <TransactionModal isOpen={modalTransactionOpen} handleClose={() => setModalTransactionOpen(false)} transaction={transaction} />}
            <PaymentForm isOpen={modalOpen} onClose={() => setModalOpen(false)} initialData={payment} onConfirm={handleConfirm} mode="Others" />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}
