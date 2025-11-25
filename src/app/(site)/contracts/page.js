"use client";
import { contractService } from "@/services/contract.service";
import { customerService } from "@/services/customer.service";
import { supplierService } from "@/services/supplier.service";
import { formatDateToInput } from '@/lib/formatDateToInput';

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import DateInput from "@/components/Input/DateInput";

import TableCommon from "@/components/Table/table";
import { ContractForm } from "@/components/Form/contractForm";
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";
import Loader from "@/components/Loader/loader";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";

export default function Contracts() {
    const router = useRouter();

    const navigate = (path) => {
        router.push(path);
    };

    //Data state
    const [contracts, setContracts] = useState([]);
    const [editingContract, setEditingContract] = useState(null);
    const [pageReady, setPageReady] = useState(false);
    const pageRole = ["Manager"];

    //Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");

    //Filter state
    const [filterSupplierId, setFilterSupplierId] = useState(null);
    const [filterCustomerId, setFilterCustomerId] = useState(null);
    const [filterFromDate, setFilterFromDate] = useState("");
    const [filterToDate, setFilterToDate] = useState("");

    const [errorToDate, setErrorToDate] = useState("");

    //Autocomplete
    const [suppliers, setSuppliers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [supplierLoading, setSupplierLoading] = useState(false);
    const [customerLoading, setCustomerLoading] = useState(false);

    //Pagination state
    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    //Loading state
    const { loading, setLoading } = useLoading();
    const { isLogin, user, refreshUserInfo } = useLogin();
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

    //Table headers
    const headerData = [
        {
            key: "contractId",
            label: "Mã hợp đồng",
            customValue: (item) => item.contractId && <div>{item.contractId}</div>
        },
        {
            key: "name",
            label: "Tên đối tác",
            customValue: (item) => item.customerName ? <div>{item.customerName}</div> : <div>{item.supplierName}</div>
        },
        {
            key: "type",
            label: "Phân loại",
            customValue: (item) => item.customerName ? <div>Khách hàng</div> : <div>Nhà cung cấp</div>
        },
        {
            key: "isActive",
            label: "Trạng thái",
            customValue: (item) => item.isActive ? <div className="text-green-600">Đang hoạt động</div> : <div className="text-red-600">Đã ngừng hoạt động</div>
        },
        {
            key: "createdAt",
            label: "Ngày tạo",
            customValue: (item) => item.createdAt && <div>{new Date(item.createdAt).toLocaleString('vi-VN')}</div>
        },
        {
            key: "updatedAt",
            label: "Ngày cập nhật",
            customValue: (item) => item.updatedAt && <div>{new Date(item.updatedAt).toLocaleString('vi-VN')}</div>
        },
    ]

    // Pagination handlers
    const handleChangePage = (event, newPage) => setPageIndex(newPage);
    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    const fetchContracts = async () => {
        try {
            setLoading(true);
            const body = {
                pageIndex: pageIndex + 1,
                pageSize: rowPerPage,
                supplierId: filterSupplierId,
                customerId: filterCustomerId,
                fromDate: filterFromDate || null,
                toDate: filterToDate || null
            };
            const response = await contractService.getAllContracts(body);
            setContracts(response.data.items);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async (value) => {
        try {
            setSupplierLoading(true);
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                supplierName: value
            };
            const response = await supplierService.getAllSuppliers(body);
            const supplierData = response.data.items.map((supplier) => ({
                supplierId: supplier.supplierId,
                supplierName: supplier.supplierName
            }));
            setSuppliers(supplierData);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        } finally {
            setSupplierLoading(false);
        }
    }

    const fetchCustomers = async (value) => {
        try {
            setCustomerLoading(true);
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                customerName: value
            };
            const response = await customerService.getAllCustomers(body);
            const customerData = response.data.items.map((customer) => ({
                customerId: customer.customerId,
                customerName: customer.fullName
            }));
            setCustomers(customerData);
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setCustomerLoading(false);
        }
    }

    useEffect(() => {
        if (!pageReady) return;
        fetchContracts();
    }, [pageIndex, rowPerPage, pageReady]);

    useEffect(() => {
        if (!pageReady) return;
        fetchSuppliers("");
        fetchCustomers("");
    }, [pageReady]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            buttonRef.current?.click();
        }
    }

    const handleChangeDropdown = (item, field) => {
        if (item) {
            if (item.supplierId) {
                setSelectedSupplier(item);
                setFilterSupplierId(item.supplierId);
            } else if (item.customerId) {
                setSelectedCustomer(item);
                setFilterCustomerId(item.customerId);
            }
        } else {
            if (field === "supplierId") {
                setSelectedSupplier(null);
                setFilterSupplierId(null);
            } else if (field === "customerId") {
                setSelectedCustomer(null);
                setFilterCustomerId(null);
            }
        }
    };

    useEffect(() => {
        validateFields();
    }, [filterFromDate, filterToDate]);

    const validateFields = () => {
        if (filterToDate && filterToDate < filterFromDate) {
            setErrorToDate("Ngày tạo đến phải lớn hơn ngày tạo từ");
            return false;
        }
        return true;
    }

    const handleApplyFilter = () => {
        if (validateFields()) {
            setPageIndex(0);
            fetchContracts();
        }
    };

    const handleClearFilter = () => {
        setSelectedSupplier(null);
        setSelectedCustomer(null);
        setFilterSupplierId(null);
        setFilterCustomerId(null);
        setFilterFromDate("");
        setFilterToDate("");
        setErrorToDate("");
        setPageIndex(0);
    }

    //modal handlers
    const handleCreate = () => {
        setEditingContract(null);
        setModalOpen(true);
    };

    const handleEdit = (contract) => {
        setEditingContract(contract);
        setModalOpen(true);
    };

    const handleDelete = async (contract) => {
        if (contract.isActive === false) {
            setModalFailedMessage("Hợp đồng đã bị xóa từ trước");
            setModalFailedOpen(true);
            return;
        }
        setLoading(true);
        try {
            await contractService.deleteContract(contract.contractId);
            fetchContracts();
            setModalSuccessMessage("Xóa hợp đồng thành công");
            setModalSuccessOpen(true);
        } catch (error) {
            console.error("Error deleting contract:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleConfirm = async (contractData) => {
        setLoading(true);
        try {
            if (editingContract) {
                await contractService.updateContract(editingContract.contractId, contractData);
                setModalSuccessMessage("Cập nhật hợp đồng thành công");
            } else {
                await contractService.createContract(contractData);
                setModalSuccessMessage("Tạo hợp đồng thành công");
            }
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchContracts();
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking authorization
    if (!pageReady) {
        return <Loader />;
    }

    return (
        <div className="grid grid-cols-4 p-8 gap-4">
            {/* Filter sidebar */}
            <div className="col-span-1">
                <div className="p-4 rounded-2xl bg-white h-auto sticky top-0">
                    <h2 className="text-xl font-bold">Lọc hợp đồng</h2>
                    <div className="flex flex-col items-center my-4">
                        <div className="my-2 w-full">
                            <label className="mr-2">Nhà cung cấp:</label>
                            <AutocompleteCommon
                                name="supplierId"
                                value={selectedSupplier}
                                loading={supplierLoading}
                                options={suppliers}
                                onSelect={(item) => handleChangeDropdown(item, "supplierId")}
                                onSearch={fetchSuppliers}
                                getOptionLabel={(option) => option.supplierName}
                                getOptionKey={(option) => option.supplierId}
                            />
                        </div>
                        <div className="my-2 w-full">
                            <label className="mr-2">Khách hàng:</label>
                            <AutocompleteCommon
                                name="customerId"
                                value={selectedCustomer}
                                loading={customerLoading}
                                options={customers}
                                onSelect={(item) => handleChangeDropdown(item, "customerId")}
                                onSearch={fetchCustomers}
                                getOptionLabel={(option) => option.customerName}
                                getOptionKey={(option) => option.customerId}
                            />
                        </div>
                        <div className="my-2 w-full grid grid-cols-2 gap-2">
                            <div className="col-span-1">
                                <label className="mr-2">Ngày tạo từ</label>
                                <DateInput className="w-full p-2 border border-gray-300 rounded" value={filterFromDate} onChange={(d) => setFilterFromDate(d)} />
                                {/* <input
                                    type="date"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={filterFromDate && formatDateToInput(filterFromDate)}
                                    onChange={(e) => {
                                        const date = new Date(e.target.value);
                                        setFilterFromDate(date);
                                    }}
                                    onKeyDown={handleKeyDown}
                                /> */}
                            </div>
                            <div className="col-span-1">
                                <label className="mr-2">Ngày tạo đến</label>
                                <DateInput className="w-full p-2 border border-gray-300 rounded" value={filterToDate} onChange={(d) => setFilterToDate(d)} />
                                {/* <input
                                    type="date"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={filterToDate && formatDateToInput(filterToDate)}
                                    onChange={(e) => {
                                        const date = new Date(e.target.value);
                                        setFilterToDate(date);
                                    }}
                                    onKeyDown={handleKeyDown}
                                /> */}
                            </div>
                        </div>
                        {errorToDate && <span className="text-red-500">{errorToDate}</span>}
                    </div>
                    <div className="flex justify-center gap-2">
                        <button
                            className="px-4 py-2 background-primary text-white rounded cursor-pointer"
                            onClick={() => handleApplyFilter()}
                            ref={buttonRef}
                        >
                            Lọc
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer" onClick={() => handleClearFilter()}>Xóa bộ lọc</button>
                    </div>
                </div>
            </div>
            {/* Main content */}
            <div className="col-span-3">
                <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4">
                    <div className="flex flex-col w-3/4 mr-4">
                        <h1 className="text-2xl font-bold">Danh sách hợp đồng</h1>
                    </div>
                    <div className="flex flex-col w-1/4">
                        <button className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto" onClick={handleCreate}>Thêm hợp đồng</button>
                    </div>
                </div>
                <TableCommon
                    headers={headerData}
                    tableData={contracts}
                    defaultSortColumn="updatedAt"
                    defaultSortType="desc"
                    rowPerPage={rowPerPage}
                    pageIndex={pageIndex}
                    totalCount={totalCount}
                    rowPerPageOptions={[5, 10, 20]}
                    handleChangePage={handleChangePage}
                    handleChangeRowPerPage={handleChangeRowPerPage}
                    navigateDetail={(item) => navigate(`contracts/details/${item.contractId}`)}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    messagePopupDelete="Bạn có muốn xóa hợp đồng này không?"
                    usePagination={true}
                    useAction={true}
                />
            </div>
            <ContractForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={editingContract}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    )
}

