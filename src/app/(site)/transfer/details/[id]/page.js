'use client';
import React, { useState, useEffect } from 'react'
import { transferService } from '@/services/transfer.service';
import { convertKgToTon, formatLargeNumber } from '@/lib/formattingLib';
import { useLoading } from '@/context/LoadingContext';
import TableCommon from "@/components/Table/table";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader/loader";
import { getTransferStatus } from "@/lib/getStatus";
import SuccessModal from '@/components/Modal/successModal';
import FailedModal from '@/components/Modal/failedModal';
import { TableRow, TableCell } from '@mui/material';
import { AssignForm } from '@/components/Form/assignForm';


export default function TransferDetail({ params }) {
    const { loading, setLoading } = useLoading();
    const { id } = React.use(params);
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();
    const [modalReassignOpen, setModalReassignOpen] = useState(false);

    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    const [transaction, setTransaction] = useState({});
    const [products, setProducts] = useState([]);
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
            const res = await transferService.getTransferDetail(id);
            setTransaction(res.data);
            setProducts(res.data.list);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!pageReady) return;
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
            key: "code",
            label: "Mã sản phẩm",
            customValue: (item) => item.code && <div>{item.code}</div>
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
    ]

    const extraRow = () => {
        return (
            <TableRow>
                <TableCell colSpan={1} align="center">Tổng</TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell align="center">{(products.reduce((total, item) => total + (item.weightPerUnit * item.quantity), 0))} Kg</TableCell>
            </TableRow>
        )
    }

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
        router.push(`/transfer/modify/create/${id}`);
    }

    const handleUpdateCancelled = async () => {
        setLoading(true);
        try {
            await transferService.cancelTransfer(id);
            setModalSuccessMessage("Hủy phiếu chuyển kho thành công");
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
            setModalFailedMessage(`Bạn không phụ trách phiếu chuyển kho này`);
            setModalFailedOpen(true);
            return;
        }
        setLoading(true);
        try {
            const body = {
                responsibleId: user.id
            }
            await transferService.completeTransfer(id, body);
            setModalSuccessMessage("Xác nhận chuyển kho thành công");
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
        router.push(`/transfer/modify/update/${id}`);
    }

    if (!pageReady) return <Loader />;

    return (
        <div className='flex flex-col gap-4 w-full'>
            <div className='grid grid-cols-3 p-4 w-full'>
                <div className='col-span-1 rounded-xl bg-white p-4'>
                    <h1 className='text-xl font-bold'>Chi tiết phiếu chuyển kho</h1>
                    <p className='my-2'>Mã giao dịch: {transaction.transactionId}</p>
                    <p className='my-2'>Ngày giao dịch: {new Date(transaction.transactionDate).toLocaleString('vi-VN')}</p>
                    <p className='my-2'>Vận chuyển từ: {transaction.sourceWarehouseName}</p>
                    <p className='my-2'>Vận chuyển đến: {transaction.destinationWarehouseName}</p>
                    <div className='my-2 flex flex-row gap-2'>
                        <p>Trạng thái: </p>
                        {getTransferStatus(transaction.status)}
                    </div>
                    <p className='my-2'>Ghi chú: {transaction.note || "Chưa có"}</p>
                    <div className='my-2 flex flex-row gap-2'>
                        <p>Nhân viên phụ trách: {transaction.responsibleName ? transaction.responsibleName + " - " + transaction.employeePhone : "Chưa có"}</p>
                        {user.roles.includes("Manager") && transaction?.status === 9 && <button className='cursor-pointer px-4 text-white bg-yellow-500 rounded-xl' onClick={handleReassign}>Sửa</button>}
                    </div>
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
                        {user.roles.includes("Employee") && transaction?.status === 9 && <button className='rounded-xl px-4 py-2 bg-cyan-500 text-white' onClick={handleUpdateDone}>Hoàn thành chuyển kho</button>}
                        {user.roles.includes("Manager") && transaction?.status === 9 && <button className='rounded-xl px-4 py-2 bg-red-500 text-white' onClick={handleUpdateCancelled}>Hủy chuyển kho</button>}
                        {user.roles.includes("Manager") && <button className='rounded-xl px-4 py-2 bg-green-500 text-white' onClick={handleCopy}>Sao chép phiếu</button>}
                        {user.roles.includes("Manager") && transaction?.status === 9 && <button className='rounded-xl px-4 py-2 bg-yellow-500 text-white' onClick={handleEdit}>Chỉnh sửa</button>}
                    </div>
                    <div className='flex flex-row items-center gap-2 justify-end'>
                        {/* {transaction && transaction.status <= 2 && <button className='rounded-xl px-4 py-2 bg-red-500 text-white' onClick={handleDelete}>Xóa</button>} */}
                    </div>

                </div>
            </div>


            <div className='w-auto rounded-xl h-auto bg-white mx-4 my-2 p-4 text-right flex flex-col items-end'>
                <div className='text-xl flex flex-row justify-between w-1/3'>
                    <h2 className='w-1/3 text-left'>Tổng khối lượng:</h2>
                    <h2>{convertKgToTon(products.reduce((total, item) => total + (item.weightPerUnit * item.quantity), 0))}</h2>
                </div>
            </div>
            <AssignForm isOpen={modalReassignOpen} onClose={() => setModalReassignOpen(false)} onConfirm={handleConfirmReassign} />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}
