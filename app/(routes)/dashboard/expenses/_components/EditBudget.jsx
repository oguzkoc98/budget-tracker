"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { db } from "@/utils/dbConfig";
import { Budgets } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { toast } from "sonner";

function EditBudget({ budgetInfo, refreshData }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  // Dialog açıldığında mevcut budget bilgilerini state'e yükle
  useEffect(() => {
    if (open && budgetInfo) {
      setName(budgetInfo.name || "");
      setAmount(budgetInfo.amount?.toString() || "");
    }
  }, [open, budgetInfo]);

  const onUpdateBudget = async () => {
    try {
      // Doğrulama
      if (!name.trim()) {
        toast.error("Bütçe adı gerekli!");
        return;
      }

      if (!amount.trim() || isNaN(Number(amount))) {
        toast.error("Geçerli bir bütçe miktarı girin!");
        return;
      }

      const result = await db
        .update(Budgets)
        .set({
          name: name.trim(),
          amount: amount.trim(), // Şemada 'amount' alanı kullanılıyor
        })
        .where(eq(Budgets.id, budgetInfo.id))
        .returning();

      if (result && result.length > 0) {
        refreshData();
        toast.success("Bütçe başarıyla güncellendi!");
        setOpen(false);
      } else {
        toast.error("Bütçe güncellenirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      toast.error("Bütçe güncellenirken bir hata oluştu!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Düzenle</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bütçeyi Düzenle</DialogTitle>
          <DialogDescription>Bütçe bilgilerinizi güncelleyin</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Bütçe Adı</label>
            <Input
              placeholder="Bütçe adı girin"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Bütçe Miktarı</label>
            <Input
              type="number"
              placeholder="Bütçe miktarı girin"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={onUpdateBudget}
              disabled={!name.trim() || !amount.trim()}
            >
              Güncelle
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EditBudget;
