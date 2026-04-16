import { Brain, FileText } from 'lucide-react'
import { FormattedText, FormattedList, toTitleCase } from '@/components/ui/FormattedText'

export function CritiqueTab({ methodology, dataset }: { methodology: any, dataset: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Methodology Critique
        </h3>

        {methodology.flaws?.length > 0 ? (
          <div className="space-y-4">
            {methodology.flaws.map((flaw: any, i: number) => (
              <div
                key={i}
                className={`p-4 rounded-lg border ${
                  flaw.severity === 'critical'
                    ? 'bg-destructive/10 border-destructive/20'
                    : flaw.severity === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900/50'
                    : 'bg-primary/5 border-primary/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      flaw.severity === 'critical'
                        ? 'bg-destructive text-destructive-foreground'
                        : flaw.severity === 'warning'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {flaw.severity}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">
                    {toTitleCase(flaw.category)}
                  </span>
                </div>
                <FormattedText text={flaw.description} className="text-foreground" />
                {flaw.impact && (
                  <p className="text-sm text-muted-foreground mt-2 italic border-l-2 pl-2">
                    Impact: {flaw.impact}
                  </p>
                )}
                {flaw.suggested_fix && (
                  <div className="text-sm text-foreground mt-3 bg-background/50 p-2 rounded">
                    <strong className="text-foreground">Suggested Fix:</strong>{' '}
                    <FormattedText text={flaw.suggested_fix} as="span" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No methodology flaws detected.</p>
        )}
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Dataset Audit
        </h3>

        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-muted-foreground block mb-1">
              Size Assessment:
            </span>
            <FormattedText text={dataset.size_assessment || 'Not assessed'} as="span" className="text-foreground capitalize bg-muted px-2 py-1 rounded" />
          </div>

          {dataset.bias_sources?.length > 0 && (
            <div>
              <span className="text-sm font-medium text-muted-foreground block mb-2">
                Potential Bias Sources:
              </span>
              <div className="pl-4 border-l-2 border-border">
                <FormattedList items={dataset.bias_sources} className="text-foreground" />
              </div>
            </div>
          )}

          {dataset.recommendations?.length > 0 && (
            <div>
              <span className="text-sm font-medium text-muted-foreground block mb-2">
                Recommendations:
              </span>
              <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                <FormattedList items={dataset.recommendations} className="text-foreground" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
