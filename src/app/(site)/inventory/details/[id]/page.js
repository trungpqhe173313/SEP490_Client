'use client';
import React, { useState, useEffect } from 'react'
import { inventoryService } from '@/services/inventory.service';
import { useLoading } from '@/context/LoadingContext';
import TableCommon from "@/components/Table/table";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader/loader";
import { getInventoryStatus } from '@/lib/getInventoryStatus';
import SuccessModal from '@/components/Modal/successModal';
import FailedModal from '@/components/Modal/failedModal';


export default function InventoryDetail({ params }) {
    const { loading, setLoading } = useLoading();
    const { id } = React.use(params);
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

    const [inventory, setinventory] = useState({});
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

    const fetchInventory = async () => {
        try {
            if (!id) return;
            setLoading(true);
            const res = await inventoryService.getStockAdjustmentDetail(id);
            setinventory(res.data);
            setProducts(res.data.details);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!pageReady) return;
        fetchInventory();
    }, [pageReady])

    const getDifference = (difference) => {
        if (!difference || isNaN(difference)) return;
        if (difference === 0) {
            return <div style={{ color: "green" }}>Số lượng chính xác</div>
        }
        if (difference > 0) {
            return <div style={{ color: "blue" }}>Thừa {difference} sản phẩm</div>
        } else if (difference < 0) {
            return <div style={{ color: "red" }}>Thiếu {difference * -1} sản phẩm</div>
        }
    }

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
            key: "systemQuantity",
            label: "Tồn kho",
            customValue: (item) => item.systemQuantity && <div>{item.systemQuantity}</div>
        },
        {
            key: "actualQuantity",
            label: "Thực tế",
            customValue: (item) => item.actualQuantity && <div>{item.actualQuantity}</div>
        },
        {
            key: "difference",
            label: "Chênh lệch",
            customValue: (item) => item.difference && <div>{getDifference(item.difference)}</div>
        },
        {
            key: "note",
            label: "Ghi chú",
            customValue: (item) => item.note && <div>{item.note}</div>
        },
        {
            key: "createdAt",
            label: "Ngày kiểm",
            customValue: (item) => item.createdAt && <div>{new Date(item.createdAt).toLocaleString('vi-VN')}</div>
        }
    ]

    const handleUpdateResolve = async () => {
        setLoading(true);
        try {
            await inventoryService.resolveStockAdjustment(id);
            setModalSuccessMessage("Xác nhận phiếu kiểm thành công");
            setModalSuccessOpen(true);
            fetchInventory();
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error?.response?.data?.statusCode}: ${error?.response?.data?.error?.message}`);
            setModalFailedSubMessages(error?.response?.data?.error?.messages);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = () => {
        router.push(`/inventory/modify/update/${id}`);
    }

    if (!pageReady) return <Loader />;

    return (
        <div className='flex flex-col gap-4 w-full'>
            <div className='grid grid-cols-3 p-4 gap-4 w-full h-50'>
                <div className='col-span-1 rounded-xl bg-white p-4'>
                    <h1 className='text-xl font-bold'>Chi tiết phiếu kiểm</h1>
                    <p className='my-2'>Mã phiếu kiểm: {inventory.adjustmentId}</p>
                    <p className='my-2'>Ngày tạo phiếu kiểm: {new Date(inventory.createdAt).toLocaleString('vi-VN')}</p>
                    <p className='my-2'>Nhà kho: {inventory.warehouseName}</p>
                    <div className='my-2 flex flex-row gap-2'>
                        <p>Trạng thái: </p>
                        {getInventoryStatus(inventory.status)}
                    </div>
                </div>
            </div>

            <div className='w-auto rounded-xl h-auto bg-white mx-4 my-2'>
                <h1 className='text-xl font-bold p-4'>Danh sách sản phẩm</h1>
                <TableCommon
                    headers={headerData}
                    tableData={products}
                />
                <div className='flex flex-row justify-between items-center p-4'>
                    <div className='flex flex-row items-center gap-2'>
                        {inventory && inventory.status === 1 && <button className='rounded-xl px-4 py-2 bg-yellow-500 text-white' onClick={handleEdit}>Chỉnh sửa</button>}
                        {inventory && inventory.status === 1 && <button className='rounded-xl px-4 py-2 bg-cyan-500 text-white' onClick={handleUpdateResolve}>Xác nhận kiểm kho</button>}
                    </div>
                </div>
            </div>
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}
