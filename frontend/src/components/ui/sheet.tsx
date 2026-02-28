import { type ReactNode, useEffect, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

// Internal context to pass `open` state down to SheetContent
const SheetContext = createContext<{ open: boolean; onOpenChange: (open: boolean) => void }>({
    open: false,
    onOpenChange: () => { },
})

interface SheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: ReactNode
}

interface SheetContentProps {
    side?: 'right' | 'left'
    className?: string
    children: ReactNode
}

interface SheetHeaderProps {
    className?: string
    children: ReactNode
}

interface SheetFooterProps {
    className?: string
    children: ReactNode
}

interface SheetTitleProps {
    className?: string
    children: ReactNode
}

interface SheetDescriptionProps {
    children: ReactNode
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    return (
        <SheetContext.Provider value={{ open, onOpenChange }}>
            {/* Backdrop — only rendered when open */}
            {open && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    onClick={() => onOpenChange(false)}
                />
            )}
            {children}
        </SheetContext.Provider>
    )
}

export function SheetContent({ side = 'right', className, children }: SheetContentProps) {
    const { open } = useContext(SheetContext)

    return (
        <div
            className={cn(
                'fixed top-0 z-50 h-full w-80 max-w-[calc(100vw-2rem)] bg-background shadow-xl transition-transform duration-300 ease-in-out',
                side === 'right'
                    ? open ? 'right-0 translate-x-0' : 'right-0 translate-x-full'
                    : open ? 'left-0 translate-x-0' : 'left-0 -translate-x-full',
                className
            )}
        >
            <div className="flex h-full flex-col p-6">
                {children}
            </div>
        </div>
    )
}

export function SheetHeader({ className, children }: SheetHeaderProps) {
    return <div className={cn('mb-4', className)}>{children}</div>
}

export function SheetFooter({ className, children }: SheetFooterProps) {
    return <div className={cn('mt-auto', className)}>{children}</div>
}

export function SheetTitle({ className, children }: SheetTitleProps) {
    return <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>
}

export function SheetDescription({ children }: SheetDescriptionProps) {
    return <p className="text-sm text-muted-foreground">{children}</p>
}
