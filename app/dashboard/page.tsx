"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { BarChart as BarChartIcon, Milk, DollarSign, TrendingUp, RefreshCw, Moon, Sun } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CustomLineChart } from "@/components/linechart"
import { CustomBarChart } from '@/components/barchart'
import { fetchAllPayments } from "@/app/services/payment-service"
import { transformPaymentsToWeeklyData, transformPaymentsToMonthlyData } from "@/app/utils/transform-payments"
import { staticMonthlySalesData, staticWeeklySalesData } from "../data/sales-data"
import { useTheme } from "@/components/theme-provider"

// Helper function to ensure values are numbers
function ensureNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

// Theme toggle component
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="bg-white text-[#333333] border-[#333333] dark:bg-[#2C3E50] dark:text-white dark:border-gray-600"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [weeklyData, setWeeklyData] = useState(staticWeeklySalesData)
  const [monthlyData, setMonthlyData] = useState(staticMonthlySalesData)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Create a memoized fetchData function so we can reuse it with the interval
  const fetchData = useCallback(async () => {
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
      
      // Update last refreshed timestamp
      setLastUpdated(new Date())

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Set up client-side only effects
  useEffect(() => {
    setIsClient(true)
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/")
      return
    }

    // Initialize lastUpdated here, only on the client
    setLastUpdated(new Date())

    // Initial data fetch
    fetchData()

    // Set up interval for refreshing data every 10 minutes (600000 ms)
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing dashboard data...")
      fetchData()
    }, 600000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [router, fetchData])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/")
  }

  const handleManualRefresh = () => {
    fetchData()
  }

  // Format the last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return "Loading..."
    return lastUpdated.toLocaleTimeString()
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#333333] dark:bg-[#121212] dark:text-[#E0E0E0]">
      {/* Navigation Bar */}
      <header className="bg-[#A7C7E7] p-4 shadow-md dark:bg-[#2C3E50]">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Milk className="h-6 w-6" />
            <h1 className="text-xl font-bold">Milk Seller Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white hover:bg-gray-100 text-[#333333] border-[#333333] dark:bg-[#2C3E50] dark:text-white dark:border-gray-600 dark:hover:bg-[#374151]"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6">
        {/* Refresh Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {isClient ? formatLastUpdated() : "Loading..."}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="flex items-center gap-1 bg-white hover:bg-gray-100 text-[#333333] border-[#333333] dark:bg-[#2C3E50] dark:text-white dark:border-gray-600 dark:hover:bg-[#374151]"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="flex justify-center items-center h-20 mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A7C7E7] dark:border-[#4B6584]"></div>
            </div>
            <Skeleton className="h-[200px] w-full rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-[300px] w-full rounded-xl bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-[300px] w-full rounded-xl bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Today's Revenue Card */}
            <Card className="bg-white shadow-md border-[#A7C7E7] border-t-4 dark:bg-[#1E293B] dark:border-[#4B6584]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-medium">Today's Milk Revenue</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Total revenue earned today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-4xl font-bold">KES {todayRevenue.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weekly Revenue Chart */}
              <Card className="bg-white dark:bg-[#1E293B]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-[#4f46e5] dark:text-[#818cf8]" />
                    Weekly Revenue
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Revenue from milk sales this week</CardDescription>
                </CardHeader>
                <div className="p-4 border rounded-lg dark:border-gray-700 mx-4">
                  <h2 className="text-xl font-semibold mb-4">Weekly Sales</h2>

                  <CustomLineChart
                    data={weeklyData}
                    xAxisKey="day"
                    dataKey="sales"
                    color={isClient && document.documentElement.classList.contains('dark') ? "#818cf8" : "#4f46e5"}
                  />
                </div>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                  <div className="flex gap-2 font-medium leading-none text-gray-600 dark:text-gray-400">
                    Showing {weeklyData === staticWeeklySalesData ? "sample" : "real-time"} payment data
                  </div>
                </CardFooter>
              </Card>

              {/* Monthly Revenue Chart */}
              <Card className="bg-white dark:bg-[#1E293B]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChartIcon className="h-5 w-5 mr-2 text-[#4f46e5] dark:text-[#818cf8]" />
                    Monthly Revenue
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Revenue from milk sales this year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-6 rounded-lg shadow-md dark:bg-[#1E293B] dark:shadow-none dark:border dark:border-gray-700">
                    <CustomBarChart
                      data={monthlyData}
                      xAxisKey="month"
                      barKey="sales"
                      barColor={isClient && document.documentElement.classList.contains('dark') ? "#818cf8" : "#4f46e5"}
                      height={400}
                      barSize={40}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                  <div className="flex gap-2 font-medium leading-none text-gray-600 dark:text-gray-400">
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