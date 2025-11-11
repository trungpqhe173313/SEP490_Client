"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import AuthService from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
	const router = useRouter();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [showFailedModal, setShowFailedModal] = useState(false);
	const [modalMessage, setModalMessage] = useState("");

	useEffect(() => {
		// Kiểm tra xem có resetToken trong localStorage không
		const resetToken = localStorage.getItem("resetToken");
		if (!resetToken) {
			// Nếu không có resetToken, redirect về forgot-password
			setModalMessage("Vui lòng xác nhận OTP trước");
			setShowFailedModal(true);
			setTimeout(() => {
				router.push("/forgot-password");
			}, 2000);
		}
	}, [router]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		const resetToken = localStorage.getItem("resetToken");
		if (!resetToken) {
			setModalMessage("Vui lòng xác nhận OTP trước");
			setShowFailedModal(true);
			router.push("/forgot-password");
			return;
		}

		if (!password.trim() || !confirmPassword.trim()) {
			setModalMessage("Vui lòng nhập đầy đủ thông tin");
			setShowFailedModal(true);
			return;
		}
		if (password !== confirmPassword) {
			setModalMessage("Mật khẩu xác nhận không khớp");
			setShowFailedModal(true);
			return;
		}
		if (password.length < 6) {
			setModalMessage("Mật khẩu tối thiểu 6 ký tự");
			setShowFailedModal(true);
			return;
		}

		setIsLoading(true);
		try {
			const resetRes = await AuthService.resetPassword({
				resetToken,
				newPassword: password
			});

			if (resetRes?.success === false) {
				const errorMessage = resetRes?.error?.message || 
				                    (typeof resetRes?.error === 'string' ? resetRes.error : null) ||
				                    resetRes?.message ||
				                    "Đổi mật khẩu thất bại";
				setModalMessage(errorMessage);
				setShowFailedModal(true);
				return;
			}

			// Xóa resetToken sau khi đổi mật khẩu thành công
			localStorage.removeItem("resetToken");
			localStorage.removeItem("resetEmail");

			setModalMessage("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
			setShowSuccessModal(true);
			setTimeout(() => {
				router.push("/login");
			}, 1200);
		} catch (err) {
			const errorData = err.response?.data;
			const errorMessage = errorData?.error?.message || 
			                    (typeof errorData?.error === 'string' ? errorData.error : null) ||
			                    errorData?.message ||
			                    err.message ||
			                    "Có lỗi xảy ra";
			setModalMessage(errorMessage);
			setShowFailedModal(true);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative min-h-screen flex flex-col">
			<Image
				src="/backgroud.jpg"
				alt="Background"
				fill
				priority
				className="object-cover object-center -z-10"
			/>
			<main className="flex-1 flex items-center justify-center px-4">
				<form onSubmit={handleSubmit} className="bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-xl p-10 w-full max-w-md">
					<h2 className="text-3xl font-serif text-center mb-8 text-black">Đặt mật khẩu mới</h2>

					<div className="mb-6">
						<label className="block font-medium mb-3 text-black">Mật khẩu mới</label>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Nhập mật khẩu mới"
								className="w-full border-0 border-b-2 border-gray-300 pr-8 pb-3 bg-transparent focus:outline-none focus:border-gray-600 placeholder:text-gray-400 text-black"
								disabled={isLoading}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
								disabled={isLoading}
							>
								{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					<div className="mb-8">
						<label className="block font-medium mb-3 text-black">Xác nhận mật khẩu</label>
						<div className="relative">
							<input
								type={showConfirmPassword ? "text" : "password"}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Nhập lại mật khẩu"
								className="w-full border-0 border-b-2 border-gray-300 pr-8 pb-3 bg-transparent focus:outline-none focus:border-gray-600 placeholder:text-gray-400 text-black"
								disabled={isLoading}
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
								disabled={isLoading}
							>
								{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					<button
						type="submit"
						className="w-full bg-gray-800 text-white py-4 rounded-lg font-semibold uppercase tracking-wide shadow-lg hover:bg-gray-900 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
						disabled={isLoading}
					>
						{isLoading ? "ĐANG XÁC NHẬN..." : "XÁC NHẬN & ĐỔI MẬT KHẨU"}
					</button>
				</form>
			</main>

			<SuccessModal
				isOpen={showSuccessModal}
				message={modalMessage}
				onClose={() => setShowSuccessModal(false)}
			/>
			<FailedModal
				isOpen={showFailedModal}
				message={modalMessage}
				onClose={() => setShowFailedModal(false)}
			/>
		</div>
	);
}

