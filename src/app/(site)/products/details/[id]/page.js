'use client';
import React, { useState, useEffect } from 'react';
import { productService } from '@/services/product.service';
import { useLoading } from '@/context/LoadingContext';
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/Form/productForm";
import Loader from "@/components/Loader/loader";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import Image from 'next/image';
import { formatImageURL } from '@/lib/formattingLib';

export default function ProductDetail({ params }) {
    const { id } = React.use(params);
    const { loading, setLoading } = useLoading();
    const router = useRouter();
    const { isLogin, user, refreshUserInfo } = useLogin();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");

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

    const handleConfirm = async (productData) => {
        setLoading(true);
        try {
            if (!product) return;
            await productService.updateProduct(product.productId, productData);
            setModalSuccessMessage("Cập nhật sản phẩm thành công");
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchProduct();
        } catch (error) {
            setModalFailedMessage(`Lỗi: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    }

    if (!pageReady) return <Loader />;

    return (
        <div className='flex flex-col gap-4 w-full p-4'>
            <div className='w-full bg-white p-4 rounded-xl flex items-center justify-between'>
                <h1 className='text-2xl font-semibold'>Chi tiết sản phẩm</h1>
                <button className='background-primary text-white px-4 py-2 rounded-md' onClick={() => setModalOpen(true)}>Chỉnh sửa sản phẩm</button>
            </div>

            <div className="w-full bg-white p-4 rounded-xl grid grid-cols-3 gap-4">
                <div className="col-span-1 flex flex-col items-center justify-center gap-4">
                    {product.imageUrl && <Image src={formatImageURL(product.imageUrl)} alt="Sản phẩm" className="w-full aspect-square object-cover border border-black" width={400} height={400} />}
                </div>
                <div className="col-span-2">
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="p-4">ID sản phẩm</td>
                                <td className="p-4 w-8/10">{product.productId}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Mã sản phẩm</td>
                                <td className="p-4 w-8/10">{product.code}</td>
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
                                <td className="p-4">Cân nặng</td>
                                <td className="p-4 w-8/10">{product.weightPerUnit} kg</td>
                            </tr>
                            <tr>
                                <td className="p-4">Giá bán</td>
                                <td className="p-4 w-8/10">{product.sellingPrice ? product.sellingPrice.toLocaleString('vi-VN') + " VND" : "Chưa có"}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Danh mục</td>
                                <td className="p-4 w-8/10">{product.categoryName || "Chưa có"}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Nhà cung cấp</td>
                                <td className="p-4 w-8/10">{product.supplierName || "Chưa có"}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Trạng thái</td>
                                <td className={`p-4 w-8/10 ${product.isAvailable ? "text-green-600" : "text-red-600"}`}>{product.isAvailable ? "Còn hàng" : "Hết hàng"}</td>
                            </tr>
                            <tr>
                                <td className="p-4">Ngày tạo</td>
                                <td className="p-4 w-8/10">{new Date(product.createdAt).toLocaleString('vi-VN')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <ProductForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={product}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}