'use client';
import React, { useState, useEffect } from 'react'
import { exportService } from '@/services/export.service';
import { numberToVietnamese } from '@/lib/numberToVietnamese';
import { useLoading } from '@/context/LoadingContext';
import TableCommon from "@/components/Table/table";

export default function ExportDetail({ params }) {
    const { setLoading } = useLoading();
    const { id } = React.use(params);

    const [transaction, setTransaction] = useState({});
    const [customer, setCustomer] = useState({});
    const [products, setProducts] = useState([]);

    const getStatus = (string) => {
        switch (string) {
            case 0:
                return <p className="text-yellow-600">Nháp</p>
            case 1:
                return <p className="text-blue-600">Lên đơn</p>
            case 2:
                return <p className="text-yellow-600">Đang giao</p>
            case 3:
                return <p className="text-green-600">Đã giao</p>
            case 4:
                return <p className="text-red-600">Đã hủy</p>
            default:
                return <p className="text-black">{string}</p>
        }
    }

    const fetchTransaction = async (id) => {
        try {
            setLoading(true);
            const res = await exportService.getExportDetail(id);
            setTransaction(res.data);
            setCustomer(res.data.customer);
            setProducts(res.data.list);
            setLoading(false);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchTransaction(id);
    }, [])

    const headerData = [
        {
            key: "productId",
            label: "Mã sản phẩm",
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
            customValue: (item) => item.expireDate && <div>{new Date(item.expireDate).toLocaleDateString('vi-VN')}</div>
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
            label: "Đơn giá",
            customValue: (item) => item.unitPrice && <div>{formatLargeNumber(item.unitPrice)}₫</div>
        },
        {
            key: "totalPrice",
            label: "Thành tiền (Đơn giá x Số lượng)",
            customValue: (item) => item.quantity && item.unitPrice && <div>{formatLargeNumber(item.quantity * item.unitPrice)}₫</div>
        },
    ]

    const formatLargeNumber = (number) => {
        return number.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
    }

    return (
        <div className='flex flex-col gap-4 w-full'>
            <div className='grid grid-cols-3 p-4 gap-4 w-full h-50'>
                <div className='col-span-1 rounded-xl bg-white p-4'>
                    <h1 className='text-xl font-bold'>Chi tiết phiếu xuất</h1>
                    <p className='my-2'>Mã giao dịch: {transaction.transactionId}</p>
                    <p className='my-2'>Ngày giao dịch: {new Date(transaction.transactionDate).toLocaleDateString('vi-VN')}</p>
                    <p className='my-2'>Nhà kho: {transaction.warehouseName}</p>
                    <div className='my-2 flex flex-row gap-2'>
                        <p>Trang thái: </p> 
                        {getStatus(transaction.status)}
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
                />
            </div>


            <div className='w-auto rounded-xl h-auto bg-white mx-4 my-2 p-4'>
                <h2 className='text-xl mb-4'>Tổng tiền: {formatLargeNumber(products.reduce((total, item) => total + (item.quantity * item.unitPrice), 0))}₫</h2>
                <h2 className='text-xl mb-4'>Bằng chữ: {numberToVietnamese(products.reduce((total, item) => total + (item.quantity * item.unitPrice), 0))}</h2>
            </div>
        </div>
    )
}
