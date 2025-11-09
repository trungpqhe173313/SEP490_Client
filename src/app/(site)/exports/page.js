"use client";
import { exportService } from "@/services/export.service";
import { warehouseService } from "@/services/warehouse.service";
import { supplierService } from "@/services/supplier.service";

import React, { useState, useEffect } from "react";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import TableCommon from "@/components/Table/table";
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";

export default function Exports() {
  const router = useRouter();

  const navigate = (path) => {
    setLoading(true);
    router.push(path);
  };

  //Data state
  const [exports, setExports] = useState([]);

  //Modal state
  const [modalOpen, setModalOpen] = useState(false);

  const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
  const [modalSuccessMessage, setModalSuccessMessage] = useState("");

  const [modalFailedOpen, setModalFailedOpen] = useState(false);
  const [modalFailedMessage, setModalFailedMessage] = useState("");
  const [modalFailedSubMessages, setModalFailedSubMessages] = useState([]);

  //Filter state
  const [filterSupplierId, setFilterSupplierId] = useState(null);
  const [filterWarehouseId, setFilterWarehouseId] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [filterTransactionFromDate, setFilterTransactionFromDate] = useState("");
  const [filterTransactionToDate, setFilterTransactionToDate] = useState("");

  const [errorToTransactionDate, setErrorToTransactionDate] = useState("");

  //Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  //Autocomplete
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [warehouseLoading, setWarehouseLoading] = useState(false);

  const { setLoading } = useLoading();
  const buttonRef = useRef(null);

  const getStatus = (string) => {
    switch (string) {
      case "Đã kiểm":
        return <div className="text-green-600">{string}</div>
      case "Lên đơn":
        return <div className="text-blue-600">{string}</div>
      case "Đang kiểm":
      case "Đang giao":
      case "Nháp":
        return <div className="text-yellow-600">{string}</div>
      case "Hủy":
      case "Đã ngưng hoạt động":
        return <div className="text-red-600">{string}</div>
      default:
        return <div className="text-black">{string}</div>
    }
  }

  const headerData = [
    {
      key: "transactionId",
      label: "Mã giao dịch",
      customValue: (item) => item.transactionId && <div>{item.transactionId}</div>
    },
    {
      key: "type",
      label: "Loại phiếu",
      customValue: (item) => item.type && <div>{item.type === "Export" ? "Xuất kho" : "Chuyển kho"}</div>
    },
    {
      key: "fullName",
      label: "Khách hàng",
      customValue: (item) => item.fullName && <div>{item.fullName === "N/A" ? "Chuyển kho" : item.fullName}</div>
    },
    {
      key: "warehouseName",
      label: "Nhà kho",
      customValue: (item) => item.warehouseName && <div>{item.warehouseName}</div>
    },
    {
      key: "statusName",
      label: "Trạng thái",
      customValue: (item) => getStatus(item.statusName)
    },
    {
      key: "transactionDate",
      label: "Ngày giao dịch",
      customValue: (item) => item.transactionDate && <div>{new Date(item.transactionDate).toLocaleDateString('vi-VN')}</div>
    },
    {
      key: "note",
      label: "Ghi chú",
      customValue: (item) => item.note ? <div>{item.note}</div> : <div>Không có</div>
    },
  ]

  //Pagination handlers
  const handleChangePage = (event, newPage) => setPageIndex(newPage);
  const handleChangeRowPerPage = (event) => {
    setRowPerPage(parseInt(event.target.value, 10));
    setPageIndex(0);
  };

  const fetchSuppliers = async (value) => {
    try {
      setSupplierLoading(true);
      const body = {
        pageIndex: 1,
        pageSize: 1000,
        isActive: true,
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

  const fetchWarehouses = async (value) => {
    try {
      setWarehouseLoading(true);
      const body = {
        pageIndex: 1,
        pageSize: 1000,
        warehouseName: value
      };
      const response = await warehouseService.getAllWarehouses(body);
      const warehouseData = response.data.items.map((warehouse) => ({
        warehouseId: warehouse.warehouseId,
        warehouseName: warehouse.warehouseName
      }));
      setWarehouses(warehouseData);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    } finally {
      setWarehouseLoading(false);
    }
  }

  useEffect(() => {
    fetchSuppliers("");
    fetchWarehouses("");
  }, []);

  const fetchExports = async () => {
    setLoading(true);
    const body = {
      pageIndex: pageIndex + 1,
      pageSize: rowPerPage,
      supplierId: filterSupplierId || null,
      warehouseId: filterWarehouseId || null,
      status: parseInt(filterStatus) || null,
      type: filterType || null,
      transactionFromDate: filterTransactionFromDate || null,
      transactionToDate: filterTransactionToDate || null
    };
    const response = await exportService.getAllExports(body);
    setExports(response.data.items);
    setTotalCount(response.data.totalCount);
    setLoading(false);
  };

  useEffect(() => {
    fetchExports();
  }, [pageIndex, rowPerPage]);

  const formatDateToInput = (dt) => {
    return dt.toISOString().split('T')[0];
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buttonRef.current?.click();
    }
  };

  const handleChangeDropdown = (item, field) => {
    if (item) {
      if (item.supplierId) {
        setSelectedSupplier(item);
        setFilterSupplierId(item.supplierId);
      } else if (item.warehouseId) {
        setSelectedWarehouse(item);
        setFilterWarehouseId(item.warehouseId);
      }
    } else {
      if (field === "supplierId") {
        setSelectedSupplier(null);
        setFilterSupplierId(null);
      } else if (field === "warehouseId") {
        setSelectedWarehouse(null);
        setFilterWarehouseId(null);
      }
    }
  };

    useEffect(() => {
        validateFields();
    }, [filterTransactionFromDate, filterTransactionToDate]);

    const validateFields = () => {
        if (filterTransactionToDate && filterTransactionFromDate > filterTransactionToDate) {
            setErrorToTransactionDate("Ngày giao dịch đến phải lớn hơn ngày giao dịch từ");
            return false;
        }
        setErrorToTransactionDate("");
        return true;
    };

    const handleApplyFilter = () => {
        if (validateFields()) {
            fetchExports();
        }
    };

  const handleClearFilter = () => {
    setFilterSupplierId(null);
    setSelectedSupplier(null);
    setFilterWarehouseId(null);
    setSelectedWarehouse(null);
    setFilterStatus(null);
    setFilterType("");
    setFilterTransactionFromDate("");
    setFilterTransactionToDate("");
    fetchExports();
  };

  // const handleCreate = () => {
  //     setEditingImport(null);
  //     setModalOpen(true);
  // };

  // const handleConfirm = async (importData) => {
  //     setLoading(true);
  //     try {
  //         if (editingImport) {
  //             await importService.updateImport(editingImport.importId, importData);
  //             setModalSuccessMessage("Cập nhật phiếu xuất kho thành công");
  //         } else {
  //             await importService.createImport(importData);
  //             setModalSuccessMessage("Tạo phiếu xuất kho thành công");
  //         }
  //         setModalSuccessOpen(true);
  //         setModalOpen(false);
  //         fetchImports();
  //     } catch (error) {
  //         setModalFailedMessage(`Lỗi ${error.response.data.statusCode}: ${error.response.data.error.message}`);
  //         setModalFailedOpen(true);
  //     } finally {
  //         setLoading(false);
  //     }
  // };

  return (
    <div className="flex flex-col p-4">
      <div className="flex flex-row mb-2 bg-white p-4 rounded-xl mb-4 justify-between">
        <div className="flex flex-col mr-4">
          <h1 className="text-2xl font-bold">Danh sách phiếu xuất</h1>
        </div>
        <div className="flex flex-col gap-2">
          <button className="block border background-primary text-white cursor-pointer rounded-xl w-full font-semibold h-10 rounded my-auto px-4" onClick={() => navigate("/exports/create")}>Tạo phiếu xuất mới</button>
        </div>
      </div>

      {/* Filter sidebar */}
      <div className="p-4 rounded-2xl bg-white h-auto w-full mb-4">
        <h2 className="text-xl font-bold">Lọc phiếu xuất</h2>
        <div className="flex items-center my-4 gap-4">
          <div className="mt-2 w-[24.25%]">
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
          <div className="mt-2 w-[24.25%]">
            <label className="mr-2">Nhà kho:</label>
            <AutocompleteCommon
              name="warehouseId"
              value={selectedWarehouse}
              loading={warehouseLoading}
              options={warehouses}
              onSelect={(item) => handleChangeDropdown(item, "warehouseId")}
              onSearch={fetchWarehouses}
              getOptionLabel={(option) => option.warehouseName}
              getOptionKey={(option) => option.warehouseId}
            />
          </div>
        </div>
        <div className="flex items-center my-4 gap-4">
          <div className="mt-2 w-full">
            <label className="mr-2">Trạng thái:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={filterStatus || ""}
              onChange={(e) => setFilterStatus(e.target.value)}
              onKeyDown={handleKeyDown}
            >
              <option value="">Tất cả</option>
              <option value={0}>Nháp</option>
              <option value={1}>Lên đơn</option>
              <option value={2}>Đang giao</option>
              <option value={4}>Hủy</option>
            </select>
          </div>
          <div className="mt-2 w-full">
            <label className="mr-2">Loại phiếu:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              onKeyDown={handleKeyDown}
            >
              <option value="">Tất cả</option>
              <option value="Import">Phiếu xuất kho</option>
              <option value="Transfer">Phiếu chuyển kho</option>
            </select>
          </div>
          <div className="mt-2 w-full">
            <label className="mr-2">Giao dịch từ ngày:</label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded"
              value={filterTransactionFromDate && formatDateToInput(filterTransactionFromDate)}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setFilterTransactionFromDate(date);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="mt-2 w-full">
            <label className="mr-2">Đến ngày:</label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded"
              value={filterTransactionToDate && formatDateToInput(filterTransactionToDate)}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setFilterTransactionToDate(date);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        <div className="flex flex-col justify-center">
          {errorToTransactionDate && <span className="text-red-500 text-center mb-2">{errorToTransactionDate}</span>}
          <div className="flex flex-row items-center justify-center gap-4">
            <button
              className="px-4 py-2 background-primary text-white rounded cursor-pointer"
              onClick={() => handleApplyFilter()}
              ref={buttonRef}
            >
              Lọc
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
              onClick={() => handleClearFilter()}
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <TableCommon
        headers={headerData}
        tableData={exports}
        defaultSortColumn="transactionId"
        rowPerPage={rowPerPage}
        pageIndex={pageIndex}
        totalCount={totalCount}
        rowPerPageOptions={[5, 10, 20]}
        handleChangePage={handleChangePage}
        handleChangeRowPerPage={handleChangeRowPerPage}
        navigateDetail={(item) => navigate(`/exports/details/${item.transactionId}`)}
        handleEdit={(item) => navigate(`/exports/update/${item.transactionId}`)}
        handleDelete={(item) => console.log(`Delete ID: ${item.transactionId}`)}
        messagePopupDelete="Bạn có muốn xóa phiếu xuất này không?"
        usePagination={true}
        useAction={true}
      />
      {/* <ImportForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                initialData={editingImport}
            /> */}
      <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
      <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} subMessages={modalFailedSubMessages} onClose={() => setModalFailedOpen(false)} />
    </div>
  )
}