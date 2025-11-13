'use client';
import React, { useState, useEffect } from 'react'
import { importService } from '@/services/import.service';
import { numberToVietnamese } from '@/lib/numberToVietnamese';
import { convertKgToTon } from '@/lib/convertToTon';
import { useLoading } from '@/context/LoadingContext';
import TableCommon from "@/components/Table/table";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader/loader";


export default function ImportDetail({ params }) {
    const { setLoading } = useLoading();
    const { id } = React.use(params);
    const router = useRouter();
    const { isLogin, user } = useLogin();

    const [transaction, setTransaction] = useState({});
    const [supplier, setSupplier] = useState({});
    const [products, setProducts] = useState([]);
    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Manager"];

    // Check authorization
    useEffect(() => {
        if (isLogin && user?.roles && user.roles.some((r) => pageRole.includes(r))) {
            setPageReady(true);
        } else if (!isLogin) {
            router.push("/login");
        } else if (!user?.roles?.some((r) => pageRole.includes(r))) {
            router.push("/");
        }
    }, [isLogin, user, router]);

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

    useEffect(() => {
        if (!pageReady) return;
        fetchTransaction();
    }, [pageReady])

    const getStatus = (string) => {
        switch (string) {
            case 1:
                return <p className="text-yellow-600">Nháp</p>
            case 0:
                return <p className="text-blue-600">Lên đơn</p>
            case 2:
                return <p className="text-yellow-600">Đang giao</p>
            case 3:
                return <p className="text-green-600">Đã giao</p>
            case 4:
                return <p className="text-red-600">Đã hủy</p>
            case 5:
                return <p className="text-yellow-600">Đang kiểm</p>
            case 6:
                return <p className="text-green-600">Đã kiểm</p>
            default:
                return <p className="text-black">{string}</p>
        }
    }

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

    if (!pageReady) return <Loader />;

    return (
        <div className='flex flex-col gap-4 w-full'>
            <div className='grid grid-cols-3 p-4 gap-4 w-full h-50'>
                <div className='col-span-1 rounded-xl bg-white p-4'>
                    <h1 className='text-xl font-bold'>Chi tiết phiếu nhập</h1>
                    <p className='my-2'>Mã giao dịch: {transaction.transactionId}</p>
                    <p className='my-2'>Ngày giao dịch: {new Date(transaction.transactionDate).toLocaleDateString('vi-VN')}</p>
                    <p className='my-2'>Nhà kho: {transaction.warehouseName}</p>
                    <div className='my-2 flex flex-row gap-2'>
                        <p>Trạng thái: </p>
                        {getStatus(transaction.status)}
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
                />
                <div className='h-14 relative flex flex-row items-center'>
                    <h2 className='absolute left-[4.5%] transform -translate-x-1/2'>Tổng</h2>
                    <h2 className='absolute right-[29%] transform -translate-x-1/2'>{(products.reduce((total, item) => total + (item.weightPerUnit * item.quantity), 0))} Kg</h2>
                    <h2 className='absolute right-[3.5%] transform -translate-x-1/2'>{formatLargeNumber(products.reduce((total, item) => total + (item.quantity * item.unitPrice), 0))}₫</h2>
                </div>
            </div>


            <div className='w-auto rounded-xl h-auto bg-white mx-4 my-2 p-4 text-right flex flex-col items-end'>
                <div className='text-xl flex flex-row justify-between w-1/3'>
                    <h2 className='w-1/3 text-left'>Tổng khối lượng:</h2>
                    <h2>{convertKgToTon(products.reduce((total, item) => total + (item.weightPerUnit * item.quantity), 0))}</h2>
                </div>
                <div className='text-xl flex flex-row justify-between w-1/3'>
                    <h2 className='w-1/3 text-left'>Tổng tiền:</h2>
                    <h2>{formatLargeNumber(products.reduce((total, item) => total + (item.quantity * item.unitPrice), 0))}₫</h2>
                </div>
                <div className='text-xl flex flex-row justify-between w-1/3'>
                    <h2 className='w-1/3 text-left'>Bằng chữ: </h2>
                    <h2>{numberToVietnamese(products.reduce((total, item) => total + (item.quantity * item.unitPrice), 0))}</h2>
                </div>
            </div>
        </div>
    )
}
