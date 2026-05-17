'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'

interface CurrencyInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: number | string
  onValueChange?: (value: number) => void
}

// Format number with Indonesian currency format (dots for thousands)
const formatCurrencyInput = (value: string): string => {
  // Remove all non-digit characters
  const numericValue = value.replace(/\D/g, '')
  
  if (!numericValue) return ''
  
  // Add dots as thousand separators
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Remove formatting to get numeric value
const getCurrencyValue = (formattedValue: string): number => {
  const numericValue = formattedValue.replace(/\D/g, '')
  return numericValue ? parseInt(numericValue, 10) : 0
}

const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>(({ value, onValueChange, onChange, ...props }, ref) => {
  const [displayValue, setDisplayValue] = React.useState<string>(() => {
    if (value === undefined || value === null) return ''
    const numericValue = typeof value === 'number' ? value : getCurrencyValue(String(value))
    return formatCurrencyInput(numericValue.toString())
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formattedValue = formatCurrencyInput(inputValue)
    const numericValue = getCurrencyValue(formattedValue)

    setDisplayValue(formattedValue)

    // Call both callbacks
    if (onValueChange) {
      onValueChange(numericValue)
    }
    if (onChange) {
      onChange(e)
    }
  }

  return (
    <Input
      ref={ref}
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder="0"
      {...props}
    />
  )
})

CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput }
