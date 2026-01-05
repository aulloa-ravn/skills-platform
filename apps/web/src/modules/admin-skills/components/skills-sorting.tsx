import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { ArrowUpDownIcon } from 'lucide-react'

export type SortOption = 'name' | 'discipline' | 'createdAt'

type SkillsSortingProps = {
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
}

export function SkillsSorting({ sortBy, onSortChange }: SkillsSortingProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDownIcon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Alphabetical</SelectItem>
          <SelectItem value="discipline">Discipline</SelectItem>
          <SelectItem value="createdAt">Creation Date</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
