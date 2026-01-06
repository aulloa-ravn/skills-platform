// Generate initials from string
export const getStringInitials = (str: string, maxLength: number = 2) => {
  return str
    .split(' ')
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, maxLength)
}
