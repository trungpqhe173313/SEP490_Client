import React from "react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import { useState } from "react";
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import HomeIcon from '@mui/icons-material/Home';
import AlignHorizontalLeftIcon from '@mui/icons-material/AlignHorizontalLeft';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CategoryIcon from '@mui/icons-material/Category';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import LaunchIcon from '@mui/icons-material/Launch';
import FactoryIcon from '@mui/icons-material/Factory';


const Navbar = () => {
  const router = useRouter();

  const navigate = (path) => {
    setLoading(true);
    router.push(path);
  };

  const [hovered, setHovered] = useState(null);
  const { setLoading } = useLoading();

  const navItems = [
    {
      label: "Tổng quan",
      icon: <DashboardIcon />,
      subItems: [
        {
          name: "Trang chủ",
          link: "/",
          role: "all",
          icon: <HomeIcon />
        },
        {
          name: "Thống kê",
          link: "/dashboard",
          role: "admin",
          icon: <AlignHorizontalLeftIcon />
        }
      ]
    },
    {
      label: "Hàng hóa",
      icon: <InventoryIcon />,
      subItems: [
        {
          name: "Sản phẩm",
          link: "/products",
          role: "all",
          icon: <ListAltIcon />
        },
        {
          name: "Danh mục",
          link: "/categories",
          role: "all",
          icon: <CategoryIcon />
        },
      ]
    },
    {
      label: "Nhân sự",
      icon: <AssignmentIcon />,
      subItems: [
        {
          name: "Nhân viên",
          link: "/employees",
          role: "all",
          icon: <AccessibilityNewIcon />
        }
      ],
    },
    {
      label: "Đối tác",
      icon: <PeopleIcon />,
      subItems: [
        {
          name: "Khách hàng",
          link: "/customers",
          role: "all",
          icon: <EmojiPeopleIcon />
        },
        {
          name: "Nhà cung cấp",
          link: "/suppliers",
          role: "all",
          icon: <PermContactCalendarIcon />
        }
      ],
    },
    {
      label: "Kho",
      icon: <WarehouseIcon />,
      subItems: [
        {
          name: "Kiểm kho",
          link: "/warehouses",
          role: "all",
          icon: <ContentPasteSearchIcon />
        },
        {
          name: "Nhập kho",
          link: "/imports",
          role: "all",
          icon: <AddShoppingCartIcon />
        },
        {
          name: "Xuất kho",
          link: "/exports",
          role: "all",
          icon: <LaunchIcon />
        }
      ],
    }
  ];

  return (
    <div className="fixed left-0 top-12 w-50 h-screen background-primary text-white flex flex-col gap-2 py-4 pl-4">
      {navItems.map((item, index) => (
        <div
          key={index}
          className="background-primary hover:bg-green-800 px-3 py-2 cursor-pointer relative flex items-center gap-2"
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(null)}
        >
          {item.icon}
          <span className="font-bold">{item.label}</span>
          {hovered === index && (
            <div
              className={`top-0 absolute left-full background-selected text-white shadow-lg w-40 z-20 animate-fade-in`}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            >
              {item.subItems.map((sub) => (
                <div
                  key={sub.name}
                  className="px-4 py-2 hover:bg-green-600 cursor-pointer text-sm flex items-center gap-2"
                  onClick={() => navigate(sub.link)}
                >
                  {sub.icon}
                  {sub.name}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Navbar;
