"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";
import { api } from "@/lib/axios";

import React, { useEffect, useState } from "react";

const itemFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Item name must be at least 2 characters." }),

  price: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Price must be a valid positive number." },
  ),

  categoryId: z.string().min(1, { message: "Please select a category." }),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

type Category = {
  _id: string;
  name: string;
};

export const CreateItemDialog = () => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      price: "",
      categoryId: "",
    },
  });

  const onSubmit = async (values: ItemFormValues) => {
    try {
      setIsUploading(true);

      const token = localStorage.getItem("accessToken");

      await api.post(
        "/foods/create",
        {
          name: values.name,
          price: parseFloat(values.price),
          categoryId: values.categoryId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      form.reset();
      setOpen(false);
    } catch (err) {
      console.error("Create item failed:", err);
      alert("Failed to create item. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get<Category[]>("/categories");
        setCategories(data);
      } catch (e) {
        console.error("Failed to load categories:", e);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-full flex flex-col gap-4 items-center justify-center p-4"
        >
          <Plus />
          Add New Item
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add new Item</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* NAME */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item name</FormLabel>
                    <FormControl>
                      <Input placeholder="Type item name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PRICE */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item price</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter price..."
                        inputMode="decimal"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* CATEGORY */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isUploading}
                className="bg-black text-white hover:bg-black/90"
              >
                {isUploading ? "Creating..." : "Add Item"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
