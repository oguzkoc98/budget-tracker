import Link from "next/link";

function BudgetItem({ budget }) {
  console.log("Budget Item:", budget); // Debug

  const calculateProgressPerc = () => {
    const perc = (budget?.totalSpend / budget?.amount) * 100;
    return perc > 100 ? 100 : perc.toFixed(2);
  };

  const getRemainingAmount = () => {
    return budget?.amount - (budget?.totalSpend || 0);
  };

  const isOverBudget = () => {
    return getRemainingAmount() < 0;
  };

  return (
    <Link href={"/dashboard/expenses/" + budget?.id}>
      <div className="p-5 border rounded-lg hover:shadow-md cursor-pointer h-[170px]">
        <div className="flex gap-2 items-center justify-between">
          <div>
            <h2 className="font-bold">{budget?.name || "Bütçe Adı"}</h2>
            <h2 className="text-sm text-gray-500">
              {budget?.totalItem || 0} Harcama Kaydı
            </h2>
          </div>
          <h2 className="font-black text-blue-800 text-xl">
            {budget?.amount
              ? `${Number(budget.amount).toLocaleString("tr-TR")} ₺`
              : "0₺"}
          </h2>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs text-slate-400">
              {(budget?.totalSpend || 0).toLocaleString("tr-TR")} ₺ Harcandı
            </h2>
            <h2
              className={`text-xs ${
                isOverBudget() ? "text-red-500 font-semibold" : "text-slate-400"
              }`}
            >
              {getRemainingAmount().toLocaleString("tr-TR")} ₺{" "}
              {isOverBudget() ? "Aştı" : "Kaldı"}
            </h2>
          </div>
          <div className="w-full bg-slate-300 h-2 rounded-full">
            <div
              className={`h-2 rounded-full ${
                isOverBudget() ? "bg-red-500" : "bg-blue-800"
              }`}
              style={{
                width: `${calculateProgressPerc()}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default BudgetItem;
