import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  rows?: number;
  headers: string[];
}

export function TableSkeleton({ rows = 5, headers }: TableSkeletonProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }, (_, i) => (
            <TableRow key={i}>
              {headers.map((h, j) => (
                <TableCell key={h}>
                  <Skeleton className={j === 0 ? "h-4 w-36" : "h-4 w-20"} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
