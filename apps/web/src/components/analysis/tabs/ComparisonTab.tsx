import { SplitSquareHorizontal, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react'
import { FormattedText, FormattedList } from '@/components/ui/FormattedText'

export function ComparisonTab({ comparison, metadata }: { comparison: any, metadata: any }) {
  if (!comparison) return null

  return (
    <div className="space-y-8">
      <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
        <h3 className="font-semibold text-primary text-xl mb-4 flex items-center gap-2">
          <SplitSquareHorizontal className="w-6 h-6" />
          Synthesis Summary
        </h3>
        <p className="text-foreground leading-relaxed text-lg">
          <FormattedText text={comparison.synthesis_summary} />
        </p>
      </div>

      <div>
        <h4 className="font-bold text-foreground text-lg mb-4 border-b pb-2">Methodology Comparison</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {comparison.methodology_comparison?.map((paper: any, idx: number) => (
             <div key={idx} className="bg-card border rounded-lg p-5 shadow-sm">
                <h5 className="font-bold text-card-foreground text-md mb-4 bg-muted/50 p-2 rounded truncate break-words" title={paper.paper_id}>
                   Paper {idx + 1}
                </h5>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs uppercase font-bold text-green-600 flex items-center gap-1 mb-2">
                       <CheckCircle className="w-3 h-3" /> Strengths
                    </span>
                    <ul className="space-y-1">
                      {paper.strengths?.map((s: string, i: number) => (
                         <li key={i} className="text-sm text-foreground flex items-start gap-2">
                           <span className="text-green-500 mt-1">•</span>
                           <span>{s}</span>
                         </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t pt-3">
                    <span className="text-xs uppercase font-bold text-destructive flex items-center gap-1 mb-2">
                       <AlertTriangle className="w-3 h-3" /> Weaknesses
                    </span>
                    <ul className="space-y-1">
                      {paper.weaknesses?.map((w: string, i: number) => (
                         <li key={i} className="text-sm text-foreground flex items-start gap-2">
                           <span className="text-destructive mt-1">•</span>
                           <span>{w}</span>
                         </li>
                      ))}
                    </ul>
                  </div>
                </div>
             </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 dark:bg-yellow-900/10 dark:border-yellow-900/30">
            <h4 className="font-bold text-yellow-800 dark:text-yellow-500 text-lg mb-3">Shared Gaps</h4>
            <FormattedList items={comparison.shared_gaps} className="text-yellow-900 dark:text-yellow-100" />
         </div>
         <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 dark:bg-blue-900/10 dark:border-blue-900/30">
            <h4 className="font-bold text-blue-800 dark:text-blue-500 text-lg mb-3">Divergent Conclusions</h4>
            <FormattedList items={comparison.divergent_conclusions} className="text-blue-900 dark:text-blue-100" />
         </div>
      </div>

      <div className="bg-muted border rounded-lg p-6">
         <h4 className="font-bold text-foreground text-lg mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Recommendation for Unification
         </h4>
         <p className="text-muted-foreground text-md italic border-l-4 border-primary pl-4 py-1">
            <FormattedText text={comparison.recommendation} />
         </p>
      </div>

    </div>
  )
}
