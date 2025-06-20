"use client";

import { useEffect } from "react";
import SideNav from "./_components/SideNav";
import DashboardHeader from "./_components/DashboardHeader";

import { db } from "@/utils/dbConfig";
import { Budgets } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { useRouter } from "next/navigation";

function DashboardLayout({ children }) {
  const { user } = useUser();
  const router = useRouter();
  useEffect(() => {
    user && checkUserBudgets();
  }, [user]);
  const checkUserBudgets = async () => {
    const result = await db
      .select()
      .from(Budgets)
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));

    if (result?.length == 0) {
      router.replace("/dashboard/budgets");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SideNav - Mobil ve Desktop responsive */}
      <SideNav />

      {/* Ana içerik alanı */}
      <div className="md:ml-64">
        <DashboardHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
