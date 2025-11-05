'use client';
import React, { useState, useEffect } from 'react'
import { useLoading } from '@/context/LoadingContext';
import TableCommon from "@/components/Table/table";

export default function ImportDetail({ params }) {
    const { setLoading } = useLoading();
    const { id } = React.use(params);

    const [transaction, setTransaction] = useState({});
    const [supplier, setSupplier] = useState({});
    const [products, setProducts] = useState([]);

    useEffect(() => {

        setLoading(false)
    }, [])

    const headerData = [
        {
            key: "id",
            label: "Mã giao dịch",
            customValue: (item) => item.id
        },
        {
            key: "transactionDate",
            label: "Ngày giao dịch",
            customValue: (item) => item.transactionDate
        },
        {
            key: "note",
            label: "Ghi chú",
            customValue: (item) => item.note
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
            customValue: (item) => item.weightPerUnit && item.quantity && <div>{item.weightPerUnit * item.quantity}</div>
        },
        {
            key:"unitPrice",
            label: "Đơn giá",
            customValue: (item) => item.unitPrice && <div>{item.unitPrice}</div>
        },
        {
            key:"totalPrice",
            label: "Thành tiền (Đơn giá x Số lượng)",
            customValue: (item) => item.quantity && item.unitPrice && <div>{ item.quantity * item.unitPrice}</div>
        },
    ]


    return (
        <div className='flex flex-col gap-4 w-full'>
            <div className='grid grid-cols-3 p-4 gap-4 w-full h-50'>
                <div className='col-span-1 rounded-xl bg-white p-4'>
                    <h1 className='text-xl font-bold'>Chi tiết phiếu nhập</h1>
                </div>
                <div className='col-span-1 rounded-xl bg-white p-4'>
                    <h1 className='text-xl font-bold'>Nhà cung cấp</h1>
                </div>
            </div>

            <div className='w-auto rounded-xl h-auto bg-white mx-4 my-2 p-4'>
                <h1 className='text-xl font-bold'>Danh sách sản phẩm</h1>
                {/* <TableCommon
                headers={headerData}
                data={products}
            /> */}
            </div>


            <div className='w-auto rounded-xl h-50 bg-white mx-4 my-2 p-4'>

            </div>
        </div>
    )
}
