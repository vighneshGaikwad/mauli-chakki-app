import { SiteHeader } from '@/components/site-header'
import { HeroSection } from '@/components/hero-section'
import { TrustBar } from '@/components/trust-bar'
import { ProductGrid } from '@/components/product-grid'
import { CartDrawer } from '@/components/cart-drawer'
import { SiteFooter } from '@/components/site-footer'

/*
 🎓 LESSON: Extracting the Home Page
 
 Before routing, ALL our UI was in App.tsx.
 Now that we have multiple pages, we moved the shop/home 
 layout into its own component: HomePage.
 
 App.tsx now only handles routing — deciding WHICH page to show.
 Each page component handles its OWN layout.
*/
export function HomePage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <SiteHeader />
            <main className="flex-1">
                <HeroSection />
                <TrustBar />
                <ProductGrid />
            </main>
            <SiteFooter />
            <CartDrawer />
        </div>
    )
}
