"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import AuthService from "@/services/auth.service";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyOtpPage({ params }) {
	const { emailParam } = React.use(params);
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [showFailedModal, setShowFailedModal] = useState(false);
	const [modalMessage, setModalMessage] = useState("");

	useEffect(() => {
		if (emailParam) setEmail(decodeURIComponent(emailParam));
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!email.trim() || !otp.trim()) {
			setModalMessage("Vui lòng nhập đầy đủ thông tin");
			setShowFailedModal(true);
			return;
		}

		setIsLoading(true);
		try {
			const verifyRes = await AuthService.verifyOtp({
				email: email.trim(),
				otpCode: otp.trim()
			});

			if (verifyRes?.success === false) {
				const errorMessage = verifyRes?.error?.message || 
				                    (typeof verifyRes?.error === 'string' ? verifyRes.error : null) ||
				                    verifyRes?.message ||
				                    "OTP không hợp lệ";
				setModalMessage(errorMessage);
				setShowFailedModal(true);
				return;
			}

			// Lấy resetToken từ response
			const resetToken =
				verifyRes?.data?.resetToken ??
				verifyRes?.data?.token ??
				verifyRes?.resetToken ??
				verifyRes?.token ??
				(typeof verifyRes?.data === "string" ? verifyRes.data : undefined);

			if (!resetToken) {
				setModalMessage("Không nhận được reset token từ hệ thống");
				setShowFailedModal(true);
				return;
			}

			// Lưu resetToken vào localStorage để trang reset-password sử dụng
			localStorage.setItem("resetToken", resetToken);
			localStorage.setItem("resetEmail", email.trim());

			setModalMessage("Xác nhận OTP thành công!");
			setShowSuccessModal(true);
			setTimeout(() => {
				router.push("/reset-password");
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

	const handleResendOtp = async () => {
		if (!email.trim()) {
			setModalMessage("Vui lòng nhập email");
			setShowFailedModal(true);
			return;
		}

		setIsLoading(true);
		try {
			const res = await AuthService.requestPasswordReset(email.trim());
			if (res?.success) {
				setModalMessage("Đã gửi lại mã OTP. Vui lòng kiểm tra email.");
				setShowSuccessModal(true);
			} else {
				const errorMessage = res?.error?.message || 
				                    (typeof res?.error === 'string' ? res.error : null) ||
				                    res?.message ||
				                    "Không thể gửi lại mã OTP";
				setModalMessage(errorMessage);
				setShowFailedModal(true);
			}
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
					<h2 className="text-3xl font-serif text-center mb-8 text-black">Xác nhận OTP</h2>

					<div className="mb-6">
						<label className="block font-medium mb-3 text-black">Email</label>
						<input
							type="text"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Nhập email"
							className="w-full border-0 border-b-2 border-gray-300 pb-3 bg-transparent focus:outline-none focus:border-gray-600 placeholder:text-gray-400 text-black"
							disabled={isLoading}
						/>
					</div>

					<div className="mb-6">
						<label className="block font-medium mb-3 text-black">Mã OTP</label>
						<input
							type="text"
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
							placeholder="Nhập mã OTP"
							className="w-full border-0 border-b-2 border-gray-300 pb-3 bg-transparent focus:outline-none focus:border-gray-600 placeholder:text-gray-400 text-black"
							disabled={isLoading}
						/>
					</div>

					<div className="mb-6 text-sm text-center">
						<span className="text-black">Không nhận được mã? </span>
						<button
							type="button"
							onClick={handleResendOtp}
							className="text-blue-600 hover:underline"
							disabled={isLoading}
						>
							Gửi lại mã
						</button>
					</div>

					<button
						type="submit"
						className="w-full bg-gray-800 text-white py-4 rounded-lg font-semibold uppercase tracking-wide shadow-lg hover:bg-gray-900 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
						disabled={isLoading}
					>
						{isLoading ? "ĐANG XÁC NHẬN..." : "XÁC NHẬN OTP"}
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

