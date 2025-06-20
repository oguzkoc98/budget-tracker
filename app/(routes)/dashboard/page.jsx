"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/utils/dbConfig";
import { eq, getTableColumns, sql, desc } from "drizzle-orm";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Plus,
} from "lucide-react";
import BarChartDashboard from "./_components/BarChartDashboard";
import BudgetItem from "./budgets/_components/BudgetItem";
import ExpensesListTable from "./expenses/_components/ExpensesListTable";
import Link from "next/link";

function Dashboard() {
  const { user } = useUser();
  const [budgetList, setBudgetList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalBudgets: 0,
    activeBudgets: 0,
    overBudgets: 0,
    totalSpent: 0,
    totalBudgeted: 0,
    thisMonthSpent: 0,
    lastMonthSpent: 0,
    recentExpenses: [],
    topCategories: [],
    budgetAlerts: [],
  });

  useEffect(() => {
    user && getBudgetList();
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

      setBudgetList(result);
      await getAllExpenses();
      calculateDashboardStats(result);
    } catch (error) {
      console.error("Budget listesi alınırken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAllExpenses = async () => {
    const result = await db
      .select({
        id: Expenses.id,
        name: Expenses.name,
        amount: Expenses.amount,
        createdAt: Expenses.createdAt,
        budgetId: Expenses.budgetId,
      })
      .from(Budgets)
      .rightJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress.emailAddress))
      .orderBy(desc(Expenses.id));

    setExpensesList(result);
    return result;
  };

  const calculateDashboardStats = async (budgets) => {
    const totalBudgets = budgets.length;
    const activeBudgets = budgets.filter((b) => (b.totalSpend || 0) > 0).length;
    const overBudgets = budgets.filter(
      (b) => (b.totalSpend || 0) > Number(b.amount)
    ).length;

    const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = budgets.reduce(
      (sum, b) => sum + (Number(b.totalSpend) || 0),
      0
    );

    // Bu ay ve geçen ay harcamaları
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthExpenses = await db
      .select({
        amount: Expenses.amount,
        createdAt: Expenses.createdAt,
      })
      .from(Expenses)
      .leftJoin(Budgets, eq(Expenses.budgetId, Budgets.id))
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));

    const thisMonthSpent = thisMonthExpenses
      .filter((e) => new Date(e.createdAt) >= thisMonthStart)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const lastMonthSpent = thisMonthExpenses
      .filter((e) => {
        const date = new Date(e.createdAt);
        return date >= lastMonthStart && date <= lastMonthEnd;
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);

    // Son 5 harcama
    const recentExpenses = expensesList.slice(0, 5);

    // En çok harcanan kategoriler
    const topCategories = budgets
      .filter((b) => (Number(b.totalSpend) || 0) > 0)
      .sort((a, b) => (Number(b.totalSpend) || 0) - (Number(a.totalSpend) || 0))
      .slice(0, 5);

    // Bütçe uyarıları
    const budgetAlerts = budgets.filter((b) => {
      const spentPercentage =
        ((Number(b.totalSpend) || 0) / Number(b.amount)) * 100;
      return spentPercentage >= 80; // %80 ve üzeri harcama yapılan bütçeler
    });

    setDashboardStats({
      totalBudgets,
      activeBudgets,
      overBudgets,
      totalSpent,
      totalBudgeted,
      thisMonthSpent,
      lastMonthSpent,
      recentExpenses,
      topCategories,
      budgetAlerts,
    });
  };

  const formatAmount = (amount) => {
    return (
      new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + " ₺"
    );
  };

  const getSpendingTrend = () => {
    if (dashboardStats.lastMonthSpent === 0)
      return { trend: "neutral", percentage: 0 };

    const difference =
      dashboardStats.thisMonthSpent - dashboardStats.lastMonthSpent;
    const percentage = Math.abs(
      (difference / dashboardStats.lastMonthSpent) * 100
    );
    const trend = difference > 0 ? "up" : difference < 0 ? "down" : "neutral";

    return { trend, percentage: Math.round(percentage) };
  };

  const spendingTrend = getSpendingTrend();

  if (loading) {
    return (
      <div className="p-5 pl-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-32">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 pl-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-3xl text-gray-800">
            Merhaba, {user?.fullName} 👋
          </h2>
          <p className="text-muted-foreground mt-2">
            Finansal durumunuza hızlı bir bakış atın ve harcamalarınızı takip
            edin.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-blue-800 hover:bg-blue-900 rounded-3xl"
          >
            <Plus className="w-4 h-4 mr-2 " />
            <Link href={"/dashboard/budgets"}>Yeni Bütçe</Link>
          </Button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam Bütçe */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Bütçe</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatAmount(dashboardStats.totalBudgeted)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboardStats.totalBudgets} kategoride
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bu Ayın Harcaması */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Bu Ayın Harcaması
                </p>
                <p className="text-2xl font-bold">
                  {formatAmount(dashboardStats.thisMonthSpent)}
                </p>
                <div className="flex items-center mt-1">
                  {spendingTrend.trend === "up" ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-xs text-red-500">
                        Geçen aya göre +%{spendingTrend.percentage}
                      </span>
                    </>
                  ) : spendingTrend.trend === "down" ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-500">
                        Geçen aya göre -%{spendingTrend.percentage}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {dashboardStats.lastMonthSpent === 0
                        ? "İlk ay"
                        : "Geçen ay ile aynı"}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kullanım Oranı */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kullanım Oranı</p>
                <p className="text-2xl font-bold">
                  {dashboardStats.totalBudgeted > 0
                    ? `%${Math.round(
                        (dashboardStats.totalSpent /
                          dashboardStats.totalBudgeted) *
                          100
                      )}`
                    : "0%"}
                </p>
                <div className="flex items-center mt-1">
                  {dashboardStats.totalBudgeted > 0 && (
                    <>
                      {(dashboardStats.totalSpent /
                        dashboardStats.totalBudgeted) *
                        100 <=
                      70 ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-xs text-green-500">
                            İyi durumda
                          </span>
                        </>
                      ) : (dashboardStats.totalSpent /
                          dashboardStats.totalBudgeted) *
                          100 <=
                        90 ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-xs text-yellow-500">
                            Dikkat et
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-xs text-red-500">
                            Limit aşıldı
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kalan Bütçe */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kalan Bütçe</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(
                    dashboardStats.totalBudgeted - dashboardStats.totalSpent
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboardStats.totalBudgeted > 0
                    ? `%${Math.round(
                        ((dashboardStats.totalBudgeted -
                          dashboardStats.totalSpent) /
                          dashboardStats.totalBudgeted) *
                          100
                      )} harcanabilir`
                    : "Bütçe tanımlanmamış"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bütçe Uyarıları */}
      {dashboardStats.budgetAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              Bütçe Uyarıları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardStats.budgetAlerts.map((budget) => {
                const percentage = Math.round(
                  ((budget.totalSpend || 0) / budget.amount) * 100
                );
                return (
                  <div
                    key={budget.id}
                    className="flex items-center justify-between bg-white p-3 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{budget.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatAmount(budget.totalSpend)} /{" "}
                        {formatAmount(budget.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={percentage} className="w-20" />
                      <Badge
                        variant={percentage > 100 ? "destructive" : "secondary"}
                      >
                        %{percentage}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ana İçerik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik ve Harcamalar */}
        <div className="lg:col-span-2 space-y-6">
          <BarChartDashboard budgetList={budgetList} />

          {/* Son Harcamalar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Son Harcamalar</span>
                <Link href="/dashboard/expenses">
                  <Button variant="ghost" size="sm">
                    Tümünü Gör
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExpensesListTable
                expensesList={expensesList.slice(0, 5)}
                refreshData={getBudgetList}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bütçe Özeti */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Target className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Bütçeler</h3>
            </div>
            <div className="space-y-3">
              {budgetList.slice(0, 4).map((budget) => (
                <BudgetItem budget={budget} key={budget.id} />
              ))}
              {budgetList.length > 4 && (
                <Button variant="outline" className="w-full" size="sm">
                  Tüm Bütçeleri Gör ({budgetList.length})
                </Button>
              )}
            </div>
          </div>

          {/* En Çok Harcanan Kategoriler */}
          <Card>
            <CardHeader>
              <CardTitle>En Çok Harcanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardStats.topCategories.map((category, index) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          index === 0
                            ? "bg-red-500"
                            : index === 1
                            ? "bg-orange-500"
                            : index === 2
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                        }`}
                      />
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatAmount(category.totalSpend)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
