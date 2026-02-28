import { type ReactNode, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface DialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: ReactNode
}

interface DialogContentProps {
    className?: string
    children: ReactNode
}

interface DialogTitleProps {
    className?: string
    children: ReactNode
}

interface DialogDescriptionProps {
    className?: string
    children: ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />
            {children}
        </div>
    )
}

export function DialogContent({ className, children }: DialogContentProps) {
    return (
        <div
            className={cn(
                'relative z-10 w-full rounded-xl bg-background shadow-2xl',
                className
            )}
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    )
}

export function DialogTitle({ className, children }: DialogTitleProps) {
    return (
        <h2 className={cn('text-xl font-bold text-foreground', className)}>
            {children}
        </h2>
    )
}

export function DialogDescription({ className, children }: DialogDescriptionProps) {
    return (
        <p className={cn('text-sm text-muted-foreground', className)}>
            {children}
        </p>
    )
}
