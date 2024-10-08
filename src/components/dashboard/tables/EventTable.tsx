"use client";
import React, { useEffect, useState } from 'react'
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
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
} from "@/components/ui/table"
import { Event } from '@/utils/constants/admin-dashboard';
import { useRouter } from 'next/navigation';
import parse from 'html-react-parser';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase-client';




type Props = {
    data: Event[];
}

const EventTable = ({ data }: Props) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [isEventRegistrationOpen, setIsEventRegistrationOpen] = useState(false);
    const router = useRouter();



     const columns: ColumnDef<Event>[] = [
      {
          accessorKey: "name",
          header: "Name",
          cell: ({ row }) => (
              <div className="capitalize">{row?.getValue("name")}</div>
          ),
      },
      {
          accessorKey: "duration",
          header: "Duration",
          cell: ({ row }) => (
              <div className="capitalize">{parse(row?.getValue("duration"))}</div>
          ),
      },
      {
          accessorKey: "type",
          header: "Event Mode",
          cell: ({ row }) => (
              <div className="capitalize">{row?.getValue("type")}</div>
          ),
      },
      {
          accessorKey: "isOpen",
          header: "Registration",
          cell: ({ row }) =>{
            const [isEventRegistrationOpen, setIsEventRegistrationOpen] = useState<any>(row.original.isOpen);
            const toggleRegistrationOpen = async () => {
              setIsEventRegistrationOpen(!isEventRegistrationOpen);
              const { data, error } = await supabase
                .from("events")
                .update({
                  is_open: !isEventRegistrationOpen,
                })
                .eq("id", row.original.id);
            };
            return (
              <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                checked={isEventRegistrationOpen == true ? true : false}
                onChange={toggleRegistrationOpen}
                value={isEventRegistrationOpen}
                type="checkbox"
                className="peer sr-only"
              />
              <div className="peer relative h-6 w-11 rounded-full bg-black  before:bg-white after:absolute  after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-regalia peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4  rtl:peer-checked:after:-translate-x-full"></div>
            </label>
          )},
      },
      {
          id: "actions",
          header: "Actions",
          enableHiding: false,
          cell: ({ row }) => {
              const payment = row.original
              const router = useRouter();
              return (
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                      <Link  href={`/coordinator/${row.original.id}/edit`}>
                          <DropdownMenuItem
                         
                          >
                            Edit
                              
                          </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem>
                              Delete
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              )
          },
      },
  ]

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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter emails..."
                    value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("email")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <div className="ml-auto flex gap-x-4">
                    <Button
                        onClick={() => router.push('/admin/manage-events/add-event')}
                    >
                        Add Event
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
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
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
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
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default EventTable