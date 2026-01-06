export const formatShortDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMonths = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30),
  )

  if (diffInMonths === 0) return 'This month'
  if (diffInMonths === 1) return '1 month ago'
  if (diffInMonths < 12) return `${diffInMonths} months ago`

  const diffInYears = Math.floor(diffInMonths / 12)
  return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`
}
