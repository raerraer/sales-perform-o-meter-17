
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import { parseNumericValue } from "@/utils/sales/dataTransformers"
import { LEVELS, MODELS, MONTHS } from "@/utils/sales/constants"
import { Link } from "react-router-dom"

// Current month for highlighting
const CURRENT_MONTH = 5; // June (index 5)

const Dashboard2 = () => {
  const [modelData, setModelData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH.toString());

  useEffect(() => {
    // Fetch data from localStorage
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
        processModelData(versionData[latestVersion]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const processModelData = (rawData: any[][]) => {
    if (!rawData || !Array.isArray(rawData)) return;
    
    // Find indices for models and regions
    const totalIndex = rawData.findIndex(row => row[0] === LEVELS.TOTAL);
    
    // Get model indices under Total
    const model1IndexTotal = totalIndex + 1;
    const model2IndexTotal = totalIndex + 2;
    
    // Find region indices
    const americasIndex = rawData.findIndex(row => row[0] === '미주');
    const europeIndex = rawData.findIndex(row => row[0] === '구주');
    
    // Get model indices under each region
    const model1IndexAmericas = americasIndex + 1;
    const model2IndexAmericas = americasIndex + 2;
    const model1IndexEurope = europeIndex + 1;
    const model2IndexEurope = europeIndex + 2;
    
    // Create data for each month
    const monthlyData = MONTHS.map((month, idx) => {
      // Base column for the month (1-based array, first column is the name)
      const baseColIdx = 1 + (idx * 11);
      
      // 전망 Qty column (0-based)
      const forecastQtyColIdx = baseColIdx + 8;
      // 전망 Amt column (0-based)
      const forecastAmtColIdx = baseColIdx + 9;
      
      // Extract values for each model in each region
      const model1AmericasQty = parseNumericValue(rawData[model1IndexAmericas]?.[forecastQtyColIdx] || 0);
      const model1AmericasAmt = parseNumericValue(rawData[model1IndexAmericas]?.[forecastAmtColIdx] || 0);
      const model2AmericasQty = parseNumericValue(rawData[model2IndexAmericas]?.[forecastQtyColIdx] || 0);
      const model2AmericasAmt = parseNumericValue(rawData[model2IndexAmericas]?.[forecastAmtColIdx] || 0);
      
      const model1EuropeQty = parseNumericValue(rawData[model1IndexEurope]?.[forecastQtyColIdx] || 0);
      const model1EuropeAmt = parseNumericValue(rawData[model1IndexEurope]?.[forecastAmtColIdx] || 0);
      const model2EuropeQty = parseNumericValue(rawData[model2IndexEurope]?.[forecastQtyColIdx] || 0);
      const model2EuropeAmt = parseNumericValue(rawData[model2IndexEurope]?.[forecastAmtColIdx] || 0);
      
      const model1TotalQty = parseNumericValue(rawData[model1IndexTotal]?.[forecastQtyColIdx] || 0);
      const model1TotalAmt = parseNumericValue(rawData[model1IndexTotal]?.[forecastAmtColIdx] || 0);
      const model2TotalQty = parseNumericValue(rawData[model2IndexTotal]?.[forecastQtyColIdx] || 0);
      const model2TotalAmt = parseNumericValue(rawData[model2IndexTotal]?.[forecastAmtColIdx] || 0);
      
      return {
        month: month,
        monthIndex: idx + 1,
        model1: {
          americas: { qty: model1AmericasQty, amt: model1AmericasAmt },
          europe: { qty: model1EuropeQty, amt: model1EuropeAmt },
          total: { qty: model1TotalQty, amt: model1TotalAmt }
        },
        model2: {
          americas: { qty: model2AmericasQty, amt: model2AmericasAmt },
          europe: { qty: model2EuropeQty, amt: model2EuropeAmt },
          total: { qty: model2TotalQty, amt: model2TotalAmt }
        }
      };
    });
    
    setModelData(monthlyData);
  };

  const getSelectedMonthData = () => {
    const monthIdx = parseInt(selectedMonth) - 1;
    const currentMonthData = modelData[monthIdx] || modelData[CURRENT_MONTH - 1];
    
    if (!currentMonthData) return [];
    
    // Convert to format suitable for the bar chart
    return [
      {
        name: '모델1',
        미주: currentMonthData.model1.americas.qty,
        구주: currentMonthData.model1.europe.qty,
        총계: currentMonthData.model1.total.qty
      },
      {
        name: '모델2',
        미주: currentMonthData.model2.americas.qty,
        구주: currentMonthData.model2.europe.qty,
        총계: currentMonthData.model2.total.qty
      }
    ];
  };

  const getCurrentMonthData = () => {
    const monthIdx = parseInt(selectedMonth) - 1;
    return modelData[monthIdx] || modelData[CURRENT_MONTH - 1];
  };

  const dashboardConfig = {
    미주: { label: "미주", theme: { light: "#4ADE80", dark: "#86EFAC" } },
    구주: { label: "구주", theme: { light: "#F43F5E", dark: "#FB7185" } },
    총계: { label: "총계", theme: { light: "#3B82F6", dark: "#60A5FA" } },
  };

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
      <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">대시보드 2</h1>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-700">모델별 실적 분석</h2>
          
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              영업실적표 보기
            </Link>
            <Link to="/dashboard1" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              대시보드 1
            </Link>
            <Link to="/dashboard3" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              대시보드 3
            </Link>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>모델별 전망 분석</CardTitle>
              <div className="flex items-center justify-between">
                <CardDescription>
                  선택한 월의 모델별 지역 판매 전망
                </CardDescription>
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white border border-gray-300 rounded-md text-sm p-1"
                >
                  {MONTHS.map((month, idx) => (
                    <option key={idx} value={idx+1}>
                      {month}월
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="qty" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="qty">수량</TabsTrigger>
                  <TabsTrigger value="amt">금액</TabsTrigger>
                </TabsList>
                <TabsContent value="qty" className="space-y-4">
                  <ChartContainer className="aspect-[4/3]" config={dashboardConfig}>
                    <BarChart data={getSelectedMonthData()}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="미주" name="미주" fill="#4ADE80" />
                      <Bar dataKey="구주" name="구주" fill="#F43F5E" />
                      <Bar dataKey="총계" name="총계" fill="#3B82F6" />
                    </BarChart>
                  </ChartContainer>
                </TabsContent>
                <TabsContent value="amt" className="space-y-4">
                  <ChartContainer className="aspect-[4/3]" config={dashboardConfig}>
                    <BarChart data={[
                      {
                        name: '모델1',
                        미주: getCurrentMonthData()?.model1.americas.amt || 0,
                        구주: getCurrentMonthData()?.model1.europe.amt || 0,
                        총계: getCurrentMonthData()?.model1.total.amt || 0
                      },
                      {
                        name: '모델2',
                        미주: getCurrentMonthData()?.model2.americas.amt || 0,
                        구주: getCurrentMonthData()?.model2.europe.amt || 0,
                        총계: getCurrentMonthData()?.model2.total.amt || 0
                      }
                    ]}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="미주" name="미주" fill="#4ADE80" />
                      <Bar dataKey="구주" name="구주" fill="#F43F5E" />
                      <Bar dataKey="총계" name="총계" fill="#3B82F6" />
                    </BarChart>
                  </ChartContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-4 mt-6">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">모델1 미주 전망</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {getCurrentMonthData()?.model1.americas.qty.toLocaleString() || 0}
                </span>
                <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded text-xs">
                  수량
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-semibold">
                  {getCurrentMonthData()?.model1.americas.amt.toLocaleString() || 0}
                </span>
                <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded text-xs">
                  금액
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">모델1 구주 전망</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {getCurrentMonthData()?.model1.europe.qty.toLocaleString() || 0}
                </span>
                <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded text-xs">
                  수량
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-semibold">
                  {getCurrentMonthData()?.model1.europe.amt.toLocaleString() || 0}
                </span>
                <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded text-xs">
                  금액
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">모델2 미주 전망</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {getCurrentMonthData()?.model2.americas.qty.toLocaleString() || 0}
                </span>
                <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded text-xs">
                  수량
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-semibold">
                  {getCurrentMonthData()?.model2.americas.amt.toLocaleString() || 0}
                </span>
                <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded text-xs">
                  금액
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">모델2 구주 전망</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {getCurrentMonthData()?.model2.europe.qty.toLocaleString() || 0}
                </span>
                <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded text-xs">
                  수량
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-semibold">
                  {getCurrentMonthData()?.model2.europe.amt.toLocaleString() || 0}
                </span>
                <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded text-xs">
                  금액
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard2;
