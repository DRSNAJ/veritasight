import { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

interface TableProps extends HTMLAttributes<HTMLTableElement> {}
interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}
interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}
interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {}
interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}
interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}

export function Table({ className = "", children, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = "", children, ...props }: TableHeaderProps) {
  return (
    <thead className={`bg-secondary sticky top-0 ${className}`} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className = "", children, ...props }: TableBodyProps) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className = "", children, ...props }: TableRowProps) {
  return (
    <tr
      className={`
        border-b border-border-subtle
        hover:bg-tertiary transition-colors duration-150
        ${className}
      `}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ numeric, className = "", children, ...props }: TableHeadProps) {
  return (
    <th
      className={`
        px-4 py-3 text-xs font-medium uppercase tracking-wider
        text-text-muted border-b border-border-subtle
        ${numeric ? "text-right font-mono" : "text-left"}
        ${className}
      `}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ numeric, className = "", children, ...props }: TableCellProps) {
  return (
    <td
      className={`
        px-4 py-3 text-sm
        ${numeric ? "text-right font-mono text-text-primary" : "text-text-secondary"}
        ${className}
      `}
      {...props}
    >
      {children}
    </td>
  );
}
