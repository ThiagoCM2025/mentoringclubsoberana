import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ChartSkeletonProps {
  height?: number;
  variant?: "area" | "bar" | "line";
}

export function ChartSkeleton({ height = 288, variant = "area" }: ChartSkeletonProps) {
  return (
    <div className="w-full animate-pulse" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-2 px-4 pb-4">
        {variant === "bar" ? (
          // Bar chart skeleton
          <>
            {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
              <div
                key={i}
                className="bg-muted rounded-t flex-1"
                style={{ height: `${h}%` }}
              />
            ))}
          </>
        ) : (
          // Area/Line chart skeleton
          <div className="w-full h-full flex flex-col justify-end">
            <svg className="w-full h-3/4" viewBox="0 0 100 50" preserveAspectRatio="none">
              <path
                d="M0,50 Q10,40 20,35 T40,30 T60,20 T80,25 T100,15 L100,50 Z"
                className="fill-muted/50"
              />
              <path
                d="M0,50 Q10,40 20,35 T40,30 T60,20 T80,25 T100,15"
                className="stroke-muted stroke-2 fill-none"
              />
            </svg>
            <div className="flex justify-between mt-2">
              {[1, 2, 3, 4, 5, 6].map((_, i) => (
                <Skeleton key={i} className="h-3 w-8" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full animate-pulse">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-border">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b border-border/50">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={`h-4 flex-1 ${colIndex === 0 ? "max-w-[150px]" : ""}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface StatsCardSkeletonProps {
  count?: number;
}

export function StatsCardSkeleton({ count = 1 }: StatsCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="relative overflow-hidden border-0 bg-card animate-pulse">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-14" />
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function PieChartSkeleton({ size = 200 }: { size?: number }) {
  return (
    <div
      className="relative animate-pulse flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div
        className="rounded-full bg-muted"
        style={{ width: size * 0.8, height: size * 0.8 }}
      />
      <div
        className="absolute rounded-full bg-card"
        style={{ width: size * 0.5, height: size * 0.5 }}
      />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-4 w-48 mt-1" />
      </CardHeader>
      <CardContent>
        <ChartSkeleton />
      </CardContent>
    </Card>
  );
}

export function EngagementTableSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="flex gap-4 p-4 border-b border-border">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 flex-1 max-w-[150px]" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-border/50">
          <Skeleton className="h-4 w-8" />
          <div className="flex items-center gap-2 flex-1 max-w-[150px]">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ActivityTimelineSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
