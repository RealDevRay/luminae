import { DollarSign, Clock } from 'lucide-react'
import { formatTime } from '@/lib/utils'

export function EconomicsTab({ economics }: { economics: any }) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <DollarSign className="w-5 h-5" />
        Cost Breakdown
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium text-muted-foreground">Total Cost</span>
          <p className="text-2xl font-bold text-foreground">
            ${economics?.estimated_cost_usd?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium text-muted-foreground">Processing Time</span>
          <p className="text-2xl font-bold text-foreground">
            {formatTime(economics?.processing_time_seconds || 0)}
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium text-muted-foreground">AI Agents Used</span>
          <p className="text-2xl font-bold text-foreground">
            5
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium text-muted-foreground">Models</span>
          <p className="text-2xl font-bold text-foreground">
            3
          </p>
        </div>
      </div>

      {/* Per-agent cost breakdown */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-sm sm:w-auto min-w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Agent</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Model</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Est. Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr><td className="px-4 py-3 text-foreground">🔍 OCR</td><td className="px-4 py-3 text-muted-foreground">mistral-ocr-latest</td><td className="px-4 py-3 text-right text-foreground font-medium">$0.01</td></tr>
              <tr><td className="px-4 py-3 text-foreground">👁️ Vision</td><td className="px-4 py-3 text-muted-foreground">ministral-3b-2512</td><td className="px-4 py-3 text-right text-foreground font-medium">$0.005</td></tr>
              <tr><td className="px-4 py-3 text-foreground">🧬 Methodology Critic</td><td className="px-4 py-3 text-muted-foreground">ministral-8b-2512</td><td className="px-4 py-3 text-right text-foreground font-medium">$0.008</td></tr>
              <tr><td className="px-4 py-3 text-foreground">📊 Dataset Auditor</td><td className="px-4 py-3 text-muted-foreground">ministral-8b-2512</td><td className="px-4 py-3 text-right text-foreground font-medium">$0.006</td></tr>
              <tr><td className="px-4 py-3 text-foreground">🧪 Experiment Designer</td><td className="px-4 py-3 text-muted-foreground">ministral-8b-2512</td><td className="px-4 py-3 text-right text-foreground font-medium">$0.008</td></tr>
              <tr><td className="px-4 py-3 text-foreground">🔗 Synthesis</td><td className="px-4 py-3 text-muted-foreground">ministral-8b-2512</td><td className="px-4 py-3 text-right text-foreground font-medium">$0.008</td></tr>
              <tr><td className="px-4 py-3 text-foreground">📝 Grant Generator</td><td className="px-4 py-3 text-muted-foreground">ministral-8b-2512</td><td className="px-4 py-3 text-right text-foreground font-medium">$0.008</td></tr>
              <tr><td className="px-4 py-3 text-foreground">📚 Reference Extractor</td><td className="px-4 py-3 text-muted-foreground">ministral-8b-2512</td><td className="px-4 py-3 text-right text-foreground font-medium">$0.008</td></tr>
              <tr className="bg-muted/50 border-t-2"><td className="px-4 py-3 font-semibold text-foreground" colSpan={2}>Total</td><td className="px-4 py-3 text-right font-bold text-foreground">${economics?.estimated_cost_usd?.toFixed(3) || '0.053'}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg">
        <p className="text-green-800 dark:text-green-300 font-medium leading-relaxed">
          This analysis cost approximately $
          {economics?.estimated_cost_usd?.toFixed(2) || '0.05'}{' '}
          — budget-optimized with Mistral&apos;s ministral models. Approximately{' '}
          {Math.floor(15 / (economics?.estimated_cost_usd || 0.05))}{' '}
          analyses possible on a $15 budget.
        </p>
      </div>
    </div>
  )
}
