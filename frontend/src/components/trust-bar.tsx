import { Factory, ShieldCheck, Truck } from 'lucide-react'

const features = [
    {
        icon: Factory,
        title: 'Milled on Order',
        description: 'Freshly ground after you order',
    },
    {
        icon: ShieldCheck,
        title: '0% Maida',
        description: 'Pure whole grain goodness',
    },
    {
        icon: Truck,
        title: 'Next-Day Delivery',
        description: 'Chakki to kitchen in 24hrs',
    },
]

export function TrustBar() {
    return (
        <section className="border-b border-border bg-secondary">
            <div className="scrollbar-none flex gap-3 overflow-x-auto px-4 py-4">
                {features.map((feature) => (
                    <div
                        key={feature.title}
                        className="flex min-w-[140px] flex-1 flex-col items-center gap-2 rounded-xl bg-card px-3 py-3 text-center shadow-sm"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <feature.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-foreground">
                                {feature.title}
                            </h3>
                            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
