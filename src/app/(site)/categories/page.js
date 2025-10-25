"use client";
import { categoryService } from "@/services/category.service";
import React, { useState, useEffect } from "react";
import TableCommon from "@/components/Table/table";
import { CategoryForm } from "@/components/Form/categoryForm";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import Loader from "@/components/Loader/loader";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    const headerData = [
        {
            key: "id",
            label: "Mã danh mục",
            customValue: (item) => item.id && <div>{item.id}</div>
        },
        {
            key: "CategoryName",
            label: "Tên danh mục",
            customValue: (item) => item.CategoryName && <div>{item.CategoryName}</div>
        },
        {
            key: "Description",
            label: "Mô tả",
            customValue: (item) => item.Description && <div>{item.Description}</div>
        },
        {
            key: "CreatedAt",
            label: "Ngày tạo",
            customValue: (item) => item.CreatedAt && <div>{new Date(item.CreatedAt).toLocaleDateString('vi-VN')}</div>
        }
    ];

    const fetchCategories = async () => {
        const response = await categoryService.getAllCategories();
        setCategories(response.data);
    };

    useEffect(() => {
        fetchCategories();
        setLoading(false);
    }, []);

    const handleCreate = () => {
        setEditingCategory(null);
        setModalOpen(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        // await categoryService.deleteCategory(id);
        // fetchCategories();
        setModalSuccessMessage("Xoá danh mục thành công");
        setModalSuccessOpen(true);
        setLoading(false);
    };

    const handleConfirm = async (categoryData) => {
        setLoading(true);
        try {
            if (editingCategory) {
                await categoryService.updateCategory(editingCategory.id, categoryData);
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
            <div className="col-span-1 p-4 rounded-2xl bg-white">
                <div className="p-4">
                    <h2 className="text-xl font-bold">Lọc danh mục</h2>
                    {/* <div className="flex flex-col">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                            Trạng thái
                        </label>
                        <select className="block w-full text-gray-700 text-sm font-semibold mb-2 h-10 border border-gray-200 rounded px-3" id="status" name="status">
                            <option value="">Tất cả</option>
                            <option value="Active">Hoạt động</option>
                            <option value="Inactive">Không hoạt động</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="parent">
                            Danh mục cha
                        </label>
                        <select className="block w-full text-gray-700 text-sm font-semibold mb-2 h-10 border border-gray-200 rounded px-3" id="parent" name="parent">
                            <option value="">Tất cả</option>
                            {categories.map(category => (
                                <option key={category.CategoryID} value={category.CategoryID}>
                                    {category.CategoryName}
                                </option>
                            ))}
                        </select>
                    </div> */}
                </div>
            </div>
            <div className="col-span-3">
                <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4">
                    <div className="flex flex-col w-3/4 mr-4">
                        <label className="block text-gray-700 text-sm font-bold" htmlFor="search">
                            Tìm danh mục
                        </label>
                        <input className="block w-full text-gray-700 text-sm font-semibold mb-2 h-10 border border-black-200 rounded px-3" id="search" type="text" name="search" />
                    </div>
                    <div className="flex flex-col w-1/4">
                        <button className="block border bg-green-600 text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto" onClick={() => handleCreate()}>Thêm danh mục</button>
                    </div>
                </div>
                <TableCommon
                    headers={headerData}
                    tableData={categories}
                    defaultSortColumn="id"
                    rowPerPage={5}
                    pageIndex={0}
                    totalCount={categories.length}
                    rowPerPageOptions={[5, 10, 20]}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    messagePopupDelete="Bạn có muốn xóa danh mục này không?"
                    placeholderSearch="Tìm danh mục"
                    usePagination={true}
                    useSearch={true}
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