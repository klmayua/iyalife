import React from "react";
import { cn } from "@iyalife/ui";

export interface Column<T> {
  key:      keyof T | string;
  label:    string;
  render?:  (row: T) => React.ReactNode;
  align?:   "left" | "right" | "center";
  hide?:    "sm" | "md";
}

interface Props<T> {
  columns:  Column<T>[];
  data:     T[];
  loading?: boolean;
  empty?:   string;
  onRow?:   (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns, data, loading, empty = "No data found.", onRow,
}: Props<T>) {
  if (loading) {
    return (
      <div className="rounded-brand border border-brand-border overflow-hidden animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-brand-surface border-b border-brand-border" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-brand border border-dashed border-brand-border
        py-16 text-center text-brand-muted text-sm">
        {empty}
      </div>
    );
  }

  return (
    <div className="rounded-brand border border-brand-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-surface border-b border-brand-border">
            <tr>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide",
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                    col.hide === "sm" && "hidden sm:table-cell",
                    col.hide === "md" && "hidden md:table-cell",
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRow?.(row)}
                className={cn(
                  "border-b border-brand-border last:border-0",
                  "hover:bg-brand-surface transition-colors",
                  onRow && "cursor-pointer",
                )}
              >
                {columns.map(col => (
                  <td
                    key={String(col.key)}
                    className={cn(
                      "px-4 py-3 text-brand-ink",
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                      col.hide === "sm" && "hidden sm:table-cell",
                      col.hide === "md" && "hidden md:table-cell",
                    )}
                  >
                    {col.render ? col.render(row) : row[col.key as keyof T] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
