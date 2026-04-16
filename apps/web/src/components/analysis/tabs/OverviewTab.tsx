import { FileText, Brain, Lightbulb, DollarSign, Clock, AlertTriangle, Link, Upload } from 'lucide-react'
import { formatTime } from '@/lib/utils'

export function OverviewTab({ data, methodology }: { data: any, methodology: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {data.metadata?.title || 'Untitled Document'}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-muted-foreground">
            Uploaded: {new Date(data.metadata?.upload_timestamp).toLocaleString()}
          </p>
          {data.metadata?.source_type === 'url' && (
            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              <Link className="w-3 h-3" />
              URL
            </span>
          )}
          {data.metadata?.source_type === 'file_upload' && (
            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
              <Upload className="w-3 h-3" />
              File Upload
            </span>
          )}
        </div>
        {data.metadata?.source_url && (
          <p className="text-sm text-muted-foreground mt-1 break-all whitespace-pre-wrap max-w-full" title={data.metadata.source_url}>
            Source: {data.metadata.source_url}
          </p>
        )}
      </div>

      {data.error && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-destructive">Analysis Issue</p>
            <p className="text-destructive/90 text-sm mt-1">{data.error}</p>
          </div>
        </div>
      )}

      {data.metadata?.abstract && (
        <div>
          <h3 className="font-semibold text-foreground mb-2">Abstract</h3>
          <p className="text-muted-foreground">{data.metadata.abstract}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Brain className="w-4 h-4" />
            <span className="text-sm">Methodology Score</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {methodology.overall_score || 'N/A'}
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Reproducibility</span>
          </div>
          <p className="text-2xl font-bold text-foreground capitalize">
            {methodology.reproducibility_rating || 'N/A'}
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Cost</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            ${data.economics?.estimated_cost_usd?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Time</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatTime(data.economics?.processing_time_seconds || 0)}
          </p>
        </div>
      </div>

      {data.improvements?.key_insights?.length > 0 && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Key Insights
          </h3>
          <ul className="space-y-2">
            {data.improvements.key_insights.map((insight: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">{i + 1}</span>
                <span className="leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
