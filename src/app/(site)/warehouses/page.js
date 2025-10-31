"use client";
import { warehouseService } from "@/services/warehouse.service";
import React, { useState, useEffect } from "react";
import TableCommon from "@/components/Table/table";
import { WarehouseForm } from "@/components/Form/warehouseForm";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import { useLoading } from "@/context/LoadingContext";

export default function Warehouses() {
    const [warehouses, setWarehouses] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMessage, setModalSuccessMessage] = useState("");
    const [modalFailedOpen, setModalFailedOpen] = useState(false);
    const [modalFailedMessage, setModalFailedMessage] = useState("");
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const { setLoading } = useLoading();

    const headerData = [
        {
            key: "id",
            label: "Mã kho",
            customValue: (item) => item.id && <div>{item.id}</div>
        },
        {
            key: "WarehouseName",
            label: "Tên kho",
            customValue: (item) => item.WarehouseName && <div>{item.WarehouseName}</div>
        },
        {
            key: "Location",
            label: "Địa điểm",
            customValue: (item) => item.Location && <div>{item.Location}</div>
        },
        {
            key: "Capacity",
            label: "Sức chứa",
            customValue: (item) => item.Capacity && <div>{item.Capacity}</div>
        },
        {
            key: "Status",
            label: "Trạng thái",
            customValue: (item) => item.Status === "Active" ?
                <div className="text-green-600">Hoạt động</div> :
                <div className="text-red-600">Không hoạt động</div>
        },
        {
            key: "Note",
            label: "Ghi chú",
            customValue: (item) => item.Note && <div>{item.Note}</div>
        },
        {
            key: "CreatedAt",
            label: "Ngày tạo",
            customValue: (item) => item.CreatedAt && <div>{new Date(item.CreatedAt).toLocaleDateString('vi-VN')}</div>
        }
    ];

    const fetchWarehouses = async () => {
        const response = await warehouseService.getAllWarehouses();
        setWarehouses(response.data);
    };

    useEffect(() => {
        //fetchWarehouses();
        setLoading(false);
    }, []);

    const handleCreate = () => {
        setEditingWarehouse(null);
        setModalOpen(true);
    };

    const handleEdit = (warehouse) => {
        setEditingWarehouse(warehouse);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        // await warehouseService.deleteWarehouse(id);
        // fetchWarehouses();
        setModalSuccessMessage("Xoá kho thành công");
        setModalSuccessOpen(true);
        setLoading(false);
    };

    const handleConfirm = async (warehouseData) => {
        setLoading(true);
        try {
            if (editingWarehouse) {
                await warehouseService.updateWarehouse(editingWarehouse.id, warehouseData);
                setModalSuccessMessage("Cập nhật kho thành công");
            } else {
                await warehouseService.createWarehouse(warehouseData);
                setModalSuccessMessage("Tạo kho thành công");
            }
            setModalSuccessOpen(true);
            setModalOpen(false);
            fetchWarehouses();
        } catch (error) {
            setModalFailedMessage("Có lỗi xảy ra, vui lòng thử lại sau");
            setModalFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-4 p-8 gap-4">
            <div className="col-span-1 p-4 rounded-2xl bg-white">
                <div className="p-4">
                    <h2 className="text-xl font-bold">Lọc kho</h2>
                    {/* ...filter UI as needed... */}
                </div>
            </div>
            <div className="col-span-3">
                <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4">
                    <div className="flex flex-col w-3/4 mr-4">
                        <label className="block text-gray-700 text-sm font-bold" htmlFor="search">
                            Tìm kho
                        </label>
                        <input className="block w-full text-gray-700 text-sm font-semibold mb-2 h-10 border border-black-200 rounded px-3" id="search" type="text" name="search" />
                    </div>
                    <div className="flex flex-col w-1/4">
                        <button className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto" onClick={() => handleCreate()}>Thêm kho</button>
                    </div>
                </div>
                <TableCommon
                    headers={headerData}
                    tableData={warehouses}
                    defaultSortColumn="id"
                    rowPerPage={5}
                    pageIndex={0}
                    totalCount={warehouses.length}
                    rowPerPageOptions={[5, 10, 20]}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    messagePopupDelete="Bạn có muốn xóa kho này không?"
                    placeholderSearch="Tìm kho"
                    usePagination={true}
                    useSearch={true}
                />
            </div>
            <WarehouseForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={editingWarehouse}
            />
            <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
            <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
        </div>
    );
}