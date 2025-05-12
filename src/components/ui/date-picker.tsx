"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Update props to accept value and onSelect for form integration
interface DatePickerProps extends Omit<React.ComponentProps<typeof Button>, 'onSelect' | 'value'> {
 id?: string;
 value?: Date; // Accept Date object value
 onSelect?: (date: Date | undefined) => void; // Function to call when date is selected
}


export function DatePicker({ className, id, value, onSelect, ...props }: DatePickerProps) {
  // Removed internal state, rely on props for value and updates
  // const [date, setDate] = React.useState<Date>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground", // Check value prop
             className
          )}
           {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>Pick a date</span>} {/* Use value prop */}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value} // Use value prop
          onSelect={onSelect} // Use onSelect prop
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
