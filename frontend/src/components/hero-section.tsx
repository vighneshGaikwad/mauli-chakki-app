export function HeroSection() {
    return (
        <section className="relative overflow-hidden">
            <div className="absolute inset-0">
                <img
                    src="/images/hero_section2.png"
                    alt="Golden wheat grains and traditional stone chakki"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-accent/90 via-accent/75 to-accent/50" />
            </div>
            <div className="relative flex min-h-[320px] flex-col items-start justify-end px-5 pb-8 pt-16">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground/80">
                    Since 2024
                </p>
                <h1 className="max-w-[280px] font-serif text-3xl leading-tight text-black">
                    Freshly Milled, Just for You.
                </h1>
                <h2
                    className="mt-3 max-w-[300px] text-lg font-semibold leading-snug text-accent-foreground/90"
                    style={{ fontFamily: "'Baloo 2', sans-serif" }}
                >
                    पारंपरिक पद्धतीने दळलेली पिठे, मसाले आणि इतर उत्पादने
                </h2>
                <a
                    href="#shop"
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.97]"
                >
                    Shop Now
                </a>
            </div>
        </section>
    )
}
