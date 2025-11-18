"use client";
import { customerService } from "@/services/customer.service";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import TableCommon from "@/components/Table/table";
import { CustomerForm } from "@/components/Form/customerForm";
import Loader from "@/components/Loader/loader";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";

export default function Customers() {
    // Data state
    const [customers, setCustomers] = useState([]);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Manager"];

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
            key: "userId",
            label: "Mã khách hàng",
            customValue: (item) => item.userId && <div>{item.userId}</div>
        },
        {
            key: "fullName",
            label: "Tên khách hàng",
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

    const fetchCustomers = async () => {
        setLoading(true);
        try {
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
            const response = await customerService.getAllCustomers(body);
            setCustomers(response.data.items);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!pageReady) return;
        fetchCustomers();
    }, [pageIndex, rowPerPage, pageReady]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            buttonRef.current.click();
        }
    };

    // Modal handlers
    const handleCreate = () => {
        setEditingCustomer(null);
        setModalOpen(true);
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setModalOpen(true);
    };

    const handleDelete = async (customer) => {
        if (customer.isActive === false) {
            setModalFailedMessage("Khách hàng đã bị xóa từ trước");
            setModalFailedOpen(true);
            return;
        }
        setLoading(true);
        try {
            await customerService.deleteCustomer(customer.userId);
            fetchCustomers();
            setModalSuccessMessage("Xoá khách hàng thành công");
            setModalSuccessOpen(true);
        } catch (error) {
            console.error("Error deleting customer:", error);
            setModalFailedMessage("Có lỗi xảy ra, vui lòng thử lại sau");
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (customerData) => {
        setLoading(true);
        try {
            if (editingCustomer) {
                await customerService.updateCustomer(editingCustomer.userId, customerData);
                setModalSuccessMessage("Cập nhật khách hàng thành công");
            } else {
                await customerService.createCustomer(customerData);
                setModalSuccessMessage("Tạo khách hàng thành công");
            }
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchCustomers();
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
        setPageIndex(0);
    };

    if (!pageReady) {
        return <Loader />;
    }

    return (
        <div className="grid grid-cols-4 p-8 gap-4">
            {/* Filter sidebar */}
            <div className="col-span-1">
                <div className="p-4 rounded-2xl bg-white h-auto sticky top-0">
                    <h2 className="text-xl font-bold">Lọc khách hàng</h2>
                    <div className="flex flex-col items-center my-4">
                        <div className="mt-2 w-full">
                            <label className="mr-2">Tên khách hàng:</label>
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
                            onClick={() => {
                                setPageIndex(0);
                                fetchCustomers();
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
                        <h1 className="text-2xl font-bold">Danh sách khách hàng</h1>
                    </div>
                    <div className="flex flex-col w-1/4">
                        <button className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto" onClick={() => handleCreate()}>Thêm khách hàng</button>
                    </div>
                </div>
                <TableCommon
                    headers={headerData}
                    tableData={customers}
                    defaultSortColumn="createdAt"
                    defaultSortType="desc"
                    rowPerPage={rowPerPage}
                    pageIndex={pageIndex}
                    totalCount={totalCount}
                    rowPerPageOptions={[5, 10, 20]}
                    handleChangePage={handleChangePage}
                    handleChangeRowPerPage={handleChangeRowPerPage}
                    navigateDetail={(item) => router.push(`/customers/details/${item.userId}`)}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    messagePopupDelete="Bạn có muốn xóa khách hàng này không?"
                    usePagination={true}
                    useAction={true}
                />
            </div>
            <CustomerForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={editingCustomer}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    );
}