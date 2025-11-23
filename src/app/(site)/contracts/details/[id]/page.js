'use client';
import React, { useState, useEffect } from 'react';
import { contractService } from '@/services/contract.service';
import { useLoading } from '@/context/LoadingContext';
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader/loader";

export default function ContractDetails({ params }) {
    const { id } = React.use(params);
    const { loading, setLoading } = useLoading();
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const [contract, setContract] = useState({});
    const [customer, setCustomer] = useState(null);
    const [supplier, setSupplier] = useState(null);
    const [showImage, setShowImage] = useState(false);
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
        fetchContract();
    }, [pageReady])

    const fetchContract = async () => {
        try {
            if (!id) return;
            setLoading(true);
            const res = await contractService.getContractByID(id);
            setContract(res.data);
            res.data.customer.userId !== null && setCustomer(res.data.customer);
            res.data.supplier.supplierId !== null && setSupplier(res.data.supplier);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const toggleImage = () => {
        setShowImage(!showImage);
    }

    if (!pageReady) {
        return <Loader />;
    }

    return (
        <div className='flex flex-col gap-4 w-full p-4'>
            <div className='w-full bg-white p-4 rounded-xl'>
                <h1 className='text-2xl font-semibold'>Chi tiết hợp đồng</h1>
            </div>

            <div className="w-full bg-white p-4 rounded-xl">
                <table className="w-full">
                    <tbody className="striped-table">
                        <tr>
                            <td className="p-4">Mã hợp đồng</td>
                            <td className="p-4 w-8/10">{contract.contractId}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Trạng thái</td>
                            <td className={`p-4 w-8/10 ${contract.isActive ? "text-green-600" : "text-red-600"}`}>{contract.isActive ? "Đang hoạt động" : "Dừng hoạt động"}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Ngày tạo</td>
                            <td className="p-4 w-8/10">{new Date(contract.createdAt).toLocaleString('vi-VN')}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Ngày cập nhật</td>
                            <td className="p-4 w-8/10">{new Date(contract.updatedAt).toLocaleString('vi-VN')}</td>
                        </tr>
                        {customer &&
                            <React.Fragment>
                                <tr>
                                    <td className="p-4">Tên khách hàng</td>
                                    <td className="p-4 w-8/10">{customer.fullName || "Chưa có"}</td>
                                </tr>
                                <tr>
                                    <td className="p-4">Số điện thoại</td>
                                    <td className="p-4 w-8/10">{customer.phone || "Chưa có"}</td>
                                </tr>
                                <tr>
                                    <td className="p-4">Email</td>
                                    <td className="p-4 w-8/10">{customer.email || "Chưa có"}</td>
                                </tr>
                            </React.Fragment>
                        }
                        {supplier &&
                            <React.Fragment>
                                <tr>
                                    <td className="p-4">Nhà cung cấp</td>
                                    <td className="p-4 w-8/10">{supplier.supplierName || "Chưa có"}</td>
                                </tr>
                                <tr>
                                    <td className="p-4">Số điện thoại</td>
                                    <td className="p-4 w-8/10">{supplier.phone || "Chưa có"}</td>
                                </tr>
                                <tr>
                                    <td className="p-4">Email</td>
                                    <td className="p-4 w-8/10">{supplier.email || "Chưa có"}</td>
                                </tr>
                            </React.Fragment>
                        }
                        <tr>
                            <td className="p-4">Ảnh hợp đồng</td>
                            <td className="p-4 w-8/10">
                                <button className='background-primary text-white px-4 py-2 rounded-md' onClick={toggleImage}>{showImage ? "Đóng ảnh" : "Xem ảnh"}</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                {showImage &&
                    <div className='w-full bg-white p-4 rounded-xl'>
                        <img src={contract?.image} className='h-screen w-auto mx-auto border-1 border-black rounded-xl' alt="Ảnh hợp đồng" />
                    </div>
                }
            </div>
        </div>
    )
}