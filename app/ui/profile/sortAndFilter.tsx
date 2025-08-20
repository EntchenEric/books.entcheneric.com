import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SlidersHorizontal, Search, ArrowUpDown, Heart, BookCheck } from "lucide-react"
import { ThemeSwitcher } from "@/components/ui/themeSwitch"

type SortAndFilterProps = {
    readonly filter: string,
    readonly setFilter: (filter: string) => void,
    readonly sort: string,
    readonly setSort: (sorting: string) => void,
    readonly wishlistStatus: string,
    readonly setWishlistStatus: (wishlistStatus: string) => void,
    readonly finishedStatus: string,
    readonly setFinishedStatus: (finished: string) => void
}

export default function SortAndFilter({
    filter,
    setFilter,
    sort,
    setSort,
    wishlistStatus,
    setWishlistStatus,
    finishedStatus,
    setFinishedStatus
}: SortAndFilterProps) {
    return <Card className="mb-8">
        <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <div className="flex gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    Filtern & Sortieren
                </div>
                <ThemeSwitcher />
            </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative sm:col-span-2 lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Nach Titel oder Autor filtern..."
                    className="pl-10"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
            </div>

            <Select value={sort} onValueChange={setSort}>
                <SelectTrigger><div className="flex w-full items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                </div></SelectTrigger>
                <SelectContent>
                    <SelectItem value="title-asc">Titel (A-Z)</SelectItem>
                    <SelectItem value="title-desc">Titel (Z-A)</SelectItem>
                    <SelectItem value="date-desc">Datum (Neueste)</SelectItem>
                    <SelectItem value="date-asc">Datum (Älteste)</SelectItem>
                </SelectContent>
            </Select>

            <Select value={wishlistStatus} onValueChange={setWishlistStatus}>
                <SelectTrigger><div className="flex w-full items-center gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                </div></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Alle (Wunschliste)</SelectItem>
                    <SelectItem value="wishlisted">Auf der Wunschliste</SelectItem>
                    <SelectItem value="not-wishlisted">In der Bibliothek</SelectItem>
                </SelectContent>
            </Select>

            <Select value={finishedStatus} onValueChange={setFinishedStatus}>
                <SelectTrigger><div className="flex w-full items-center gap-2">
                    <BookCheck className="h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                </div></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Alle (Lesestatus)</SelectItem>
                    <SelectItem value="finished">Beendet</SelectItem>
                    <SelectItem value="not-finished">Nicht beendet</SelectItem>
                </SelectContent>
            </Select>
        </CardContent>
    </Card>
}