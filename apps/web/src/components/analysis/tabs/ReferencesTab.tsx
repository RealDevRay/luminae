import { Link } from 'lucide-react'

export function ReferencesTab({ references }: { references: any[] }) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Link className="w-5 h-5" />
        Extracted References
      </h3>

      {references?.length > 0 ? (
        <div className="space-y-4">
          {references.map((ref, i) => (
            <div key={i} className="p-4 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors">
              <h4 className="font-medium text-card-foreground leading-tight mb-2">
                {ref.title || 'Unknown Title'}
              </h4>
              <p className="text-sm text-foreground mb-1">
                <span className="font-medium text-muted-foreground">Authors:</span> {ref.authors || 'Unknown'}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
                {ref.year && <span><span className="font-medium text-foreground">Year:</span> {ref.year}</span>}
                {ref.venue && <span><span className="font-medium text-foreground">Venue:</span> {ref.venue}</span>}
              </div>
              {ref.doi && ref.doi !== 'unknown' && (
                <a
                  href={`https://doi.org/${ref.doi.replace('doi:', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 mt-4 font-medium"
                >
                  <Link className="w-3 h-3" />
                  {ref.doi}
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-muted/30 rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">No structured references could be extracted from this document.</p>
        </div>
      )}
    </div>
  )
}
