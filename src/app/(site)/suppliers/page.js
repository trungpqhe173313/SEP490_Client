"use client";
import { supplierService } from "@/services/supplier.service";
import React, { useState, useEffect } from "react";
import TableCommon from "@/components/Table/table";
import { SupplierForm } from "@/components/Form/supplierForm";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import Loader from "@/components/Loader/loader";

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [loading, setLoading] = useState(true);

    const headerData = [
        {
            key: "id",
            label: "Mã nhà cung cấp",
            customValue: (item) => item.id && <div>{item.id}</div>
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

    const fetchSuppliers = async () => {
        const response = await supplierService.getAllSuppliers();
        setSuppliers(response.data);
    };

    useEffect(() => {
        fetchSuppliers();
        setLoading(false);
    }, []);

    const handleCreate = () => {
        setEditingSupplier(null);
        setModalOpen(true);
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        // await supplierService.deleteSupplier(id);
        // fetchSuppliers();
        setModalSuccessMessage("Xoá nhà cung cấp thành công");
        setModalSuccessOpen(true);
        setLoading(false);
    };

    const handleConfirm = async (supplierData) => {
        setLoading(true);
        try {
            if (editingSupplier) {
                await supplierService.updateSupplier(editingSupplier.id, supplierData);
                setModalSuccessMessage("Cập nhật nhà cung cấp thành công");
            } else {
                await supplierService.createSupplier(supplierData);
                setModalSuccessMessage("Tạo nhà cung cấp thành công");
            }
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchSuppliers();
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
                <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4">
                    <div className="flex flex-col w-3/4 mr-4">
                        <label className="block text-gray-700 text-sm font-bold" htmlFor="search">
                            Tìm nhà cung cấp
                        </label>
                        <input className="block w-full text-gray-700 text-sm font-semibold mb-2 h-10 border border-black-200 rounded px-3" id="search" type="text" name="search" />
                    </div>
                    <div className="flex flex-col w-1/4">
                        <button className="block border bg-green-600 text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto" onClick={() => handleCreate()}>Thêm nhà cung cấp</button>
                    </div>
                </div>
                <TableCommon
                    headers={headerData}
                    tableData={suppliers}
                    defaultSortColumn="id"
                    rowPerPage={5}
                    pageIndex={0}
                    totalCount={suppliers.length}
                    rowPerPageOptions={[5, 10, 20]}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    messagePopupDelete="Bạn có muốn xóa nhà cung cấp này không?"
                    placeholderSearch="Tìm nhà cung cấp"
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