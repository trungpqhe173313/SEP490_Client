'use client';
import React, { useState, useEffect } from 'react'
import { importService } from '@/services/import.service';
import { numberToVietnamese } from '@/lib/numberToVietnamese';
import { convertKgToTon, formatLargeNumber } from '@/lib/formattingLib';
import { useLoading } from '@/context/LoadingContext';
import TableCommon from "@/components/Table/table";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader/loader";
import { getImportStatus } from '@/lib/getStatus';
import { TableRow, TableCell } from '@mui/material';
import SuccessModal from '@/components/Modal/successModal';
import FailedModal from '@/components/Modal/failedModal';
import { paymentService } from '@/services/payment.service';
import { PaymentForm } from '@/components/Form/paymentForm';
import { transactionService } from '@/services/transaction.service';


export default function ImportDetail({ params }) {
    const { loading, setLoading } = useLoading();
    const { id } = React.use(params);
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const [modalOpen, setModalOpen] = useState(false);
    const [mode, setMode] = useState("createPayment");
    const [paidAmount, setPaidAmount] = useState(0);

    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    const [transaction, setTransaction] = useState({});
    const [supplier, setSupplier] = useState({});
    const [products, setProducts] = useState([]);
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

    const fetchTransaction = async () => {
        try {
            if (!id) return;
            setLoading(true);
            const res = await importService.getImportDetail(id);
            setTransaction(res.data);
            setSupplier(res.data.supplier);
            setProducts(res.data.list);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const fetchPayments = async () => {
        try {
            if (!id) return;
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                relatedTransactionId: id
            }
            const response = await paymentService.getAllPayments(body);
            const totalPaidAmount = response.data.items.reduce((acc, cur) => acc + cur.amount * -1, 0);
            setPaidAmount(totalPaidAmount);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (!pageReady) return;
        fetchPayments();
        fetchTransaction();
    }, [pageReady])

    const headerData = [
        {
            key: "productId",
            label: "ID sản phẩm",
            customValue: (item) => item.productId && <div>{item.productId}</div>
        },
        {
            key: "productName",
            label: "Tên sản phẩm",
            customValue: (item) => item.productName && <div>{item.productName}</div>
        },
        {
            key: "expireDate",
            label: "Ngày hết hạn",
            customValue: (item) => item.expireDate && <div>{new Date(item.expireDate).toLocaleString('vi-VN')}</div>
        },
        {
            key: "note",
            label: "Ghi chú",
            customValue: (item) => item.note && <div>{item.note}</div>
        },
        {
            key: "weightPerUnit",
            label: "Khối lượng (Kg)",
            customValue: (item) => item.weightPerUnit && <div>{item.weightPerUnit}</div>
        },
        {
            key: "quantity",
            label: "Số lượng (Bao)",
            customValue: (item) => item.quantity && <div>{item.quantity}</div>
        },
        {
            key: "totalWeight",
            label: "Tổng khối lượng (Khối lượng x Số lượng)",
            customValue: (item) => item.weightPerUnit && item.quantity && <div>{formatLargeNumber(item.weightPerUnit * item.quantity)}</div>
        },
        {
            key: "unitPrice",
            label: "Đơn giá (VND)",
            customValue: (item) => item.unitPrice && <div>{formatLargeNumber(item.unitPrice)}₫</div>
        },
        {
            key: "totalPrice",
            label: "Thành tiền (VND)",
            customValue: (item) => item.quantity && item.unitPrice && <div>{formatLargeNumber(item.quantity * item.unitPrice)}₫</div>
        },
    ]

    const extraRow = () => {
        return (
            <TableRow>
                <TableCell colSpan={1} align="center">Tổng</TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell align="center">{(products.reduce((total, item) => total + (item.weightPerUnit * item.quantity), 0))} Kg</TableCell>
                <TableCell />
                <TableCell align="center">{!transaction.totalCost ? formatLargeNumber(products.reduce((total, item) => total + (item.quantity * item.unitPrice), 0)) : formatLargeNumber(transaction.totalCost)} ₫</TableCell>
            </TableRow>
        )
    }

    const handleCopy = () => {
        router.push(`/imports/modify/create/${id}`);
    }

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await importService.updateToChecked(id);
            setModalSuccessMessage("Xác nhận kiểm đơn hàng thành công");
            setModalSuccessOpen(true);
            fetchTransaction();
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error?.response?.data?.statusCode}: ${error?.response?.data?.error?.message}`);
            setModalFailedSubMessages(error?.response?.data?.error?.messages);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = () => {
        router.push(`/imports/modify/update/${id}`);
    }

    const handleDelete = () => {
        console.log('delete');
    }

    const handleReturn = () => {
        window.open(`/returns/modify/create/import/${id}`, "_blank");
    }

    const handlePrint = async () => {
        const response = await transactionService.printTransaction(id);
        const blob = new Blob([response.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL);
    }

    const handleCreatePayment = () => {
        if (paidAmount !== 0) setTransaction({ ...transaction, amount: transaction.totalCost - paidAmount });
        setMode("createPayment");
        setModalOpen(true);
    }

    const handleCompletePayment = () => {
        setMode("completePayment");
        setModalOpen(true);
    }

    const handleConfirmPayment = async (paymentData) => {
        setLoading(true);
        try {
            const body = {
                transactionId: parseInt(id),
                amount: mode === "completePayment" ? null : paymentData.amount,
                description: paymentData.description,
                paymentMethod: paymentData.paymentMethod,
                createdBy: user.id
            }
            if (mode === "completePayment") {
                await paymentService.completeImportPayment(body);
            } else {
                await paymentService.createImportPayment(body);
            }
            await fetchTransaction();
            await fetchPayments();
            setModalSuccessMessage("Thanh toán giao dịch thành công");
            setModalSuccessOpen(true);
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error?.response?.data?.statusCode}: ${error?.response?.data?.error?.message}`);
            setModalFailedSubMessages(error?.response?.data?.error?.messages);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    }

    if (!pageReady) return <Loader />;

    return (
        <div className='flex flex-col gap-4 w-full'>
            <div className='grid grid-cols-3 p-4 gap-4 w-full h-50'>
                <div className='col-span-1 rounded-xl bg-white p-4'>
                    <h1 className='text-xl font-bold'>Chi tiết phiếu nhập</h1>
                    <p className='my-2'>Mã giao dịch: {transaction.transactionId}</p>
                    <p className='my-2'>Ngày giao dịch: {new Date(transaction.transactionDate).toLocaleString('vi-VN')}</p>
                    <p className='my-2'>Nhà kho: {transaction.warehouseName}</p>
                    <div className='my-2 flex flex-row gap-2'>
                        <p>Trạng thái: </p>
                        {getImportStatus(transaction.status)}
                    </div>
                </div>
                <div className='col-span-1 rounded-xl bg-white p-4'>
                    <h1 className='text-xl font-bold'>Nhà cung cấp</h1>
                    <p className='my-2'>Tên nhà cung cấp: {supplier.supplierName}</p>
                    <p className='my-2'>Email nhà cung cấp: {supplier.email}</p>
                    <p className='my-2'>Số điện thoại: {supplier.phone}</p>
                </div>
            </div>

            <div className='w-auto rounded-xl h-auto bg-white mx-4 my-2'>
                <h1 className='text-xl font-bold p-4'>Danh sách sản phẩm</h1>
                <TableCommon
                    headers={headerData}
                    tableData={products}
                    extraRow={extraRow}
                />
                <div className='flex flex-row justify-between items-center p-4'>
                    <div className='flex flex-row items-center gap-2'>
                        {transaction && transaction.status === 1 && <button className='rounded-xl px-4 py-2 bg-cyan-500 text-white' onClick={handleConfirm}>Xác nhận nhập kho</button>}
                        {transaction?.status === 2 && <button className='rounded-xl px-4 py-2 bg-cyan-500 text-white' onClick={handleCompletePayment}>Thanh toán toàn bộ</button>}
                        {transaction?.status === 2 && <button className='rounded-xl px-4 py-2 bg-yellow-500 text-white' onClick={handleCreatePayment}>Thanh toán một phần</button>}
                        {transaction?.status === 12 && <button className='rounded-xl px-4 py-2 bg-cyan-500 text-white' onClick={handleCreatePayment}>Thanh toán phần còn thiếu</button>}
                        <button className='rounded-xl px-4 py-2 bg-green-500 text-white' onClick={handleCopy}>Sao chép đơn</button>
                        {transaction && transaction.status > 1 && <button className='rounded-xl px-4 py-2 bg-red-500 text-white' onClick={handleReturn}>Trả hàng</button>}
                        {transaction?.status >= 11 && <button className='rounded-xl px-4 py-2 bg-cyan-500 text-white' onClick={handlePrint}>In</button>}
                        {transaction && transaction.status === 1 && <button className='rounded-xl px-4 py-2 bg-yellow-500 text-white' onClick={handleEdit}>Chỉnh sửa</button>}
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                        {/* {transaction && transaction.status === 1 && <button className='rounded-xl px-4 py-2 bg-red-500 text-white' onClick={handleDelete}>Xóa</button>} */}
                    </div>

                </div>
            </div>


            <div className='w-auto rounded-xl h-auto bg-white mx-4 my-2 p-4 text-right flex flex-col items-end'>
                <div className='text-xl flex flex-row justify-between w-1/3'>
                    <h3 className='w-1/3 text-left'>Tổng khối lượng:</h3>
                    <h3>{convertKgToTon(products.reduce((total, item) => total + (item.weightPerUnit * item.quantity), 0))}</h3>
                </div>
                <div className='text-xl flex flex-row justify-between w-1/3'>
                    <h3 className='w-1/3 text-left'>Tổng tiền đơn:</h3>
                    <h3>{!transaction.totalCost ? formatLargeNumber(products.reduce((total, item) => total + (item.quantity * item.unitPrice), 0)) : formatLargeNumber(transaction.totalCost)}₫</h3>
                </div>
                {transaction?.status >= 11 && <div className='w-1/3'>
                    <div className='text-xl flex flex-row justify-between'>
                        <h3 className='w-1/3 text-left'>Đã thanh toán:</h3>
                        <h3 className='text-green-600'>{formatLargeNumber(paidAmount)}₫</h3>
                    </div>
                    <div className='text-xl flex flex-row justify-between'>
                        <h3 className='w-1/3 text-left'>Còn nợ:</h3>
                        <h3 className='text-red-600'>{formatLargeNumber(transaction.totalCost - paidAmount)}₫</h3>
                    </div>
                </div>}
                <div className='text-xl flex flex-row justify-between w-1/3'>
                    <h3 className='w-1/3 text-left'>Bằng chữ: </h3>
                    <h3>{transaction?.status >= 11 ? numberToVietnamese(transaction.totalCost - paidAmount) : numberToVietnamese(transaction.totalCost)}</h3>
                </div>
            </div>
            <PaymentForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirmPayment}
                initialData={transaction}
                mode={mode}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}
