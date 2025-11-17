"use client";
import { categoryService } from "@/services/category.service";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import TableCommon from "@/components/Table/table";
import { CategoryForm } from "@/components/Form/categoryForm";
import Loader from "@/components/Loader/loader";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";

export default function Categories() {
    //Data state
    const [categories, setCategories] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null);
    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Manager"];

    //Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");

    //Filter state
    const [filterCategoryName, setFilterCategoryName] = useState("");

    //Pagination state
    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const { loading, setLoading } = useLoading();
    const { isLogin, user, refreshUserInfo } = useLogin();
    const router = useRouter();
    const buttonRef = useRef(null);

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

    const headerData = [
        {
            key: "categoryId",
            label: "Mã danh mục",
            customValue: (item) => item.categoryId && <div>{item.categoryId}</div>
        },
        {
            key: "categoryName",
            label: "Tên danh mục",
            customValue: (item) => item.categoryName && <div>{item.categoryName}</div>
        },
        {
            key: "description",
            label: "Mô tả",
            customValue: (item) => item.description ? <div>{item.description}</div> : <div>"Chưa có"</div>
        },
        {
            key: "isActive",
            label: "Trạng thái",
            customValue: (item) => item.isActive == 1 ? <div className="text-green-600">Đang hoạt động</div> : <div className="text-red-600">Dừng hoạt động</div>
        },
        {
            key: "createdAt",
            label: "Ngày tạo",
            customValue: (item) => item.createdAt && <div>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</div>
        },
        {
            key: "updateAt",
            label: "Ngày cập nhật",
            customValue: (item) => item.updateAt && <div>{new Date(item.updateAt).toLocaleDateString('vi-VN')}</div>
        },
    ];

    // Pagination handlers
    const handleChangePage = (event, newPage) => setPageIndex(newPage);
    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const body = {
                pageIndex: pageIndex + 1,
                pageSize: rowPerPage,
                categoryName: filterCategoryName
            }
            const response = await categoryService.getAllCategories(body);
            setCategories(response.data.items);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!pageReady) return;
        fetchCategories();
    }, [pageIndex, rowPerPage, pageReady]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            buttonRef.current?.click();
        }
    };

    // Modal handlers
    const handleCreate = () => {
        setEditingCategory(null);
        setModalOpen(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setModalOpen(true);
    };

    const handleDelete = async (category) => {
        if (category.isActive === false) {
            setModalFailedMessage("Danh mục đã bị xóa từ trước");
            setModalFailedOpen(true);
            return;
        }
        setLoading(true);
        try {
            await categoryService.deleteCategory(category.categoryId);
            setModalSuccessMessage("Xoá danh mục thành công");
            setModalSuccessOpen(true);
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (categoryData) => {
        setLoading(true);
        try {
            if (editingCategory) {
                await categoryService.updateCategory(editingCategory.categoryId, categoryData);
                setModalSuccessMessage("Cập nhật danh mục thành công");
            } else {
                await categoryService.createCategory(categoryData);
                setModalSuccessMessage("Tạo danh mục thành công");
            }
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchCategories();
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error?.response?.data?.statusCode}: ${error?.response?.data?.error?.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilter = () => {
        setFilterCategoryName("");
        setPageIndex(0);
    };

    // Show loading while checking authorization
    if (!pageReady) {
        return <Loader />;
    }

    return (
        <div className="grid grid-cols-4 p-8 gap-4">
            {/* Filter sidebar */}
            <div className="col-span-1">
                <div className="p-4 rounded-2xl bg-white h-auto sticky top-0 w-full">
                    <h2 className="text-xl font-bold">Lọc danh mục</h2>
                    <div className="flex flex-col items-center my-4">
                        <div className="mt-2 w-full">
                            <label className="mr-2">Tên danh mục:</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={filterCategoryName}
                                onChange={(e) => setFilterCategoryName(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    </div>
                    <div className="flex justify-center gap-2">
                        <button
                            className="px-4 py-2 background-primary text-white rounded cursor-pointer"
                            onClick={() => {
                                setPageIndex(0);
                                fetchCategories();
                            }}
                            ref={buttonRef}
                        >
                            Lọc
                        </button>
                        <button
                            className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
                            onClick={handleClearFilter}
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            </div>
            {/* Main content */}
            <div className="col-span-3">
                <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4">
                    <div className="flex flex-col w-3/4 mr-4">
                        <h1 className="text-2xl font-bold">Danh sách danh mục</h1>
                    </div>
                    <div className="flex flex-col w-1/4">
                        <button className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto" onClick={() => handleCreate()}>Thêm danh mục</button>
                    </div>
                </div>
                <TableCommon
                    headers={headerData}
                    tableData={categories}
                    defaultSortColumn="updateAt"
                    defaultSortType="desc"
                    rowPerPage={rowPerPage}
                    pageIndex={pageIndex}
                    totalCount={totalCount}
                    rowPerPageOptions={[5, 10, 20]}
                    handleChangePage={handleChangePage}
                    handleChangeRowPerPage={handleChangeRowPerPage}
                    navigateDetail={(item) => router.push(`/categories/details/${item.categoryId}`)}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    messagePopupDelete="Bạn có muốn xóa danh mục này không?"
                    usePagination={true}
                    useAction={true}
                />
            </div>
            <CategoryForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={editingCategory}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    );
}