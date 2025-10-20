"use client";
import { categoryService } from "@/services/category.service";
import React, { useState, useEffect } from "react";
import TableCommon from "@/components/Table/table";

export default function Categories() {
    const [categories, setCategories] = useState([]);

    const headerData = [
        {
            key: "CategoryID",
            label: "Mã danh mục",
            customValue: (item) => item.CategoryID && <div>{item.CategoryID}</div>
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
        }
    ];

    useEffect(() => {
        const fetchCategories = async () => {
            const response = await categoryService.getAllCategories();
            setCategories(response.data);
        };
        fetchCategories();
    }, []);

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
                <TableCommon
                    headers={headerData}
                    tableData={categories}
                    defaultSortColumn="CategoryID"
                    rowPerPage={5}
                    pageIndex={0}
                    totalCount={categories.length}
                    rowPerPageOptions={[5, 10, 20]}
                    handleEdit={(item) => console.log('edit', item)}
                    handleDelete={(id) => console.log('delete', id)}
                    messagePopupDelete="Bạn có muốn xóa danh mục này không?"
                    placeholderSearch="Tìm kiếm danh mục"
                    usePagination={true}
                    useSearch={true}
                />
            </div>
        </div>
    );
}