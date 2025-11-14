'use client';
import React, { useState, useEffect } from 'react';
import { productService } from '@/services/product.service';
import { useLoading } from '@/context/LoadingContext';
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader/loader";

export default function ProductDetail({ params }) {
    const { id } = React.use(params);
    const { loading, setLoading } = useLoading();
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const [product, setProduct] = useState({});
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
        fetchProduct();
    }, [pageReady])

    const fetchProduct = async () => {
        try {
            if (!id) return;
            setLoading(true);
            const res = await productService.getProductByID(id);
            setProduct(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    if (!pageReady) return <Loader />;

    return (
        <div className='flex flex-col gap-4 w-full p-4'>
            <div className='w-full bg-white p-4 rounded-xl'>
                <h1 className='text-2xl font-semibold'>Chi tiết sản phẩm</h1>
            </div>

            <div className="w-full bg-white p-4 rounded-xl">
                <table className="w-full">
                    <tbody className="striped-table">
                        <tr>
                            <td className="p-4">Mã sản phẩm</td>
                            <td className="p-4 w-8/10">{product.productId}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Tên sản phẩm</td>
                            <td className="p-4 w-8/10">{product.productName}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Mô tả</td>
                            <td className="p-4 w-8/10">{product.description}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Trạng thái</td>
                            <td className={`p-4 w-8/10 ${product.isAvailable ? "text-green-600" : "text-red-600"}`}>{product.isAvailable ? "Đang hoạt động" : "Dừng hoạt động"}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Ngày tạo</td>
                            <td className="p-4 w-8/10">{new Date(product.createdAt).toLocaleDateString('vi-VN')}</td>
                        </tr>
                        <tr>
                            <td className="p-4">Ngày cập nhật</td>
                            <td className="p-4 w-8/10">{new Date(product.updateAt).toLocaleDateString('vi-VN')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}