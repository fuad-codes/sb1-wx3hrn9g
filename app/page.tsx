'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Overview } from "@/components/overview"
import { RecentTrips } from "@/components/recent-trips"
import { fetchApi } from "@/lib/utils"
import { 
  TrendingUp, 
  TrendingDown, 
  Truck, 
  Users, 
  FileText, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  BarChart3,
  Wrench,
  Container,
  Clock,
  Download
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { format, addDays, isBefore } from "date-fns"

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    trucks: {
      total: 0,
      active: 0,
      maintenance: 0,
      expiringSoon: 0
    },
    trailers: {
      total: 0,
      active: 0,
      expiringSoon: 0
    },
    employees: {
      total: 0,
      drivers: 0,
      expiringSoon: 0
    },
    trips: {
      total: 0,
      completed: 0,
      inProgress: 0,
      revenue: 0,
      profit: 0
    },
    maintenance: {
      total: 0,
      pending: 0,
      cost: 0
    },
    fines: {
      total: 0,
      pending: 0,
      amount: 0
    },
    documents: {
      expiringSoon: 0
    }
  })
  const [selectedTab, setSelectedTab] = useState("overview")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // In a real implementation, we would fetch this data from the API
      // For now, we'll simulate the API response with mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      setDashboardData({
        trucks: {
          total: 24,
          active: 18,
          maintenance: 3,
          expiringSoon: 5
        },
        trailers: {
          total: 18,
          active: 15,
          expiringSoon: 3
        },
        employees: {
          total: 32,
          drivers: 22,
          expiringSoon: 4
        },
        trips: {
          total: 156,
          completed: 142,
          inProgress: 14,
          revenue: 245000,
          profit: 87500
        },
        maintenance: {
          total: 48,
          pending: 5,
          cost: 35600
        },
        fines: {
          total: 12,
          pending: 3,
          amount: 8500
        },
        documents: {
          expiringSoon: 8
        }
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Pie chart data for fleet status
  const fleetStatusData = [
    { name: 'Active', value: dashboardData.trucks.active },
    { name: 'Maintenance', value: dashboardData.trucks.maintenance },
    { name: 'Inactive', value: dashboardData.trucks.total - dashboardData.trucks.active - dashboardData.trucks.maintenance }
  ]

  // Pie chart data for trip status
  const tripStatusData = [
    { name: 'Completed', value: dashboardData.trips.completed },
    { name: 'In Progress', value: dashboardData.trips.inProgress }
  ]

  // Pie chart colors
  const COLORS = ['#4ade80', '#f87171', '#facc15', '#60a5fa']

  // Calculate upcoming expirations
  const calculateUpcomingExpirations = () => {
    // In a real implementation, we would fetch this data from the API
    // For now, we'll use mock data
    return [
      {
        type: 'Truck Insurance',
        item: 'T-001',
        date: format(addDays(new Date(), 15), 'yyyy-MM-dd'),
        daysLeft: 15
      },
      {
        type: 'Driver Visa',
        item: 'John Doe',
        date: format(addDays(new Date(), 10), 'yyyy-MM-dd'),
        daysLeft: 10
      },
      {
        type: 'Trailer Registration',
        item: 'TR-003',
        date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        daysLeft: 7
      },
      {
        type: 'TIR Carnet',
        item: 'TIR123456',
        date: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
        daysLeft: 5
      }
    ]
  }

  // Calculate recent maintenance
  const calculateRecentMaintenance = () => {
    // In a real implementation, we would fetch this data from the API
    // For now, we'll use mock data
    return [
      {
        truck: 'T-001',
        description: 'Oil change and general service',
        date: format(addDays(new Date(), -2), 'yyyy-MM-dd'),
        cost: 378
      },
      {
        truck: 'T-005',
        description: 'Brake replacement',
        date: format(addDays(new Date(), -5), 'yyyy-MM-dd'),
        cost: 1250
      },
      {
        truck: 'T-008',
        description: 'Tire replacement',
        date: format(addDays(new Date(), -7), 'yyyy-MM-dd'),
        cost: 2400
      }
    ]
  }

  // Calculate recent trips
  const calculateRecentTrips = () => {
    // In a real implementation, we would fetch this data from the API
    // For now, we'll use mock data
    return [
      {
        id: 'TR-156',
        driver: 'John Doe',
        destination: 'Muscat, Oman',
        status: 'Completed',
        amount: 2500
      },
      {
        id: 'TR-155',
        driver: 'Mike Johnson',
        destination: 'Riyadh, Saudi Arabia',
        status: 'In Progress',
        amount: 3200
      },
      {
        id: 'TR-154',
        driver: 'Sarah Wilson',
        destination: 'Doha, Qatar',
        status: 'Completed',
        amount: 2800
      },
      {
        id: 'TR-153',
        driver: 'Ahmed Hassan',
        destination: 'Kuwait City, Kuwait',
        status: 'Completed',
        amount: 3000
      }
    ]
  }

  const upcomingExpirations = calculateUpcomingExpirations()
  const recentMaintenance = calculateRecentMaintenance()
  const recentTrips = calculateRecentTrips()

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
          <Button>
            <BarChart3 className="mr-2 h-4 w-4" />
            Generate Analytics
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fleet">Fleet</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">د.إ {dashboardData.trips.revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">د.إ {dashboardData.trips.profit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Trucks</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.trucks.active}/{dashboardData.trucks.total}</div>
                <p className="text-xs text-muted-foreground">{Math.round((dashboardData.trucks.active / dashboardData.trucks.total) * 100)}% fleet utilization</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.documents.expiringSoon}</div>
                <p className="text-xs text-muted-foreground">Documents expiring soon</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Fleet Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fleetStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {fleetStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} trucks`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Trips</CardTitle>
                <CardDescription>
                  Latest trip activities across your fleet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTrips />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Expirations</CardTitle>
                <CardDescription>
                  Documents and licenses expiring soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingExpirations.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        item.daysLeft <= 7 ? 'bg-red-500' : 
                        item.daysLeft <= 14 ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{item.type}: {item.item}</p>
                        <p className="text-sm text-muted-foreground">Expires: {item.date} ({item.daysLeft} days left)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Trucks</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.trucks.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Trailers</CardTitle>
                <Container className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.trailers.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.trucks.maintenance}</div>
                <p className="text-xs text-muted-foreground">Trucks under maintenance</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.trucks.expiringSoon + dashboardData.trailers.expiringSoon}</div>
                <p className="text-xs text-muted-foreground">Documents expiring in 30 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fleet Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fleetStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {fleetStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} trucks`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMaintenance.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-2 bg-blue-500" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{item.truck}: {item.description}</p>
                        <div className="flex justify-between">
                          <p className="text-sm text-muted-foreground">Date: {item.date}</p>
                          <p className="text-sm font-medium">د.إ {item.cost.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.trips.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Trips</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.trips.completed}</div>
                <p className="text-xs text-muted-foreground">{Math.round((dashboardData.trips.completed / dashboardData.trips.total) * 100)}% completion rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.trips.inProgress}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.employees.drivers}</div>
                <p className="text-xs text-muted-foreground">Out of {dashboardData.employees.total} employees</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Trip Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tripStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {tripStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} trips`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Trips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTrips.map((trip, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        trip.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{trip.id}: {trip.destination}</p>
                        <div className="flex justify-between">
                          <p className="text-sm text-muted-foreground">Driver: {trip.driver}</p>
                          <p className="text-sm font-medium">د.إ {trip.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finance" className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">د.إ {dashboardData.trips.revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">د.إ {dashboardData.trips.profit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance Cost</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">د.إ {dashboardData.maintenance.cost.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">-5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fines Amount</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">د.إ {dashboardData.fines.amount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{dashboardData.fines.pending} pending payments</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Profit Margin Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Revenue</p>
                      <p className="text-sm text-muted-foreground">Total income from operations</p>
                    </div>
                    <div className="font-medium">د.إ {dashboardData.trips.revenue.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Expenses</p>
                      <p className="text-sm text-muted-foreground">Maintenance, fines, and other costs</p>
                    </div>
                    <div className="font-medium">د.إ {(dashboardData.maintenance.cost + dashboardData.fines.amount).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Net Profit</p>
                      <p className="text-sm text-muted-foreground">Total profit after expenses</p>
                    </div>
                    <div className="font-medium">د.إ {dashboardData.trips.profit.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Profit Margin</p>
                      <p className="text-sm text-muted-foreground">Percentage of revenue as profit</p>
                    </div>
                    <div className="font-medium">{Math.round((dashboardData.trips.profit / dashboardData.trips.revenue) * 100)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Documents</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.documents.expiringSoon}</div>
                <p className="text-xs text-muted-foreground">Documents expiring in 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Fines</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.fines.pending}</div>
                <p className="text-xs text-muted-foreground">Unpaid fines</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visa Expirations</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.employees.expiringSoon}</div>
                <p className="text-xs text-muted-foreground">Employee visas expiring soon</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Insurance Renewals</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.trucks.expiringSoon}</div>
                <p className="text-xs text-muted-foreground">Vehicle insurance renewals due</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Document Expirations</CardTitle>
              <CardDescription>Documents expiring in the next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingExpirations.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      item.daysLeft <= 7 ? 'bg-red-500' : 
                      item.daysLeft <= 14 ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{item.type}: {item.item}</p>
                      <p className="text-sm text-muted-foreground">Expires: {item.date} ({item.daysLeft} days left)</p>
                    </div>
                    <Button variant="outline" size="sm">Renew</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}