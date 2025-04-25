"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const recentTrips = [
  {
    id: "TR-1234",
    driver: "John Doe",
    destination: "New York, NY",
    status: "In Progress",
    amount: "$1,200",
  },
  {
    id: "TR-1235",
    driver: "Jane Smith",
    destination: "Los Angeles, CA",
    status: "Completed",
    amount: "$1,800",
  },
  {
    id: "TR-1236",
    driver: "Mike Johnson",
    destination: "Chicago, IL",
    status: "Scheduled",
    amount: "$950",
  },
  {
    id: "TR-1237",
    driver: "Sarah Wilson",
    destination: "Miami, FL",
    status: "In Progress",
    amount: "$1,500",
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
            <TableCell>{trip.status}</TableCell>
            <TableCell className="text-right">{trip.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}