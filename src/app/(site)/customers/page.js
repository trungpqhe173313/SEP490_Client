"use client";
import { customerService } from "@/services/customer.service";
import React, { useState, useEffect } from "react";
import TableCommon from "@/components/Table/table";

export default function Customers() {
    const [customers, setCustomers] = useState([]);

    const headerData = [
        {
            key: "CustomerID",
            label: "Mã khách hàng",
            customValue: (item) => item.CustomerID && <div>{item.CustomerID}</div>
        },
        {
            key: "CustomerName",
            label: "Tên khách hàng",
            customValue: (item) => item.CustomerName && <div>{item.CustomerName}</div>
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
        }
    ];

    useEffect(() => {
        const fetchCustomers = async () => {
            const response = await customerService.getAllCustomers();
            setCustomers(response.data);
        };
        fetchCustomers();
    }, []);

    return (
        <div className="grid grid-cols-4 p-8 gap-4">
            <div className="col-span-1 p-4 rounded-2xl bg-white">
                <div className="p-4">
                    <h2 className="text-xl font-bold">Lọc khách hàng</h2>
                    {/* <div className="flex flex-col">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                            Loại khách hàng
                        </label>
                        <select className="block w-full text-gray-700 text-sm font-semibold mb-2 h-10 border border-gray-200 rounded px-3" id="type" name="type">
                            <option value="">Tất cả</option>
                            <option value="VIP">VIP</option>
                            <option value="Regular">Thường xuyên</option>
                            <option value="New">Mới</option>
                        </select>
                    </div> */}
                </div>
            </div>
            <div className="col-span-3">
                <TableCommon
                    headers={headerData}
                    tableData={customers}
                    defaultSortColumn="CustomerID"
                    rowPerPage={5}
                    pageIndex={0}
                    totalCount={customers.length}
                    rowPerPageOptions={[5, 10, 20]}
                    handleEdit={(item) => console.log('edit', item)}
                    handleDelete={(id) => console.log('delete', id)}
                    messagePopupDelete="Bạn có muốn xóa khách hàng này không?"
                    placeholderSearch="Tìm kiếm khách hàng"
                    usePagination={true}
                    useSearch={true}
                />
            </div>
        </div>
    );
}