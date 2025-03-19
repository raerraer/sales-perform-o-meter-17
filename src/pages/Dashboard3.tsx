import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Legend, Pie, PieChart, ResponsiveContainer, Sector } from "recharts"
import { useEffect, useState } from "react"
import { parseNumericValue } from "@/utils/sales/dataTransformers"
import { LEVELS, MONTHS, REGION_COUNTRIES } from "@/utils/sales/constants"
import NavigationHeader from "@/components/common/NavigationHeader"

// Current month for highlighting
const CURRENT_MONTH = 5; // June (index 5)

// 타입 정의 추가
interface CountryStatsData {
  qty: number;
  amt: number;
}

interface MonthlyData {
  month: string;
  monthIndex: number;
  isCurrent: boolean;
  countries: Record<string, CountryStatsData>;
}

const Dashboard3 = () => {
  const [countryData, setCountryData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  
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
        processCountryData(versionData[latestVersion]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const processCountryData = (rawData: any[][]) => {
    if (!rawData || !Array.isArray(rawData)) return;
    
    // Find indices for countries
    const countryIndices: Record<string, number> = {};
    
    // Get all country indices
    Object.keys(REGION_COUNTRIES).forEach(region => {
      REGION_COUNTRIES[region as keyof typeof REGION_COUNTRIES].forEach(country => {
        const index = rawData.findIndex(row => row[0] === country);
        if (index !== -1) {
          countryIndices[country] = index;
        }
      });
    });
    
    // Create data for each month
    const monthlyData = MONTHS.map((month, idx) => {
      // Base column for the month (1-based array, first column is the name)
      const baseColIdx = 1 + (idx * 11);
      
      // 전망 Qty column (0-based)
      const forecastQtyColIdx = baseColIdx + 8;
      // 전망 Amt column (0-based)
      const forecastAmtColIdx = baseColIdx + 9;
      
      // Get country data
      const countryStats: Record<string, CountryStatsData> = {};
      
      Object.entries(countryIndices).forEach(([country, index]) => {
        countryStats[country] = {
          qty: parseNumericValue(rawData[index]?.[forecastQtyColIdx] || 0),
          amt: parseNumericValue(rawData[index]?.[forecastAmtColIdx] || 0)
        };
      });
      
      return {
        month,
        monthIndex: idx + 1,
        isCurrent: idx + 1 === CURRENT_MONTH,
        countries: countryStats
      };
    });
    
    setCountryData(monthlyData);
  };

  const getCurrentMonthData = () => {
    return countryData.find(data => data.isCurrent) || countryData[CURRENT_MONTH - 1];
  };

  const getQtyPieChartData = () => {
    const currentData = getCurrentMonthData();
    if (!currentData) return [];
    
    return Object.entries(currentData.countries).map(([country, data], index) => ({
      name: country,
      value: data.qty,
      fill: getCountryColor(country)
    }));
  };

  const getAmtPieChartData = () => {
    const currentData = getCurrentMonthData();
    if (!currentData) return [];
    
    return Object.entries(currentData.countries).map(([country, data], index) => ({
      name: country,
      value: data.amt,
      fill: getCountryColor(country)
    }));
  };

  const getCountryColor = (country: string): string => {
    switch(country) {
      case '미국': return '#3B82F6';  // Blue
      case '캐나다': return '#4ADE80'; // Green
      case '영국': return '#F43F5E';   // Pink
      case '이태리': return '#F59E0B'; // Amber
      default: return '#6B7280';       // Gray
    }
  };

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-medium">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs">
          {`${value.toLocaleString()}`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
          {`(${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const dashboardConfig = {
    미국: { label: "미국", theme: { light: "#3B82F6", dark: "#60A5FA" } },
    캐나다: { label: "캐나다", theme: { light: "#4ADE80", dark: "#86EFAC" } },
    영국: { label: "영국", theme: { light: "#F43F5E", dark: "#FB7185" } },
    이태리: { label: "이태리", theme: { light: "#F59E0B", dark: "#FBBF24" } }
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
      <NavigationHeader />
      
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">국가별 실적 분석</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{CURRENT_MONTH}월 국가별 수량 비중</CardTitle>
              <CardDescription>
                국가별 전망 수량 분포
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer className="aspect-[4/3]" config={dashboardConfig}>
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={getQtyPieChartData()}
                    innerRadius={70}
                    outerRadius={90}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{CURRENT_MONTH}월 국가별 금액 비중</CardTitle>
              <CardDescription>
                국가별 전망 금액 분포
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer className="aspect-[4/3]" config={dashboardConfig}>
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={getAmtPieChartData()}
                    innerRadius={70}
                    outerRadius={90}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle>{CURRENT_MONTH}월 국가별 상세 전망</CardTitle>
            <CardDescription>
              국가별 판매 전망 데이터
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="americas" className="space-y-4">
              <TabsList>
                <TabsTrigger value="americas">미주</TabsTrigger>
                <TabsTrigger value="europe">구주</TabsTrigger>
              </TabsList>
              <TabsContent value="americas" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {REGION_COUNTRIES['미주'].map(country => {
                    const currentData = getCurrentMonthData()?.countries[country];
                    return (
                      <Card key={country} className="bg-white">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{country}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center border-b pb-2">
                              <span className="text-sm font-medium">수량</span>
                              <span className="text-lg font-bold">{currentData?.qty.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">금액</span>
                              <span className="text-lg font-bold">{currentData?.amt.toLocaleString() || 0}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
              <TabsContent value="europe" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {REGION_COUNTRIES['구주'].map(country => {
                    const currentData = getCurrentMonthData()?.countries[country];
                    return (
                      <Card key={country} className="bg-white">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{country}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center border-b pb-2">
                              <span className="text-sm font-medium">수량</span>
                              <span className="text-lg font-bold">{currentData?.qty.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">금액</span>
                              <span className="text-lg font-bold">{currentData?.amt.toLocaleString() || 0}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Sales Perform-O-Meter. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard3;
