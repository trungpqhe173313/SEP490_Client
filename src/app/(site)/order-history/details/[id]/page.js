'use client';
import React, { useState, useEffect } from 'react'
import { customerOrderService } from '@/services/customerOrder.service';
import { getExportStatus } from '@/lib/getStatus';
import { numberToVietnamese } from '@/lib/numberToVietnamese';
import { convertKgToTon, formatLargeNumber } from '@/lib/formattingLib';
import { useLoading } from '@/context/LoadingContext';
import TableCommon from "@/components/Table/table";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader/loader";
import { TableRow, TableCell } from '@mui/material';

export default function ExportDetail({ params }) {
    const { loading, setLoading } = useLoading();
    const { id } = React.use(params);
    const { isLogin, user, refreshUserInfo } = useLogin();
    const router = useRouter();

    const [transaction, setTransaction] = useState({});
    const [customer, setCustomer] = useState({});
    const [products, setProducts] = useState([]);
    const [rowPerPage, setRowPerPage] = useState(5);
    const [pageIndex, setPageIndex] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Customer", "Customer1"];

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
            const res = await customerOrderService.getCustomerOrderById(id);
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

    if (!pageReady) {
        return <Loader />;
    }

    return (
        <div className='flex flex-col gap-4 w-full'>
            <div className='grid grid-cols-3 p-4 gap-4 w-full h-50'>
                <div className='col-span-1 rounded-xl bg-white p-4'>
                    <h1 className='text-xl font-bold'>Chi tiết đơn hàng</h1>
                    <p className='my-2'>Mã giao dịch: {transaction.transactionId}</p>
                    <p className='my-2'>Ngày giao dịch: {new Date(transaction.transactionDate).toLocaleString('vi-VN')}</p>
                    <div className='my-2 flex flex-row gap-2'>
                        <p>Trạng thái: </p>
                        {getExportStatus(transaction.status)}
                    </div>
                </div>
                <div className='col-span-1 rounded-xl bg-white p-4'>
                    <h1 className='text-xl font-bold'>Chi tiết khách hàng</h1>
                    <p className='my-2'>Tên khách hàng: {customer.fullName}</p>
                    <p className='my-2'>Email: {customer.email}</p>
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
            </div>


            <div className='w-auto rounded-xl h-auto bg-white mx-4 my-2 p-4 text-right flex flex-col items-end'>
                <div className='text-xl flex flex-row justify-between w-1/3'>
                    <h2 className='w-1/3 text-left'>Tổng khối lượng:</h2>
                    <h2>{convertKgToTon(products.reduce((total, item) => total + (item.weightPerUnit * item.quantity), 0))}</h2>
                </div>
                <div className='text-xl flex flex-row justify-between w-1/3'>
                    <h2 className='w-1/3 text-left'>Tổng tiền:</h2>
                    <h2>{!transaction.totalCost ? formatLargeNumber(products.reduce((total, item) => total + (item.quantity * item.unitPrice), 0)) : formatLargeNumber(transaction.totalCost)}₫</h2>
                </div>
                <div className='text-xl flex flex-row justify-between w-1/3'>
                    <h2 className='w-1/3 text-left'>Bằng chữ: </h2>
                    <h2>{!transaction.totalCost ? numberToVietnamese(products.reduce((total, item) => total + (item.quantity * item.unitPrice), 0)) : numberToVietnamese(transaction.totalCost)}₫</h2>
                </div>
            </div>
        </div>
    )
}
