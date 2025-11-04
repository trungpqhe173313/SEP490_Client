import { useState, useEffect } from "react";
import { Modal } from "@mui/material";
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";
import { importService } from "@/services/import.service";
import { warehouseService } from "@/services/warehouse.service";

export function ImportForm({
    isOpen,
    onClose,
    onConfirm,
    initialData
}) {
    const [form, setForm] = useState({});
    const [error, setError] = useState("");
    const today = new Date();

    // data for check exist
    const [imports, setImports] = useState([]);

    //Autocomplete
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [warehouseLoading, setWarehouseLoading] = useState(false);

    const fetchImports = async () => {
        try {
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                batchId: 0,
                batchCode: ""
            };
            const response = await importService.getAllImports(body);
            const importData = response.data.items.map((importItem) => ({
                importId: importItem.batchId,
                warehouseId: importItem.warehouseId,
                transactionId: importItem.transactionId,
                batchCode: importItem.batchCode
            }));
            setImports(importData);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchWarehouses = async (value) => {
        try {
            setWarehouseLoading(true);
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                warehouseName: value
            }
            const response = await warehouseService.getAllWarehouses(body);
            const warehouseData = response.data.items.map((warehouse) => ({
                warehouseId: warehouse.warehouseId,
                warehouseName: warehouse.warehouseName
            }));
            setWarehouses(warehouseData);
        } catch (error) {
            console.log(error);
        } finally {
            setWarehouseLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses("");
        fetchImports();
        if (initialData) {
            setForm({
                warehouseId: initialData.warehouseId || null,
                transactionId: initialData.transactionId || 0,
                productionFinishId: initialData.productionFinishId || null,
                batchCode: initialData.batchCode || 0,
                expireDate: initialData.expireDate || today,
                note: initialData.note || ""
            });
            setSelectedWarehouse(initialData);
        } else {
            setForm({
                warehouseId: null,
                transactionId: null,
                productionFinishId: null,
                batchCode: "",
                expireDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                note: ""
            });
        }
        setError("");
    }, [initialData, isOpen]);

    const formatDateToInput = (dt) => {
        return dt.toISOString().split('T')[0];
    }


    //validation
    const [validTransactionId, setValidTransactionId] = useState(true);
    const [validBatchCode, setValidBatchCode] = useState(true);
    const [validExpireDate, setValidExpireDate] = useState(true);

    const [errorTransactionId, setErrorTransactionId] = useState("");
    const [errorBatchCode, setErrorBatchCode] = useState("");
    const [errorExpireDate, setErrorExpireDate] = useState("");

    const handleChange = (name, value) => {
        let newValue = value;
        switch (name) {
            case "transactionId":
                newValue = parseInt(value);
                const isExistingTransactionId = imports.find(importItem => importItem.transactionId === newValue && importItem.transactionId !== initialData?.transactionId);
                if (isExistingTransactionId) {
                    setValidTransactionId(true);
                    setErrorTransactionId("");
                } else {
                    setValidTransactionId(false);
                    setErrorTransactionId(`Transaction "${value}" chưa có trong danh sách, vui lòng chọn transaction khác`);
                }
                break;
            case "batchCode":
                const checkingBatchCode = value.trim().replace(/\s\s+/g, ' ');
                const isExistingBatchCode = imports.find(importItem => importItem.batchCode.toLowerCase() === checkingBatchCode.toLowerCase() && importItem.batchCode !== initialData?.batchCode);
                if (isExistingBatchCode) {
                    setValidBatchCode(false);
                    setErrorBatchCode(`Mã "${checkingBatchCode}" đã tồn tại, vui lòng nhập mã khác`);
                } else {
                    setValidBatchCode(true);
                    setErrorBatchCode("");
                }
                break;
            case "expireDate":
                newValue = new Date(value);
                if (newValue <= today) {
                    setValidExpireDate(false);
                    setErrorExpireDate("Hạn sử dụng phải là tương lai");
                } else {
                    setValidExpireDate(true);
                    setErrorExpireDate("");
                }
                break;
            default:
                break;
        }
        setForm((prev) => ({
            ...prev,
            [name]: newValue
        }))
    }

    const handleChangeDropdown = (item) => {
        if (item) {
            if (item.warehouseId) {
                setSelectedWarehouse(item);
                handleChange("warehouseId", item.warehouseId);
            }
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const invalidForms = !validBatchCode || !validExpireDate;
        if (invalidForms) {
            setError("Có nhập liệu không hợp lệ, vui lòng thử lại");
            return
        }
        setError("");
        onConfirm(form);
        onClose();
    }

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
        >
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-1/2 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden">
                    <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0 z-50">
                        <h2 className="text-2xl font-bold my-auto" id="product-modal-title">
                            {initialData ? "Cập nhật phiếu nhập" : "Tạo phiếu nhập mới"}
                        </h2>
                        <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1" onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 p-8">
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Nhà kho</label>
                                <p className="text-xs text-gray-500">Nhập tên nhà kho</p>
                            </div>
                            <AutocompleteCommon
                                name="warehouseId"
                                value={selectedWarehouse}
                                loading={warehouseLoading}
                                options={warehouses}
                                onSelect={(item) => handleChangeDropdown(item)}
                                onSearch={fetchWarehouses}
                                getOptionLabel={(option) => option.warehouseName}
                                getOptionKey={(option) => option.warehouseId}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Mã giao dịch</label>
                                <p className="text-xs text-gray-500">Nhập mã giao dịch</p>
                            </div>
                            <input
                                type="number"
                                name="transactionId"
                                value={form.transactionId || 0}
                                onChange={(e) => handleChange("transactionId", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2`}
                                required
                            />
                            {!validTransactionId && <p className="text-red-500 text-xs italic">{errorTransactionId}</p>}
                        </div>
                        {/* <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Mã giao dịch</label>
                                <p className="text-xs text-gray-500">Nhập mã giao dịch</p>
                            </div>
                            <input
                                type="text"
                                name="productionFinishId"
                                value={form.productionFinishId}
                                onChange={(e) => handleChange("productionFinishId", e.target.value)}
                                className="w-full bg-white border rounded px-3 py-2"
                                required
                                />
                            {!validProductionFinishId && <p className="text-red-500 text-xs italic">{errorProductionFinishId}</p>}
                        </div> */}
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Code lô</label>
                                <p className="text-xs text-gray-500">Nhập code lô</p>
                            </div>
                            <input
                                type="text"
                                name="batchCode"
                                value={form.batchCode}
                                onChange={(e) => handleChange("batchCode", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2 ${!validBatchCode ? "border-red-500" : "border-green-500"}`}
                                required
                            />
                            {!validBatchCode && <p className="text-red-500 text-xs italic">{errorBatchCode}</p>}
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Ngày hết hạn</label>
                                <p className="text-xs text-gray-500">Nhập ngày hết hạn</p>
                            </div>
                            <input
                                type="date"
                                name="expireDate"
                                value={form.expireDate && formatDateToInput(form.expireDate)}
                                onChange={(e) => handleChange("expireDate", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2 ${!validExpireDate ? "border-red-500" : "border-green-500"}`}
                                required
                            />
                            {!validExpireDate && <p className="text-red-500 text-xs italic">{errorExpireDate}</p>}
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div className="grid grid-cols-1">
                                <label className="block text-md font-bold">Ghi chú</label>
                                <p className="text-xs text-gray-500">Nhập ghi chú</p>
                            </div>
                            <textarea
                                name="note"
                                value={form.note}
                                onChange={(e) => handleChange("note", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2`}
                            />
                        </div>
                        {error && <div className="text-red-600 text-md text-right">{error}</div>}
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                                onClick={onClose}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded background-primary background-hovered text-white cursor-pointer"
                            >
                                {initialData ? "Cập nhật" : "Tạo mới"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    )
}