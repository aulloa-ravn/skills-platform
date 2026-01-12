import { ArrowDown, ArrowRight } from 'lucide-react'
import type { SeniorityHistoryResponse } from '@/shared/lib/types'
import { formatShortDate, SeniorityLevelMap } from '@/shared/utils'

interface SeniorityTimelineProps {
  seniorityHistory: SeniorityHistoryResponse[]
}

export function SeniorityTimeline({
  seniorityHistory,
}: SeniorityTimelineProps) {
  const timeline = seniorityHistory.map((item, index) => ({
    id: index + 1,
    role: SeniorityLevelMap[item.seniorityLevel],
    startDate: formatShortDate(item.startDate),
    endDate: item.endDate ? formatShortDate(item.endDate) : 'Present',
    isCurrent: !item.endDate,
  }))

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 bg-background">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-foreground">
        Seniority Timeline
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 overflow-x-auto">
        {timeline.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center gap-4 flex-shrink-0"
          >
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4 flex-1 sm:min-w-max shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <h3 className="font-semibold text-sm sm:text-base text-foreground">
                  {item.role}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {item.startDate} → {item.endDate}
              </p>
            </div>

            {index < timeline.length - 1 && (
              <>
                <div className="hidden sm:block text-muted-foreground text-lg flex-shrink-0">
                  <ArrowRight />
                </div>
                <div className="block sm:hidden text-muted-foreground text-lg flex-shrink-0 mx-auto">
                  <ArrowDown />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
