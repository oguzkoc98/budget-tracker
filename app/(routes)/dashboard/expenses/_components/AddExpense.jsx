import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/utils/dbConfig";
import { Expenses } from "@/utils/schema";
import moment from "moment/moment";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Calendar } from "lucide-react";
import { eq } from "drizzle-orm";

function AddExpense({
  budgetId,
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

  const addNewExpense = async () => {
    try {
      if (editingExpense) {
        // Güncelleme işlemi
        const result = await db
          .update(Expenses)
          .set({
            name: name,
            amount: amount,
            createdAt: moment(selectedDate).format("DD/MM/yyyy"),
          })
          .where(eq(Expenses.id, editingExpense.id))
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
            createdAt: moment(selectedDate).format("DD/MM/yyyy"),
          })
          .returning({ insertedId: Expenses.id });

        if (result) {
          refreshData();
          toast("Yeni harcama eklendi");
          resetForm();
        }
      }
    } catch (error) {
      console.error("İşlem sırasında hata:", error);
      toast("İşlem sırasında bir hata oluştu");
    }
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
          onClick={() => addNewExpense()}
          className={`${
            editingExpense ? "flex-1" : "w-full"
          } bg-blue-800 hover:bg-blue-900`}
        >
          {editingExpense ? "Güncelle" : "Ekle"}
        </Button>
      </div>
    </div>
  );
}

export default AddExpense;
