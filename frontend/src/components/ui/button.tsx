import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'ghost' | 'outline'
    size?: 'default' | 'sm' | 'icon' | 'icon-sm'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
                    {
                        'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
                        'hover:bg-secondary hover:text-secondary-foreground': variant === 'ghost',
                        'border border-border bg-background hover:bg-secondary': variant === 'outline',
                    },
                    {
                        'h-10 px-4 py-2 text-sm': size === 'default',
                        'h-8 px-3 text-xs': size === 'sm',
                        'h-10 w-10': size === 'icon',
                        'h-7 w-7': size === 'icon-sm',
                    },
                    className
                )}
                {...props}
            />
        )
    }
)

Button.displayName = 'Button'

export { Button }
