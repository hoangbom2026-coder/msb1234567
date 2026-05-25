import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { ChevronDown, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: any
  searchKey?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  searchKey = "phone"
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    meta,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full h-full flex flex-col min-w-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 pt-1 px-4">
        <div className="relative w-full max-w-sm group">
            <Input
                placeholder={`Tìm kiếm theo ${searchKey}...`}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                    table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                className="h-10 bg-white/5 border-white/10 rounded-lg focus-visible:ring-primary/20 transition-all hover:bg-white/[0.08] text-xs"
            />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 px-4 rounded-lg bg-white/5 border border-white/10 text-primary/60 hover:text-primary transition-all gap-2 text-[10px] font-black uppercase tracking-wider">
                        <SlidersHorizontal size={16} />
                        <span className="hidden sm:inline">Hiển thị</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#050a12] border-white/10 text-white p-2 rounded-2xl shadow-2xl min-w-[200px]">
                    <div className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1">Tùy chỉnh cột</div>
                    {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                            return (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize rounded-xl focus:bg-primary/20 focus:text-primary text-[10px] font-black uppercase tracking-widest px-4 py-2.5 my-0.5"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) =>
                                        column.toggleVisibility(!!value)
                                    }
                                >
                                    {column.id}
                                </DropdownMenuCheckboxItem>
                            )
                        })
                    }
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar border-y border-white/5">
        <div className="min-w-full inline-block align-middle">
            <Table>
              <TableHeader className="bg-white/[0.03] sticky top-0 z-10 backdrop-blur-md">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent border-white/5">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="px-3 md:px-4 h-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="group hover:bg-white/[0.02] border-white/5"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-3 md:px-4 py-2.5">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-60 text-center text-slate-500 italic text-xs font-bold uppercase tracking-widest opacity-30"
                    >
                      Không có dữ liệu hiển thị
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-black/10">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          Hiển thị <span className="text-primary">{table.getRowModel().rows.length}</span> bản ghi
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-black text-slate-400 uppercase">
            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:text-primary transition-all disabled:opacity-20"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:text-primary transition-all disabled:opacity-20"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight size={16} />
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
