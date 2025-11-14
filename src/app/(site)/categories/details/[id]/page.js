'use client';
import React, { useState, useEffect } from 'react';
import { categoryService } from '@/services/category.service';
import { useLoading } from '@/context/LoadingContext';
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import { CategoryForm } from "@/components/Form/categoryForm";
import Loader from "@/components/Loader/loader";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";

export default function CategoryDetail({ params }) {
    const { id } = React.use(params);
    const { loading, setLoading } = useLoading();
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");

    const [category, setCategory] = useState({});
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
        fetchCategory();
    }, [pageReady])

    const fetchCategory = async () => {
        try {
            if (!id) return;
            setLoading(true);
            const res = await categoryService.getCategoryByID(id);
            setCategory(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleConfirm = async (categoryData) => {
        setLoading(true);
        try {
            if (!category) return;
            await categoryService.updateCategory(category.categoryId, categoryData);
            setModalSuccessMessage("Cập nhật danh mục thành công");
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchCategory();
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
            <div className='w-full bg-white p-4 rounded-xl flex items-center justify-between'>
                <h1 className='text-2xl font-semibold'>Chi tiết danh mục</h1>
                <button className='background-primary text-white px-4 py-2 rounded-md' onClick={() => setModalOpen(true)}>Chỉnh sửa danh mục</button>
            </div>

            <div className="w-full bg-white p-4 rounded-xl">
                <table className="w-full">
                    <tbody className="striped-table">
                        <tr>
                            <td className="p-4">Mã danh mục</td>
                            <td className="p-4 w-8/10">{category.categoryId}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Tên danh mục</td>
                            <td className="p-4 w-8/10">{category.categoryName}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Mô tả</td>
                            <td className="p-4 w-8/10">{category.description}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Trạng thái</td>
                            <td className={`p-4 w-8/10 ${category.isActive ? "text-green-600" : "text-red-600"}`}>{category.isActive ? "Đang hoạt động" : "Dừng hoạt động"}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Ngày tạo</td>
                            <td className="p-4 w-8/10">{new Date(category.createdAt).toLocaleDateString('vi-VN')}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Ngày cập nhật</td>
                            <td className="p-4 w-8/10">{new Date(category.updateAt).toLocaleDateString('vi-VN')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <CategoryForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={category}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}