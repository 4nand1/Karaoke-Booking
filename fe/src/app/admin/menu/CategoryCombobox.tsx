"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const frameworks = [
  { value: "All Dishes", label: "All Dishes" },
  { value: "Appetizers", label: "Appetizers" },
  { value: "Salads", label: "Salads" },
  { value: "Pizzas", label: "Pizzas" },
  { value: "Lunch favorites", label: "Lunch favorites" },
  { value: "Main dishes", label: "Main dishes" },
  { value: "Fish & Sea foods", label: "Fish & Sea foods" },
];

type CategoryComboboxProps = {
  value: string;
  onChange: (newCategoryId: string) => void;
};

export const CategoryCombobox = ({
  value,
  onChange,
}: CategoryComboboxProps) => {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-50 justify-between border")}
        >
          {
            frameworks.find((framework) => framework.value === selectedValue)
              ?.label
          }
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-50 p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setSelectedValue(currentValue);
                    setOpen(false);
                  }}
                >
                  {framework.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedValue === framework.value
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
