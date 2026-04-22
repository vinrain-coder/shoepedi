import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AuthFormSkeleton() {
  return (
    <Card className="w-full shadow-md border rounded-2xl" role="status" aria-label="Loading">
      <CardHeader className="space-y-1 text-center">
        <Skeleton className="h-8 w-1/3 mx-auto mb-2" aria-hidden="true" />
        <Skeleton className="h-4 w-2/3 mx-auto" aria-hidden="true" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" aria-hidden="true" />
          <Skeleton className="h-10 w-full" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" aria-hidden="true" />
          <Skeleton className="h-10 w-full" aria-hidden="true" />
        </div>
        <Skeleton className="h-10 w-full mt-6" aria-hidden="true" />
        <Skeleton className="h-10 w-full mt-2" aria-hidden="true" />
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-md border" role="status" aria-label="Loading">
      <div className="border-b px-4 py-3 bg-muted/20">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" aria-hidden="true" />
          ))}
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-4">
            <div className="flex gap-4">
              {Array.from({ length: cols }).map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" aria-hidden="true" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminListSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" aria-hidden="true" />
          <Skeleton className="h-4 w-64" aria-hidden="true" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" aria-hidden="true" />
          <Skeleton className="h-10 w-32" aria-hidden="true" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" aria-hidden="true" />
              <Skeleton className="h-4 w-4" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" aria-hidden="true" />
              <Skeleton className="h-3 w-32" aria-hidden="true" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-md border p-4 bg-card">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" aria-hidden="true" />
          <Skeleton className="h-10 w-32" aria-hidden="true" />
          <Skeleton className="h-10 w-32" aria-hidden="true" />
        </div>
      </div>

      <TableSkeleton />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8" role="status" aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" aria-hidden="true" />
        <Skeleton className="h-8 w-64" aria-hidden="true" />
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" aria-hidden="true" />
              <Skeleton className="h-10 w-full" aria-hidden="true" />
            </div>
          ))}
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-10 w-32" aria-hidden="true" />
            <Skeleton className="h-10 w-32" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AccountPageSkeleton({ children }: { children?: React.ReactNode }) {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <Skeleton className="h-4 w-48" aria-hidden="true" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" aria-hidden="true" />
        <Skeleton className="h-4 w-full max-w-md" aria-hidden="true" />
      </div>
      {children || <TableSkeleton />}
    </div>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-square w-full" aria-hidden="true" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-4 w-2/3" aria-hidden="true" />
            <Skeleton className="h-4 w-1/3" aria-hidden="true" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" role="status" aria-label="Loading">
      <div className="lg:col-span-2 space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" aria-hidden="true" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" aria-hidden="true" />
              <Skeleton className="h-10 w-full" aria-hidden="true" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" aria-hidden="true" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" aria-hidden="true" />
                <Skeleton className="h-4 w-16" aria-hidden="true" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" aria-hidden="true" />
                <Skeleton className="h-4 w-16" aria-hidden="true" />
              </div>
            </div>
            <Skeleton className="h-12 w-full mt-4" aria-hidden="true" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" aria-hidden="true" />
        <Skeleton className="h-10 w-32" aria-hidden="true" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" aria-hidden="true" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="col-span-4 h-[400px]" aria-hidden="true" />
        <Skeleton className="col-span-3 h-[400px]" aria-hidden="true" />
      </div>
    </div>
  );
}

export function CompareSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <Skeleton className="h-10 w-64" aria-hidden="true" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="aspect-square w-full" aria-hidden="true" />
            <Skeleton className="h-6 w-2/3" aria-hidden="true" />
            <Skeleton className="h-4 w-1/3" aria-hidden="true" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="aspect-square w-full" aria-hidden="true" />
            <Skeleton className="h-6 w-2/3" aria-hidden="true" />
            <Skeleton className="h-4 w-1/3" aria-hidden="true" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function MaintenanceSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6 text-center px-4" role="status" aria-label="Loading">
      <Skeleton className="h-16 w-16 rounded-full" aria-hidden="true" />
      <Skeleton className="h-10 w-full max-w-xs mx-auto" aria-hidden="true" />
      <Skeleton className="h-4 w-full max-w-sm mx-auto" aria-hidden="true" />
    </div>
  );
}

export function SupportFormSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-8" role="status" aria-label="Loading">
      <div className="space-y-2 text-center">
        <Skeleton className="h-8 w-48 mx-auto" aria-hidden="true" />
        <Skeleton className="h-4 w-full max-w-sm mx-auto" aria-hidden="true" />
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" aria-hidden="true" />
              <Skeleton className="h-10 w-full" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" aria-hidden="true" />
              <Skeleton className="h-10 w-full" aria-hidden="true" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" aria-hidden="true" />
            <Skeleton className="h-10 w-full" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" aria-hidden="true" />
            <Skeleton className="h-32 w-full" aria-hidden="true" />
          </div>
          <Skeleton className="h-11 w-full" aria-hidden="true" />
        </CardContent>
      </Card>
    </div>
  );
}

export function CartAddItemSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <Skeleton className="h-4 w-48" aria-hidden="true" />
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
        <Card className="w-full rounded-none">
          <CardContent className="flex h-full items-center justify-center gap-3 py-4">
            <Skeleton className="h-20 w-20 shrink-0" aria-hidden="true" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-32" aria-hidden="true" />
              <Skeleton className="h-4 w-24" aria-hidden="true" />
              <Skeleton className="h-4 w-20" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
        <Card className="w-full rounded-none">
          <CardContent className="p-4 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full items-center">
              <div className="flex justify-center items-center">
                <Skeleton className="h-10 w-full max-w-xs" aria-hidden="true" />
              </div>
              <div className="lg:border-l lg:border-muted lg:pl-3 flex flex-col items-center gap-3">
                <div className="flex gap-3 items-baseline">
                  <Skeleton className="h-6 w-24" aria-hidden="true" />
                  <Skeleton className="h-8 w-20" aria-hidden="true" />
                </div>
                <Skeleton className="h-10 w-full rounded-full" aria-hidden="true" />
                <Skeleton className="h-10 w-full rounded-full" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Skeleton className="h-6 w-48 mb-4" aria-hidden="true" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" aria-hidden="true" />
          ))}
        </div>
      </div>
    </div>
  );
}
