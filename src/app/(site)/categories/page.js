"use client";
import { categoryService } from "@/services/category.service";
import React, { useState, useEffect } from "react";
import TableCommon from "@/components/Table/table";
import { CategoryForm } from "@/components/Form/categoryForm";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import Loader from "@/components/Loader/loader";

export default function Categories() {
    //Data state
    const [categories, setCategories] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null);

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
    const [rowPerPage, setRowPerPage] = useState(5);
    const [totalCount, setTotalCount] = useState(0);

    const [loading, setLoading] = useState(true);

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
            customValue: (item) => item.description && <div>{item.description}</div>
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
        const body = {
            pageIndex: pageIndex + 1,
            pageSize: rowPerPage,
            categoryName: filterCategoryName
        }
        const response = await categoryService.getAllCategories(body);
        setCategories(response.data.items);
        setTotalCount(response.data.totalCount);
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, [pageIndex, rowPerPage, filterCategoryName]);

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
        setLoading(true);
        await categoryService.deleteCategory(category.categoryId);
        fetchCategories();
        setModalSuccessMessage("Xoá danh mục thành công");
        setModalSuccessOpen(true);
        setLoading(false);
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
            setModalFailedMessage("Có lỗi xảy ra, vui lòng thử lại sau");
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="grid grid-cols-4 p-8 gap-4">
            {/* Filter sidebar */}
            <div className="col-span-1">
                <div className="p-4 rounded-2xl bg-white h-auto max-h-screen sticky top-30">
                    <h2 className="text-xl font-bold">Lọc danh mục</h2>
 
                </div>
            </div>
            {/* Main content */}
            <div className="col-span-3">
                <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4">
                    <div className="flex flex-col w-3/4 mr-4">
                        <label className="block text-gray-700 text-sm font-bold" htmlFor="search">
                            Tìm danh mục
                        </label>
                        <input className="block w-full text-gray-700 text-sm font-semibold mb-2 h-10 border border-black-200 rounded px-3" type="text" name="search" />
                    </div>
                    <div className="flex flex-col w-1/4">
                        <button className="block border bg-green-600 text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto" onClick={() => handleCreate()}>Thêm danh mục</button>
                    </div>
                </div>
                <TableCommon
                    headers={headerData}
                    tableData={categories}
                    defaultSortColumn="categoryId"
                    rowPerPage={rowPerPage}
                    pageIndex={pageIndex}
                    totalCount={totalCount}
                    rowPerPageOptions={[5, 10, 20]}
                    handleChangePage={handleChangePage}
                    handleChangeRowPerPage={handleChangeRowPerPage}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    messagePopupDelete="Bạn có muốn xóa danh mục này không?"
                    usePagination={true}
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