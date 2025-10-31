import { useState, useEffect } from "react";
import { Modal } from "@mui/material";
import { employeeService } from "@/services/employee.service";

export function EmployeeForm({
    isOpen,
    onClose,
    onConfirm,
    initialData
}) {
    const [form, setForm] = useState({});
    const [error, setError] = useState("");

    //data for check exist
    const [employees, setEmployees] = useState([]);

    const fetchEmployees = async () => {
        try {
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                fullName: ""
            };
            const response = await employeeService.getAllEmployees(body);
            const employeeData = response.data.items.map((employee) => ({
                fullName: employee.fullName,
                username: employee.username,
                email: employee.email
            }));
            setEmployees(employeeData);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    useEffect(() => {
        if (initialData) {
            setForm({
                username: initialData.username || "",
                password: initialData.password || "",
                fullName: initialData.fullName || "",
                image: "https://picsum.photos/200",
                email: initialData.email || "",
                isActive: initialData.isActive ?? true,
            });
        } else {
            setForm({
                username: "",
                image: "https://picsum.photos/200",
                fullName: "",
                email: "",
            });
        }
        setError("");
        fetchEmployees();
    }, [initialData, isOpen]);

    //Validation
    const [validUsername, setValidUsername] = useState(true);
    const [validEmail, setValidEmail] = useState(true);
    const [validFullName, setValidFullName] = useState(true);

    const [errorUsername, setErrorUsername] = useState("");
    const [errorEmail, setErrorEmail] = useState("");
    const [errorFullName, setErrorFullName] = useState("");

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
                } else if (employees.find(employee => employee.email.toLowerCase() === checkingEmail.toLowerCase() && employee.email !== initialData?.email)) {
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
                } else if (employees.find(employee => employee.username.toLowerCase() === checkingUsername.toLowerCase() && employee.username !== initialData?.username)) {
                    setValidUsername(false);
                    setErrorUsername(`Tài khoản ${checkingUsername} đã tồn tại, vui lòng nhập tên tài khoản khác.`);
                } else {
                    setValidUsername(true);
                    setErrorUsername("");
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
        if (form.fullName === "" || form.username === "") {
            setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
            return;
        }
        const invalidForms = !validFullName || !validUsername || !validEmail;
        if (invalidForms) {
            setError("Có nhập liệu không hợp lệ, vui lòng thử lại.");
            return;
        }
        setError("");
        onConfirm(form);
        onClose();
    };

    return (
        <Modal open={isOpen} onClose={onClose}>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-1/2 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden">
                    <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0">
                        <h2 className="text-2xl font-bold my-auto">
                            {initialData ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
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
                                <label className="block text-md font-bold">Tên nhân viên *</label>
                                <p className="text-xs text-gray-500">Nhập tên nhân viên</p>
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
                                <p className="text-xs text-gray-500">Nhập Email nhân viên</p>
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
                        {initialData && <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Trạng thái</label>
                                <p className="text-xs text-gray-500">Chọn trạng thái nhân viên</p>
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