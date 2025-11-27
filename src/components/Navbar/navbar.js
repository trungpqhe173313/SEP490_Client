import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLogin } from "@/context/LoginContext";
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
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import FactoryIcon from '@mui/icons-material/Factory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddchartIcon from '@mui/icons-material/Addchart';
import ForestIcon from '@mui/icons-material/Forest';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import AssignmentAddIcon from '@mui/icons-material/AssignmentAdd';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import BentoIcon from '@mui/icons-material/Bento';
import SyncAltIcon from '@mui/icons-material/SyncAlt';

const Navbar = () => {
  const router = useRouter();
  const { user } = useLogin();

  const navigate = (path) => {
    router.push(path);
  };

  const [hovered, setHovered] = useState(null);

  const isShown = (role) => {
    if (role.includes("All")) {
      return true;
    }
    return user?.roles?.some((r) => role.includes(r));
  };

  const navItems = [
    {
      label: "Tổng quan",
      icon: <DashboardIcon />,
      subItems: [
        {
          name: "Trang chủ",
          link: "/",
          role: ["All", "Manager", "Admin"],
          icon: <HomeIcon />
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
          role: ["Manager"],
          icon: <ListAltIcon />
        },
        {
          name: "Danh mục",
          link: "/categories",
          role: ["Manager"],
          icon: <CategoryIcon />
        },
        // {
        //   name: "Nguyên liệu",
        //   link: "/materials",
        //   role: "all",
        //   icon: <ForestIcon />
        //},
        {
          name: "Bảng giá",
          link: "/price-list",
          role: ["Manager"],
          icon: <AccountBalanceWalletIcon />
        }
      ]
    },
    {
      label: "Nhân sự",
      icon: <AssignmentIcon />,
      subItems: [
        {
          name: "Nhân viên",
          link: "/employees",
          role: ["Manager"],
          icon: <AccessibilityNewIcon />
        },
        {
          name: "Chấm công",
          link: "/worklogs",
          role: ["Manager"],
          icon: <CalendarMonthIcon />
        },
        // {
        //   name: "Chấm công",
        //   link: "/worklogs/check-in",
        //   role: ["Manager"],
        //   icon: <CalendarMonthIcon />
        // },
        {
          name: "Bảng lương",
          link: "/payrolls",
          role: ["Manager"],
          icon: <AddchartIcon />
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
          role: ["Manager"],
          icon: <EmojiPeopleIcon />
        },
        {
          name: "Nhà cung cấp",
          link: "/suppliers",
          role: ["Manager"],
          icon: <PermContactCalendarIcon />
        },
        {
          name: "Hợp đồng",
          link: "/contracts",
          role: ["Manager"],
          icon: <NoteAltIcon />
        }
      ],
    },
    {
      label: "Kho",
      icon: <WarehouseIcon />,
      subItems: [
        {
          name: "Tồn kho",
          link: "/inventory",
          role: ["Manager"],
          icon: <BentoIcon />
        },
        {
          name: "Nhập kho",
          link: "/imports",
          role: ["Manager"],
          icon: <AddShoppingCartIcon />
        },
        {
          name: "Xuất kho",
          link: "/exports",
          role: ["Manager"],
          icon: <LaunchIcon />
        },
        {
          name: "Kiểm kho",
          link: "/stock-adjustment",
          role: ["Manager"],
          icon: <ContentPasteSearchIcon />
        },
        {
          name: "Trả hàng nhập kho",
          link: "/returns/import",
          role: ["Manager"],
          icon: <AirportShuttleIcon/>
        },
        {
          name: "Trả hàng xuất kho",
          link: "/returns/export",
          role: ["Manager"],
          icon: <AssignmentReturnIcon />
        },
        {
          name: "Sản xuất",
          link: "/productions",
          role: ["Manager"],
          icon: <FactoryIcon />
        },
        {
          name: "Chuyển kho",
          link: "/transfers",
          role: ["Manager"],
          icon: <SyncAltIcon />
        }
      ],
    },
    {
      label: "Giao dịch",
      icon: <ShoppingCartIcon />,
      subItems: [
        // {
        //   name: "Thu",
        //   link: "/incomes",
        //   role: "all",
        //   icon: <AttachMoneyIcon />
        // },
        // {
        //   name: "Chi",
        //   link: "/expenses",
        //   role: "all",
        //   icon: <MoneyOffIcon />
        // },
        {
          name: "Lịch sử đơn hàng",
          link: "/order-history",
          role: ["Customer"],
          icon: <ShoppingBasketIcon />
        }
      ]
    },
    {
      label: "Quản lý",
      icon: <ManageAccountsIcon />,
      subItems: [
        {
          name: "Thống kê",
          link: "/dashboard",
          role: ["Admin"],
          icon: <AlignHorizontalLeftIcon />
        },
        {
          name: "Quản lý người dùng",
          link: "/management/accounts",
          role: ["Admin"],
          icon: <GroupsIcon />
        }
      ]
    }
  ];

  return (
    <div className="fixed left-0 top-15 w-50 h-screen background-primary text-white flex flex-col">
      {navItems.map((item, index) => {
        // Filter subItems based on role and check if any remain
        const visibleSubItems = item.subItems.filter((sub) => isShown(sub.role));
        
        // Hide the main item if no sub-items are visible
        if (visibleSubItems.length === 0) {
          return null;
        }

        return (
          <div
            key={index}
            className="background-primary hover:bg-green-800 p-4 cursor-pointer relative flex items-center gap-2"
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            {item.icon}
            <span className="font-bold">{item.label}</span>
            {hovered === index && (
              <div
                className={`top-0 absolute left-full background-selected text-white shadow-lg max-h-42 z-20 animate-fade-in flex flex-col flex-wrap`}
                style={{ width: `${Math.ceil(visibleSubItems.length / 3) * 180}px` }}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                {visibleSubItems.map((sub) => (
                  <div
                    key={sub.name}
                    className="p-4 hover:bg-green-600 cursor-pointer text-sm flex items-center gap-2"
                    onClick={() => navigate(sub.link)}
                  >
                    {sub.icon}
                    {sub.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Navbar;
