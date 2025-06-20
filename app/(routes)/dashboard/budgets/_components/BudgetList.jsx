"use client";

import React, { useEffect, useState } from "react";
import CreateBudget from "./CreateBudget";
import { db } from "@/utils/dbConfig";
import { eq, getTableColumns, sql, desc } from "drizzle-orm";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import BudgetItem from "./BudgetItem";

// Loading skeleton componenti
const BudgetSkeleton = () => {
  return (
    <div className="p-5 border rounded-lg h-[170px] animate-pulse">
      <div className="flex gap-2 items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div className="bg-gray-300 h-2 rounded-full w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

function BudgetList() {
  const [budgetList, setBudgetList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skeletonCount, setSkeletonCount] = useState(3); // Varsayılan skeleton sayısı
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      getBudgetList();
    }
  }, [user]);

  const getBudgetList = async () => {
    try {
      setLoading(true);
      const result = await db
        .select({
          ...getTableColumns(Budgets),
          totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
          totalItem: sql`count(${Expenses.id})`.mapWith(Number),
        })
        .from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
        .groupBy(Budgets.id)
        .orderBy(desc(sql`CAST(${Budgets.amount} AS INTEGER)`));

      console.log("Budget Result:", result);

      // İlk yüklemede skeleton sayısını ayarla
      if (budgetList.length === 0 && result.length > 0) {
        setSkeletonCount(result.length);
      }

      setBudgetList(result);
    } catch (error) {
      console.error("Budget listesi alınırken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <CreateBudget refreshData={() => getBudgetList()} />

        {loading ? (
          // Yükleme skeleton'ları - dinamik sayıda göster
          Array.from({ length: skeletonCount }, (_, index) => (
            <BudgetSkeleton key={`skeleton-${index}`} />
          ))
        ) : budgetList?.length > 0 ? (
          budgetList.map((budget, index) => (
            <BudgetItem key={budget.id || index} budget={budget} />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">Henüz bütçe eklenmemiş</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetList;
