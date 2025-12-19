import { useState, useEffect } from "react";
import { Modal } from "@mui/material";
import { AutocompleteCommon } from "@/components/Autocomplete/Autocomplete";
import { supplierService } from "@/services/supplier.service";
import { customerService } from "@/services/customer.service";
import Image from "next/image";
import { formatImageURL } from "@/lib/formattingLib";

export function ContractForm({
  isOpen,
  onClose,
  onConfirm,
  initialData
}) {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [type, setType] = useState("supplier");
  const [options, setOptions] = useState([]);

  //Autocomplete
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coopLoading, setCoopLoading] = useState(false);
  const [selectedCoop, setSelectedCoop] = useState(null);

  const fetchSuppliers = async () => {
    try {
      const body = {
        pageIndex: 1,
        pageSize: 1000,
        supplierName: "",
        isActive: true
      };
      const response = await supplierService.getAllSuppliers(body);
      const supplierData = response.data.items.map((supplier) => ({
        name: supplier.supplierName,
        id: supplier.supplierId,
        phone: supplier.phone
      }));
      setSuppliers(supplierData);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const body = {
        pageIndex: 1,
        pageSize: 1000,
        customerName: "",
        isActive: true
      };
      const response = await customerService.getAllCustomers(body);
      const customerData = response.data.items.map((customer) => ({
        name: customer.fullName,
        id: customer.userId,
        phone: customer.phone
      }));
      setCustomers(customerData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchCustomers();
    handleSearch("");
    if (initialData) {
      setForm({
        isActive: initialData.isActive
      });
    } else {
      setForm({
        userId: null,
        supplierId: null,
        image: "",
      });
      setSelectedCoop(null);
    }
    setError("");
  }, [initialData, isOpen]);

  const handleChange = (name, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleChangeDropdown = (item) => {
    if (item) {
      if (type === "supplier") {
        setSelectedCoop(item);
        handleChange("supplierId", item.id);
      } else if (type === "customer") {
        setSelectedCoop(item);
        handleChange("userId", item.id);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!initialData && (!form.supplierId && !form.userId)) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    if (!form.image) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    setError("");
    onConfirm(form);
    onClose();
  };

  const handleSearch = async (searchTerm) => {
    setCoopLoading(true);
    if (type === "supplier") {
      try {
        const body = {
          pageIndex: 1,
          pageSize: 1000,
          isActive: true,
          supplierName: searchTerm
        };
        const response = await supplierService.getAllSuppliers(body);
        const supplierData = response.data.items.map((supplier) => ({
          id: supplier.supplierId,
          name: supplier.supplierName
        }));
        setOptions(supplierData);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    } else if (type === "customer") {
      try {
        const body = {
          pageIndex: 1,
          pageSize: 1000,
          isActive: true,
          customerName: searchTerm
        };
        const response = await customerService.getAllCustomers(body);
        const customerData = response.data.items.map((customer) => ({
          id: customer.userId,
          name: customer.fullName
        }));
        setOptions(customerData);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    }
    setCoopLoading(false);
  };

  const handleChangeType = async (value) => {
    setType(value);
    setSelectedCoop(null);
    setForm((prevForm) => ({
      ...prevForm,
      supplierId: null,
      userId: null
    }));
    if (value === "supplier") {
      setOptions(suppliers);
    } else if (value === "customer") {
      setOptions(customers);
    }
  };

  const handleFileChange = (file) => {
    if (!file) return;
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedImageTypes.includes(file.type)) {
      setError("Chỉ chấp nhận định dạng ảnh: JPG, PNG, GIF, WEBP");
      return;
    }
    setError("");
    handleChange('image', file);
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-1/2 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden">
          <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0 z-50">
            <h2 className="text-2xl font-bold my-auto" id="product-modal-title">
              {initialData ? "Cập nhật hợp đồng" : "Thêm hợp đồng mới"}
            </h2>
            <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-8">
            {!initialData && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                  <div className="grid grid-cols-1">
                    <label className="block text-md font-bold">Loại đối tác</label>
                    <p className="text-xs text-gray-500">Chọn loại đối tác</p>
                  </div>
                  <select
                    name="type"
                    value={type}
                    onChange={(e) => handleChangeType(e.target.value)}
                    className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                  >
                    <option value="supplier">Nhà cung cấp</option>
                    <option value="customer">Khách hàng</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                  <div className="grid grid-cols-1">
                    <label className="block text-md font-bold">Đối tác</label>
                    <p className="text-xs text-gray-500">Chọn nhà đối tác</p>
                  </div>
                  <AutocompleteCommon
                    name="coop"
                    value={selectedCoop}
                    loading={coopLoading}
                    options={options}
                    onSelect={(item) => handleChangeDropdown(item)}
                    onSearch={handleSearch}
                    getOptionLabel={(option) => option.name + " - " + option.phone || ""}
                    getOptionKey={(option) => option.id}
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
              <div className="grid grid-cols-1">
                <label className="block text-md font-bold">Hình ảnh</label>
                <p className="text-xs text-gray-500">Chọn hình ảnh hợp đồng (JPG, PNG)</p>
              </div>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="image"
                  className="px-3 py-2 rounded-md background-primary text-white cursor-pointer"
                  onClick={() => document.getElementById("image").value = ""}
                >
                  Chọn hình ảnh
                </label>
                {form.image && <button
                  type="button"
                  className="px-3 py-2 rounded-md bg-red-600 text-white cursor-pointer"
                  onClick={() => handleChange("image", null)}
                >
                  Xóa hình ảnh
                </button>}
              </div>
              <input
                id="image"
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                hidden
              />
              {form.image && (
                <div className="mt-2">
                  <Image src={formatImageURL(form.image)} alt="Preview" width={400} height={400} className="w-full h-auto"/>
                </div>
              )}
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

