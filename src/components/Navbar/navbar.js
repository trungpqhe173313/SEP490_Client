import React from "react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import { useState } from "react";

const Navbar = () => {
  const router = useRouter();

  const navigate = (path) => {
    router.push(path);
  };

  const [hovered, setHovered] = useState(null);
  const { setLoading } = useLoading();

  const goTo = (path) => {
    setLoading(true);
    navigate(path);
    if (path === "/") {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const navItems = [
    {
      label: "Tổng quan",
      subItems: [
        {
          name: "Trang chủ",
          link: "/",
          role: "all"
        },
        {
          name: "Thống kê",
          link: "/dashboard",
          role: "admin"
        }
      ],
    },
    {
      label: "Hàng hóa",
      subItems: [
        {
          name: "Sản phẩm",
          link: "/products",
          role: "all"
        },
        {
          name: "Danh mục",
          link: "/categories",
          role: "all"
        },
      ]
    },
    {
      label: "Nhân sự",
      subItems: [
        {
          name: "Nhân viên",
          link: "/employees",
          role: "all"
        }
      ],
    },
    {
      label: "Đối tác",
      subItems: [
        {
          name: "Khách hàng",
          link: "/customers",
          role: "all"
        },
        {
          name: "Nhà cung cấp",
          link: "/suppliers",
          role: "all"
        }
      ],
    },
    {
      label: "Kho",
      subItems: [
        {
          name: "Kiểm kho",
          link: "/warehouses",
          role: "all"
        },
        {
          name: "Nhập kho",
          link: "/imports",
          role: "all"
        },
        {
          name: "Xuất kho",
          link: "/exports",
          role: "all"
        }
      ],
    }
  ];

  return (
    <div className="fixed left-0 top-12 w-50 h-screen background-primary text-white flex flex-col gap-2 py-4 pl-4">
      {navItems.map((item, index) => (
        <div
          key={index}
          className="background-primary hover:bg-green-800 px-3 py-2 cursor-pointer relative"
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(null)}
        >
          <span className="font-bold">{item.label}</span>
          {hovered === index && (
            <div
              className={`top-0 absolute left-full background-selected text-white shadow-lg py-2 w-40 z-20 animate-fade-in`}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            >
              {item.subItems.map((sub) => (
                <div
                  key={sub.name}
                  className="px-4 py-2 hover:bg-green-600 cursor-pointer text-sm"
                  onClick={() => goTo(sub.link)}
                >
                  {sub.name}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Left side: Menu */}
      {/* <span className={`${pathname === "/"
        ? "background-selected background-hovered px-3 py-2 rounded cursor-pointer"
        : "background-hovered px-3 py-2 rounded cursor-pointer"}`}
        onClick={() => navigate("/")}>
        Tổng quan
      </span>
      <span className={`${pathname === "/warehouses"
        ? "background-selected background-hovered px-3 py-2 rounded cursor-pointer"
        : "background-hovered px-3 py-2 rounded cursor-pointer"}`} onClick={() => goTo("/warehouses")}>
        Nhà kho
      </span>
      <span className={`${pathname === "/products"
        ? "background-selected background-hovered px-3 py-2 rounded cursor-pointer"
        : "background-hovered px-3 py-2 rounded cursor-pointer"}`} onClick={() => goTo("/products")}>
        Hàng hóa
      </span>

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
      <span className="background-selected px-3 py-2 rounded cursor-pointer">
          Đơn hàng
        </span>
      <span className="relative background-hovered px-3 py-2 rounded cursor-pointer">
          Báo cáo
          <span className="absolute top-0 right-0 bg-red-500 text-xs px-1 rounded-full">
            Mới
          </span>
        </span>
      <span className={`${pathname === "/suppliers"
        ? "background-selected background-hovered px-3 py-2 rounded cursor-pointer"
        : "background-hovered px-3 py-2 rounded cursor-pointer"}`} onClick={() => goTo("/suppliers")}>
        Nhà cung cấp
      </span> */}

      {/* Right side: Button */}
      {/* <button className="bg-white text-green-600 font-semibold px-4 py-2 rounded shadow">
        🛒 Bán hàng
      </button> */}
    </div>
  );
};

export default Navbar;
