"use client";
import { supplierService } from "@/services/supplier.service";
import React, { useState, useEffect } from "react";
import TableCommon from "@/components/Table/table";
import { SupplierForm } from "@/components/Form/supplierForm";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import { useLoading } from "@/context/LoadingContext";

export default function Suppliers() {
    //object
    const [suppliers, setSuppliers] = useState([]);
    const [editingSupplier, setEditingSupplier] = useState(null);

    //modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");

    //filter
    const [filterSupplierName, setFilterSupplierName] = useState("");
    const [filterEmail, setFilterEmail] = useState("");
    const [filterPhone, setFilterPhone] = useState("");
    const [filterIsActive, setFilterIsActive] = useState(null);

    //pagination
    const [pageIndex, setPageIndex] = useState(0);
    const [rowPerPage, setRowPerPage] = useState(5);
    const [totalCount, setTotalCount] = useState(0);

    //loading
    const { setLoading } = useLoading();

    const headerData = [
        {
            key: "supplierId",
            label: "Mã nhà cung cấp",
            customValue: (item) => item.supplierId && <div>{item.supplierId}</div>
        },
        {
            key: "supplierName",
            label: "Tên nhà cung cấp",
            customValue: (item) => item.supplierName && <div>{item.supplierName}</div>
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
            key: "isActive",
            label: "Trạng thái",
            customValue: (item) => item.isActive == 1 ?
                <div className="text-green-600">Đang hoạt động</div> :
                <div className="text-red-600">Dừng hoạt động</div>
        },
        {
            key: "createdAt",
            label: "Ngày tạo",
            customValue: (item) => item.createdAt &&
                <div>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</div>
        }
    ];

    // Pagination handlers for MUI TablePagination
    const handleChangePage = (event, newPage) => {
        setPageIndex(newPage);
    }

    const handleChangeRowPerPage = (event) => {
        setRowPerPage(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    const fetchSuppliers = async () => {
        setLoading(true);
        const body = {
            pageIndex: pageIndex + 1,
            pageSize: rowPerPage,
            isActive: filterIsActive
        };
        if (filterSupplierName) {
            body.SupplierName = filterSupplierName;
        }
        if (filterEmail) {
            body.Email = filterEmail;
        }
        if (filterPhone) {
            body.Phone = filterPhone;
        }

        const response = await supplierService.getAllSuppliers(body);
        setSuppliers(response.data.items);
        setTotalCount(response.data.totalCount);
        setLoading(false);
    };

    useEffect(() => {
        fetchSuppliers();
    }, [pageIndex, rowPerPage, filterSupplierName, filterEmail, filterPhone, filterIsActive]);

    const handleCreate = () => {
        setEditingSupplier(null);
        setModalOpen(true);
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setModalOpen(true);
    };

    const handleDelete = async (supplier) => {
        setLoading(true);
        await supplierService.deleteSupplier(supplier.supplierId);
        fetchSuppliers();
        setModalSuccessMessage("Xoá nhà cung cấp thành công");
        setModalSuccessOpen(true);
        setLoading(false);
    };

    const handleConfirm = async (supplierData) => {
        setLoading(true);
        try {
            if (editingSupplier) {
                await supplierService.updateSupplier(editingSupplier.supplierId, supplierData);
                setModalSuccessMessage("Cập nhật nhà cung cấp thành công");
            } else {
                await supplierService.createSupplier(supplierData);
                setModalSuccessMessage("Tạo nhà cung cấp thành công");
            }
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchSuppliers();
        } catch (error) {
            setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-4 p-8 gap-4">
            <div className="col-span-1">
                <div className="p-4 rounded-2xl bg-white h-auto max-h-screen sticky top-0">
                    <h2 className="text-xl font-bold">Lọc nhà cung cấp</h2>
                    {/* <div className="flex flex-col">
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
                    </div> */}
                </div>
            </div>
            <div className="col-span-3">
                <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4">
                    <div className="flex flex-col w-3/4 mr-4">
                        <h1 className="text-2xl font-bold">Danh sách nhà cung cấp</h1>
                    </div>
                    <div className="flex flex-col w-1/4">
                        <button className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto" onClick={() => handleCreate()}>Thêm nhà cung cấp</button>
                    </div>
                </div>
                <TableCommon
                    headers={headerData}
                    tableData={suppliers}
                    defaultSortColumn="supplierId"
                    rowPerPage={rowPerPage}
                    pageIndex={pageIndex}
                    totalCount={totalCount}
                    rowPerPageOptions={[5, 10, 20]}
                    handleChangePage={handleChangePage}
                    handleChangeRowPerPage={handleChangeRowPerPage}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    messagePopupDelete="Bạn có muốn xóa nhà cung cấp này không?"
                    usePagination={true}
                    useSearch={true}
                />
            </div>
            <SupplierForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={editingSupplier}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    );
}