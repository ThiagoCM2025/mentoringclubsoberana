import * as React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
  /** Minimum width for the table content. Default: 800px */
  minWidth?: string;
}

/**
 * Responsive table wrapper that adds horizontal scroll on mobile devices.
 * Use this to wrap Table components that have many columns.
 * 
 * Example:
 * ```tsx
 * <ResponsiveTable>
 *   <Table>
 *     <TableHeader>...</TableHeader>
 *     <TableBody>...</TableBody>
 *   </Table>
 * </ResponsiveTable>
 * ```
 */
export function ResponsiveTable({ 
  children, 
  className,
  minWidth = "800px" 
}: ResponsiveTableProps) {
  return (
    <div 
      className={cn(
        "w-full overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0",
        "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
        className
      )}
    >
      <div 
        className="sm:min-w-0"
        style={{ minWidth }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Mobile-friendly card alternative to table rows.
 * Shows as card on mobile, integrates into table on desktop.
 */
interface MobileCardRowProps {
  children: React.ReactNode;
  className?: string;
  /** Content to show only on mobile as a card */
  mobileContent?: React.ReactNode;
}

export function MobileCardRow({ 
  children, 
  className,
  mobileContent 
}: MobileCardRowProps) {
  return (
    <>
      {/* Mobile card view */}
      {mobileContent && (
        <div className={cn("sm:hidden", className)}>
          {mobileContent}
        </div>
      )}
      {/* Desktop table row */}
      <tr className={cn("hidden sm:table-row", className)}>
        {children}
      </tr>
    </>
  );
}
