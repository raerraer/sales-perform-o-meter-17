import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import { parseNumericValue } from "@/utils/sales/dataTransformers"
import { LEVELS, MONTHS } from "@/utils/sales/constants"
import NavigationHeader from "@/components/common/NavigationHeader"

// Current month for highlighting (mock for now)
const CURRENT_MONTH = 5; // June (index 5)

const Dashboard1 = () => {
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("all");

  useEffect(() => {
    // Fetch data from localStorage (assuming version data exists)
    const fetchData = () => {
      try {
        const versionDataStr = localStorage.getItem('salesVersionData');
        if (!versionDataStr) {
          console.error("No sales data found in localStorage");
          return;
        }
        
        const versionData = JSON.parse(versionDataStr);
        const latestVersion = Object.keys(versionData).sort().pop();
        
        if (!latestVersion || !versionData[latestVersion]) {
          console.error("Latest version data not found");
          return;
        }
        
        // Process data for dashboard
        processDataForDashboard(versionData[latestVersion]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const processDataForDashboard = (rawData: any[][]) => {
    if (!rawData || !Array.isArray(rawData)) return;
    
    // Find indices for Total, Regions, and Models
    const totalIndex = rawData.findIndex(row => row[0] === LEVELS.TOTAL);
    const regionIndices = {
      '미주': rawData.findIndex(row => row[0] === '미주'),
      '구주': rawData.findIndex(row => row[0] === '구주')
    };
    
    // Extract forecast data (전망) which is at index 9 in each month's data block
    // Each month has 11 columns (5 data types + 1 remark column)
    const formattedData = MONTHS.map((month, idx) => {
      // Base column index for each month (1-based array: first column is the name)
      const baseColIdx = 1 + (idx * 11);
      // 전망 Qty column is at offset 8 (0-based)
      const forecastQtyColIdx = baseColIdx + 8;
      // 전망 Amt column is at offset 9 (0-based)
      const forecastAmtColIdx = baseColIdx + 9;
      
      // Extract values for total and regions
      const totalQty = parseNumericValue(rawData[totalIndex]?.[forecastQtyColIdx] || 0);
      const totalAmt = parseNumericValue(rawData[totalIndex]?.[forecastAmtColIdx] || 0);
      
      // Extract values for each region
      const americasQty = parseNumericValue(rawData[regionIndices['미주']]?.[forecastQtyColIdx] || 0);
      const americasAmt = parseNumericValue(rawData[regionIndices['미주']]?.[forecastAmtColIdx] || 0);
      const europeQty = parseNumericValue(rawData[regionIndices['구주']]?.[forecastQtyColIdx] || 0);
      const europeAmt = parseNumericValue(rawData[regionIndices['구주']]?.[forecastAmtColIdx] || 0);
      
      return {
        month: month,
        isCurrent: idx === CURRENT_MONTH - 1,
        totalQty,
        totalAmt,
        americasQty,
        americasAmt,
        europeQty,
        europeAmt
      };
    });
    
    setForecastData(formattedData);
  };

  const getFilteredData = () => {
    if (selectedRegion === "americas") {
      return forecastData.map(item => ({
        month: item.month,
        isCurrent: item.isCurrent,
        qty: item.americasQty,
        amt: item.americasAmt
      }));
    } else if (selectedRegion === "europe") {
      return forecastData.map(item => ({
        month: item.month,
        isCurrent: item.isCurrent,
        qty: item.europeQty,
        amt: item.europeAmt
      }));
    } else {
      return forecastData.map(item => ({
        month: item.month,
        isCurrent: item.isCurrent,
        qty: item.totalQty,
        amt: item.totalAmt
      }));
    }
  };

  const dashboardConfig = {
    qty: { label: "수량", theme: { light: "#8B5CF6", dark: "#A78BFA" } },
    amt: { label: "금액", theme: { light: "#F97316", dark: "#FB923C" } }
  };

  const getCurrentMonthStats = () => {
    const currentMonthData = forecastData.find(item => item.isCurrent);
    
    if (!currentMonthData) return { qty: 0, amt: 0, region: '전체' };
    
    if (selectedRegion === 'americas') {
      return { 
        qty: currentMonthData.americasQty,
        amt: currentMonthData.americasAmt,
        region: '미주'
      };
    } else if (selectedRegion === 'europe') {
      return { 
        qty: currentMonthData.europeQty,
        amt: currentMonthData.europeAmt,
        region: '구주'
      };
    } else {
      return { 
        qty: currentMonthData.totalQty,
        amt: currentMonthData.totalAmt,
        region: '전체'
      };
    }
  };

  const currentStats = getCurrentMonthStats();

  if (isLoading) {
    return <div className="container mx-auto py-8 px-4">
      <div className="animate-pulse flex flex-col gap-4">
        <div className="h-12 bg-gray-200 rounded-md w-1/2"></div>
        <div className="h-80 bg-gray-200 rounded-md w-full"></div>
        <div className="h-40 bg-gray-200 rounded-md w-full"></div>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader />
      
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">월별 판매 전망 분석</h1>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="col-span-3 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>월별 판매 전망</CardTitle>
              <CardDescription>
                월별 수량 및 금액 판매 전망 추이
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-4" onValueChange={setSelectedRegion}>
                <TabsList>
                  <TabsTrigger value="all">전체</TabsTrigger>
                  <TabsTrigger value="americas">미주</TabsTrigger>
                  <TabsTrigger value="europe">구주</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  <ChartContainer className="aspect-[4/3]" config={dashboardConfig}>
                    <LineChart data={getFilteredData()}>
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="qty"
                        name="수량"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="amt"
                        name="금액"
                        stroke="#F97316"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </TabsContent>
                <TabsContent value="americas" className="space-y-4">
                  <ChartContainer className="aspect-[4/3]" config={dashboardConfig}>
                    <LineChart data={getFilteredData()}>
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="qty"
                        name="수량"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="amt"
                        name="금액"
                        stroke="#F97316"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </TabsContent>
                <TabsContent value="europe" className="space-y-4">
                  <ChartContainer className="aspect-[4/3]" config={dashboardConfig}>
                    <LineChart data={getFilteredData()}>
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="qty"
                        name="수량"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="amt"
                        name="금액"
                        stroke="#F97316"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card className="col-span-3 md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle>{CURRENT_MONTH}월 전망 요약</CardTitle>
              <CardDescription>
                {currentStats.region} 지역 ({CURRENT_MONTH}월)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-purple-50">
                  <div className="text-sm text-purple-800 font-medium mb-1">예상 판매 수량</div>
                  <div className="text-3xl font-bold text-purple-900">{currentStats.qty.toLocaleString()} 개</div>
                </div>
                
                <div className="p-4 border rounded-lg bg-orange-50">
                  <div className="text-sm text-orange-800 font-medium mb-1">예상 판매 금액</div>
                  <div className="text-3xl font-bold text-orange-900">{currentStats.amt.toLocaleString()} 만원</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Sales Perform-O-Meter. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard1;
