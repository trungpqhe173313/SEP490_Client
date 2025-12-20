import { useState, useEffect } from "react";
import { Modal } from "@mui/material";
import { supplierService } from "@/services/supplier.service";
import { adminService } from "@/services/admin.service";
import { useLogin } from "@/context/LoginContext";

export function SupplierForm({
    isOpen,
    onClose,
    onConfirm,
    initialData,
}) {
    const [form, setForm] = useState({});
    const [error, setError] = useState("");
    const { user } = useLogin();

    //data for check exist
    const [suppliers, setSuppliers] = useState([]);
    const [accounts, setAccounts] = useState([]);

    const fetchSuppliers = async () => {
        if (user?.roles?.includes("Manager")) return;
        try {
            const body = {
                pageIndex: 1,
                pageSize: 1000
            };
            const response = await supplierService.getAllSuppliers(body);
            const supplierData = response.data.items.map((supplier) => ({
                supplierName: supplier.supplierName,
                email: supplier.email,
                phone: supplier.phone
            }));
            const accountResponse = await adminService.getAllAccounts(body);
            const accountData = accountResponse.data.items.map((account) => ({
                fullName: account.fullName,
                username: account.username,
                email: account.email,
                phone: account.phone
            }));
            setAccounts(accountData);
            setSuppliers(supplierData);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    }

    useEffect(() => {
        if (initialData) {
            setForm({
                supplierName: initialData.supplierName || "",
                email: initialData.email || "",
                phone: initialData.phone || "",
                isActive: initialData.isActive ?? true,
            });
        } else {
            setForm({
                supplierName: "",
                email: "",
                phone: "",
            });
        }
        clearErrors();
        fetchSuppliers();
    }, [initialData, isOpen]);

    //Validation
    const [validSupplierName, setValidSupplierName] = useState(true);
    const [validEmail, setValidEmail] = useState(true);
    const [validPhone, setValidPhone] = useState(true);

    const [errorSupplierName, setErrorSupplierName] = useState("");
    const [errorEmail, setErrorEmail] = useState("");
    const [errorPhone, setErrorPhone] = useState("");

    const clearErrors = () => {
        setError("");
        setErrorSupplierName("");
        setErrorEmail("");
        setErrorPhone("");
        setValidSupplierName(true);
        setValidEmail(true);
        setValidPhone(true);
    }

    const handleChange = (name, value) => {
        let newValue = value;
        switch (name) {
            case "isActive":
                newValue = value === "true";
                break;
            case "supplierName":
                const checkingSupplierName = value.trim();
                const regexSupplierName = /^[\p{L}\p{N}]+(?: [\p{L}\p{N}]+)*$/u
                const isExistingSupplierName = suppliers.find(supplier => supplier.supplierName.toLowerCase() === checkingSupplierName.toLowerCase() && supplier.supplierName !== initialData?.supplierName);
                if (isExistingSupplierName) {
                    setValidSupplierName(false);
                    setErrorSupplierName(`Nhà cung cấp ${checkingSupplierName} đã tồn tại, vui lòng nhập tên khác`);
                } else if (!regexSupplierName.test(checkingSupplierName)) {
                    setValidFullName(false);
                    setErrorFullName("Tên nhà cung cấp không hợp lệ.");
                } else if (checkingSupplierName.length < 3 || checkingSupplierName.length > 60) {
                    setValidSupplierName(false);
                    setErrorSupplierName("Tên nhà cung cấp phải trong khoảng 3 đến 60 ky tự.");
                } else {
                    setValidSupplierName(true);
                    setErrorSupplierName("");
                }
                break;
            case "email":
                const checkingEmail = value.trim();
                const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isExistingEmail = suppliers.find(supplier => (supplier.email.toLowerCase() === checkingEmail.toLowerCase() || accounts.find(account => account.email.toLowerCase() === checkingEmail.toLowerCase())) && supplier.email !== initialData?.email);
                if (isExistingEmail) {
                    setValidEmail(false);
                    setErrorEmail(`Email ${checkingEmail} đã tồn tại, vui lòng nhập email khác`);
                } else if (!regexEmail.test(checkingEmail)) {
                    setValidEmail(false);
                    setErrorEmail("Email không hợp lệ.");
                } else if (checkingEmail.length < 6 || checkingEmail.length > 60) {
                    setValidEmail(false);
                    setErrorEmail("Email phải trong khoảng 6 đến 60 ky tự.");
                } else {
                    setValidEmail(true);
                    setErrorEmail("");
                }
                break;
            case "phone":
                const checkingPhone = value.trim().replace(/\s\s+/g, ' ');
                const isExistingPhone = suppliers.find(supplier => (supplier.phone.toLowerCase() === checkingPhone.toLowerCase() || accounts.find(account => account.phone.toLowerCase() === checkingPhone.toLowerCase())) && supplier.phone !== initialData?.phone);
                if (isExistingPhone) {
                    setValidPhone(false);
                    setErrorPhone(`Số ${checkingPhone} đã tồn tại, vui lòng điền số điện thoại khác`);
                } else {
                    setValidPhone(true);
                    setErrorPhone("");
                }
                break;
            default:
                break;
        }
        setForm((prev) => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.supplierName === "" || form.phone === "") {
            setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
            return;
        }
        const invalidForms = !validSupplierName || !validEmail || !validPhone;
        if (invalidForms) {
            setError("Có nhập liệu không hợp lệ, vui lòng thử lại");
            return;
        }
        setError("");
        onConfirm(form);
        onClose();
    };

    return (
        <Modal open={isOpen} onClose={onClose}>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-1/2 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden z-51">
                    <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0">
                        <h2 className="text-2xl font-bold my-auto">
                            {initialData ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp mới"}
                        </h2>
                        <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1" onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4 p-8">
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Tên nhà cung cấp *</label>
                                <p className="text-xs text-gray-500">Nhập tên nhà cung cấp</p>
                            </div>
                            <input
                                type="text"
                                name="supplierName"
                                value={form.supplierName}
                                onChange={(e) => handleChange("supplierName", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2 ${!validSupplierName ? "border-red-500" : "border-green-500"}`}
                                required
                            />
                            {!validSupplierName && <p className="text-red-500 text-xs italic">{errorSupplierName}</p>}
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Email </label>
                                <p className="text-xs text-gray-500">Nhập Email nhà cung cấp</p>
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2 ${!validEmail ? "border-red-500" : "border-green-500"}`}
                            />
                            {!validEmail && <p className="text-red-500 text-xs italic">{errorEmail}</p>}
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Số điện thoại *</label>
                                <p className="text-xs text-gray-500">Nhập số điện thoại nhà cung cấp</p>
                            </div>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onInput={(e) => {
                                    e.target.value = e.target.value.replace(/\D/g, "");
                                }}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2 ${!validPhone ? "border-red-500" : "border-green-500"}`}
                                required
                            />
                            {!validPhone && <p className="text-red-500 text-xs italic">{errorPhone}</p>}
                        </div>
                        {initialData && <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Trạng thái</label>
                                <p className="text-xs text-gray-500">Nhập trạng thái nhà cung cấp</p>
                            </div>
                            <select name="isActive" value={form.isActive ? "true" : "false"} onChange={(e) => handleChange("isActive", e.target.value)} className="w-full bg-white border border-gray-300 rounded px-3 py-2">
                                <option value="true">Đang hoạt động</option>
                                <option value="false">Dừng hoạt động</option>
                            </select>
                        </div>
                        }
                        {error && <div className="text-red-600 text-md text-right">{error}</div>}
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer" onClick={onClose}>Hủy</button>
                            <button type="submit" className="px-4 py-2 rounded background-primary text-white background-hovered cursor-pointer">
                                {initialData ? "Cập nhật" : "Tạo mới"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}
