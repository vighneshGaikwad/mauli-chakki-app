import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, checked, onCheckedChange, ...props }, ref) => {
        return (
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    ref={ref}
                    checked={checked}
                    onChange={(e) => onCheckedChange?.(e.target.checked)}
                    className="sr-only"
                    {...props}
                />
                <div
                    onClick={() => onCheckedChange?.(!checked)}
                    className={cn(
                        'flex h-4 w-4 cursor-pointer items-center justify-center rounded border-2 transition-colors',
                        checked
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/40 bg-background',
                        className
                    )}
                >
                    {checked && (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-2.5 w-2.5 text-primary-foreground"
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </div>
            </div>
        )
    }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
