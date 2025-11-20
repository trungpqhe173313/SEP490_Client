import { useState, useEffect } from "react";
import { Modal } from "@mui/material";
import { adminService } from "@/services/admin.service";

export function AccountForm({
    isOpen,
    onClose,
    onConfirm,
    initialData
}) {
    const [form, setForm] = useState({});
    const [error, setError] = useState("");

    //data for check exist
    const [accounts, setAccounts] = useState([]);
    const [roles, setRoles] = useState([]);

    const fetchAccounts = async () => {
        try {
            const body = {
                pageIndex: 1,
                pageSize: 1000
            };
            const response = await adminService.getAllAccounts(body);
            const accountData = response.data.items.map((account) => ({
                fullName: account.fullName,
                username: account.username,
                email: account.email
            }));
            setAccounts(accountData);
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await adminService.getAllRoles();
            setRoles(response.data);
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    useEffect(() => {
        if (initialData) {
            setForm({
                username: initialData.username || "",
                fullName: initialData.fullName || "",
                roles: initialData.roles || [],
                email: initialData.email || "",
                phone: initialData.phone || "",
                isActive: initialData.isActive ?? true,
            });
        } else {
            setForm({
                username: "",
                roles: [],
                fullName: "",
                email: "",
                phone: "",
            });
        }
        setError("");
        fetchAccounts();
        fetchRoles();
    }, [initialData, isOpen]);

    //Validation
    const [validUsername, setValidUsername] = useState(true);
    const [validEmail, setValidEmail] = useState(true);
    const [validFullName, setValidFullName] = useState(true);
    const [validPhone, setValidPhone] = useState(true);

    const [errorUsername, setErrorUsername] = useState("");
    const [errorEmail, setErrorEmail] = useState("");
    const [errorFullName, setErrorFullName] = useState("");
    const [errorPhone, setErrorPhone] = useState("");

    const handleChange = (name, value) => {
        let newValue = value;
        switch (name) {
            case "isActive":
                newValue = value === "true";
                break;
            case "email":
                const checkingEmail = value.trim().replace(/\s\s+/g, ' ');
                if (value.length > 60 || value.length < 6) {
                    setValidEmail(false);
                    setErrorEmail("Email phải trong khoảng 6 đến 60 ky tự.");
                } else if (accounts.find(account => account.email.toLowerCase() === checkingEmail.toLowerCase() && account.email !== initialData?.email)) {
                    setValidEmail(false);
                    setErrorEmail(`Email ${checkingEmail} đã tồn tại, vui lòng nhập email khác.`);
                } else {
                    setValidEmail(true);
                    setErrorEmail("");
                }
                break;
            case "username":
                const checkingUsername = value.trim().replace(/\s\s+/g, ' ');
                if (value.length > 60 || value.length < 6) {
                    setValidUsername(false);
                    setErrorUsername("Tên tài khoản phải trong khoảng 6 đến 60 ky tự.");
                } else if (accounts.find(account => account.username.toLowerCase() === checkingUsername.toLowerCase() && account.username !== initialData?.username)) {
                    setValidUsername(false);
                    setErrorUsername(`Tài khoản ${checkingUsername} đã tồn tại, vui lòng nhập tên tài khoản khác.`);
                } else {
                    setValidUsername(true);
                    setErrorUsername("");
                }
                break;
            case "phone":
                const checkingPhone = value.trim().replace(/\s\s+/g, ' ');
                const isExistingPhone = accounts.find(account => account.phone.toLowerCase() === checkingPhone.toLowerCase() && account.phone !== initialData?.phone);
                if (isExistingPhone) {
                    setValidPhone(false);
                    setErrorPhone(`Số ${checkingPhone} đã tồn tại, vui lòng điền số điện thoại khác`);
                } else {
                    setValidPhone(true);
                    setErrorPhone("");
                }
                break;
            case "fullName":
                const checkingFullName = value.trim().replace(/\s\s+/g, ' ');
                if (accounts.find(account => account.fullName.toLowerCase() === checkingFullName.toLowerCase() && account.fullName !== initialData?.fullName)) {
                    setValidFullName(false);
                    setErrorFullName(`Tên người dùng ${checkingFullName} đã tồn tại, vui lòng nhập tên người dùng khác.`);
                } else {
                    setValidFullName(true);
                    setErrorFullName("");
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
        if (form.fullName === "" || form.username === "" || form.phone === "" || form.roles.length === 0) {
            setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
            return;
        }
        const invalidForms = !validFullName || !validUsername || !validEmail || !validPhone;
        if (invalidForms) {
            setError("Có nhập liệu không hợp lệ, vui lòng thử lại.");
            return;
        }
        setError("");
        onConfirm(form);
        onClose();
    };

    const handleCheckboxChange = (name) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(name) ? prev.roles.filter((role) => role !== name) : [...prev.roles, name],
    }))
  };

    return (
        <Modal open={isOpen} onClose={onClose}>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-1/2 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden">
                    <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0">
                        <h2 className="text-2xl font-bold my-auto">
                            {initialData ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}
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
                                <label className="block text-md font-bold">Tên tài khoản *</label>
                                <p className="text-xs text-gray-500">Nhập tên tài khoản</p>
                            </div>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={(e) => handleChange("username", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2 ${!validUsername ? "border-red-500" : "border-green-500"}`}
                                required
                            />
                            {errorUsername && <p className="text-red-500 text-xs italic">{errorUsername}</p>}
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Tên người dùng *</label>
                                <p className="text-xs text-gray-500">Nhập tên người dùng</p>
                            </div>
                            <input
                                type="text"
                                name="fullName"
                                value={form.fullName}
                                onChange={(e) => handleChange("fullName", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2 ${!validFullName ? "border-red-500" : "border-green-500"}`}
                                required
                            />
                            {errorFullName && <p className="text-red-500 text-xs italic">{errorFullName}</p>}
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Email </label>
                                <p className="text-xs text-gray-500">Nhập Email tài khoản</p>
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2 ${!validEmail ? "border-red-500" : "border-green-500"}`}
                            />
                            {errorEmail && <p className="text-red-500 text-xs italic">{errorEmail}</p>}
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Số điện thoại *</label>
                                <p className="text-xs text-gray-500">Nhập số điện thoại tài khoản</p>
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
                            {errorPhone && <p className="text-red-500 text-xs italic">{errorPhone}</p>}
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Vai trò</label>
                                <p className="text-xs text-gray-500">Chọn 1 hoặc nhiều vai trò</p>
                            </div>
                            {
                                roles.map((role) => (
                                    <label
                                        key={role.roleId}
                                        className="flex items-center my-2 px-4 py-2 border border-gray-300 rounded-xl cursor-pointer gap-4"
                                    >
                                        <input
                                            type="checkbox"
                                            value={role.roleName}
                                            checked={form.roles.includes(role.roleName)}
                                            onChange={() => handleCheckboxChange(role.roleName)}
                                            className="w-6 h-6 accent-green-600 cursor-pointer"
                                        />
                                        <span className="text-md w-full">{role.description}</span>
                                    </label>
                                ))
                            }
                        </div>
                        {initialData && <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Trạng thái</label>
                                <p className="text-xs text-gray-500">Chọn trạng thái tài khoản</p>
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