'use client';
import React, { useState, useEffect } from 'react';
import { employeeService } from '@/services/employee.service';
import { useLoading } from '@/context/LoadingContext';
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import { EmployeeForm } from "@/components/Form/employeeForm";
import Loader from "@/components/Loader/loader";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";

export default function EmployeeDetail({ params }) {
    const { id } = React.use(params);
    const { loading, setLoading } = useLoading();
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");

    const [employee, setEmployee] = useState({});
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
        fetchEmployee();
    }, [pageReady])

    const fetchEmployee = async () => {
        try {
            if (!id) return;
            setLoading(true);
            const res = await employeeService.getEmployeeByID(id);
            setEmployee(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleConfirm = async (employeeData) => {
        setLoading(true);
        try {
            if (!employee) return;
            await employeeService.updateEmployee(employee.userId, employeeData);
            setModalSuccessMessage("Cập nhật nhân viên thành công");
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchEmployee();
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
                <h1 className='text-2xl font-semibold'>Chi tiết nhân viên</h1>
                <button className='background-primary text-white px-4 py-2 rounded-md' onClick={() => setModalOpen(true)}>Chỉnh sửa nhân viên</button>
            </div>

            <div className="w-full bg-white p-4 rounded-xl grid grid-cols-3 gap-4">
                <div className="col-span-1 flex items-center justify-center">
                    <img src={employee.image} alt="avatar" className="w-80 aspect-square object-cover rounded-full border border-black" />
                </div>
                <div className="col-span-1">
                    <h1 className="text-2xl font-bold mb-4">Thông tin nhân viên</h1>
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="p-4">Mã nhân viên</td>
                                <td className="p-4 w-6/10">{employee.userId}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Tên nhân viên</td>
                                <td className="p-4 w-6/10">{employee.fullName}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Email</td>
                                <td className="p-4 w-6/10">{employee.email}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Số điện thoại</td>
                                <td className="p-4 w-6/10">{employee.phone}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Trạng thái</td>
                                <td className={`p-4 w-6/10 ${employee.isActive ? "text-green-600" : "text-red-600"}`}>{employee.isActive ? "Đang hoạt động" : "Dừng hoạt động"}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Ngày tạo</td>
                                <td className="p-4 w-6/10">{new Date(employee.createdAt).toLocaleString('vi-VN')}</td>
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
                                <td className="p-4 w-6/10">{employee.username}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Mật khẩu</td>
                                <td className="p-4 w-6/10">{showPassword ? employee.password : "************"}</td>
                            </tr>
                        </tbody>
                    </table>
                    <button className="background-primary text-white px-4 py-2 rounded-md mt-4" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Ẩn" : "Hiện"}</button>
                </div>
            </div>
            <EmployeeForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={employee}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}