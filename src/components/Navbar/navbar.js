import React from "react";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between px-6 py-2 bg-blue-600 text-white">
      {/* Left side: Menu */}
      <div className="flex space-x-6 text-sm font-medium">
        <span className="hover:bg-blue-700 px-3 py-1 rounded cursor-pointer">
          Tổng quan
        </span>
        <span className="hover:bg-blue-700 px-3 py-1 rounded cursor-pointer">
          Hàng hóa
        </span>
        <span className="bg-blue-800 px-3 py-1 rounded cursor-pointer">
          Đơn hàng
        </span>
        <span className="hover:bg-blue-700 px-3 py-1 rounded cursor-pointer">
          Khách hàng
        </span>
        <span className="hover:bg-blue-700 px-3 py-1 rounded cursor-pointer">
          Nhân viên
        </span>
        <span className="hover:bg-blue-700 px-3 py-1 rounded cursor-pointer">
          Sổ quỹ
        </span>
        <span className="relative hover:bg-blue-700 px-3 py-1 rounded cursor-pointer">
          Báo cáo
          <span className="absolute top-0 right-0 bg-red-500 text-xs px-1 rounded-full">
            Mới
          </span>
        </span>
        <span className="hover:bg-blue-700 px-3 py-1 rounded cursor-pointer">
          Bán online
        </span>
      </div>

      {/* Right side: Button */}
      <button className="bg-white text-blue-600 font-semibold px-4 py-1 rounded shadow">
        🛒 Bán hàng
      </button>
    </div>
  );
};

export default Navbar;
