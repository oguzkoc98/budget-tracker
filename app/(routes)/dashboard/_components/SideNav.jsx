"use client";
import { UserButton } from "@clerk/nextjs";
import { LayoutGrid, Coins, ReceiptText } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";

function SideNav() {
  const pathname = usePathname();

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

  return (
    <div className="h-screen p-6 border shadow-sm">
      <div className="flex items-center cursor-pointer">
        <Image
          src={"/logo.svg"}
          alt="logo"
          width={30}
          height={30}
          className="mr-2"
        />
        <p className="font-extrabold text-blue-800 tracking-tighter text-3xl">
          Cebimden
        </p>
      </div>

      <div className="mt-8 space-y-2">
        {menuList.map((menu, index) => (
          <Link href={menu.path} key={menu.id}>
            <div
              className={`group relative flex items-center gap-3 px-4 py-3 mx-2 rounded-xl font-medium cursor-pointer transition-all duration-300 hover:shadow-sm hover:translate-x-1 ${
                isActive(menu.path)
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 translate-x-1"
                  : "text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700"
              }`}
            >
              <div className="flex items-center justify-center w-5 h-5 transition-transform duration-300 group-hover:scale-110">
                <menu.icon size={20} />
              </div>
              <span className="text-sm font-medium tracking-wide">
                {menu.name}
              </span>
              <div
                className={`absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full transition-opacity duration-300 ${
                  isActive(menu.path)
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              />
            </div>
          </Link>
        ))}
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50 shadow-sm backdrop-blur-sm">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 rounded-xl shadow-sm",
              },
            }}
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800">Profil</span>
            <span className="text-xs text-gray-500">Hesap ayarları</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideNav;
