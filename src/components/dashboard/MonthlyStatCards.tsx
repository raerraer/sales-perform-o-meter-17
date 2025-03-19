
import { RegionData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthlyStatCardsProps {
  data: RegionData[];
  currentMonth: number;
}

const MonthlyStatCards = ({ data, currentMonth }: MonthlyStatCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {data.map((regionData, index) => (
        <Card key={index} className="shadow-sm">
          <CardHeader className="pb-2" style={{ borderBottom: `3px solid ${regionData.color}` }}>
            <CardTitle>{regionData.name}</CardTitle>
            <CardDescription>{currentMonth}월 판매 전망</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-2">
              <div className="text-3xl font-bold">${regionData.amt.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                수량: {regionData.qty.toLocaleString()} 개
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MonthlyStatCards;
