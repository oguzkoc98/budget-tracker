"use client";
import { LayoutGrid, Coins, ReceiptText, Menu, X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

function SideNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuList = [
    { id: 1, name: "Genel Bakış", icon: LayoutGrid, path: "/dashboard" },
    { id: 2, name: "Bütçeler", icon: Coins, path: "/dashboard/budgets" },
    {
      id: 3,
      name: "Harcamalar",
      icon: ReceiptText,
      path: "/dashboard/expenses",
    },
  ];

  const isActive = (path) => {
    // Ana dashboard sayfası için tam eşleşme kontrolü
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    // Diğer sayfalar için başlangıç kontrolü (dinamik route'lar için)
    return pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button - Sabit pozisyon */}
      <button
        onClick={toggleMobileMenu}
        className={`md:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 ${
          isMobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Menu size={20} className="text-gray-700" />
      </button>

      {/* Desktop Sidebar & Mobile Slide Menu */}
      <div
        className={`
          fixed top-0 left-0 h-full w-80 md:w-64 bg-white border-r border-gray-200 shadow-xl md:shadow-sm z-40 
          transition-transform duration-300 ease-in-out
          md:translate-x-0 
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 relative">
          {/* Mobile Close Button - Sidebar içinde */}
          <button
            onClick={closeMobileMenu}
            className="md:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>

          <div className="flex items-center pr-12 md:pr-0">
            <Image
              src={"/logo.svg"}
              alt="logo"
              width={32}
              height={32}
              className="mr-3 flex-shrink-0"
            />
            <p className="font-extrabold text-blue-800 tracking-tighter text-2xl truncate">
              Cebimden
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-4 py-6">
          <nav className="space-y-2">
            {menuList.map((menu) => (
              <Link href={menu.path} key={menu.id} onClick={closeMobileMenu}>
                <div
                  className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium cursor-pointer transition-all duration-200 ${
                    isActive(menu.path)
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-center w-5 h-5">
                    <menu.icon size={20} />
                  </div>
                  <span className="text-sm font-medium">{menu.name}</span>
                  {isActive(menu.path) && (
                    <div className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full" />
                  )}
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

export default SideNav;
