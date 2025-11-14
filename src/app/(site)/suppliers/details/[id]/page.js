'use client';
import React, { useState, useEffect } from 'react';
import { supplierService } from '@/services/supplier.service';
import { useLoading } from '@/context/LoadingContext';
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import { SupplierForm } from "@/components/Form/supplierForm";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import Loader from "@/components/Loader/loader";

export default function SupplierDetail({ params }) {
    const { id } = React.use(params);
    const { loading, setLoading } = useLoading();
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");

    const [supplier, setSupplier] = useState({});
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

    useEffect(() => {
        if (!pageReady) return;
        fetchSupplier();
    }, [pageReady])

    const fetchSupplier = async () => {
        try {
            if (!id) return;
            setLoading(true);
            const res = await supplierService.getSupplierByID(id);
            setSupplier(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleConfirm = async (supplierData) => {
        setLoading(true);
        try {
            if (!supplier) return;
            await supplierService.updateSupplier(supplier.supplierId, supplierData);
            setModalSuccessMessage("Cập nhật nhà cung cấp thành công");
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchSupplier();
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error?.response?.data?.statusCode}: ${error?.response?.data?.error?.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    if (!pageReady) return <Loader />;

    return (
        <div className='flex flex-col gap-4 w-full p-4'>
            <div className='w-full bg-white p-4 rounded-xl flex justify-between items-center'>
                <h1 className='text-2xl font-semibold'>Chi tiết nhà cung cấp</h1>
                <button className='background-primary text-white px-4 py-2 rounded-md' onClick={() => setModalOpen(true)}>Chỉnh sửa nhà cung cấp</button>
            </div>

            <div className="w-full bg-white p-4 rounded-xl">
                <table className="w-full">
                    <tbody className="striped-table">
                        <tr>
                            <td className="p-4">Mã nhà cung cấp</td>
                            <td className="p-4 w-8/10">{supplier.supplierId}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Tên nhà cung cấp</td>
                            <td className="p-4 w-8/10">{supplier.supplierName}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Email</td>
                            <td className="p-4 w-8/10">{supplier.email || "Chưa có"}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Số điện thoại</td>
                            <td className="p-4 w-8/10">{supplier.phone || "Chưa có"}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Trạng thái</td>
                            <td className={`p-4 w-8/10 ${supplier.isActive ? "text-green-600" : "text-red-600"}`}>{supplier.isActive ? "Đang hoạt động" : "Dừng hoạt động"}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Ngày tạo</td>
                            <td className="p-4 w-8/10">{new Date(supplier.createdAt).toLocaleDateString('vi-VN')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <SupplierForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={supplier}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}