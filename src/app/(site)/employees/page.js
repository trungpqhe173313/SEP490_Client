"use client";
import { employeeService } from "@/services/employee.service";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRef } from "react";

import TableCommon from "@/components/Table/table";
import { EmployeeForm } from "@/components/Form/employeeForm";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";

export default function Employees() {
    // Data state
    const [employees, setEmployees] = useState([]);
    const [editingEmployee, setEditingEmployee] = useState(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");

    // Filter state
    const [filterFullName, setFilterFullName] = useState("");
    const [filterEmail, setFilterEmail] = useState("");
    const [filterIsActive, setFilterIsActive] = useState(null);

    // Pagination state
    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(5);
    const [totalCount, setTotalCount] = useState(0);

    const { setLoading } = useLoading();
    const buttonRef = useRef(null);

    const headerData = [
        {
            key: "userId",
            label: "Mã nhân viên",
            customValue: (item) => item.userId && <div>{item.userId}</div>
        },
        {
            key: "fullName",
            label: "Tên nhân viên",
            customValue: (item) => item.fullName && <div>{item.fullName}</div>
        },
        {
            key: "email",
            label: "Email",
            customValue: (item) => item.email && <div>{item.email}</div>
        },
        {
            key: "username",
            label: "Tài khoản",
            customValue: (item) => item.username && <div>{item.username}</div>
        },
        {
            key: "isActive",
            label: "Trạng thái",
            customValue: (item) => item.isActive ? <div className="text-green-600">Đang hoạt động</div> : <div className="text-red-600">Dừng hoạt động</div>
        },
        {
            key: "createdAt",
            label: "Ngày tạo",
            customValue: (item) => item.createdAt && <div>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</div>
        }
    ];

    // Pagination handlers
    const handleChangePage = (event, newPage) => setPageIndex(newPage);
    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    const fetchEmployees = async () => {
        setLoading(true);
        const body = {
            pageIndex: pageIndex + 1,
            pageSize: rowPerPage,
            isActive: filterIsActive === "true" ? true : filterIsActive === "false" ? false : null
        }
        if (filterFullName) {
            body.fullName = filterFullName;
        }
        if (filterEmail) {
            body.email = filterEmail;
        }
        const response = await employeeService.getAllEmployees(body);
        setEmployees(response.data.items);
        setTotalCount(response.data.totalCount);
        setLoading(false);
    };

    useEffect(() => {
        fetchEmployees();
    }, [pageIndex, rowPerPage]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            buttonRef.current?.click();
        }
    };

    // Modal handlers
    const handleCreate = () => {
        setEditingEmployee(null);
        setModalOpen(true);
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setModalOpen(true);
    };

    const handleDelete = async (employee) => {
        if (employee.isActive === false) {
            setModalFailedMessage("Nhân viên đã bị xóa từ trước");
            setModalFailedOpen(true);
            return;
        }
        setLoading(true);
        await employeeService.deleteEmployee(employee.userId);
        fetchEmployees();
        setModalSuccessMessage("Xoá nhân viên thành công");
        setModalSuccessOpen(true);
        setLoading(false);
    };

    const handleConfirm = async (employeeData) => {
        setLoading(true);
        try {
            if (editingEmployee) {
                await employeeService.updateEmployee(editingEmployee.userId, employeeData);
                setModalSuccessMessage("Cập nhật nhân viên thành công");
            } else {
                await employeeService.createEmployee(employeeData);
                setModalSuccessMessage("Tạo nhân viên thành công");
            }
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchEmployees();
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilter = () => {
        setFilterFullName("");
        setFilterEmail("");
        setFilterIsActive(null);
        fetchEmployees();
    };

    return (
        <div className="grid grid-cols-4 p-8 gap-4">
            {/* Filter sidebar */}
            <div className="col-span-1">
                <div className="p-4 rounded-2xl bg-white h-auto max-h-screen sticky top-0">
                    <h2 className="text-xl font-bold">Lọc nhân viên</h2>
                    <div className="flex flex-col items-center my-4">
                        <div className="mt-2 w-full">
                            <label className="mr-2">Tên nhân viên:</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={filterFullName}
                                onChange={(e) => setFilterFullName(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className="mt-2 w-full">
                            <label className="mr-2">Email:</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={filterEmail}
                                onChange={(e) => setFilterEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className="mt-2 w-full">
                            <label className="mr-2">Trạng thái:</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded"
                                value={filterIsActive && filterIsActive !== "null" ? filterIsActive : "null"}
                                onChange={(e) => setFilterIsActive(e.target.value)}
                                onKeyDown={handleKeyDown}
                            >
                                <option value="null">Tất cả</option>
                                <option value="true">Đang hoạt động</option>
                                <option value="false">Dừng hoạt động</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-center gap-2">
                        <button
                            className="px-4 py-2 background-primary text-white rounded cursor-pointer"
                            onClick={() => fetchEmployees()}
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
                        <h1 className="text-2xl font-bold">Danh sách nhân viên</h1>
                    </div>
                    <div className="flex flex-col w-1/4">
                        <button className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto" onClick={() => handleCreate()}>Thêm nhân viên</button>
                    </div>
                </div>
                <TableCommon
                    headers={headerData}
                    tableData={employees}
                    defaultSortColumn="userId"
                    rowPerPage={rowPerPage}
                    pageIndex={pageIndex}
                    totalCount={totalCount}
                    rowPerPageOptions={[5, 10, 20]}
                    handleChangePage={handleChangePage}
                    handleChangeRowPerPage={handleChangeRowPerPage}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    messagePopupDelete="Bạn có muốn xóa nhân viên này không?"
                    usePagination={true}
                    useAction={true}
                />
            </div>
            <EmployeeForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={editingEmployee}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    );
}