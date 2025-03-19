
import { ForecastData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Legend, Line, LineChart, XAxis, YAxis } from "recharts";
import { useState } from "react";

interface SalesForecastChartProps {
  data: ForecastData[];
}

const SalesForecastChart = ({ data }: SalesForecastChartProps) => {
  const [selectedRegion, setSelectedRegion] = useState("all");

  const getFilteredChartData = () => {
    if (selectedRegion === "americas") {
      return data.map(item => ({
        month: item.month,
        isCurrent: item.isCurrent,
        qty: item.americasQty,
        amt: item.americasAmt
      }));
    } else if (selectedRegion === "europe") {
      return data.map(item => ({
        month: item.month,
        isCurrent: item.isCurrent,
        qty: item.europeQty,
        amt: item.europeAmt
      }));
    } else {
      return data.map(item => ({
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

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>월별 판매 전망 추이</CardTitle>
        <CardDescription>월별 금액 판매 전망 추이 그래프</CardDescription>
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
              <LineChart data={getFilteredChartData()}>
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
              <LineChart data={getFilteredChartData()}>
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
              <LineChart data={getFilteredChartData()}>
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
  );
};

export default SalesForecastChart;
