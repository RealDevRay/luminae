'use client'

import { useEffect } from 'react'
import { DollarSign, AlertTriangle } from 'lucide-react'
import { useBudget } from '@/hooks/useAnalysis'
import { formatCurrency } from '@/lib/utils'

export function BudgetCard() {
  const { budget, isLoading, fetchBudget } = useBudget()

  useEffect(() => {
    fetchBudget()
    const interval = setInterval(fetchBudget, 30000)
    return () => clearInterval(interval)
  }, [fetchBudget])

  if (isLoading || !budget) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <DollarSign className="w-4 h-4" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  const percentRemaining = (budget.remaining / budget.total) * 100

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">
          {formatCurrency(budget.remaining)} remaining
        </span>
      </div>

      <div className="w-24 bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            percentRemaining < 20
              ? 'bg-red-500'
              : percentRemaining < 50
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${percentRemaining}%` }}
        />
      </div>

      {budget.papersRemaining > 0 && (
        <span className="text-xs text-gray-500">
          ~{budget.papersRemaining} papers left
        </span>
      )}

      {budget.papersRemaining <= 0 && (
        <div className="flex items-center gap-1 text-yellow-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs">Low budget</span>
        </div>
      )}
    </div>
  )
}
