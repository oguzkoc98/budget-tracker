"use client";

import React from "react";
import Image from "next/image";

// components
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import CustomUserDropdown from "@/app/(routes)/dashboard/_components/CustomUserDropdown";

function Header() {
  const { user, isSignedIn } = useUser();

  return (
    <div className="flex p-6 items-center justify-between border shadow-sm">
      <Link href={"/"}>
        <div className="flex items-center cursor-pointer">
          <Image
            src={"./logo.svg"}
            alt="logo"
            width={30}
            height={30}
            className="mr-2"
          />
          <p className="font-extrabold text-blue-800 tracking-tighter text-3xl">
            Cebimden
          </p>
        </div>
      </Link>

      <div className="flex justify-end items-center">
        {isSignedIn ? (
          <div className="flex items-center gap-3">
            <Button className="bg-blue-800 hover:bg-blue-900 rounded-3xl">
              <Link href={"/dashboard"}>Genel Bakış</Link>
            </Button>
            <CustomUserDropdown size="default" position="bottom" />
          </div>
        ) : (
          <Link href={"/sign-in"}>
            <Button className="bg-blue-800 hover:bg-blue-900">
              Ücretsiz Başlayın
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Header;
