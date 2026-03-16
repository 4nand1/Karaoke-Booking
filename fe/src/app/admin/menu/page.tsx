"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateCategoryDialog } from "./CreateCategoryDialog";
import { CreateItemDialog } from "./CreateItemDialog";
import { ItemEditCard } from "./ItemEditCard";
import { api } from "@/lib/axios";

type Item = {
  _id: string;
  name: string;
  price: number;
  categoryId: Array<{
    _id: string;
    name: string;
  }>;
};

type Categories = {
  _id: string;
  name: string;
};

export default function Home() {
  const [categories, setCategories] = useState<Categories[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, itemRes] = await Promise.all([
          api.get<Categories[]>("/categories"),
          api.get<Item[]>("/items", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }),
        ]);

        setCategories(catRes.data);

        const normalizedItems = itemRes.data.map((i: any) => ({
          ...i,
          categoryId: Array.isArray(i.categoryId)
            ? i.categoryId
            : i.categoryId
              ? [i.categoryId]
              : [],
        }));
        setItems(normalizedItems);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const onAddToCart = (item: Item) => {
    console.log("Added to cart:", item);
  };

  const filteredCategories = selectedCategory
    ? categories.filter((cat) => cat._id === selectedCategory)
    : categories;

  return (
    <div className="min-h-screen bg-secondary p-8">
      <div className="w-full h-fit bg-white rounded-2xl p-5 mb-8 gap-4 flex flex-col text-[20px] font-semibold">
        Menu
      </div>

      <div className="w-full h-fit bg-white rounded-2xl p-5 mb-8 gap-4 flex flex-col">
        <p className="text-[20px] font-semibold">Category</p>
        <div className="flex gap-2 flex-wrap">
          <span
            onClick={() => setSelectedCategory(null)}
            className={`border rounded-full px-5 py-2 text-sm font-medium cursor-pointer transition ${
              selectedCategory === null
                ? "bg-black text-white"
                : "border-secondary hover:bg-black hover:text-white"
            }`}
          >
            All
          </span>

          {categories.map((category) => (
            <span
              key={category._id}
              onClick={() => setSelectedCategory(category._id)}
              className={`border rounded-full px-5 py-2 text-sm font-medium cursor-pointer transition ${
                selectedCategory === category._id
                  ? "bg-black text-white"
                  : "border-secondary hover:bg-black hover:text-white"
              }`}
            >
              {category.name}
            </span>
          ))}
          <CreateCategoryDialog />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {filteredCategories.map((category) => {
          const itemsInCategory = items.filter((item) =>
            item.categoryId.some((cat) => cat._id === category._id),
          );

          return (
            <div key={category._id} className="border rounded-lg bg-white p-5">
              <p className="text-[20px] font-semibold mb-5">{category.name}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <CreateItemDialog />

                {itemsInCategory.map((item) => (
                  <ItemEditCard
                    key={item._id}
                    item={item}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
