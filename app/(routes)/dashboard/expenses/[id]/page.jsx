"use client";
import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { db } from "@/utils/dbConfig";
import { eq, getTableColumns, sql, and, desc } from "drizzle-orm";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import BudgetItem from "../../budgets/_components/BudgetItem";
import ExpensesListTable from "../_components/ExpensesListTable";
import EditBudget from "../_components/EditBudget";
import { ArrowLeft } from "lucide-react";
import moment from "moment";

// Yükleme skeleton bileşeni - BudgetItem'a uygun
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

// Harcama Düzenleme Bileşeni
const EditExpense = ({ expense, refreshData, open, setOpen }) => {
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (expense) {
      setExpenseName(expense.name);
      setExpenseAmount(expense.amount.toString());
      // Tarihi uygun formata dönüştür
      const expenseDate = moment(expense.createdAt).isValid()
        ? moment(expense.createdAt).format("YYYY-MM-DD")
        : new Date().toISOString().split("T")[0];
      setSelectedDate(expenseDate);
    }
  }, [expense]);

  const onUpdateExpense = async () => {
    try {
      const result = await db
        .update(Expenses)
        .set({
          name: expenseName,
          amount: parseFloat(expenseAmount),
          createdAt: selectedDate,
        })
        .where(eq(Expenses.id, expense.id))
        .returning();

      if (result) {
        toast("Harcama güncellendi");
        setOpen(false);
        refreshData();
      }
    } catch (error) {
      console.error("Harcama güncelleme hatası:", error);
      toast("Harcama güncellenirken bir hata oluştu");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Harcama Düzenle</DialogTitle>
          <DialogDescription>
            Harcama bilgilerinizi güncelleyin.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-5">
          <div className="mt-2">
            <label className="text-gray-900 font-medium text-sm">
              Harcama Adı
            </label>
            <Input
              placeholder="Örn. Migros"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="mt-4">
            <label className="text-gray-900 font-medium text-sm">Tutar</label>
            <Input
              type="number"
              placeholder="Örn. 2500"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="mt-4">
            <label className="text-gray-900 font-medium text-sm">Tarih</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="mt-1"
            />
          </div>
          <div className="flex gap-2 mt-5">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              disabled={!(expenseName && expenseAmount && selectedDate)}
              onClick={onUpdateExpense}
              className="flex-1 bg-blue-800 hover:bg-blue-900"
            >
              Güncelle
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Harcama Ekle Bileşeni - CreateBudget örneğine benzer yapı
const AddExpense = ({ budgetId, user, refreshData }) => {
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [open, setOpen] = useState(false);

  const onCreateExpense = async () => {
    try {
      const result = await db
        .insert(Expenses)
        .values({
          name: expenseName,
          amount: parseFloat(expenseAmount),
          budgetId: parseInt(budgetId),
          createdAt: selectedDate,
        })
        .returning({ insertedId: Expenses.id });

      if (result) {
        toast("Yeni harcama eklendi");
        setExpenseName("");
        setExpenseAmount("");
        setSelectedDate(new Date().toISOString().split("T")[0]);
        setOpen(false);

        // Listeyi yenile
        if (refreshData) {
          refreshData();
        }
      }
    } catch (error) {
      console.error("Harcama ekleme hatası:", error);
      toast("Harcama eklenirken bir hata oluştu");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="bg-slate-100 p-10 rounded-md items-center flex flex-col border-2 border-accent cursor-pointer hover:shadow-sm h-[170px] justify-center">
          <h2 className="text-3xl text-gray-700">+</h2>
          <h2 className="text-gray-700">Harcama Ekle</h2>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Harcama Ekle</DialogTitle>
          <DialogDescription>
            Bu bütçeye yeni bir harcama kaydı ekleyin.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-5">
          <div className="mt-2">
            <label className="text-gray-900 font-medium text-sm">
              Harcama Adı
            </label>
            <Input
              placeholder="Örn. Migros"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="mt-4">
            <label className="text-gray-900 font-medium text-sm">Tutar</label>
            <Input
              type="number"
              placeholder="Örn. 2500"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="mt-4">
            <label className="text-gray-900 font-medium text-sm">Tarih</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="mt-1"
            />
          </div>
          <Button
            disabled={!(expenseName && expenseAmount && selectedDate)}
            onClick={onCreateExpense}
            className="mt-5 w-full bg-blue-800 hover:bg-blue-900"
          >
            Ekle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function ExpensesScreen({ params }) {
  const { user } = useUser();
  const router = useRouter();
  const resolvedParams = use(params);
  const budgetId = resolvedParams.id;

  const [budgetInfo, setBudgetInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Başlangıçta true olarak ayarlandı
  const [expensesList, setExpensesList] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (user && budgetId) {
      getBudgetInfo();
      getExpensesList();
    }
  }, [user, budgetId]);

  const getBudgetInfo = async () => {
    try {
      setLoading(true);
      console.log("Aranan Budget ID:", budgetId);

      const result = await db
        .select({
          ...getTableColumns(Budgets),
          totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
          totalItem: sql`count(${Expenses.id})`.mapWith(Number),
        })
        .from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(
          and(
            eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress),
            eq(Budgets.id, parseInt(budgetId))
          )
        )
        .groupBy(Budgets.id);

      console.log("Budget Result:", result);
      setBudgetInfo(result[0] || null);
      setInitialLoadComplete(true);
    } catch (error) {
      console.error("Budget listesi alınırken hata:", error);
      setInitialLoadComplete(true);
    } finally {
      setLoading(false);
    }
  };

  const getExpensesList = async () => {
    try {
      console.log("Harcamalar getiriliyor, Budget ID:", budgetId);

      const result = await db
        .select()
        .from(Expenses)
        .where(eq(Expenses.budgetId, parseInt(budgetId)))
        .orderBy(desc(Expenses.id));

      console.log("Expenses Result:", result);
      setExpensesList(result);
    } catch (error) {
      console.error("Harcamalar listesi alınırken hata:", error);
    }
  };

  const refreshData = () => {
    getBudgetInfo();
    getExpensesList();
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setEditModalOpen(true);
  };

  const handleEditComplete = () => {
    setEditingExpense(null);
    setEditModalOpen(false);
    refreshData();
  };

  const deleteBudget = async () => {
    try {
      // Önce ilgili harcamaları sil
      const deleteExpensesResult = await db
        .delete(Expenses)
        .where(eq(Expenses.budgetId, parseInt(budgetId)))
        .returning();

      console.log("Silinen harcamalar:", deleteExpensesResult);

      // Sonra bütçeyi sil
      const result = await db
        .delete(Budgets)
        .where(eq(Budgets.id, parseInt(budgetId)))
        .returning();

      console.log("Silinen bütçe:", result);

      if (result.length > 0) {
        toast("Bütçe başarıyla silindi.");
        router.replace("/dashboard/budgets");
      } else {
        toast("Bütçe silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Bütçe silme hatası:", error);
      toast("Bütçe silinirken bir hata oluştu.");
    }
  };

  // İlk yükleme tamamlanmadan hiçbir şey gösterme
  if (!initialLoadComplete) {
    return (
      <div className="p-5 pl-10">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-2xl text-gray-800">Harcamalar</h2>
          <div className="flex gap-2">
            <div className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-5">
          <BudgetSkeleton />
          <div className="bg-slate-100 p-10 rounded-md items-center flex flex-col border-2 border-accent h-[170px] justify-center animate-pulse">
            <div className="h-8 w-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>

        <div className="mt-15">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="bg-white rounded-lg border animate-pulse">
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 md:pl-10">
      {/* Mobil için üst header */}
      <div className="block md:hidden mb-4">
        <button
          onClick={() => router.push("/dashboard/expenses")}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Harcamalara Dön
        </button>

        <div className="flex flex-col gap-3">
          <h1 className="font-bold text-xl leading-tight">
            {budgetInfo ? (
              <>
                <span className="text-blue-800 font-bold block">
                  {budgetInfo.name}
                </span>
                <span className="text-gray-800 font-medium text-lg">
                  Bütçesinin Harcamaları
                </span>
              </>
            ) : (
              <span className="text-gray-800">Harcamalar</span>
            )}
          </h1>

          <div className="flex gap-2 flex-wrap">
            <EditBudget
              budgetInfo={budgetInfo}
              refreshData={() => getBudgetInfo()}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-red-500 hover:bg-red-700 text-sm px-3 py-2">
                  Sil
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-gray-800">
                    Bütçeyi Silmek İstiyor Musunuz?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Bu işlemle birlikte bu bütçeye ait tüm harcama kayıtları da
                    silinecek. Bu işlemi geri alamazsınız. Emin misiniz?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteBudget()}>
                    Evet
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Desktop için header */}
      <div className="hidden md:flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-2xl">
            {budgetInfo ? (
              <>
                <span className="text-blue-800 font-bold text-2xl">
                  {budgetInfo.name}
                </span>
                <span className="text-gray-800 text-2xl font-medium ml-2">
                  Bütçesinin Harcamaları
                </span>
              </>
            ) : (
              <span className="text-gray-800">Harcamalar</span>
            )}
          </h2>
          <button
            onClick={() => router.push("/dashboard/expenses")}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors ml-10 flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Harcamalara Dön
          </button>
        </div>
        <div className="flex gap-2">
          <EditBudget
            budgetInfo={budgetInfo}
            refreshData={() => getBudgetInfo()}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-red-500 hover:bg-red-700">Sil</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-800">
                  Bütçeyi Silmek İstiyor Musunuz?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Bu işlemle birlikte bu bütçeye ait tüm harcama kayıtları da
                  silinecek. Bu işlemi geri alamazsınız. Emin misiniz?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteBudget()}>
                  Evet
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 mt-4 md:mt-6 gap-3 md:gap-5">
        {budgetInfo ? (
          <BudgetItem budget={budgetInfo} />
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">Bütçe bulunamadı</p>
          </div>
        )}
        {budgetInfo && (
          <AddExpense
            budgetId={budgetId}
            user={user}
            refreshData={refreshData}
          />
        )}
      </div>

      <div className="mt-8 md:mt-15">
        <h2 className="font-bold text-lg md:text-xl text-gray-800 mb-3 md:mb-4">
          Geçmiş Harcamalar
        </h2>
        <ExpensesListTable
          expensesList={expensesList}
          refreshData={refreshData}
          onEditExpense={handleEditExpense}
        />

        {/* Edit Expense Modal */}
        {editingExpense && (
          <EditExpense
            expense={editingExpense}
            refreshData={handleEditComplete}
            open={editModalOpen}
            setOpen={setEditModalOpen}
          />
        )}
      </div>
    </div>
  );
}

export default ExpensesScreen;
