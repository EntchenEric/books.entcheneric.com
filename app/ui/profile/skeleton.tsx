import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function ProfilePageSkeleton() {
    return (
        <main className="container mx-auto p-4 md:p-8 animate-pulse">
            <header className="mb-8 flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div>
                        <Skeleton className="h-10 w-64 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <Skeleton className="h-10 w-24" />
            </header>
            <Card className="mb-8">
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Skeleton className="h-10 sm:col-span-2 lg:col-span-2" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                </CardContent>
            </Card>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                            <Skeleton className="h-40 w-full rounded-t-lg" />
                            <div className="p-6">
                                <Skeleton className="h-5 w-4/5 mb-2" />
                                <Skeleton className="h-4 w-3/g" />
                                <Skeleton className="h-10 w-full mt-4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}