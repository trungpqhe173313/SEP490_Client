'use client';
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/auth.service";
import ConfirmModal from "@/components/Modal/confirmModal";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLogin } from "@/context/LoginContext";
import Image from "next/image";
import { formatImageURL } from "@/lib/formattingLib";

const Header = () => {
  const router = useRouter();
  const [toggle, setToggle] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const { isLogin, user } = useLogin();
  const profileRef = useRef(null);

  useEffect(() => {
    if (!toggle) return;
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setToggle(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [toggle]);

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
          <p>Xin chào, {user.fullName}</p>
        }
        {isLogin == true ? (
          <div
            ref={profileRef}
            className="w-8 h-8 background-primary rounded-full flex items-center justify-center cursor-pointer relative"
            onClick={() => setToggle(!toggle)}
          >
            {user.image ?
              <Image
                src={formatImageURL(user.image)}
                alt="Profile"
                unoptimized
                onError={(e) => {
                  e.currentTarget.src = "/altImage.jpg";
                }}
                className="w-full h-full object-cover rounded-full"
              />
              :
              <AccountCircleIcon className="text-white" />}
            {toggle && (
              <div className="absolute top-10 right-0 bg-white shadow-md w-40 background-primary text-white">
                <div
                  className="cursor-pointer p-4  background-primary background-hovered text-white"
                  onClick={() => router.push("/profile")}
                >
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
