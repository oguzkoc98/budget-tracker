import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/utils/dbConfig";
import { Expenses } from "@/utils/schema";
import moment from "moment/moment";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Calendar, AlertTriangle } from "lucide-react";
import { eq, and, sql } from "drizzle-orm";
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

function AddExpense({
  budgetId,
  budgetAmount,
  user,
  refreshData,
  editingExpense,
  onEditComplete,
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);
  const [pendingExpense, setPendingExpense] = useState(null);

  // Düzenleme modunda başlangıç değerlerini ayarla
  useEffect(() => {
    if (editingExpense) {
      setName(editingExpense.name);
      setAmount(editingExpense.amount.toString());
      // Tarihi uygun formata dönüştür
      const expenseDate = moment(editingExpense.createdAt).format("YYYY-MM-DD");
      setSelectedDate(expenseDate);
    }
  }, [editingExpense]);

  // Mevcut toplam harcamayı getir
  const getCurrentTotalSpent = async () => {
    try {
      const result = await db
        .select({
          totalSpent: sql`COALESCE(SUM(CAST(${Expenses.amount} AS DECIMAL)), 0)`,
        })
        .from(Expenses)
        .where(
          and(
            eq(Expenses.budgetId, budgetId),
            eq(Expenses.createdBy, user?.primaryEmailAddress?.emailAddress),
            // Düzenleme modundaysa mevcut harcamayı hariç tut
            editingExpense
              ? sql`${Expenses.id} != ${editingExpense.id}`
              : sql`1=1`
          )
        );

      return Number(result[0]?.totalSpent || 0);
    } catch (error) {
      console.error("Toplam harcama hesaplanırken hata:", error);
      return 0;
    }
  };

  // Bütçe aşımı kontrolü
  const checkBudgetOverflow = async (newAmount) => {
    if (!budgetAmount || !newAmount) return false;

    const currentTotal = await getCurrentTotalSpent();
    const newTotal = currentTotal + Number(newAmount);
    const budgetLimit = Number(budgetAmount);

    return newTotal > budgetLimit;
  };

  const handleExpenseSubmit = async () => {
    // Bütçe aşımı kontrolü
    const willOverflow = await checkBudgetOverflow(amount);

    if (willOverflow && !editingExpense) {
      // Uyarı göster ve kullanıcı onayını bekle
      setPendingExpense({ name, amount, selectedDate });
      setShowBudgetWarning(true);
      return;
    }

    // Doğrudan ekle
    await addNewExpense();
  };

  const addNewExpense = async (forceAdd = false) => {
    try {
      if (editingExpense) {
        // Güncelleme işlemi - sadece kullanıcının kendi harcamasını güncelleyebilir
        const result = await db
          .update(Expenses)
          .set({
            name: name,
            amount: amount,
            createdAt: moment(selectedDate).format("DD/MM/yyyy"),
          })
          .where(
            and(
              eq(Expenses.id, editingExpense.id),
              eq(Expenses.createdBy, user?.primaryEmailAddress?.emailAddress)
            )
          )
          .returning();

        if (result) {
          refreshData();
          toast("Harcama güncellendi");
          onEditComplete && onEditComplete();
          resetForm();
        }
      } else {
        // Yeni ekleme işlemi
        const result = await db
          .insert(Expenses)
          .values({
            name: name,
            amount: amount,
            budgetId: budgetId,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            createdAt: moment(selectedDate).format("DD/MM/yyyy"),
          })
          .returning({ insertedId: Expenses.id });

        if (result) {
          refreshData();
          if (forceAdd) {
            toast("Harcama eklendi (Bütçe aşıldı!)");
          } else {
            toast("Yeni harcama eklendi");
          }
          resetForm();
        }
      }
    } catch (error) {
      console.error("İşlem sırasında hata:", error);
      toast("İşlem sırasında bir hata oluştu");
    }
  };

  const handleBudgetWarningConfirm = async () => {
    setShowBudgetWarning(false);
    await addNewExpense(true); // forceAdd = true
    setPendingExpense(null);
  };

  const handleBudgetWarningCancel = () => {
    setShowBudgetWarning(false);
    setPendingExpense(null);
  };

  const resetForm = () => {
    setName("");
    setAmount("");
    setSelectedDate(moment().format("YYYY-MM-DD"));
  };

  return (
    <div className="border p-5 rounded-lg">
      <h2 className="font-bold mb-5 text-gray-900">
        {editingExpense ? "Harcama Düzenle" : "Harcama Ekle"}
      </h2>
      <div className="mt-2">
        <h2 className="text-gray-900 font-medium my-1">Harcama Adı</h2>
        <Input
          placeholder="Örn. Migros"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mt-2">
        <h2 className="text-gray-900 font-medium my-1">Tutar</h2>
        <Input
          type="number"
          placeholder="Örn. 2500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="mt-2">
        <h2 className="text-gray-900 font-medium my-1 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Tarih
        </h2>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={moment().format("YYYY-MM-DD")} // Gelecek tarih seçilemesin
        />
      </div>
      <div className="flex gap-2 mt-5">
        {editingExpense && (
          <Button
            variant="outline"
            onClick={() => {
              onEditComplete && onEditComplete();
              resetForm();
            }}
            className="flex-1"
          >
            İptal
          </Button>
        )}
        <Button
          disabled={!(name && amount && selectedDate)}
          onClick={() => handleExpenseSubmit()}
          className={`${
            editingExpense ? "flex-1" : "w-full"
          } bg-blue-800 hover:bg-blue-900`}
        >
          {editingExpense ? "Güncelle" : "Ekle"}
        </Button>
      </div>

      {/* Bütçe Aşımı Uyarısı */}
      <AlertDialog open={showBudgetWarning} onOpenChange={setShowBudgetWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Bütçe Aşımı Uyarısı
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700">
              Bu harcamayı eklerseniz bütçenizi aşacaksınız!
              <br />
              <br />
              <strong>Bütçe Limiti:</strong>{" "}
              {budgetAmount
                ? new Intl.NumberFormat("tr-TR").format(budgetAmount)
                : 0}{" "}
              ₺
              <br />
              <strong>Eklenecek Tutar:</strong>{" "}
              {pendingExpense
                ? new Intl.NumberFormat("tr-TR").format(pendingExpense.amount)
                : 0}{" "}
              ₺
              <br />
              <br />
              Yine de devam etmek istiyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleBudgetWarningCancel}>
              İptal Et
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBudgetWarningConfirm}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Yine de Ekle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AddExpense;
