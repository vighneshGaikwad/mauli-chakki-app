import { Wheat } from 'lucide-react'

export function SiteFooter() {
    return (
        <footer className="border-t border-border bg-secondary">
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 text-center md:flex-row md:justify-between md:text-left">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                        <Wheat className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-serif text-base font-bold text-accent">
                        Mauli Chakki
                    </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Freshly milled with love, since 1987. Delivering health to every
                    Indian kitchen.
                </p>
            </div>
        </footer>
    )
}
