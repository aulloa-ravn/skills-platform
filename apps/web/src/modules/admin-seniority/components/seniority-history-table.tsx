import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'
import { SeniorityLevelMap, formatShortDate } from '@/shared/utils'
import { EditIcon } from 'lucide-react'
import type { SeniorityLevel } from '@/shared/lib/types'

export type SeniorityHistoryTableRow = {
  id: number
  profileId: string
  seniorityLevel: SeniorityLevel
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

type SeniorityHistoryTableProps = {
  records: SeniorityHistoryTableRow[]
  loading: boolean
  onEditRecord: (record: SeniorityHistoryTableRow) => void
}

export function SeniorityHistoryTable({
  records,
  loading,
  onEditRecord,
}: SeniorityHistoryTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner className="mr-2" />
        <span className="text-sm text-muted-foreground">
          Loading seniority history...
        </span>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No seniority history records found.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%] min-w-[150px]">
              Seniority Level
            </TableHead>
            <TableHead className="w-[20%] min-w-[120px]">Start Date</TableHead>
            <TableHead className="w-[20%] min-w-[120px]">End Date</TableHead>
            <TableHead className="w-[20%] min-w-[120px] hidden md:table-cell">
              Last Updated
            </TableHead>
            <TableHead className="w-[15%] min-w-[80px] text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <Badge variant="default">
                  {SeniorityLevelMap[record.seniorityLevel]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {formatShortDate(record.startDate)}
              </TableCell>
              <TableCell className="text-sm">
                {record.endDate ? (
                  formatShortDate(record.endDate)
                ) : (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Current
                  </span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                {formatShortDate(record.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEditRecord(record)}
                  aria-label={`Edit ${SeniorityLevelMap[record.seniorityLevel]} record`}
                >
                  <EditIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
