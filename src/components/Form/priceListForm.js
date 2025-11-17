import React, { useState, useEffect } from 'react'
import { Modal } from "@mui/material";
import { priceListService } from "@/services/priceList.service";
import { supplierService } from '@/services/supplier.service';
import { formatDateToInput } from '@/lib/formatDateToInput';
import DateInput from '../Input/DateInput';

export function PriceListForm({
  isOpen,
  onClose,
  onConfirm,
  initialData
}) {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const today = new Date();

  //data for check exist
  const [priceLists, setPriceLists] = useState([]);

  const [validPriceListName, setValidPriceListName] = useState(true);
  const [validStartDate, setValidStartDate] = useState(true);
  const [validEndDate, setValidEndDate] = useState(true);

  const [errorPriceListName, setErrorPriceListName] = useState("");
  const [errorStartDate, setErrorStartDate] = useState("");
  const [errorEndDate, setErrorEndDate] = useState("");

  const fetchPriceLists = async () => {
    try {
      const body = {
        pageIndex: 1,
        pageSize: 1000
      }
      const response = await priceListService.getAllPriceLists(body);
      const priceListData = response.data.items.map((priceList) => ({
        priceListId: priceList.priceListId,
        priceListName: priceList.priceListName
      }))
      setPriceLists(priceListData);
    } catch (error) {
      console.error("Error fetching price lists:", error);
    }
  };

  useEffect(() => {
    if (initialData) {
      setForm({
        priceListName: initialData.priceListName || "",
        startDate: initialData.startDate || today,
        endDate: initialData.endDate || "",
        isActive: initialData.isActive ?? true
      });
    } else {
      setForm({
        priceListName: "",
        startDate: today,
        endDate: ""
      });
    }
    fetchPriceLists();
  }, [initialData, isOpen]);

  const handleChange = (name, value) => {
    let newValue = value;
    switch (name) {
      case "isActive":
        newValue = value === "true";
        break;
      case "priceListName":
        const checkingPriceListName = newValue.trim().replace(/\s\s+/g, ' ');
        if (priceLists.find(priceList => priceList.priceListName.toLowerCase() === checkingPriceListName.toLowerCase() && priceList.priceListName !== initialData?.priceListName)) {
          setValidPriceListName(false);
          setErrorPriceListName(`Bảng giá "${checkingPriceListName}" đã tồn tại, vui lòng nhập tên khác.`);
        } else {
          setValidPriceListName(true);
          setErrorPriceListName("");
        }
        break;
      case "endDate":
        if (form.startDate !== "" && value < form.startDate) {
          setValidEndDate(false);
          setErrorEndDate("Ngày hết hạn phải lớn hơn ngày có hiệu lực");
        } else if (value < today) {
          setValidEndDate(false);
          setErrorEndDate("Ngày hết hạn phải là tương lai");
        } else {
          setValidEndDate(true);
          setErrorEndDate("");
        }
        break;
      default:
        break;
    }
    setForm((prevForm) => ({
      ...prevForm,
      [name]: newValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.priceListName === "" || form.startDate === "" || form.endDate === "") {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }
    const invalidForms = !validPriceListName || !validEndDate;
    if (invalidForms) {
      setError("Có nhập liệu không hợp lệ, vui lòng thử lại.");
      return
    }
    setError("");
    onConfirm(form);
    onClose();
  }

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-1/2 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden">
          <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0">
            <h2 className="text-2xl font-bold my-auto">
              {initialData ? "Chỉnh sửa bảng giá" : "Thêm bảng giá"}
            </h2>
            <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
              <div>
                <label className="block text-md font-bold">Tên bảng giá</label>
                <p className="text-xs text-gray-500">Nhập tên bảng giá</p>
              </div>
              <input
                type="text"
                name="priceListName"
                value={form.priceListName}
                onChange={(e) => handleChange("priceListName", e.target.value)}
                className={`w-full bg-white border rounded px-3 py-2 ${!validPriceListName ? "border-red-500" : "border-green-500"}`}
                required
              />
              {!validPriceListName && <p className="text-red-500 text-xs">{errorPriceListName}</p>}
            </div>
            {initialData && <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
              <div>
                <label className="block text-md font-bold">Ngày hiệu lực</label>
                <p className="text-xs text-gray-500">Nhập ngày hiệu lực</p>
              </div>
              <DateInput
                value={form.startDate}
                onChange={(d) => handleChange("startDate", d)}
                className={`w-full bg-white border rounded px-3 py-2 ${!validStartDate ? "border-red-500" : "border-green-500"}`}
                required
              />
              {/* <input
                type="date"
                name="endDate"
                value={form.startDate && formatDateToInput(form.startDate)}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  handleChange("startDate", date);
                }}
                className={`w-full bg-white border rounded px-3 py-2 ${!validStartDate ? "border-red-500" : "border-green-500"}`}
                required
              /> */}
              {!validStartDate && <p className="text-red-500 text-xs">{errorStartDate}</p>}
            </div>
            }
            <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
              <div>
                <label className="block text-md font-bold">Ngày hết hạn</label>
                <p className="text-xs text-gray-500">Nhập ngày hết hạn</p>
              </div>
              <DateInput
                value={form.endDate}
                onChange={(d) => handleChange("endDate", d)}
                className={`w-full bg-white border rounded px-3 py-2 ${!validEndDate ? "border-red-500" : "border-green-500"}`}
                required
              />
              {/* <input
                type="date"
                name="endDate"
                value={form.endDate && formatDateToInput(form.endDate)}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  handleChange("endDate", date);
                }}
                className={`w-full bg-white border rounded px-3 py-2 ${!validEndDate ? "border-red-500" : "border-green-500"}`}
                required
              /> */}
              {!validEndDate && <p className="text-red-500 text-xs">{errorEndDate}</p>}
            </div>
            {initialData && <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
              <div>
                <label className="block text-md font-bold">Trạng thái</label>
                <p className="text-xs text-gray-500">Chọn trạng thái bảng giá</p>
              </div>
              <select name="isActive" value={form.isActive ? "true" : "false"} onChange={(e) => handleChange("isActive", e.target.value)} className="w-full bg-white border border-gray-300 rounded px-3 py-2">
                <option value="true">Đang hoạt động</option>
                <option value="false">Dừng hoạt động</option>
              </select>
            </div>
            }
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






export function PriceListUploadProductForm({
  isOpen,
  onClose,
  onConfirm
}) {
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);

  const fetchSuppliers = async () => {
    try {
      const body = {
        pageIndex: 1,
        pageSize: 1000,
        isActive: true
      }
      const response = await supplierService.getAllSuppliers(body);
      const supplierData = response.data.items.map((supplier) => ({
        supplierId: supplier.supplierId,
        supplierName: supplier.supplierName
      }))
      setSuppliers(supplierData);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    setError("");
  }, [selectedSuppliers]);

  const handleCheckboxChange = (id) => {
    setSelectedSuppliers((prev) =>
      prev.includes(id)
        ? prev.filter((supplierId) => supplierId !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSuppliers.length === 0) {
      setError("Nhà cung cấp không được để trống");
      return;
    }
    onConfirm(selectedSuppliers);
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-1/2 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden">
          <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0">
            <h2 className="text-2xl font-bold my-auto">
              Chọn nhà cung cấp
            </h2>
            <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 m-4">
            <h3 className="text-lg font-semibold mb-2">Hãy chọn 1 hoặc nhiều các nhà cung cấp dưới đây</h3>
            {suppliers.map((supplier) => (
              <label
                key={supplier.supplierId}
                className="flex items-center my-2 px-4 py-2 border border-gray-300 rounded-xl cursor-pointer gap-4"
              >
                <input
                  type="checkbox"
                  value={supplier.supplierId}
                  checked={selectedSuppliers.includes(supplier.supplierId)}
                  onChange={() => handleCheckboxChange(supplier.supplierId)}
                  className="w-6 h-6 accent-green-600 cursor-pointer"
                />
                <span className="text-md w-full">{supplier.supplierName}</span>
              </label>
            ))}
            <div className="flex flex-col justify-center items-center gap-2 mt-4">
              {error && <p className="text-red-500">{error}</p>}
              <button className="px-4 py-2 background-primary text-white rounded-md cursor-pointer">Xác nhận</button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}

