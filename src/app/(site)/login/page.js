"use client";
import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import AuthService from "@/services/auth.service";
import { useLogin } from "@/context/LoginContext";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const router = useRouter();
  const { refreshUserInfo } = useLogin();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.username.trim() || !formData.password.trim()) {
      setModalMessage("Vui lòng nhập đầy đủ thông tin đăng nhập");
      setShowFailedModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.login(formData.username, formData.password);

      if (response.success) {
        // Store authentication data using service
        AuthService.storeAuthData(response.data);

        // Refresh user info in context
        refreshUserInfo();
        setRoles(response.data.userInfo.roles);
        setModalMessage("Đăng nhập thành công!");
        setShowSuccessModal(true);

        // Redirect after a short delay
        // setTimeout(() => {
        //   router.push("/");
        // }, 1500);
      } else {
        // Handle case when API returns success: false
        const errorMessage = response?.error?.message ||
          (typeof response?.error === 'string' ? response.error : null) ||
          response?.message ||
          "Đăng nhập thất bại";
        setModalMessage(errorMessage);
        setShowFailedModal(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      // Handle error response from API
      const errorData = error.response?.data;
      const errorMessage = errorData?.error?.message ||
        (typeof errorData?.error === 'string' ? errorData.error : null) ||
        errorData?.message ||
        error.message ||
        "Có lỗi xảy ra khi đăng nhập";
      setModalMessage(errorMessage);
      setShowFailedModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExit = () => {
    switch (roles[0]) {
      case 'Admin':
        router.push('/management/accounts');
        break;
      case 'Manager':
        router.push('/dashboard');
        break;
      case 'Customer':
        router.push('/order-history');
        break;
      default:
        router.push('/');
        break;
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
      {/* <header className="bg-white py-4 px-8 shadow-sm">
        <h1 className="text-xl font-bold">Ricehub</h1>
      </header> */}
      <main className="flex-1 flex items-center justify-center px-4">
        <form onSubmit={handleSubmit} className="bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-xl p-10 w-full max-w-md">
          {/* Title with serif font */}
          <h2 className="text-3xl font-serif text-center mb-8 text-black">Đăng nhập</h2>

          {/* Username Field */}
          <div className="mb-6">
            <label className="block font-medium mb-3 text-black">Tên tài khoản</label>
            <div className="relative">
              <User className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Nhập tên tài khoản"
                className="w-full border-0 border-b-2 border-gray-300 pl-8 pb-3 bg-transparent focus:outline-none focus:border-gray-600 placeholder:text-gray-400 text-black"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label className="block font-medium mb-3 text-black">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu"
                className="w-full border-0 border-b-2 border-gray-300 pl-8 pr-8 pb-3 bg-transparent focus:outline-none focus:border-gray-600 placeholder:text-gray-400 text-black"
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

          {/* Links */}
          <div className="flex justify-between text-sm mt-3 mb-8">
            <Link href="/forgot-password" className="text-black hover:underline">
              Quên mật khẩu ?
            </Link>
            {/* <Link href="#" className="text-black hover:underline">
              Chưa có tài khoản?
            </Link> */}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-4 rounded-lg font-semibold uppercase tracking-wide shadow-lg hover:bg-gray-900 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
          </button>
        </form>
      </main>

      {/* Modals */}
      <SuccessModal
        isOpen={showSuccessModal}
        message={modalMessage}
        onClose={() => { setShowSuccessModal(false), handleExit() }}
      />

      <FailedModal
        isOpen={showFailedModal}
        message={modalMessage}
        onClose={() => setShowFailedModal(false)}
      />
    </div>
  );
}
