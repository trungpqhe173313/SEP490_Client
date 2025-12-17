'use client';
import React, { useState, useEffect } from 'react'
import { exportService } from '@/services/export.service';
import { paymentService } from '@/services/payment.service';
import { transactionService } from '@/services/transaction.service';
import { numberToVietnamese } from '@/lib/numberToVietnamese';
import { convertKgToTon, formatLargeNumber } from '@/lib/formattingLib';
import { useLoading } from '@/context/LoadingContext';
import TableCommon from "@/components/Table/table";
import { PaymentForm } from '@/components/Form/paymentForm';
import { AssignForm } from '@/components/Form/assignForm';
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader/loader";
import { getExportStatus } from "@/lib/getStatus";
import SuccessModal from '@/components/Modal/successModal';
import FailedModal from '@/components/Modal/failedModal';
import { TableRow, TableCell } from '@mui/material';


export default function ExportDetail({ params }) {
    const { loading, setLoading } = useLoading();
    const { id } = React.use(params);
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalAssignOpen, setModalAssignOpen] = useState(false);
    const [modalReassignOpen, setModalReassignOpen] = useState(false);
    const [mode, setMode] = useState("createPayment");
    const [paidAmount, setPaidAmount] = useState(0);

    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    const [transaction, setTransaction] = useState({});
    const [customer, setCustomer] = useState({});
    const [products, setProducts] = useState([]);
    const [rowPerPage, setRowPerPage] = useState(5);
    const [pageIndex, setPageIndex] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Manager", "Employee"];

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
            const res = await exportService.getExportDetail(id);
            setTransaction(res.data);
            setCustomer(res.data.customer);
            setProducts(res.data.list);
            setTotalCount(res.data.list.length);
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
            const totalPaidAmount = response.data.items.reduce((acc, cur) => acc + cur.amount, 0);
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
                <TableCell align="center">{(products.reduce((total, item) => total + (item.weightPerUnit * item.quantity), 0))} Kg</TableCell>
                <TableCell />
                <TableCell align="center">{!transaction.totalCost ? formatLargeNumber(products.reduce((total, item) => total + (item.quantity * item.unitPrice), 0)) : formatLargeNumber(transaction.totalCost)}₫</TableCell>
            </TableRow>
        )
    }

    const handleChangePage = (event, newPage) => {
        setPageIndex(newPage);
    };

    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    const handleReassign = () => {
        setModalReassignOpen(true);
    }

    const handleConfirmReassign = async (data) => {
        setLoading(true);
        try {
            await transactionService.changeEmployee(id, data);
            setModalSuccessMessage("Sửa nhân viên phụ trách thành công");
            setModalSuccessOpen(true);
            fetchTransaction();
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message}`);
            setModalFailedSubMessages(error?.response?.data?.error?.messages);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    }

    const handleCopy = () => {
        router.push(`/exports/modify/create/${id}`);
    }

    const handleCancel = async () => {
        setLoading(true);
        try {
            await exportService.cancelExport(id);
            setModalSuccessMessage("Hủy xuất kho thành công");
            setModalSuccessOpen(true);
            fetchTransaction();
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message}`);
            setModalFailedSubMessages(error?.response?.data?.error?.messages);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    }

    const handleUpdateOrder = async () => {
        setModalAssignOpen(true);
    }

    const handleConfirmUpdateOrder = async (data) => {
        setLoading(true);
        try {
            await exportService.updateToOrder(id, data);
            setModalSuccessMessage("Lên phiếu xuất kho thành công");
            setModalSuccessOpen(true);
            fetchTransaction();
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message}`);
            setModalFailedSubMessages(error?.response?.data?.error?.messages);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    }

    const handleUpdateDelivering = async () => {
        if (transaction.responsibleId !== user.id) {
            setModalFailedMessage(`Bạn không phụ trách phiếu xuất kho này`);
            setModalFailedOpen(true);
            return;
        }
        setLoading(true);
        try {
            const body = {
                responsibleId: user.id
            }
            await exportService.updateToDelivering(id, body);
            setModalSuccessMessage("Xác nhận xuất kho thành công");
            setModalSuccessOpen(true);
            fetchTransaction();
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message}`);
            setModalFailedSubMessages(error?.response?.data?.error?.messages);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    }

    const handleUpdateDone = async () => {
        if (transaction.responsibleId !== user.id) {
            setModalFailedMessage(`Bạn không phụ trách phiếu xuất kho này`);
            setModalFailedOpen(true);
            return;
        }
        setLoading(true);
        try {
            const body = {
                responsibleId: user.id
            }
            await exportService.updateToDone(id, body);
            setModalSuccessMessage("Giao hàng thành công");
            setModalSuccessOpen(true);
            fetchTransaction();
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message}`);
            setModalFailedSubMessages(error?.response?.data?.error?.messages);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = () => {
        router.push(`/exports/modify/update/${id}`);
    }

    const handleDelete = () => {
        console.log('delete');
    }

    const handleReturn = () => {
        window.open(`/returns/modify/create/export/${id}`, "_blank");
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
                await paymentService.completeExportPayment(body);
            } else {
                await paymentService.createExportPayment(body);
            }
            await fetchTransaction();
            await fetchPayments();
            setModalSuccessMessage("Thanh toán giao dịch thành công");
            setModalSuccessOpen(true);
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message}`);
            setModalFailedSubMessages(error?.response?.data?.error?.messages);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    }

    if (!pageReady) return <Loader />;

    return (
        <div className='flex flex-col gap-4 w-full'>
            <div className='grid grid-cols-3 p-4 gap-4 w-full'>
                <div className='col-span-1 rounded-xl bg-white p-4'>
                    <h1 className='text-xl font-bold'>Chi tiết phiếu xuất</h1>
                    <p className='my-2'>Mã giao dịch: {transaction.transactionId}</p>
                    <p className='my-2'>Ngày giao dịch: {new Date(transaction.transactionDate).toLocaleString('vi-VN')}</p>
                    <p className='my-2'>Nhà kho: {transaction.warehouseName}</p>
                    <div className='my-2 flex flex-row gap-2'>
                        <p>Trạng thái: </p>
                        {getExportStatus(transaction.status)}
                    </div>
                    <p className='my-2'>Ghi chú: {transaction.note || "Chưa có"}</p>
                    <div className='my-2 flex flex-row gap-2'>
                       <p>Nhân viên phụ trách: {transaction.responsibleName ? transaction.responsibleName + " - " + transaction.employeePhone : "Chưa có"}</p>
                       {user.roles.includes("Manager") && transaction?.status === 2 && <button className='cursor-pointer px-4 text-white bg-yellow-500 rounded-xl' onClick={handleReassign}>Sửa</button>}
                    </div>
                </div>
                <div className='col-span-1 rounded-xl bg-white p-4'>
                    <h1 className='text-xl font-bold'>Khách hàng</h1>
                    <p className='my-2'>Tên khách hàng: {customer.fullName}</p>
                    <p className='my-2'>Email khách hàng: {customer.email}</p>
                    <p className='my-2'>Số điện thoại: {customer.phone}</p>
                </div>
            </div>

            <div className='w-auto rounded-xl h-auto bg-white mx-4 my-2'>
                <h1 className='text-xl font-bold p-4'>Danh sách sản phẩm</h1>
                <TableCommon
                    headers={headerData}
                    tableData={products}
                    extraRow={extraRow}
                    rowPerPage={rowPerPage}
                    pageIndex={pageIndex}
                    totalCount={totalCount}
                    rowPerPageOptions={[5, 10, 20]}
                    handleChangePage={handleChangePage}
                    handleChangeRowPerPage={handleChangeRowPerPage}
                    usePagination={true}
                    fePagination={true}
                />
                <div className='flex flex-row justify-between items-center p-4'>
                    <div className='flex flex-row items-center gap-2'>
                        {user.roles.includes("Manager") && transaction?.status === 1 && <button className='rounded-xl px-4 py-2 bg-cyan-500 text-white' onClick={handleUpdateOrder}>Lên phiếu</button>}
                        {user.roles.includes("Employee") && transaction?.status === 2 && <button className='rounded-xl px-4 py-2 bg-cyan-500 text-white' onClick={handleUpdateDelivering}>Xác nhận xuất kho</button>}
                        {user.roles.includes("Employee") && transaction?.status === 3 && <button className='rounded-xl px-4 py-2 bg-cyan-500 text-white' onClick={handleUpdateDone}>Hoàn thành giao hàng</button>}
                        {user.roles.includes("Manager") && transaction?.status === 4 && <button className='rounded-xl px-4 py-2 bg-cyan-500 text-white' onClick={handleCompletePayment}>Thanh toán toàn bộ</button>}
                        {user.roles.includes("Manager") && transaction?.status === 4 && <button className='rounded-xl px-4 py-2 bg-yellow-500 text-white' onClick={handleCreatePayment}>Thanh toán một phần</button>}
                        {user.roles.includes("Manager") && transaction?.status === 12 && <button className='rounded-xl px-4 py-2 bg-cyan-500 text-white' onClick={handleCreatePayment}>Thanh toán phần còn thiếu</button>}
                        {user.roles.includes("Manager") && <button className='rounded-xl px-4 py-2 bg-green-500 text-white' onClick={handleCopy}>Sao chép phiếu</button>}
                        {user.roles.includes("Manager") && transaction?.status === 4 && <button className='rounded-xl px-4 py-2 bg-red-500 text-white' onClick={handleReturn}>Trả hàng</button>}
                        {user.roles.includes("Manager") && transaction?.status >= 11 && <button className='rounded-xl px-4 py-2 bg-cyan-500 text-white' onClick={handlePrint}>In</button>}
                        {user.roles.includes("Manager") && transaction?.status <= 2 && <button className='rounded-xl px-4 py-2 bg-yellow-500 text-white' onClick={handleEdit}>Chỉnh sửa</button>}
                    </div>
                    <div className='flex flex-row items-center gap-2 justify-end'>
                        {user.roles.includes("Manager") && transaction?.status === 1 && <button className='rounded-xl px-4 py-2 bg-red-500 text-white' onClick={handleCancel}>Hủy</button>}
                    </div>
                </div>
            </div>


            <div className='w-auto rounded-xl h-auto bg-white mx-4 my-2 p-4 text-right flex flex-col items-end'>
                <div className='text-xl flex flex-row justify-between w-1/3'>
                    <h3 className='w-1/3 text-left'>Tổng khối lượng:</h3>
                    <h3>{convertKgToTon(products.reduce((total, item) => total + (item.weightPerUnit * item.quantity), 0))}</h3>
                </div>
                <div className='text-xl flex flex-row justify-between w-1/3'>
                    <h3 className='w-1/3 text-left'>Tổng tiền phiếu:</h3>
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
            <AssignForm isOpen={modalAssignOpen} onClose={() => setModalAssignOpen(false)} onConfirm={handleConfirmUpdateOrder} />
            <AssignForm isOpen={modalReassignOpen} onClose={() => setModalReassignOpen(false)} onConfirm={handleConfirmReassign} />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}
