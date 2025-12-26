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
    <div className="px-6 py-8">
      <h2 className="text-2xl font-bold mb-8 text-foreground">
        Seniority Timeline
      </h2>

      <div className="flex items-center gap-4 overflow-x-auto pb-4">
        {timeline.map((item, index) => (
          <div key={item.id} className="flex items-center gap-4 flex-shrink-0">
            {/* Timeline card */}
            <div className="bg-card border border-border rounded-lg p-4 min-w-max shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-foreground">{item.role}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {item.startDate} → {item.endDate}
              </p>
            </div>

            {/* Arrow connector */}
            {index < timeline.length - 1 && (
              <div className="text-muted-foreground text-lg flex-shrink-0">
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
