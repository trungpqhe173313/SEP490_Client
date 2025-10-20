"use client";
import { supplierService } from "@/services/supplier.service";
import React, { useState, useEffect } from "react";
import TableCommon from "@/components/Table/table";

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);

    const headerData = [
        {
            key: "SupplierID",
            label: "Mã nhà cung cấp",
            customValue: (item) => item.SupplierID && <div>{item.SupplierID}</div>
        },
        {
            key: "SupplierName",
            label: "Tên nhà cung cấp",
            customValue: (item) => item.SupplierName && <div>{item.SupplierName}</div>
        },
        {
            key: "Email",
            label: "Email",
            customValue: (item) => item.Email && <div>{item.Email}</div>
        },
        {
            key: "Phone",
            label: "Số điện thoại",
            customValue: (item) => item.Phone && <div>{item.Phone}</div>
        },
        {
            key: "IsVerified",
            label: "Trạng thái",
            customValue: (item) => item.IsVerified === 1 ? 
                <div className="text-green-600">Đã xác thực</div> : 
                <div className="text-red-600">Chưa xác thực</div>
        },
        {
            key: "CreatedAt",
            label: "Ngày tạo",
            customValue: (item) => item.CreatedAt && 
                <div>{new Date(item.CreatedAt).toLocaleDateString('vi-VN')}</div>
        }
    ];

    useEffect(() => {
        const fetchSuppliers = async () => {
            const response = await supplierService.getAllSuppliers();
            setSuppliers(response.data);
        };
        fetchSuppliers();
    }, []);

    return (
        <div className="grid grid-cols-4 p-8 gap-4">
            <div className="col-span-1 p-4 rounded-2xl bg-white">
                <div className="p-4">
                    <h2 className="text-xl font-bold">Lọc nhà cung cấp</h2>
                    <div className="flex flex-col">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                            Trạng thái
                        </label>
                        <select className="block w-full text-gray-700 text-sm font-semibold mb-2 h-10 border border-gray-200 rounded px-3" id="status" name="status">
                            <option value="">Tất cả</option>
                            <option value="1">Đã xác thực</option>
                            <option value="0">Chưa xác thực</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="createdDate">
                            Ngày tạo
                        </label>
                        <input 
                            type="date" 
                            className="block w-full text-gray-700 text-sm font-semibold mb-2 h-10 border border-gray-200 rounded px-3"
                            id="createdDate"
                        />
                    </div>
                </div>
            </div>
            <div className="col-span-3">
                <TableCommon
                    headers={headerData}
                    tableData={suppliers}
                    defaultSortColumn="SupplierID"
                    rowPerPage={5}
                    pageIndex={0}
                    totalCount={suppliers.length}
                    rowPerPageOptions={[5, 10, 20]}
                    handleEdit={(item) => console.log('edit', item)}
                    handleDelete={(id) => console.log('delete', id)}
                    messagePopupDelete="Bạn có muốn xóa nhà cung cấp này không?"
                    placeholderSearch="Tìm nhà cung cấp"
                    usePagination={true}
                    useSearch={true}
                />
            </div>
        </div>
    );
}