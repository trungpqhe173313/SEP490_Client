import { useState, useEffect } from "react";
import { Modal } from "@mui/material";
import { customerService } from "@/services/customer.service";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { formatImageURL } from "@/lib/formattingLib";

export function CustomerForm({
    isOpen,
    onClose,
    onConfirm,
    initialData
}) {
    const [form, setForm] = useState({});
    const [error, setError] = useState("");

    //data for check exist
    const [customers, setCustomers] = useState([]);
    const [showPassword, setShowPassword] = useState(false);

    const fetchCustomers = async () => {
        try {
            const body = {
                pageIndex: 1,
                pageSize: 1000,
                fullName: ""
            };
            const response = await customerService.getAllCustomers(body);
            const customerData = response.data.items.map((customer) => ({
                fullName: customer.fullName,
                username: customer.username,
                email: customer.email,
                phone: customer.phone
            }));
            setCustomers(customerData);
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };

    useEffect(() => {
        if (initialData) {
            setForm({
                username: initialData.username || "",
                password: initialData.password || "",
                fullName: initialData.fullName || "",
                image: initialData.image || "",
                email: initialData.email || "",
                phone: initialData.phone || "",
                isActive: initialData.isActive ?? true,
            });
        } else {
            setForm({
                username: "",
                image: "",
                fullName: "",
                email: "",
                phone: "",
            });
        }
        clearErrors();
        fetchCustomers();
    }, [initialData, isOpen]);

    const clearErrors = () => {
        setError("");
        setErrorUsername("");
        setErrorEmail("");
        setErrorFullName("");
        setErrorPhone("");
        setErrorPassword("");
        setValidUsername(true);
        setValidEmail(true);
        setValidFullName(true);
        setValidPhone(true);
        setValidPassword(true);
    };

    //Validation
    const [validUsername, setValidUsername] = useState(true);
    const [validEmail, setValidEmail] = useState(true);
    const [validFullName, setValidFullName] = useState(true);
    const [validPhone, setValidPhone] = useState(true);
    const [validPassword, setValidPassword] = useState(true);

    const [errorUsername, setErrorUsername] = useState("");
    const [errorEmail, setErrorEmail] = useState("");
    const [errorFullName, setErrorFullName] = useState("");
    const [errorPhone, setErrorPhone] = useState("");
    const [errorPassword, setErrorPassword] = useState("");

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
                } else if (customers.find(customer => customer.email.toLowerCase() === checkingEmail.toLowerCase() && customer.email !== initialData?.email)) {
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
                } else if (customers.find(customer => customer.username.toLowerCase() === checkingUsername.toLowerCase() && customer.username !== initialData?.username)) {
                    setValidUsername(false);
                    setErrorUsername(`Tài khoản ${checkingUsername} đã tồn tại, vui lòng nhập tên tài khoản khác.`);
                } else {
                    setValidUsername(true);
                    setErrorUsername("");
                }
                break;
            case "phone":
                const checkingPhone = value.trim().replace(/\s\s+/g, ' ');
                const isExistingPhone = customers.find(customer => customer.phone.toLowerCase() === checkingPhone.toLowerCase() && customer.phone !== initialData?.phone);
                if (isExistingPhone) {
                    setValidPhone(false);
                    setErrorPhone(`Số ${checkingPhone} đã tồn tại, vui lòng điền số điện thoại khác`);
                } else {
                    setValidPhone(true);
                    setErrorPhone("");
                }
                break;
            case "password":
                const checkingPassword = value.trim();
                const regex = /^(?!.*\s)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\.-])[A-Za-z\d@$!%*?&_\.-]{8,}$/;
                if (!regex.test(checkingPassword)) {
                    setValidPassword(false);
                    setErrorPassword("Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường, số và 1 trong các ký tự sau: @ $ ! % * ? & _ . -");
                } else {
                    setValidPassword(true);
                    setErrorPassword("");
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
        if (form.fullName === "" || form.username === "" || form.phone === "") {
            setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
            return;
        }
        const invalidForms = !validFullName || !validUsername || !validEmail || !validPhone || !validPassword;
        if (invalidForms) {
            setError("Có nhập liệu không hợp lệ, vui lòng thử lại.");
            return;
        }
        setError("");
        onConfirm(form);
        onClose();
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
                    <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0">
                        <h2 className="text-2xl font-bold my-auto">
                            {initialData ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}
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
                                <label className="block text-md font-bold">Hình ảnh</label>
                                <p className="text-xs text-gray-500">Chọn hình ảnh cho khách hàng (JPG, PNG)</p>
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
                                    onClick={() => handleChange("image", "")}
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
                                <div className="mt-2 flex justify-center">
                                    <Image src={formatImageURL(form.image)} alt="Preview" width={400} height={400} className="w-1/2 h-auto rounded-full aspect-square object-cover border border-black" />
                                </div>
                            )}
                        </div>
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
                        {initialData &&
                            <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300 relative">
                                <div>
                                    <label className="block text-md font-bold">Mật khẩu *</label>
                                    <p className="text-xs text-gray-500">Nhập mật khẩu tài khoản</p>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    className={`w-full bg-white border rounded px-3 py-2 ${!validPassword ? "border-red-500" : "border-green-500"}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-7 top-7/10 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={25} /> : <Eye size={25} />}
                                </button>

                            </div>
                        }
                        {errorPassword && <p className="text-red-500 text-xs italic">{errorPassword}</p>}
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Tên khách hàng *</label>
                                <p className="text-xs text-gray-500">Nhập tên khách hàng</p>
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
                                <p className="text-xs text-gray-500">Nhập Email khách hàng</p>
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
                                <p className="text-xs text-gray-500">Nhập số điện thoại khách hàng</p>
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
                        {initialData && <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Trạng thái</label>
                                <p className="text-xs text-gray-500">Chọn trạng thái khách hàng</p>
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