"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart as BarChartIcon, Milk, DollarSign, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CustomLineChart } from "@/components/linechart"
import { CustomBarChart } from '@/components/barchart'
import { fetchAllPayments } from "@/app/services/payment-service"
import { transformPaymentsToWeeklyData, transformPaymentsToMonthlyData } from "@/app/utils/transform-payments"
import { staticMonthlySalesData, staticWeeklySalesData } from "../data/sales-data"

// Helper function to ensure values are numbers
function ensureNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [weeklyData, setWeeklyData] = useState(staticWeeklySalesData)
  const [monthlyData, setMonthlyData] = useState(staticMonthlySalesData)

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/")
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch payments data
        const payments = await fetchAllPayments()

        // Calculate today's revenue
        const today = new Date().toISOString().split('T')[0]  // Get today's date in YYYY-MM-DD format
        const todayPayments = payments.filter(payment =>
          new Date(payment.timestamp).toISOString().split('T')[0] === today  // Compare timestamps
        )

        // Calculate today's revenue with proper number handling
        const todayTotal = todayPayments.reduce((sum, payment) => {
          return sum + ensureNumber(payment.amount)
        }, 0)
        
        // Format to 2 decimal places for display
        setTodayRevenue(Number(todayTotal.toFixed(2)))

        // Transform payments to weekly and monthly data
        const weeklySalesData = transformPaymentsToWeeklyData(payments)
        const monthlySalesData = transformPaymentsToMonthlyData(payments)

        // Log the transformed data for weekly and monthly sales
        console.log("Weekly Data for Line Graph:", weeklySalesData)
        console.log("Monthly Data for Line Graph:", monthlySalesData)

        // Set the data for the chart
        setWeeklyData(weeklySalesData)
        setMonthlyData(monthlySalesData)

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Bar (unchanged) */}
      <header className="bg-primary p-4 shadow-md">
        {/* ... existing header code ... */}
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6">
        {isLoading ? (
          <div className="space-y-6">
            <div className="flex justify-center items-center h-20 mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Today's Revenue Card */}
            <Card className="bg-card shadow-md border-primary border-t-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-medium">Today's Milk Revenue</CardTitle>
                <CardDescription>Total revenue earned today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-10 w-10 text-primary mr-3" />
                  <span className="text-4xl font-bold">${todayRevenue.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weekly Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    Weekly Revenue
                  </CardTitle>
                  <CardDescription>Revenue from milk sales this week</CardDescription>
                </CardHeader>
                <div className="p-4 border rounded-lg">
                  <h2 className="text-xl font-semibold mb-4">Weekly Sales</h2>

                  <CustomLineChart
                    data={weeklyData}
                    xAxisKey="day"
                    dataKey="sales"
                    color="#4f46e5"
                  />
                </div>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                  <div className="flex gap-2 font-medium leading-none">
                    Showing {weeklyData === staticWeeklySalesData ? "sample" : "real-time"} payment data
                  </div>
                </CardFooter>
              </Card>

              {/* Monthly Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChartIcon className="h-5 w-5 mr-2 text-secondary" />
                    Monthly Revenue
                  </CardTitle>
                  <CardDescription>Revenue from milk sales this year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <CustomBarChart
                      data={monthlyData}
                      xAxisKey="month"
                      barKey="sales"
                      barColor="#4f46e5"
                      height={400}
                      barSize={40}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                  <div className="flex gap-2 font-medium leading-none">
                    Showing {monthlyData === staticMonthlySalesData ? "sample" : "real-time"} payment data
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}