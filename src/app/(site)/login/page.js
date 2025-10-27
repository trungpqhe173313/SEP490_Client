"use client";
import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/header";
import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import AuthService from "@/services/auth.service";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const router = useRouter();

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
        
        setModalMessage("Đăng nhập thành công!");
        setShowSuccessModal(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        setModalMessage(response.error || "Đăng nhập thất bại");
        setShowFailedModal(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          "Có lỗi xảy ra khi đăng nhập";
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
      {/* <header className="bg-white py-4 px-8 shadow-sm">
        <h1 className="text-xl font-bold">Ricehub</h1>
      </header> */}
      <Header/>
      <main className="flex-1 flex items-center justify-center px-4">
        <form onSubmit={handleSubmit} className="bg-white bg-opacity-95 rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-center mb-6">Đăng nhập</h2>

          <div className="mb-5">
            <label className="block font-medium mb-2">Tên tài khoản</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Nhập tên tài khoản"
                className="w-full border-b border-gray-300 pl-9 pb-2 focus:outline-none focus:border-gray-600"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block font-medium mb-2">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu"
                className="w-full border-b border-gray-300 pl-9 pr-9 pb-2 focus:outline-none focus:border-gray-600"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="flex justify-between text-sm text-gray-500 mt-2 mb-6">
            <a href="#" className="hover:underline">
              Quên mật khẩu ?
            </a>
            <a href="#" className="hover:underline">
              Chưa có tài khoản?
            </a>
          </div>

          {/* Submit */}
          <button 
            type="submit"
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
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
