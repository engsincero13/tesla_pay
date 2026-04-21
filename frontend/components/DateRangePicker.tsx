"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
    className?: string
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
    onFilter?: () => void
}

export function DateRangePicker({
    className,
    date,
    setDate,
    onFilter
}: DateRangePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date)

    // Sync tempDate when modal opens or external date changes
    React.useEffect(() => {
        if (open) {
            setTempDate(date)
        }
    }, [open, date])

    const handleApply = () => {
        setDate(tempDate)
        setOpen(false)
        if (onFilter) onFilter()
    }

    const handleClear = () => {
        setTempDate(undefined)
        setDate(undefined)
        setOpen(false)
        if (onFilter) onFilter()
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal bg-background border-border text-foreground hover:bg-muted/50",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "dd 'de' MMM", { locale: ptBR })} -{" "}
                                    {format(date.to, "dd 'de' MMM", { locale: ptBR })}
                                </>
                            ) : (
                                format(date.from, "dd 'de' MMM", { locale: ptBR })
                            )
                        ) : (
                            <span>Filtrar Período</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        autoFocus
                        mode="range"
                        defaultMonth={tempDate?.from}
                        selected={tempDate}
                        onSelect={setTempDate}
                        numberOfMonths={1}
                        locale={ptBR}
                    />
                    <div className="p-3 border-t border-border flex justify-between items-center bg-muted/20">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                            Limpar filtros
                        </Button>
                        <Button size="sm" onClick={handleApply}>
                            Filtrar
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
