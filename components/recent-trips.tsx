"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const recentTrips = [
  {
    id: "TR-156",
    driver: "John Doe",
    destination: "Muscat, Oman",
    status: "Completed",
    amount: "د.إ 2,500",
  },
  {
    id: "TR-155",
    driver: "Mike Johnson",
    destination: "Riyadh, Saudi Arabia",
    status: "In Progress",
    amount: "د.إ 3,200",
  },
  {
    id: "TR-154",
    driver: "Sarah Wilson",
    destination: "Doha, Qatar",
    status: "Completed",
    amount: "د.إ 2,800",
  },
  {
    id: "TR-153",
    driver: "Ahmed Hassan",
    destination: "Kuwait City, Kuwait",
    status: "Completed",
    amount: "د.إ 3,000",
  },
]

export function RecentTrips() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Trip ID</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentTrips.map((trip) => (
          <TableRow key={trip.id}>
            <TableCell className="font-medium">{trip.id}</TableCell>
            <TableCell>{trip.driver}</TableCell>
            <TableCell>{trip.destination}</TableCell>
            <TableCell>
              <Badge variant={trip.status === "Completed" ? "default" : "secondary"}>
                {trip.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">{trip.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}