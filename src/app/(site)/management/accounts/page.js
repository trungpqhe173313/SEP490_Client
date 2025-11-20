"use client";
import { adminService } from "@/services/admin.service";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import TableCommon from "@/components/Table/table";
import { AccountForm } from "@/components/Form/accountForm";
import Loader from "@/components/Loader/loader";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";

export default function UserManagement() {
    // Data state
    const [accounts, setAccounts] = useState([]);
    const [editingAccount, setEditingAccount] = useState(null);
    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Admin"];

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

    const getRoleName = (role) => {
        switch (role) {
            case "Admin":
                return "Quản trị hệ thống";
            case "Manager":
                return "Quản lý kho";
            case "Employee":
                return "Nhân viên";
            case "Customer":
                return "Khách hàng";
            default:
                return role;
        }
    };

    const headerData = [
        {
            key: "userId",
            label: "ID người dùng",
            customValue: (item) => item.userId && <div>{item.userId}</div>
        },
        {
            key: "fullName",
            label: "Tên người dùng",
            customValue: (item) => item.fullName && <div>{item.fullName}</div>
        },
        {
            key: "email",
            label: "Email",
            customValue: (item) => item.email && <div>{item.email}</div>
        },
        {
            key: "phone",
            label: "Số điện thoại",
            customValue: (item) => item.phone && <div>{item.phone}</div>
        },
        {
            key: "roles",
            label: "Vai trò",
            customValue: (item) => item.roles && <div>{item.roles.map((r) => <div key={r}>{getRoleName(r)}</div>)}</div>
        },
        {
            key: "username",
            label: "Tên tài khoản",
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
        },
        {
            key: 'actions',
            label: 'Hành động',
            customValue: (item) => <div><button className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-xl" onClick={() => handleEdit(item)}>Chỉnh sửa</button></div>
        }
    ];

    const handleChangePage = (event, newPage) => setPageIndex(newPage);
    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    const fetchAccounts = async () => {
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
            const response = await adminService.getAllAccounts(body);
            setAccounts(response.data.items);
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
        fetchAccounts();
    }, [pageIndex, rowPerPage, pageReady]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            buttonRef.current.click();
        }
    };

    // Modal handlers
    const handleCreate = () => {
        setEditingAccount(null);
        setModalOpen(true);
    };

    const handleEdit = (account) => {
        setEditingAccount(account);
        setModalOpen(true);
    };

    const handleDelete = async (account) => {
        // if (account.isActive === false) {
        //     setModalFailedMessage("Tài khoản đã bị xóa từ trước");
        //     setModalFailedOpen(true);
        //     return;
        // }
        // setLoading(true);
        // try {
        //     await adminService.deleteAccount(account.userId);
        //     fetchAccounts();
        //     setModalSuccessMessage("Xoá tài khoản thành công");
        //     setModalSuccessOpen(true);
        // } catch (error) {
        //     console.error("Error deleting account:", error);
        //     setModalFailedMessage("Có lỗi xảy ra, vui lòng thử lại sau");
        //     setModalFailedOpen(true);
        // } finally {
        //     setLoading(false);
        // }
    };

    const handleConfirm = async (accountData) => {
        setLoading(true);
        try {
            if (editingAccount) {
                await adminService.updateAccount(editingAccount.userId, accountData);
                setModalSuccessMessage("Cập nhật tài khoản thành công");
            } else {
                await adminService.createAccount(accountData);
                setModalSuccessMessage("Tạo tài khoản thành công");
            }
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchAccounts();
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
        <div className="flex flex-col p-4">
            <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4 justify-between">
                <div className="flex flex-col mr-4">
                    <h1 className="text-2xl font-bold">Danh sách tài khoản</h1>
                </div>
                {/* <div className="flex flex-col">
                    <button className="background-primary text-white cursor-pointer rounded-xl px-4 py-2" onClick={handleCreate}>Thêm tài khoản</button>
                </div> */}
            </div>

            {/* Filter sidebar */}
            <div className="p-4 rounded-2xl bg-white h-auto w-full mb-4">
                <h2 className="text-xl font-bold">Lọc tài khoản</h2>
                <div className="flex flex-row items-center my-4 gap-4">
                    <div className="mt-2 w-full">
                        <label className="mr-2">Tên người dùng:</label>
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
                            fetchAccounts();
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
            {/* Main content */}
            <TableCommon
                headers={headerData}
                tableData={accounts}
                defaultSortColumn="createdAt"
                defaultSortType="desc"
                rowPerPage={rowPerPage}
                pageIndex={pageIndex}
                totalCount={totalCount}
                rowPerPageOptions={[5, 10, 20]}
                handleChangePage={handleChangePage}
                handleChangeRowPerPage={handleChangeRowPerPage}
                // navigateDetail={(item) => router.push(`/management/accounts/details/${item.userId}`)}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                messagePopupDelete="Bạn có muốn xóa tài khoản này không?"
                usePagination={true}
                //useAction={true}
            />
            <AccountForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={editingAccount}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    );
}