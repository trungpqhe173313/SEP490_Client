import { useState } from "react";
import { Modal } from "@mui/material";
import { Eye, EyeOff } from "lucide-react";

export function PasswordForm({
    isOpen,
    onClose,
    onConfirm,
}) {
    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    //Validation
    const [validNewPassword, setValidNewPassword] = useState(true);
    const [validConfirmPassword, setValidConfirmPassword] = useState(true);

    const [errorNewPassword, setErrorNewPassword] = useState("");
    const [errorConfirmPassword, setErrorConfirmPassword] = useState("");

    const handleChange = (name, value) => {
        let newValue = value;
        switch (name) {
            case "newPassword":
                const checkingPassword = value.trim();
                const regex = /^(?!.*\s)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\.-])[A-Za-z\d@$!%*?&_\.-]{8,}$/;
                if (!regex.test(checkingPassword)) {
                    setValidNewPassword(false);
                    setErrorNewPassword("Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường, số và 1 trong các ký tự sau: @ $ ! % * ? & _ . -");
                } else {
                    setValidNewPassword(true);
                    setErrorNewPassword("");
                }
                if (checkingPassword!== form.confirmPassword) {
                    setValidConfirmPassword(false);
                    setErrorConfirmPassword("Mật khẩu không trùng khớp");
                } else {
                    setValidConfirmPassword(true);
                    setErrorConfirmPassword("");
                }
                break;
            case "confirmPassword":
                const checkingConfirmPassword = value.trim();
                if (form.newPassword !== checkingConfirmPassword) {
                    setValidConfirmPassword(false);
                    setErrorConfirmPassword("Mật khẩu không trùng khớp");
                } else {
                    setValidConfirmPassword(true);
                    setErrorConfirmPassword("");
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
        if (form.oldPassword === "" || form.newPassword === "" || form.confirmPassword === "") {
            setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
            return;
        }
        const invalidForms = !validNewPassword || !validConfirmPassword;
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
                            Đổi mật khẩu
                        </h2>
                        <button className="text-white cursor-pointer bg-red-600 hover:bg-red-700 p-1" onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4 p-8">
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300 relative">
                            <label className="block text-md font-bold">Mật khẩu hiện tại</label>
                            <input
                                type={showOldPassword ? "text" : "password"}
                                name="oldPassword"
                                value={form.oldPassword}
                                onChange={(e) => handleChange("oldPassword", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-7 top-2/3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showOldPassword ? <EyeOff size={25} /> : <Eye size={25} />}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300 relative">
                            <label className="block text-md font-bold">Mật khẩu mới</label>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={form.newPassword}
                                onChange={(e) => handleChange("newPassword", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2 ${!validNewPassword ? "border-red-500" : "border-green-500"}`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-7 top-2/3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showNewPassword ? <EyeOff size={25} /> : <Eye size={25} />}
                            </button>
                        </div>
                        {errorNewPassword && <p className="text-red-500 text-sm italic">{errorNewPassword}</p>}
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded p-4 border border-gray-300 relative">
                            <label className="block text-md font-bold">Xác nhận mật khẩu mới</label>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                className={`w-full bg-white border rounded px-3 py-2 ${!validConfirmPassword ? "border-red-500" : "border-green-500"}`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-7 top-2/3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff size={25} /> : <Eye size={25} />}
                            </button>
                        </div>
                        {errorConfirmPassword && <p className="text-red-500 text-sm italic">{errorConfirmPassword}</p>}
                        {error && <div className="text-red-600 text-md text-right">{error}</div>}
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer" onClick={onClose}>Hủy</button>
                            <button type="submit" className="px-4 py-2 rounded background-primary text-white background-hovered cursor-pointer">
                                Thay đổi
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}