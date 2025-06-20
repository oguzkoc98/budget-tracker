"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

function CustomUserDropdown({ size = "default", position = "bottom" }) {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Dropdown dışına tıklayınca kapat
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // ESC tuşu ile kapat
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    try {
      openUserProfile();
    } catch (error) {
      console.error("Profil açma hatası:", error);
    }
  };

  if (!isClient || !user) {
    return (
      <div
        className={`${
          size === "default" ? "w-8 h-8" : "w-10 h-10"
        } bg-gray-200 rounded-lg animate-pulse`}
      />
    );
  }

  const avatarSize = size === "default" ? "w-8 h-8" : "w-10 h-10";

  // Position logic - sidebar için yukarı, header için aşağı
  const getDropdownPosition = () => {
    if (position === "top") {
      return size === "default" ? "right-0 bottom-10" : "right-0 bottom-12";
    }
    return size === "default" ? "right-0 top-10" : "right-0 top-12";
  };

  const dropdownPosition = getDropdownPosition();
  const animationOrigin =
    position === "top" ? "origin-bottom-right" : "origin-top-right";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${avatarSize} rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center border-2 border-transparent hover:border-blue-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 active:scale-95 transform`}
        style={{
          touchAction: "manipulation",
          WebkitTouchCallout: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={
              user.fullName || user.emailAddresses[0]?.emailAddress || "User"
            }
            className={`${avatarSize} rounded-lg object-cover`}
          />
        ) : (
          <User className="w-5 h-5 text-blue-600" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div
            className={`absolute ${dropdownPosition} z-50 w-64 bg-white border border-gray-200 rounded-xl shadow-lg py-2 ${
              position === "top" ? "mb-1" : "mt-1"
            } transform transition-all duration-200 ease-out ${animationOrigin}`}
            style={{
              animation: `${
                position === "top" ? "fadeInScaleUp" : "fadeInScale"
              } 0.15s ease-out forwards`,
            }}
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 ring-2 ring-blue-100/50">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || "User"}
                      className="w-10 h-10 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <User
                    className={`w-5 h-5 text-blue-600 ${
                      user.imageUrl ? "hidden" : "flex"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-gray-900 text-sm truncate"
                    title={user.fullName || "Kullanıcı"}
                  >
                    {user.fullName || "Kullanıcı"}
                  </p>
                  <p
                    className="text-xs text-gray-500 truncate"
                    title={user.emailAddresses[0]?.emailAddress}
                  >
                    {user.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 active:bg-gray-100"
                style={{
                  touchAction: "manipulation",
                  WebkitTouchCallout: "none",
                }}
              >
                <Settings className="w-4 h-4 text-gray-500" />
                Hesap Ayarları
              </button>

              <hr className="my-2 border-gray-100" />

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 active:bg-red-100"
                style={{
                  touchAction: "manipulation",
                  WebkitTouchCallout: "none",
                }}
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-5px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes fadeInScaleUp {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(5px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default CustomUserDropdown;
