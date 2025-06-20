import { db } from "@/utils/dbConfig";
import { Expenses } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Trash2, Calendar, TrendingUp, Wallet, Edit3 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

function ExpensesListTable({ expensesList, refreshData, onEditExpense }) {
  const [deletingId, setDeletingId] = useState(null);

  const deleteExpense = async (expense) => {
    setDeletingId(expense.id);
    try {
      const result = await db
        .delete(Expenses)
        .where(eq(Expenses.id, expense.id))
        .returning();

      if (result) {
        toast.success("Harcama kaydı silindi.");
        refreshData();
      }
    } catch (error) {
      toast.error("Harcama silinirken bir hata oluştu.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (!expensesList || expensesList.length === 0) {
    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">0 kayıt</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Henüz harcama eklenmemiş
          </h4>
          <p className="text-gray-500">
            İlk harcamanızı ekleyerek takip etmeye başlayın
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">{expensesList.length} kayıt</div>
      </div>

      <div className="space-y-3">
        {expensesList.map((expense) => (
          <div
            key={expense.id}
            className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-base">
                    {expense.name}
                  </h4>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-800">
                      {formatAmount(expense.amount)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      {formatDate(expense.createdAt)}
                    </div>
                    {expense.budgetName && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                      >
                        <Wallet className="w-3 h-3 mr-1" />
                        {expense.budgetName}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onEditExpense && onEditExpense(expense)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg active:scale-95 transition-all duration-150"
                      title="Harcamayı düzenle"
                      style={{
                        touchAction: "manipulation",
                        WebkitTouchCallout: "none",
                      }}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteExpense(expense)}
                      disabled={deletingId === expense.id}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-150"
                      title="Harcamayı sil"
                      style={{
                        touchAction: "manipulation",
                        WebkitTouchCallout: "none",
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExpensesListTable;
