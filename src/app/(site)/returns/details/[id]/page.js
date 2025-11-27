'use client';
import React, { useState, useEffect } from 'react'
import { returnService } from '@/services/return.service';
import { formatLargeNumber } from '@/lib/formattingLib';
import { numberToVietnamese } from '@/lib/numberToVietnamese';
import { useLoading } from '@/context/LoadingContext';
import TableCommon from "@/components/Table/table";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import { TableRow, TableCell } from '@mui/material';
import Loader from "@/components/Loader/loader";
import SuccessModal from '@/components/Modal/successModal';
import FailedModal from '@/components/Modal/failedModal';


export default function ReturnDetail({ params }) {
    const { loading, setLoading } = useLoading();
    const { id } = React.use(params);
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    const [returnTransaction, setReturnTransaction] = useState({});
    const [supplier, setSupplier] = useState(null);
    const [customer, setCustomer] = useState(null);
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

    const fetchReturnTransaction = async () => {
        try {
            if (!id) return;
            setLoading(true);
            const response = await returnService.getReturnDetail(id);
            setReturnTransaction(response.data);
            response.data.supplier && setSupplier(response.data.supplier);
            response.data.customer && setCustomer(response.data.customer);
            setProducts(response.data.items);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!pageReady) return;
        fetchReturnTransaction();
    }, [pageReady]);

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
            key: "quantity",
            label: "Số lượng (Bao)",
            customValue: (item) => item.quantity && <div>{item.quantity}</div>
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
                <TableCell align="center">{formatLargeNumber(products.reduce((total, item) => total + (item.quantity * item.unitPrice), 0))} ₫</TableCell>
            </TableRow>
        )
    }

    const handleEdit = () => {
        router.push(`/returns/modify/update/${returnTransaction.transactionType.toLowerCase()}/${returnTransaction.transactionId}`);
    }

    if (!pageReady) return <Loader />

    return (
        <div className='flex flex-col gap-4 w-full'>
            <div className='grid grid-cols-3 p-4 gap-4 w-full h-50'>
                <div className='col-span-1 rounded-xl bg-white p-4'>
                    <h1 className='text-xl font-bold'>Chi tiết phiếu trả hàng</h1>
                    <p className='my-2'>Mã trả hàng: {returnTransaction.returnTransactionId}</p>
                    <p className='my-2'>Ngày trả hàng: {new Date(returnTransaction.createdAt).toLocaleString('vi-VN')}</p>
                    <p className='my-2'>Nhà kho: {returnTransaction.warehouseName}</p>
                </div>
                {supplier &&
                    <div className='col-span-1 rounded-xl bg-white p-4'>
                        <h1 className='text-xl font-bold'>Nhà cung cấp</h1>
                        <p className='my-2'>Tên nhà cung cấp: {supplier.supplierName}</p>
                        <p className='my-2'>Email nhà cung cấp: {supplier.email}</p>
                        <p className='my-2'>Số điện thoại: {supplier.phone}</p>
                    </div>
                }
                {customer &&
                    <div className='col-span-1 rounded-xl bg-white p-4'>
                        <h1 className='text-xl font-bold'>Khách hàng</h1>
                        <p className='my-2'>Ten khách hàng: {customer.fullName}</p>
                        <p className='my-2'>Email khách hàng: {customer.email}</p>
                        <p className='my-2'>Số điện thoại: {customer.phone}</p>
                    </div>
                }
            </div>

            <div className='w-auto rounded-xl h-auto bg-white mx-4 my-2'>
                <h1 className='text-xl font-bold p-4'>Danh sách sản phẩm</h1>
                <TableCommon
                    headers={headerData}
                    tableData={products}
                    extraRow={extraRow}
                />
                <div className='flex flex-row justify-between items-center p-4'>
                    {/* <div className='flex flex-row items-center gap-2'>
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                        <button className='rounded-xl px-4 py-2 bg-yellow-500 text-white' onClick={handleEdit}>Chỉnh sửa</button>
                    </div> */}
                </div>

                <div className='w-auto rounded-xl h-auto bg-white mx-4 my-2 p-4 text-right flex flex-col items-end'>
                    <div className='text-xl flex flex-row justify-between w-1/3'>
                        <h2 className='w-1/3 text-left'>Tổng số lượng trả:</h2>
                        <h2>{products.reduce((total, item) => total + item.quantity, 0)}</h2>
                    </div>
                    <div className='text-xl flex flex-row justify-between w-1/3'>
                        <h2 className='w-1/3 text-left'>Tổng tiền trả:</h2>
                        <h2>{formatLargeNumber(products.reduce((total, item) => total + (item.quantity * item.unitPrice), 0))}₫</h2>
                    </div>
                    <div className='text-xl flex flex-row justify-between w-1/3'>
                        <h2 className='w-1/3 text-left'>Bằng chữ: </h2>
                        <h2>{numberToVietnamese(products.reduce((total, item) => total + (item.quantity * item.unitPrice), 0))}</h2>
                    </div>
                </div>
            </div>

            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}