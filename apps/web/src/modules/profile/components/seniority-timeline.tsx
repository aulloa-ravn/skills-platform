import { ArrowDown, ArrowRight } from 'lucide-react'

export function SeniorityTimeline() {
  const timeline = [
    {
      id: 1,
      role: 'Junior Designer',
      startDate: 'Jan 2020',
      endDate: 'Dec 2021',
      isCurrent: false,
    },
    {
      id: 2,
      role: 'Mid-level Designer',
      startDate: 'Jan 2022',
      endDate: 'Jun 2023',
      isCurrent: false,
    },
    {
      id: 3,
      role: 'Senior UI/UX Designer',
      startDate: 'Jul 2023',
      endDate: 'Present',
      isCurrent: true,
    },
  ]

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 bg-background">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-foreground">
        Seniority Timeline
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {timeline.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center gap-4 flex-shrink-0"
          >
            {/* Timeline card */}
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

            {/* Arrow connector */}
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
