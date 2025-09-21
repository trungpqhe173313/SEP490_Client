import React from "react";

const Header = () => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white shadow">
      {/* Left side: Logo */}
      <div className="flex items-center space-x-2">
        <span className="text-gray-700 font-semibold">NutriBarn</span>
      </div>

      {/* Right side: Icons and User */}
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span>Giao hàng</span>
        <span>Chủ đề</span>
        <span>Hỗ trợ</span>
        <span>Góp ý</span>
        <span>Giao diện cũ</span>
        <span>Tiếng Việt ▼</span>

        {/* Icons */}
        <i className="fab fa-youtube text-red-600"></i>
        <i className="far fa-bell"></i>
        <i className="fas fa-cog"></i>

        {/* Avatar */}
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
};

export default Header;
