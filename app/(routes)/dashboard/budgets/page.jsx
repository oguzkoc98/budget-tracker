"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { desc, eq, sql } from "drizzle-orm";
import { DollarSign, Target, TrendingUp, AlertCircle } from "lucide-react";
import BudgetList from "./_components/BudgetList";
import { Card, CardContent } from "@/components/ui/card";

function Budget() {
  const [budgetsList, setBudgetsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [stats, setStats] = useState({
    totalBudgets: 0,
    totalAmount: 0,
    totalSpent: 0,
    remainingBudget: 0,
    usagePercentage: 0,
    overBudgetCount: 0,
  });

  // Tüm bütçeleri ve harcamaları getir
  const getAllBudgets = async () => {
    setLoading(true);
    try {
      // Bütçeleri ve toplam harcamalarını getir
      const result = await db
        .select({
          id: Budgets.id,
          name: Budgets.name,
          amount: Budgets.amount,
          createdBy: Budgets.createdBy,
          totalSpent: sql`COALESCE(SUM(CAST(${Expenses.amount} AS DECIMAL)), 0)`,
          totalItems: sql`COUNT(${Expenses.id})`,
        })
        .from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .groupBy(Budgets.id, Budgets.name, Budgets.amount, Budgets.createdBy);

      setBudgetsList(result || []);
      calculateStats(result || []);
    } catch (error) {
      console.error("Bütçeler yüklenirken hata:", error);
      setBudgetsList([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri hesapla
  const calculateStats = (budgets) => {
    if (!budgets || budgets.length === 0) {
      setStats({
        totalBudgets: 0,
        totalAmount: 0,
        totalSpent: 0,
        remainingBudget: 0,
        usagePercentage: 0,
        overBudgetCount: 0,
      });
      return;
    }

    const totalBudgets = budgets.length;
    const totalAmount = budgets.reduce(
      (sum, budget) => sum + (Number(budget.amount) || 0),
      0
    );
    const totalSpent = budgets.reduce(
      (sum, budget) => sum + (Number(budget.totalSpent) || 0),
      0
    );

    // Ek metrikler
    const remainingBudget = totalAmount - totalSpent;
    const usagePercentage =
      totalAmount > 0 ? Math.round((totalSpent / totalAmount) * 100) : 0;
    const overBudgetCount = budgets.filter((budget) => {
      const budgetAmount = Number(budget.amount) || 0;
      const spentAmount = Number(budget.totalSpent) || 0;
      return spentAmount >= budgetAmount && budgetAmount > 0;
    }).length;

    setStats({
      totalBudgets,
      totalAmount,
      totalSpent,
      remainingBudget,
      usagePercentage,
      overBudgetCount,
    });
  };

  // Filtrelenmiş bütçeler
  const getFilteredBudgets = () => {
    if (!budgetsList || budgetsList.length === 0) {
      return [];
    }

    let filtered = [...budgetsList];

    // Arama ile filtreleme
    if (searchTerm) {
      filtered = filtered.filter(
        (budget) =>
          budget.name &&
          budget.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Durum filtresi
    if (statusFilter !== "all") {
      filtered = filtered.filter((budget) => {
        const budgetAmount = Number(budget.amount) || 0;
        const spentAmount = Number(budget.totalSpent) || 0;
        const spentPercentage =
          budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

        switch (statusFilter) {
          case "active":
            return spentPercentage < 100;
          case "completed":
            return spentPercentage >= 100;
          case "warning":
            return spentPercentage >= 75 && spentPercentage < 100;
          case "safe":
            return spentPercentage < 50;
          default:
            return true;
        }
      });
    }

    // Sıralama
    switch (sortBy) {
      case "highest":
        filtered.sort(
          (a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0)
        );
        break;
      case "lowest":
        filtered.sort(
          (a, b) => (Number(a.amount) || 0) - (Number(b.amount) || 0)
        );
        break;
      case "name":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "usage":
        filtered.sort((a, b) => {
          const aAmount = Number(a.amount) || 0;
          const bAmount = Number(b.amount) || 0;
          const aUsage =
            aAmount > 0 ? ((Number(a.totalSpent) || 0) / aAmount) * 100 : 0;
          const bUsage =
            bAmount > 0 ? ((Number(b.totalSpent) || 0) / bAmount) * 100 : 0;
          return bUsage - aUsage;
        });
        break;
      default: // en yeni
        filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
    }

    return filtered;
  };

  const formatAmount = (amount) => {
    return (
      new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + " ₺"
    );
  };

  useEffect(() => {
    getAllBudgets();
  }, []);

  const filteredBudgets = getFilteredBudgets();

  if (loading) {
    return (
      <div className="p-5 pl-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-24">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 pl-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-2xl text-gray-800">Bütçeler</h2>
          <p className="text-gray-600 mt-2 tracking-tight">
            Bu sayfa üzerinden yeni bütçeler ekleyebilir ve mevcut bütçelerinizi
            yönetebilirsiniz.
          </p>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Toplam Tutar Kartı */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Toplam Tutar
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatAmount(stats.totalAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalBudgets} kategoride
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kalan Bütçe Kartı */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Kalan Bütçe
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(stats.remainingBudget)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Harcanabilir tutar
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kullanım Oranı Kartı */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Kullanım Oranı
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  %{stats.usagePercentage}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.usagePercentage <= 70
                    ? "İyi durumda"
                    : stats.usagePercentage <= 90
                    ? "Dikkat et"
                    : "Limit yakın"}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limit Aşan Kartı */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Limit Aşan</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.overBudgetCount}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.overBudgetCount === 0
                    ? "Hiç bütçe aşmadı"
                    : `${stats.overBudgetCount} bütçe limit aştı`}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bütçe Listesi Bileşeni */}
      <BudgetList budgetsList={filteredBudgets} refreshData={getAllBudgets} />
    </div>
  );
}

export default Budget;
