import React, { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, Info } from "lucide-react";

function BarChartDashboard({ budgetList }) {
  const [chartView, setChartView] = useState("comparison"); // karşılaştırma, harcama, bütçe

  const formatAmount = (amount) => {
    return (
      new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(amount) || 0) + " ₺"
    );
  };

  const getChartData = () => {
    if (!budgetList || budgetList.length === 0) return [];

    return budgetList.map((budget) => ({
      name:
        budget.name.length > 10
          ? budget.name.substring(0, 10) + "..."
          : budget.name,
      fullName: budget.name,
      totalSpend: Number(budget.totalSpend) || 0,
      budgetAmount: Number(budget.amount) || 0,
      remaining: Math.max(
        0,
        (Number(budget.amount) || 0) - (Number(budget.totalSpend) || 0)
      ),
      percentage:
        ((Number(budget.totalSpend) || 0) / (Number(budget.amount) || 1)) * 100,
      isOverBudget:
        (Number(budget.totalSpend) || 0) > (Number(budget.amount) || 0),
      totalItem: Number(budget.totalItem) || 0,
    }));
  };

  const getBarColor = (data, index) => {
    if (chartView === "spending") {
      return data.isOverBudget ? "#ef4444" : "#3b82f6";
    }
    return index % 2 === 0 ? "#3b82f6" : "#1e40af";
  };

  const chartData = getChartData();
  const totalBudget = chartData.reduce(
    (sum, item) => sum + (Number(item.budgetAmount) || 0),
    0
  );
  const totalSpent = chartData.reduce(
    (sum, item) => sum + (Number(item.totalSpend) || 0),
    0
  );
  const overBudgetCount = chartData.filter((item) => item.isOverBudget).length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = chartData.find((item) => item.name === label);
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data?.fullName}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">
              Harcanan:{" "}
              <span className="font-medium">
                {formatAmount(data?.totalSpend || 0)}
              </span>
            </p>
            <p className="text-gray-600">
              Bütçe:{" "}
              <span className="font-medium">
                {formatAmount(data?.budgetAmount || 0)}
              </span>
            </p>
            <p className="text-gray-600">
              Kalan:{" "}
              <span className="font-medium">
                {formatAmount(data?.remaining || 0)}
              </span>
            </p>
            <p className="text-gray-600">
              İşlem:{" "}
              <span className="font-medium">{data?.totalItem || 0} adet</span>
            </p>
            {data?.percentage && (
              <p
                className={`font-medium ${
                  data.isOverBudget ? "text-red-600" : "text-green-600"
                }`}
              >
                %{Math.round(data.percentage)} kullanıldı
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (chartView) {
      case "comparison":
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k ₺`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="totalSpend"
              name="Harcanan"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="budgetAmount"
              name="Bütçe"
              fill="#e5e7eb"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case "spending":
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k ₺`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalSpend" name="Harcama" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry, index)} />
              ))}
            </Bar>
          </BarChart>
        );

      case "budget":
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k ₺`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="budgetAmount"
              name="Toplam Bütçe"
              fill="#1f2937"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      default:
        return null;
    }
  };

  if (!budgetList || budgetList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Bütçe Analizi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz veri bulunmuyor
            </h3>
            <p className="text-gray-500 mb-4">
              Grafik görebilmek için önce bütçe oluşturun ve harcama ekleyin
            </p>
            <Button>İlk Bütçenizi Oluşturun</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <CardTitle>Bütçe Analizi</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Select value={chartView} onValueChange={setChartView}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comparison">Karşılaştırma</SelectItem>
                <SelectItem value="spending">Harcamalar</SelectItem>
                <SelectItem value="budget">Bütçeler</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Toplam Harcama: {formatAmount(totalSpent)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Toplam Bütçe: {formatAmount(totalBudget)}
            </span>
          </div>
          {overBudgetCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {overBudgetCount} limit aşımı
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Grafik */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Grafik Açıklaması:</p>
              <p className="text-blue-700">
                {chartView === "comparison" &&
                  "Mavi barlar harcamanızı, gri barlar bütçenizi gösterir."}
                {chartView === "spending" &&
                  "Kırmızı barlar bütçe aşımını, mavi barlar normal harcamaları gösterir."}
                {chartView === "budget" &&
                  "Her kategori için belirlediğiniz bütçe miktarlarını gösterir."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BarChartDashboard;
