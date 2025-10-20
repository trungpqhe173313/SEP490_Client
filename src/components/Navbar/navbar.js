import React from "react";
import { useNavigate } from "react-router-dom";
import { usePathname, useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (path) => {
    router.push(path);
  };

  return (
    <div className="flex items-center justify-between px-6 py-2 bg-green-600 text-white">
      {/* Left side: Menu */}
      <div className="flex space-x-6 text-sm font-medium">
        <span className={`${pathname === "/" 
            ? "bg-green-800 hover:bg-green-700 px-3 py-1 rounded cursor-pointer" 
            : "hover:bg-green-700 px-3 py-1 rounded cursor-pointer"}`}
            onClick={() => navigate("/")}>
          Tổng quan
        </span>
        <span className={`${pathname === "/products" 
            ? "bg-green-800 hover:bg-green-700 px-3 py-1 rounded cursor-pointer" 
            : "hover:bg-green-700 px-3 py-1 rounded cursor-pointer"}`} onClick={() => navigate("/products")}>
          Hàng hóa
        </span>
        {/* <span className="bg-green-800 px-3 py-1 rounded cursor-pointer">
          Đơn hàng
        </span> */}
        <span className={`${pathname === "/customers" 
            ? "bg-green-800 hover:bg-green-700 px-3 py-1 rounded cursor-pointer" 
            : "hover:bg-green-700 px-3 py-1 rounded cursor-pointer"}`} onClick={() => navigate("/customers")}>
          Khách hàng
        </span>
        <span className={`${pathname === "/employees" 
            ? "bg-green-800 hover:bg-green-700 px-3 py-1 rounded cursor-pointer" 
            : "hover:bg-green-700 px-3 py-1 rounded cursor-pointer"}`} onClick={() => navigate("/employees")}>
          Nhân viên
        </span>
        <span className={`${pathname === "/categories" 
            ? "bg-green-800 hover:bg-green-700 px-3 py-1 rounded cursor-pointer" 
            : "hover:bg-green-700 px-3 py-1 rounded cursor-pointer"}`} onClick={() => navigate("/categories")}>
          Danh mục
        </span>
        {/* <span className="relative hover:bg-green-700 px-3 py-1 rounded cursor-pointer">
          Báo cáo
          <span className="absolute top-0 right-0 bg-red-500 text-xs px-1 rounded-full">
            Mới
          </span>
        </span> */}
        <span className={`${pathname === "/suppliers" 
            ? "bg-green-800 hover:bg-green-700 px-3 py-1 rounded cursor-pointer" 
            : "hover:bg-green-700 px-3 py-1 rounded cursor-pointer"}`} onClick={() => navigate("/suppliers")}>
          Nhà cung cấp
        </span>
      </div>

      {/* Right side: Button */}
      {/* <button className="bg-white text-green-600 font-semibold px-4 py-1 rounded shadow">
        🛒 Bán hàng
      </button> */}
    </div>
  );
};

export default Navbar;
