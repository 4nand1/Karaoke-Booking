"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash } from "lucide-react";
import { useEffect, useState } from "react";

import { toast } from "sonner";

import { api } from "@/lib/axios";
import { CategoryCombobox } from "./CategoryCombobox";

const toCategoryId = (cat: any): string => {
  if (!cat) return "";
  if (typeof cat === "string") return cat;
  if (Array.isArray(cat)) return cat?.[0]?._id || cat?.[0] || "";
  return cat?._id || "";
};

export const ItemEditCard = ({
  item,
  onAddToCart,
}: {
  item: any;
  onAddToCart: (item: any) => void;
}) => {
  const [currentItem, setCurrentItem] = useState<any>({
    ...item,
    // ✅ normalize categoryId into string right away
    categoryId: toCategoryId(item.categoryId),
  });

  const [checked, setChecked] = useState(false);
  const [quantity, setQuantity] = useState(0);

  // optional: if parent re-renders with new item, keep state synced
  useEffect(() => {
    setCurrentItem({
      ...item,
      categoryId: toCategoryId(item.categoryId),
    });
  }, [item]);

  const handleClick = () => {
    setChecked((prev) => !prev);

    if (!checked) {
      onAddToCart?.(currentItem);
      toast.success("Added to cart!");
    }
  };

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 0 ? prev - 1 : 0));

  const handleDelete = async (_id: string) => {
    try {
      const token = localStorage.getItem("accessToken");

      await api.delete(`/items/${_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Item deleted successfully");
    } catch (err) {
      console.error("Delete item failed:", err);
      toast.error("Failed to delete item");
    }
  };

  const handleEdit = async (_id: string) => {
    try {
      const token = localStorage.getItem("accessToken");

      // ✅ send only what backend expects
      const payload = {
        name: currentItem.name,
        price: Number(currentItem.price),
        ingredients: currentItem.ingredients,
        imageUrl: currentItem.imageUrl,
        categoryId: toCategoryId(currentItem.categoryId),
      };

      await api.put(`/items/${_id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Item updated successfully");
    } catch (err) {
      console.error("Update item failed:", err);
      toast.error("Failed to update item");
    }
  };

  return (
    <Dialog>
      <div className="h-85.5 rounded-4xl bg-white flex flex-col gap-5 p-4 border border-gray-200">
        <div className="relative">
          <DialogTrigger asChild>
            <Button
              onClick={handleClick}
              className={`
                absolute bottom-3 right-3 w-10 h-10 p-0 rounded-full text-[20px] font-semibold flex items-center justify-center
                transition-all
                ${
                  checked
                    ? "bg-[#EF4444] text-white"
                    : "bg-white text-[#EF4444] shadow-md"
                }
              `}
            >
              <Pencil />
            </Button>
          </DialogTrigger>
        </div>

        <div className="flex flex-col gap-2 cursor-pointer">
          <div className="flex justify-between items-center">
            <p className="text-[24px] text-[#EF4444] font-semibold">
              {item.name}
            </p>
            <p className="font-semibold text-[18px]">{item.price}</p>
          </div>
        </div>

        <DialogContent className="max-w-200 w-full p-0 rounded-2xl">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6 p-6 bg-white rounded-2xl">
            <div className="flex flex-col justify-between w-full gap-5">
              <div>
                <Label className="text-[18px] font-semibold">Items info</Label>
              </div>

              <div className="flex gap-2 items-center">
                <p className="text-[12px] text-[#71717A] flex-1">Item name</p>
                <Input
                  value={currentItem.name ?? ""}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, name: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2 items-center">
                <p className="text-[12px] text-[#71717A] flex-1">Category</p>

                <div className="flex-[3]">
                  <CategoryCombobox
                    value={currentItem.categoryId}
                    onChange={(newCategoryId: string) =>
                      setCurrentItem({
                        ...currentItem,
                        categoryId: newCategoryId,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <p className="text-[12px] text-[#71717A] flex-1">Price</p>
                <Input
                  type="number"
                  value={currentItem.price ?? 0}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      price: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="flex justify-between">
                <Button
                  className="h-10 w-12 border border-red-400"
                  variant={"outline"}
                  onClick={() => handleDelete(currentItem._id)}
                >
                  <Trash className="text-red-400" />
                </Button>

                <Button onClick={() => handleEdit(currentItem._id)}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
};
