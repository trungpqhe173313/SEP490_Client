'use client';
import React, { useState, useEffect } from 'react';
import { customerService } from '@/services/customer.service';
import { useLoading } from '@/context/LoadingContext';
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import { CustomerForm } from "@/components/Form/customerForm";
import Loader from "@/components/Loader/loader";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";

export default function CustomerDetail({ params }) {
    const { id } = React.use(params);
    const { loading, setLoading } = useLoading();
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");

    const [customer, setCustomer] = useState({});
    const [showPassword, setShowPassword] = useState(false);
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
        fetchCustomer();
    }, [pageReady])

    const fetchCustomer = async () => {
        try {
            if (!id) return;
            setLoading(true);
            const res = await customerService.getCustomerByID(id);
            setCustomer(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleConfirm = async (customerData) => {
        setLoading(true);
        try {
            if (!customer) return;
            await customerService.updateCustomer(customer.userId, customerData);
            setModalSuccessMessage("Cập nhật khách hàng thành công");
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchCustomer();
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    if (!pageReady) return <Loader />;

    return (
        <div className='flex flex-col gap-4 w-full py-8 px-4'>
            <div className='w-full bg-white p-4 rounded-xl flex items-center justify-between'>
                <h1 className='text-2xl font-semibold'>Chi tiết khách hàng</h1>
                <button className='background-primary text-white px-4 py-2 rounded-md' onClick={() => setModalOpen(true)}>Chỉnh sửa khách hàng</button>
            </div>

            <div className="w-full bg-white p-4 rounded-xl grid grid-cols-3 gap-4">
                <div className="col-span-1 flex items-center justify-center">
                    <img src={customer.image} alt="avatar" className="w-80 aspect-square object-cover rounded-full border border-black" />
                </div>
                <div className="col-span-1">
                    <h1 className="text-2xl font-bold mb-4">Thông tin khách hàng</h1>
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="p-4">Mã khách hàng</td>
                                <td className="p-4 w-6/10">{customer.userId}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Tên khách hàng</td>
                                <td className="p-4 w-6/10">{customer.fullName}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Email</td>
                                <td className="p-4 w-6/10">{customer.email}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Số điện thoại</td>
                                <td className="p-4 w-6/10">{customer.phone}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Trạng thái</td>
                                <td className={`p-4 w-6/10 ${customer.isActive ? "text-green-600" : "text-red-600"}`}>{customer.isActive ? "Đang hoạt động" : "Dừng hoạt động"}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Ngày tạo</td>
                                <td className="p-4 w-6/10">{new Date(customer.createdAt).toLocaleString('vi-VN')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="col-span-1 w-full flex flex-col items-center">
                    <h1 className="text-2xl font-bold mb-4">Thông tin đăng nhập</h1>
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="p-4">Tên đăng nhập</td>
                                <td className="p-4 w-6/10">{customer.username}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Mật khẩu</td>
                                <td className="p-4 w-6/10">{showPassword ? customer.password : "************"}</td>
                            </tr>
                        </tbody>
                    </table>
                    <button className="background-primary text-white px-4 py-2 rounded-md mt-4" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Ẩn" : "Hiện"}</button>
                </div>
            </div>
            <CustomerForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={customer}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}