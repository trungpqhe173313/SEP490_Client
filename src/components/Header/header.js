'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/auth.service";
import ConfirmModal from "@/components/Modal/confirmModal";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLogin } from "@/context/LoginContext";

const Header = () => {
  const router = useRouter();
  const [toggle, setToggle] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const { isLogin, user, refreshUserInfo } = useLogin();


  const handleLogOut = () => {
    authService.logout();
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white shadow h-15">
      <div className="flex items-center space-x-2">
        <span className="text-gray-700 font-semibold">NutriBarn</span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        {isLogin &&
          <p>Xin chào, {user.username}</p>
        }
        {isLogin == true ? (
          <div
            className="w-8 h-8 background-primary rounded-full flex items-center justify-center cursor-pointer relative"
            onClick={() => setToggle(!toggle)}
          >
            <AccountCircleIcon className="text-white" />
            {toggle && (
              <div className="absolute top-10 right-0 bg-white shadow-md w-40 background-primary text-white">
                <div className="cursor-pointer p-4  background-primary background-hovered text-white">
                  <span>Hồ sơ</span>
                </div>
                <div
                  className="cursor-pointer p-4 background-primary background-hovered text-white"
                  onClick={() => setOpenModal(true)}
                >
                  <span>Đăng xuất</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            className="background-primary text-white rounded-md px-4 py-2 hover:background-selected transition-all duration-300 ease-in-out cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Đăng nhập
          </button>
        )}
      </div>
      <ConfirmModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={() => handleLogOut()}
        onCancel={() => setOpenModal(false)}
        message="Bạn có muốn đăng xuất không?"
      />
    </div>
  );
};

export default Header;
