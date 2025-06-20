"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/dbConfig";
import { Budgets } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

function CreateBudget({ refreshData }) {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  const onCreateBudget = async () => {
    try {
      const result = await db
        .insert(Budgets)
        .values({
          name: name,
          amount: budget,
          createdBy: user?.primaryEmailAddress?.emailAddress,
        })
        .returning({ insertedId: Budgets.id });

      if (result) {
        toast("Yeni bütçe eklendi");
        setName("");
        setBudget("");
        setOpen(false);

        // Listeyi yenile
        if (refreshData) {
          refreshData();
        }
      }
    } catch (error) {
      console.error("Bütçe ekleme hatası:", error);
      toast("Bütçe eklenirken bir hata oluştu");
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="bg-slate-100 p-10 rounded-md items-center flex flex-col border-2 border-accent cursor-pointer hover:shadow-sm h-[170px] justify-center">
            <h2 className="text-3xl text-gray-700">+</h2>
            <h2 className="text-gray-700">Yeni Bütçe Ekle</h2>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Bütçe Ekle</DialogTitle>
            <DialogDescription>
              Yeni bir bütçe oluşturun ve harcamalarınızı takip etmeye başlayın.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5">
            <div className="mt-2">
              <label className="text-gray-900 font-medium text-sm">
                Bütçe Adı
              </label>
              <Input
                placeholder="Örn. Maaş"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="mt-4">
              <label className="text-gray-900 font-medium text-sm">Bütçe</label>
              <Input
                type="number"
                placeholder="Örn. 10000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              disabled={!(name && budget)}
              onClick={onCreateBudget}
              className="mt-5 w-full bg-blue-800 hover:bg-blue-900"
            >
              Ekle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateBudget;
