"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/utils/dbConfig";
import { Expenses, Budgets } from "@/utils/schema";
import { desc, eq } from "drizzle-orm";
import { toast } from "sonner";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Search,
  DollarSign,
  BarChart3,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ExpensesListTable from "./_components/ExpensesListTable";
import AddExpense from "./_components/AddExpense";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function ExpensesPage() {
  const [expensesList, setExpensesList] = useState([]);
  const [budgetsList, setBudgetsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [editingExpense, setEditingExpense] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    thisMonthAmount: 0,
    lastMonthAmount: 0,
    biggestExpense: { name: "", amount: 0 },
    monthlyTrend: 0,
  });

  // Tüm verileri getir
  const getAllExpenses = async () => {
    setLoading(true);
    try {
      // Tüm harcamaları getir
      const result = await db
        .select({
          id: Expenses.id,
          name: Expenses.name,
          amount: Expenses.amount,
          createdAt: Expenses.createdAt,
          budgetId: Expenses.budgetId,
          budgetName: Budgets.name,
        })
        .from(Expenses)
        .leftJoin(Budgets, eq(Expenses.budgetId, Budgets.id))
        .orderBy(desc(Expenses.createdAt));

      setExpensesList(result);

      // Bütçeleri getir
      const budgetsResult = await db.select().from(Budgets);
      setBudgetsList(budgetsResult);

      // İstatistikleri hesapla
      calculateStats(result);
    } catch (error) {
      console.error("Harcamalar yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri hesapla
  const calculateStats = (expenses) => {
    const totalAmount = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );
    const totalExpenses = expenses.length;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Bu ayki harcamalar
    const thisMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.createdAt);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });
    const thisMonthAmount = thisMonthExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

    // Geçen ayki harcamalar
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.createdAt);
      return (
        expenseDate.getMonth() === lastMonth &&
        expenseDate.getFullYear() === lastYear
      );
    });
    const lastMonthAmount = lastMonthExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

    // Bu ayın en büyük harcaması
    const biggestThisMonth =
      thisMonthExpenses.length > 0
        ? thisMonthExpenses.reduce((max, expense) =>
            Number(expense.amount) > Number(max.amount) ? expense : max
          )
        : { name: "Henüz harcama yok", amount: 0 };

    // Aylık trend hesaplaması
    const monthlyTrend =
      lastMonthAmount > 0
        ? Math.round(
            ((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100
          )
        : thisMonthAmount > 0
        ? 100
        : 0;

    setStats({
      totalExpenses,
      totalAmount,
      thisMonthAmount,
      lastMonthAmount,
      biggestExpense: biggestThisMonth,
      monthlyTrend,
    });
  };

  // Filtrelenmiş harcamalar
  const getFilteredExpenses = () => {
    let filtered = [...expensesList];

    // Arama ile filtreleme
    if (searchTerm) {
      filtered = filtered.filter(
        (expense) =>
          expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (expense.budgetName &&
            expense.budgetName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Bütçe ile filtreleme
    if (selectedBudget !== "all") {
      filtered = filtered.filter(
        (expense) => expense.budgetId === parseInt(selectedBudget)
      );
    }

    // Tarih ile filtreleme
    if (dateRange !== "all") {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "3months":
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(
          (expense) => new Date(expense.createdAt) >= startDate
        );
      }
    }

    // Sıralama
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "highest":
        filtered.sort((a, b) => Number(b.amount) - Number(a.amount));
        break;
      case "lowest":
        filtered.sort((a, b) => Number(a.amount) - Number(b.amount));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
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

  // Export fonksiyonu
  const exportExpenses = () => {
    const filtered = getFilteredExpenses();
    const csvContent = [
      ["Harcama Adı", "Tutar", "Bütçe", "Tarih"],
      ...filtered.map((expense) => [
        expense.name,
        expense.amount,
        expense.budgetName || "Belirsiz",
        new Date(expense.createdAt).toLocaleDateString("tr-TR"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `harcamalar_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Düzenleme fonksiyonları
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setEditModalOpen(true);
  };

  const handleEditComplete = () => {
    setEditingExpense(null);
    setEditModalOpen(false);
    getAllExpenses();
  };

  // Sayfalama fonksiyonları
  const getPaginatedExpenses = () => {
    const filtered = getFilteredExpenses();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filtered = getFilteredExpenses();
    return Math.ceil(filtered.length / itemsPerPage);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= getTotalPages()) {
      setCurrentPage(newPage);
    }
  };

  // Filtre değiştiğinde sayfa 1'e dön
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBudget, dateRange, sortBy]);

  useEffect(() => {
    getAllExpenses();
  }, []);

  const filteredExpenses = getFilteredExpenses();
  const paginatedExpenses = getPaginatedExpenses();
  const totalPages = getTotalPages();

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
          <h2 className="font-bold text-2xl text-gray-800">Harcamalar</h2>
          <p className="text-gray-600 mt-2 tracking-tight">
            Tüm harcamalarınızı görüntüleyin, filtreleyin ve analiz edin.
          </p>
        </div>
        <Button
          onClick={exportExpenses}
          className="flex items-center gap-2"
          variant="default"
        >
          <Download className="w-4 h-4" />
          Dışa Aktar
        </Button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Toplam Tutar */}
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
                  {stats.totalExpenses} harcama kaydı
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bu Ayın Harcaması */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Bu Ayın Harcaması
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatAmount(stats.thisMonthAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date().toLocaleDateString("tr-TR", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Geçen Ay Karşılaştırması */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Geçen Ay Karşılaştırması
                </p>
                <p className="text-2xl font-bold">
                  {stats.monthlyTrend >= 0 ? "+" : ""}
                  {stats.monthlyTrend}%
                </p>
                <div className="flex items-center mt-1">
                  {stats.monthlyTrend > 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-xs text-red-500">Artış</span>
                    </>
                  ) : stats.monthlyTrend < 0 ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-500">Azalış</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Değişim yok
                    </span>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* En Büyük Harcama */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  En Büyük Harcama
                </p>
                <p className="text-lg font-bold text-orange-600 truncate max-w-32">
                  {stats.biggestExpense.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatAmount(Number(stats.biggestExpense.amount))}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtreler ve Arama
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Arama */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Harcama ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Bütçe Filtresi */}
            <Select value={selectedBudget} onValueChange={setSelectedBudget}>
              <SelectTrigger>
                <SelectValue placeholder="Bütçe seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Bütçeler</SelectItem>
                {budgetsList.map((budget) => (
                  <SelectItem key={budget.id} value={budget.id.toString()}>
                    {budget.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tarih Filtresi */}
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Tarih aralığı" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Zamanlar</SelectItem>
                <SelectItem value="today">Bugün</SelectItem>
                <SelectItem value="week">Son 7 Gün</SelectItem>
                <SelectItem value="month">Bu Ay</SelectItem>
                <SelectItem value="3months">Son 3 Ay</SelectItem>
              </SelectContent>
            </Select>

            {/* Sıralama */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">En Yeni</SelectItem>
                <SelectItem value="oldest">En Eski</SelectItem>
                <SelectItem value="highest">En Yüksek Tutar</SelectItem>
                <SelectItem value="lowest">En Düşük Tutar</SelectItem>
                <SelectItem value="name">İsme Göre</SelectItem>
              </SelectContent>
            </Select>

            {/* Aktif Filtreler */}
            <div className="flex items-center gap-2">
              {(searchTerm ||
                selectedBudget !== "all" ||
                dateRange !== "all" ||
                sortBy !== "newest") && (
                <>
                  {searchTerm && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      Arama: {searchTerm}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setSearchTerm("")}
                      />
                    </Badge>
                  )}
                  {selectedBudget !== "all" && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      Bütçe:{" "}
                      {
                        budgetsList.find(
                          (b) => b.id.toString() === selectedBudget
                        )?.name
                      }
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setSelectedBudget("all")}
                      />
                    </Badge>
                  )}
                  {dateRange !== "all" && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      Tarih:{" "}
                      {dateRange === "today"
                        ? "Bugün"
                        : dateRange === "week"
                        ? "Son 7 Gün"
                        : dateRange === "month"
                        ? "Bu Ay"
                        : dateRange === "3months"
                        ? "Son 3 Ay"
                        : dateRange}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setDateRange("all")}
                      />
                    </Badge>
                  )}
                </>
              )}
            </div>

            {/* Filtreleri Temizle */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedBudget("all");
                setDateRange("all");
                setSortBy("newest");
              }}
              className="w-full"
            >
              Tümünü Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Harcamalar Listesi */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Harcama Listesi
              <Badge variant="outline">{filteredExpenses.length} kayıt</Badge>
            </CardTitle>
            {filteredExpenses.length !== expensesList.length && (
              <p className="text-sm text-muted-foreground">
                {expensesList.length} kayıttan {filteredExpenses.length} tanesi
                gösteriliyor
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ExpensesListTable
            expensesList={paginatedExpenses}
            refreshData={getAllExpenses}
            onEditExpense={handleEditExpense}
          />

          {/* Sayfalama Kontrolleri */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Sayfa {currentPage} / {totalPages} ({filteredExpenses.length}{" "}
                kayıt)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Önceki
                </Button>

                {/* Sayfa Numaraları */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Sonraki
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Edit Expense Dialog */}
          <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Harcama Düzenle</DialogTitle>
                <DialogDescription>
                  Harcama bilgilerinizi güncelleyin.
                </DialogDescription>
              </DialogHeader>
              {editingExpense && (
                <div className="mt-5">
                  <div className="mt-2">
                    <label className="text-gray-900 font-medium text-sm">
                      Harcama Adı
                    </label>
                    <Input
                      id="edit-expense-name"
                      placeholder="Örn. Migros"
                      defaultValue={editingExpense.name}
                      className="mt-1"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="text-gray-900 font-medium text-sm">
                      Tutar
                    </label>
                    <Input
                      id="edit-expense-amount"
                      type="number"
                      placeholder="Örn. 2500"
                      defaultValue={editingExpense.amount}
                      className="mt-1"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="text-gray-900 font-medium text-sm">
                      Tarih
                    </label>
                    <Input
                      id="edit-expense-date"
                      type="date"
                      defaultValue={
                        new Date(editingExpense.createdAt)
                          .toISOString()
                          .split("T")[0]
                      }
                      max={new Date().toISOString().split("T")[0]}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2 mt-5">
                    <Button
                      variant="outline"
                      onClick={() => setEditModalOpen(false)}
                      className="flex-1"
                    >
                      İptal
                    </Button>
                    <Button
                      onClick={async () => {
                        const name =
                          document.getElementById("edit-expense-name").value;
                        const amount = document.getElementById(
                          "edit-expense-amount"
                        ).value;
                        const date =
                          document.getElementById("edit-expense-date").value;

                        if (name && amount && date) {
                          try {
                            await db
                              .update(Expenses)
                              .set({
                                name: name,
                                amount: parseFloat(amount),
                                createdAt: date,
                              })
                              .where(eq(Expenses.id, editingExpense.id));

                            toast.success("Harcama güncellendi");
                            handleEditComplete();
                          } catch (error) {
                            console.error("Harcama güncelleme hatası:", error);
                            toast.error(
                              "Harcama güncellenirken bir hata oluştu"
                            );
                          }
                        }
                      }}
                      className="flex-1 bg-blue-800 hover:bg-blue-900"
                    >
                      Güncelle
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

export default ExpensesPage;
