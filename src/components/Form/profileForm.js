import { useState, useEffect } from "react";
import { Modal } from "@mui/material";
import Image from "next/image";

export function ProfileForm({
    isOpen,
    onClose,
    onConfirm,
    initialData
}) {
    const [form, setForm] = useState({});
    const [error, setError] = useState("");

    //data for check exist
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const body = {
                pageIndex: 1,
                pageSize: 1000,
            };
            const response = await userService.getAllUsers(body);
            const userData = response.data.items.map((user) => ({
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                phone: user.phone
            }));
            setUsers(userData);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        if (initialData) {
            setForm({
                fullName: initialData.fullName || "",
                image: initialData.image || "",
                email: initialData.email || "",
                phone: initialData.phone || "",
            });
        }
        setError("");
        //fetchUsers();
    }, [initialData, isOpen]);

    //Validation
    const [validEmail, setValidEmail] = useState(true);
    const [validFullName, setValidFullName] = useState(true);
    const [validPhone, setValidPhone] = useState(true);

    const [errorEmail, setErrorEmail] = useState("");
    const [errorFullName, setErrorFullName] = useState("");
    const [errorPhone, setErrorPhone] = useState("");

    const handleChange = (name, value) => {
        let newValue = value;
        // switch (name) {
        //     case "email":
        //         const checkingEmail = value.trim().replace(/\s\s+/g, ' ');
        //         if (value.length > 60 || value.length < 6) {
        //             setValidEmail(false);
        //             setErrorEmail("Email phải trong khoảng 6 đến 60 ky tự.");
        //         } else if (customers.find(customer => customer.email.toLowerCase() === checkingEmail.toLowerCase() && customer.email !== initialData?.email)) {
        //             setValidEmail(false);
        //             setErrorEmail(`Email ${checkingEmail} đã tồn tại, vui lòng nhập email khác.`);
        //         } else {
        //             setValidEmail(true);
        //             setErrorEmail("");
        //         }
        //         break;
        //     case "phone":
        //         const checkingPhone = value.trim().replace(/\s\s+/g, ' ');
        //         const isExistingPhone = suppliers.find(supplier => supplier.phone.toLowerCase() === checkingPhone.toLowerCase() && supplier.phone !== initialData?.phone);
        //         if (isExistingPhone) {
        //             setValidPhone(false);
        //             setErrorPhone(`Số ${checkingPhone} đã tồn tại, vui lòng điền số điện thoại khác`);
        //         } else {
        //             setValidPhone(true);
        //             setErrorPhone("");
        //         }
        //         break;
        //     default:
        //         break;
        // }
        setForm((prev) => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.fullName === "" || form.email === "" || form.phone === "") {
            setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
            return;
        }
        const invalidForms = !validFullName || !validEmail || !validPhone;
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

    const formatImageUrl = (url) => typeof url === 'string' ? url : URL.createObjectURL(url);

    return (
        <Modal open={isOpen} onClose={onClose}>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-1/2 relative max-h-95/100 h-auto overflow-y-scroll scrollbar-hidden">
                    <div className="w-full background-primary text-white p-4 flex-row flex justify-between sticky top-0">
                        <h2 className="text-2xl font-bold my-auto">
                            Chỉnh sửa hồ sơ
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
                                <p className="text-xs text-gray-500">Chọn hình ảnh cho hồ sơ (JPG, PNG, GIF, WEBP)</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <label
                                    htmlFor="image"
                                    className="px-3 py-2 rounded-md background-primary text-white cursor-pointer"
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
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={(e) => handleFileChange(e.target.files?.[0])}
                                hidden
                            />
                            {form.image && (
                                <div className="mt-2 flex justify-center">
                                    <Image src={formatImageUrl(form.image)} alt="Preview" width={400} height={400} className="w-1/2 h-auto rounded-full aspect-square object-cover border border-black" />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300">
                            <div>
                                <label className="block text-md font-bold">Tên người dùng</label>
                                <p className="text-xs text-gray-500">Nhập tên đầy đủ của bạn</p>
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
                                <label className="block text-md font-bold">Email</label>
                                <p className="text-xs text-gray-500">Nhập Email của bạn</p>
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
                                <label className="block text-md font-bold">Số điện thoại</label>
                                <p className="text-xs text-gray-500">Nhập số điện thoại của bạn</p>
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
                        {error && <div className="text-red-600 text-md text-right">{error}</div>}
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer" onClick={onClose}>Hủy</button>
                            <button type="submit" className="px-4 py-2 rounded background-primary text-white background-hovered cursor-pointer">
                                Cập nhật
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}