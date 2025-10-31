import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import { useState } from "react";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (path) => {
    router.push(path);
  };

  const [hovered, setHovered] = useState(null);
  const {setLoading} = useLoading();

  const goTo = (path) => {
    setLoading(true);
    navigate(path); 
  };

  const navItems = [
    {
      label: "Dashboard",
      subItems: ["Overview", "Stats", "Reports"],
    },
    {
      label: "Products",
      subItems: ["All Products", "Categories", "Add New"],
    },
    {
      label: "Settings",
      subItems: ["Profile", "Security", "Billing"],
    },
  ];

  return (
    <div className="fixed left-0 top-12 w-50 h-screen background-primary text-white flex flex-col gap-2 p-4">
      {/* Left side: Menu */}
      <span className={`${pathname === "/"
        ? "background-selected background-hovered px-3 py-2 rounded cursor-pointer"
        : "background-hovered px-3 py-2 rounded cursor-pointer"}`}
        onClick={() => navigate("/")}>
        Tổng quan
      </span>
      {/* <span className={`${pathname === "/warehouses"
        ? "background-selected background-hovered px-3 py-2 rounded cursor-pointer"
        : "background-hovered px-3 py-2 rounded cursor-pointer"}`} onClick={() => goTo("/warehouses")}>
        Nhà kho
      </span> */}
      <span className={`${pathname === "/products"
        ? "background-selected background-hovered px-3 py-2 rounded cursor-pointer"
        : "background-hovered px-3 py-2 rounded cursor-pointer"}`} onClick={() => goTo("/products")}>
        Hàng hóa
      </span>
      {/* <span className="background-selected px-3 py-2 rounded cursor-pointer">
          Đơn hàng
        </span> */}
      <span className={`${pathname === "/customers"
        ? "background-selected background-hovered px-3 py-2 rounded cursor-pointer"
        : "background-hovered px-3 py-2 rounded cursor-pointer"}`} onClick={() => goTo("/customers")}>
        Khách hàng
      </span>
      <span className={`${pathname === "/employees"
        ? "background-selected background-hovered px-3 py-2 rounded cursor-pointer"
        : "background-hovered px-3 py-2 rounded cursor-pointer"}`} onClick={() => goTo("/employees")}>
        Nhân viên
      </span>
      <span className={`${pathname === "/categories"
        ? "background-selected background-hovered px-3 py-2 rounded cursor-pointer"
        : "background-hovered px-3 py-2 rounded cursor-pointer"}`} onClick={() => goTo("/categories")}>
        Danh mục
      </span>
      {/* <span className="relative background-hovered px-3 py-2 rounded cursor-pointer">
          Báo cáo
          <span className="absolute top-0 right-0 bg-red-500 text-xs px-1 rounded-full">
            Mới
          </span>
        </span> */}
      <span className={`${pathname === "/suppliers"
        ? "background-selected background-hovered px-3 py-2 rounded cursor-pointer"
        : "background-hovered px-3 py-2 rounded cursor-pointer"}`} onClick={() => goTo("/suppliers")}>
        Nhà cung cấp
      </span>

      {/* Right side: Button */}
      {/* <button className="bg-white text-green-600 font-semibold px-4 py-2 rounded shadow">
        🛒 Bán hàng
      </button> */}
    </div>
  );
};

export default Navbar;
