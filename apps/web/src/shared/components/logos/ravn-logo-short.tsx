interface RavnLogoShortProps {
  className?: string
}

export function RavnLogoShort(props: RavnLogoShortProps) {
  const { className } = props
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M91.2655 79.6695C107.165 75.3246 118.855 60.7775 118.855 43.5C118.855 23.1487 102.642 6.58439 82.4312 6.01981V6H24.1988H0L20.0854 30.9934H24.1988V31H81.5431C88.3604 31.0991 93.8571 36.6557 93.8571 43.4967C93.8571 50.4005 88.2613 55.9968 81.3582 55.9968H72.2432H40.174L86.7856 114H118.852L91.2655 79.6695Z"
        fill="currentColor"
      />
      <path
        d="M27 114C36.1127 114 43.5 106.613 43.5 97.5C43.5 88.3873 36.1127 81 27 81C17.8873 81 10.5 88.3873 10.5 97.5C10.5 106.613 17.8873 114 27 114Z"
        fill="currentColor"
      />
    </svg>
  )
}
