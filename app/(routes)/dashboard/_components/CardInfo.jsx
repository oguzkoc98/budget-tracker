"use client";
import { useEffect, useState } from "react";
import { Wallet, TrendingUp, Hash } from "lucide-react";

function CardInfo({ budgetList }) {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);

  useEffect(() => {
    if (budgetList && budgetList.length > 0) {
      CalculateCardInfo();
    }
  }, [budgetList]);

  const CalculateCardInfo = () => {
    let totalBudget_ = 0;
    let totalSpend_ = 0;

    budgetList.forEach((budget) => {
      totalBudget_ = totalBudget_ + Number(budget.amount);
      totalSpend_ = totalSpend_ + (budget.totalSpend || 0);
    });

    // State'leri güncelle
    setTotalBudget(totalBudget_);
    setTotalSpend(totalSpend_);
  };

  const calculateUsagePercentage = () => {
    if (totalBudget === 0) return 0;
    return ((totalSpend / totalBudget) * 100).toFixed(1);
  };

  return (
    <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="text-gray-800">
            <h2 className="text-sm font-medium text-gray-600">Toplam Bütçe</h2>
            <h2 className="font-bold text-2xl text-gray-900 mt-1">
              {totalBudget.toLocaleString("tr-TR")} ₺
            </h2>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="text-gray-800">
            <h2 className="text-sm font-medium text-gray-600">
              Toplam Harcama
            </h2>
            <h2 className="font-bold text-2xl text-gray-900 mt-1">
              {totalSpend.toLocaleString("tr-TR")} ₺
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              %{calculateUsagePercentage()} kullanıldı
            </p>
          </div>
          <div className="p-3 bg-red-100 rounded-full">
            <TrendingUp className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Toplam Bütçe Sayısı Kartı */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="text-gray-800">
            <h2 className="text-sm font-medium text-gray-600">
              Toplam Bütçe Sayısı
            </h2>
            <h2 className="font-bold text-2xl text-gray-900 mt-1">
              {budgetList ? budgetList.length : 0}
            </h2>
            <p className="text-xs text-gray-500 mt-1">Aktif bütçe</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <Hash className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardInfo;
