import { FileText } from 'lucide-react'
import { FormattedText, FormattedList } from '@/components/ui/FormattedText'

export function GrantTab({ grant }: { grant: any }) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Grant Proposal Outline
      </h3>

      {grant?.title ? (
        <div className="space-y-8 bg-card border rounded-xl p-6 shadow-sm">
          <div>
            <h4 className="text-xl font-bold text-card-foreground border-b pb-4 mb-6">
              {grant.title}
            </h4>
          </div>

          {grant.specific_aims?.length > 0 && (
            <div className="bg-muted/30 p-5 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-3 text-lg">
                Specific Aims
              </h5>
              <div className="pl-4">
                <FormattedList items={grant.specific_aims} className="text-muted-foreground" ordered />
              </div>
            </div>
          )}

          {grant.research_strategy && (
            <div>
              <h5 className="font-semibold text-foreground mb-2 text-lg">
                Research Strategy
              </h5>
              <div className="text-muted-foreground leading-relaxed bg-background p-4 rounded border">
                <FormattedText text={grant.research_strategy} />
              </div>
            </div>
          )}

          {grant.expected_outcomes && (
            <div>
              <h5 className="font-semibold text-foreground mb-2 text-lg">
                Expected Outcomes
              </h5>
              <div className="text-muted-foreground leading-relaxed bg-background p-4 rounded border">
                <FormattedText text={grant.expected_outcomes} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {grant.timeline && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <span className="text-xs uppercase font-bold text-primary tracking-wider block mb-1">Timeline</span>
                <p className="font-medium text-foreground text-lg">
                  {grant.timeline}
                </p>
              </div>
            )}

            {grant.budget_estimate && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/50">
                <span className="text-xs uppercase font-bold text-green-700 dark:text-green-400 tracking-wider block mb-1">Budget</span>
                <p className="font-medium text-green-900 dark:text-green-100 text-lg">
                  {grant.budget_estimate}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed flex flex-col items-center">
            <FileText className="w-10 h-10 text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground font-medium text-lg">
              Grant outline not generated.
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Enable grant generation in analysis options to see a full NSF-style proposal.
            </p>
        </div>
      )}
    </div>
  )
}
