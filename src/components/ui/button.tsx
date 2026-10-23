import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-lime-300 px-4 py-2.5 text-slate-950 shadow-[0_10px_30px_rgba(190,242,100,0.18)] hover:-translate-y-0.5 hover:bg-lime-200 focus-visible:outline-lime-300',
        secondary: 'border border-white/12 bg-white/[0.06] px-4 py-2.5 text-slate-100 hover:border-cyan-200/40 hover:bg-white/[0.1] focus-visible:outline-cyan-300',
        ghost: 'px-3 py-2 text-slate-300 hover:bg-white/[0.08] hover:text-white focus-visible:outline-cyan-300',
      },
      size: { default: '', sm: 'px-3 py-2 text-xs', lg: 'px-5 py-3 text-base' },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
