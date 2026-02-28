import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> { }

function Badge({ className, ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-semibold',
                className
            )}
            {...props}
        />
    )
}

export { Badge }
