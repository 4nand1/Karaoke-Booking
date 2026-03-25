"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { Edit3, Plus, Soup, Trash2 } from "lucide-react"
import { apiRootUrl } from "@/lib/api-url"
import { ImageUploadField } from "@/components/ui/image-upload-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type MenuItem = {
  _id: string
  name: string
  category: "food" | "drink" | "set"
  price: number
  description?: string
  image?: string
  isAvailable: boolean
}

type Karaoke = {
  _id: string
  rooms: unknown[]
  menu: MenuItem[]
  name: string
  address: string
  city: string
  phone: string
  description: string
  openingTime: string
  closingTime: string
}

type FormState = {
  name: string
  category: MenuItem["category"]
  price: string
  description: string
  image: string
}

const emptyForm: FormState = {
  name: "",
  category: "food",
  price: "",
  description: "",
  image: "",
}

export function MenuTab({
  karaoke,
  onRefresh,
}: {
  karaoke: Karaoke
  onRefresh: () => void
}) {
  const { getToken } = useAuth()
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(false)

  const isFormOpen = adding || Boolean(editing)
  const groupedMenu = useMemo(
    () => ({
      food: karaoke.menu.filter((item) => item.category === "food"),
      drink: karaoke.menu.filter((item) => item.category === "drink"),
      set: karaoke.menu.filter((item) => item.category === "set"),
    }),
    [karaoke.menu]
  )

  async function handleAdd() {
    if (!form.name || !form.price) {
      return alert("Please enter a menu item name and price.")
    }

    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${apiRootUrl}/karaoke/${karaoke._id}/menu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          price: Number(form.price),
          description: form.description,
          image: form.image,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || "Failed to add menu item")
      }

      resetForm()
      onRefresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add menu item")
    } finally {
      setLoading(false)
    }
  }

  function startEdit(item: MenuItem) {
    setEditing(item._id)
    setAdding(false)
    setForm({
      name: item.name,
      category: item.category,
      price: String(item.price),
      description: item.description ?? "",
      image: item.image ?? "",
    })
  }

  async function handleUpdate() {
    if (!editing || !form.name || !form.price) {
      return alert("Please enter a menu item name and price.")
    }

    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(
        `${apiRootUrl}/karaoke/${karaoke._id}/menu/${editing}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name,
            category: form.category,
            price: Number(form.price),
            description: form.description,
            image: form.image,
          }),
        }
      )

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || "Failed to update menu item")
      }

      resetForm()
      onRefresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update menu item")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm("Delete this menu item?")) return

    try {
      const token = await getToken()
      const res = await fetch(`${apiRootUrl}/karaoke/${karaoke._id}/menu/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        throw new Error("Failed to delete menu item")
      }

      onRefresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete menu item")
    }
  }

  function resetForm() {
    setAdding(false)
    setEditing(null)
    setForm(emptyForm)
  }

  const inputClassName =
    "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-200"
  const labelClassName =
    "mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"

  return (
    <div className="space-y-6 text-slate-950 dark:text-slate-50">
      <div className="grid gap-4 md:grid-cols-3">
        {(["food", "drink", "set"] as const).map((category) => (
          <div
            key={category}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              {category}
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {groupedMenu[category].length}
            </p>
          </div>
        ))}
      </div>

      {!isFormOpen ? (
        <>
          <div className="grid gap-5 lg:grid-cols-3">
            {(["food", "drink", "set"] as const).map((category) => (
              <div
                key={category}
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold capitalize">{category}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {groupedMenu[category].length} items
                    </p>
                  </div>
                  <Badge variant="outline">{category}</Badge>
                </div>

                <div className="space-y-3">
                  {groupedMenu[category].length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                      No items yet.
                    </div>
                  ) : (
                    groupedMenu[category].map((item) => (
                      <div
                        key={item._id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{item.name}</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {item.price.toLocaleString()} MNT
                            </p>
                            {item.description ? (
                              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                {item.description}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(item)}
                              className="rounded-xl"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item._id)}
                              className="rounded-xl text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex w-full items-center justify-center gap-3 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-5 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-100 dark:hover:bg-slate-900"
          >
            <Plus className="h-4 w-4" />
            Add menu item
          </button>
        </>
      ) : (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                {editing ? "Edit item" : "New item"}
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                {editing ? "Update menu item" : "Add a menu item"}
              </h3>
            </div>
            <Button type="button" variant="outline" onClick={resetForm} className="rounded-2xl">
              Cancel
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClassName}>Item name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className={inputClassName}
                placeholder="Fried wings"
              />
            </div>
            <div>
              <label className={labelClassName}>Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    category: e.target.value as MenuItem["category"],
                  }))
                }
                className={inputClassName}
              >
                <option value="food">Food</option>
                <option value="drink">Drink</option>
                <option value="set">Set</option>
              </select>
            </div>
            <div>
              <label className={labelClassName}>Price</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                className={inputClassName}
                placeholder="0"
              />
            </div>
            <div>
              <label className={labelClassName}>Short description</label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className={inputClassName}
                placeholder="Popular late-night snack"
              />
            </div>
            <div className="md:col-span-2">
              <ImageUploadField
                label="Item image"
                value={form.image ? [form.image] : []}
                onChange={(images) =>
                  setForm((prev) => ({ ...prev, image: images[0] ?? "" }))
                }
                helperText="Optional, but recommended for the admin catalog."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              onClick={editing ? handleUpdate : handleAdd}
              disabled={loading}
              className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <Soup className="h-4 w-4" />
              {loading ? "Saving..." : editing ? "Save changes" : "Create item"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
