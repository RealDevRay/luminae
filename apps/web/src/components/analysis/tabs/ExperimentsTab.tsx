import { Lightbulb } from 'lucide-react'
import { FormattedText, FormattedList } from '@/components/ui/FormattedText'

export function ExperimentsTab({ experiments, keyInsights }: { experiments: any[], keyInsights: string[] }) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Lightbulb className="w-5 h-5" />
        Proposed Experiments
      </h3>

      {experiments.length > 0 ? (
        <div className="space-y-4">
          {experiments.map((exp, i) => (
            <div
              key={i}
              className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors bg-card"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-card-foreground text-lg">
                    {i + 1}. {exp.title}
                  </h4>
                  <div className="bg-muted bg-opacity-30 rounded p-2 mt-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Hypothesis</span>
                    <FormattedText text={exp.hypothesis} className="text-sm text-foreground" />
                  </div>
                </div>
                <div className="text-left md:text-right shrink-0 bg-background rounded-lg border p-2">
                  <span className="text-xs uppercase font-semibold text-muted-foreground block">
                    Feasibility
                  </span>
                  <div className="flex items-end md:justify-end gap-1">
                    <span className="text-2xl font-bold text-foreground leading-none">
                      {exp.feasibility_score}
                    </span>
                    <span className="text-muted-foreground font-medium mb-0.5">/10</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-card-foreground grid gap-3">
                <div>
                  <strong className="text-foreground block mb-1">Method:</strong>
                  <div className="text-muted-foreground">
                    <FormattedText text={exp.method} as="span" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 pt-3 border-t">
                  <div>
                    <strong className="text-foreground block mb-1">Expected Outcome:</strong>
                    <div className="text-muted-foreground">
                      <FormattedText text={exp.expected_outcome} as="span" />
                    </div>
                  </div>
                  <div>
                    <strong className="text-foreground block mb-1">Budget Estimate:</strong>
                    <div className="text-muted-foreground">
                      <FormattedText text={exp.estimated_budget} as="span" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-muted/30 rounded-lg border border-dashed border-border flex flex-col items-center">
            <Lightbulb className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground font-medium">No experiments proposed for this document.</p>
        </div>
      )}

      {keyInsights?.length > 0 && (
        <div className="mt-8 p-5 bg-primary/5 rounded-xl border border-primary/20">
          <h4 className="font-semibold text-primary mb-3 flex items-center gap-2 text-lg">
            Synthesis Insights
          </h4>
          <FormattedList items={keyInsights} className="text-foreground/90 leading-relaxed" />
        </div>
      )}
    </div>
  )
}
