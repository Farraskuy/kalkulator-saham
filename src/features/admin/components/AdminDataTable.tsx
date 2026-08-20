"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type React from "react";

export type AdminTableColumn<T> = {
  id: string;
  label: string;
  getValue: (item: T) => string | number | Date | null | undefined;
  render: (item: T) => React.ReactNode;
  className?: string;
};

export type AdminTableFilter<T> = {
  id: string;
  label: string;
  options: { label: string; value: string }[];
  matches: (item: T, value: string) => boolean;
};

type Props<T> = {
  title: string;
  description: string;
  items: T[];
  columns: AdminTableColumn<T>[];
  getKey: (item: T) => string;
  searchFields: (item: T) => string[];
  searchPlaceholder: string;
  filters?: AdminTableFilter<T>[];
  emptyText: string;
  renderActions?: (item: T) => React.ReactNode;
  pageSize?: number;
};

function normalize(value: string | number | Date | null | undefined) {
  if (value === null || value === undefined) return "";
  return value instanceof Date ? value.getTime().toString() : String(value);
}

export default function AdminDataTable<T>({
  title,
  description,
  items,
  columns,
  getKey,
  searchFields,
  searchPlaceholder,
  filters = [],
  emptyText,
  renderActions,
  pageSize = 8,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ id: string; direction: "asc" | "desc" }>({
    id: columns[0]?.id || "",
    direction: "asc",
  });
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("id-ID");
    const filtered = items.filter((item) => {
      const matchedSearch =
        !keyword ||
        searchFields(item).some((value) =>
          value.toLocaleLowerCase("id-ID").includes(keyword),
        );
      const matchedFilters = filters.every(
        (filter) =>
          !filterValues[filter.id] ||
          filter.matches(item, filterValues[filter.id]),
      );
      return matchedSearch && matchedFilters;
    });
    const column = columns.find((item) => item.id === sort.id);
    if (!column) return filtered;
    return [...filtered].sort((left, right) => {
      const a = normalize(column.getValue(left));
      const b = normalize(column.getValue(right));
      const comparison = a.localeCompare(b, "id-ID", {
        numeric: true,
        sensitivity: "base",
      });
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [columns, filterValues, filters, items, query, searchFields, sort]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(
    () => setPage((current) => Math.min(current, totalPages)),
    [totalPages],
  );
  useEffect(() => setPage(1), [query, filterValues, sort]);
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const setSortColumn = (id: string) => {
    setSort((current) =>
      current.id === id
        ? { id, direction: current.direction === "asc" ? "desc" : "asc" }
        : { id, direction: "asc" },
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border-custom bg-card">
      <div className="border-b border-border-custom px-4 py-3.5">
        <h2 className="text-sm font-bold text-main">{title}</h2>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
      <div className="flex flex-col gap-3 border-b border-border-custom p-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block min-w-0 lg:w-80">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-xl border border-border-custom bg-page pl-9 pr-3 text-sm text-main outline-none focus:border-acc-blue"
          />
        </label>
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <label key={filter.id} className="relative">
                <select
                  value={filterValues[filter.id] || ""}
                  onChange={(event) =>
                    setFilterValues((current) => ({
                      ...current,
                      [filter.id]: event.target.value,
                    }))
                  }
                  className="h-10 appearance-none rounded-xl border border-border-custom bg-card py-0 pl-3 pr-8 text-sm font-medium text-main outline-none focus:border-acc-blue"
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
                />
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-sub-slate/70 text-xs font-semibold text-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`px-4 py-3 ${column.className || ""}`}
                >
                  <button
                    type="button"
                    onClick={() => setSortColumn(column.id)}
                    className="inline-flex items-center gap-1.5 hover:text-main"
                  >
                    {column.label}
                    <ChevronsUpDown
                      size={14}
                      className={sort.id === column.id ? "text-acc-blue" : ""}
                    />
                  </button>
                </th>
              ))}
              {renderActions && <th className="px-4 py-3 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-custom">
            {pageRows.map((item) => (
              <tr key={getKey(item)} className="hover:bg-sub-slate/50">
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={`px-4 py-3.5 ${column.className || ""}`}
                  >
                    {column.render(item)}
                  </td>
                ))}
                {renderActions && (
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-1">
                      {renderActions(item)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="px-4 py-14 text-center text-sm text-muted"
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-2 border-t border-border-custom px-4 py-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>
          Menampilkan {pageRows.length ? (page - 1) * pageSize + 1 : 0}–
          {Math.min(page * pageSize, rows.length)} dari {rows.length} data
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-lg border border-border-custom p-1.5 disabled:opacity-40"
          >
            <ChevronLeft size={15} />
          </button>
          <span>
            Halaman {page}/{totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-border-custom p-1.5 disabled:opacity-40"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
