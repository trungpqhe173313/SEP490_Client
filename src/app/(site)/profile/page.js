'use client';
import React, { useState, useEffect } from 'react';
import authService from '@/services/auth.service';
import { useLoading } from '@/context/LoadingContext';
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader/loader";

import SuccessModal from "@/components/Modal/successModal";
import FailedModal from "@/components/Modal/failedModal";
import { ProfileForm } from "@/components/Form/profileForm";
import { PasswordForm } from "@/components/Form/passwordForm";
import Image from 'next/image';
import { formatImageURL } from '@/lib/formattingLib';

export default function ProfilePage() {
  const [profile, setProfile] = useState({});
  const { loading, setLoading } = useLoading();
  const router = useRouter();
  const { isLogin, refreshUserInfo } = useLogin();
  const [pageReady, setPageReady] = useState(false);
  const [modalProfileOpen, setModalProfileOpen] = useState(false);
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
  const [modalSuccessMessage, setModalSuccessMessage] = useState("");
  const [modalFailedOpen, setModalFailedOpen] = useState(false);
  const [modalFailedMessage, setModalFailedMessage] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!isLogin) {
      router.push("/login");
      return;
    }
    setPageReady(true);
  }, [isLogin, loading]);


  useEffect(() => {
    if (!pageReady) return;
    fetchProfile();
  }, [pageReady]);

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await authService.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (passwordData) => {
    setLoading(true);
    try {
      const response = await authService.updatePassword(passwordData);
      setModalSuccessMessage("Cập nhật mật khẩu thành công, vui lòng đăng nhập lại");
      setModalSuccessOpen(true);
      authService.logout();
    } catch (error) {
      setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message}`);
      setModalFailedOpen(true);
    } finally {
      setLoading(false);
    }
  }

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const response = await authService.updateProfile(profileData);
      setModalSuccessMessage("Cập nhật hồ sơ cá nhân thành công");
      setModalSuccessOpen(true);
      fetchProfile();
    } catch (error) {
      setModalFailedMessage(`Lỗi: ${error?.response?.data?.error?.message}`);
      setModalFailedOpen(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (loading) return;
    if (modalSuccessOpen === false && modalSuccessMessage === "Cập nhật mật khẩu thành công, vui lòng đăng nhập lại") {
      router.push("/login");
    }
  }, [modalSuccessOpen])

  if (!pageReady) return <Loader />

  return (
    <div className='flex flex-col gap-4 w-full py-8 px-4'>
      <div className='w-full bg-white p-4 rounded-xl flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Hồ sơ cá nhân</h1>
      </div>

      <div className="w-full bg-white p-4 rounded-xl grid grid-cols-3 gap-4">
        <div className="col-span-1 flex flex-col items-center justify-center gap-4">
          {profile.image ?
            <Image src={formatImageURL(profile.image)} alt="Ảnh hồ sơ" className="w-80 aspect-square object-cover rounded-full border border-black" width={600} height={600}
              unoptimized
              onError={(e) => {
                e.currentTarget.src = "/altImage.jpg";
              }}
            />
            :
            <Image src="/altImage.jpg" alt="Ảnh hồ sơ" className="w-80 aspect-square object-cover rounded-full border border-black" width={600} height={600} />
          }
          <div className="flex gap-4">
            <button className='background-primary text-white px-4 py-2 rounded-md' onClick={() => setModalProfileOpen(true)}>Chỉnh sửa hồ sơ</button>
            <button className='bg-blue-600 text-white px-4 py-2 rounded-md' onClick={() => setModalPasswordOpen(true)}>Đổi mật khẩu</button>
          </div>
        </div>
        <div className="col-span-1">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="p-4">Mã người dùng</td>
                <td className="p-4 w-6/10">{profile.id}</td>
              </tr>
              <tr>
                <td className="p-4">Tên người dùng</td>
                <td className="p-4 w-6/10">{profile.fullName}</td>
              </tr>
              <tr>
                <td className="p-4">Email</td>
                <td className="p-4 w-6/10">{profile.email}</td>
              </tr>
              <tr>
                <td className="p-4">Số điện thoại</td>
                <td className="p-4 w-6/10">{profile.phone}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <PasswordForm isOpen={modalPasswordOpen} onClose={() => setModalPasswordOpen(false)} onConfirm={updatePassword} />
      <ProfileForm isOpen={modalProfileOpen} onClose={() => setModalProfileOpen(false)} onConfirm={updateProfile} initialData={profile} />
      <SuccessModal isOpen={modalSuccessOpen} message={modalSuccessMessage} onClose={() => setModalSuccessOpen(false)} />
      <FailedModal isOpen={modalFailedOpen} message={modalFailedMessage} onClose={() => setModalFailedOpen(false)} />
    </div>
  )
}

