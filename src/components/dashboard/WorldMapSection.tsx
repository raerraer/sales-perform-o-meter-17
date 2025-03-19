
import { CountryData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WorldMap from "@/components/WorldMap";

interface WorldMapSectionProps {
  countries: CountryData[];
  currentMonth: number;
}

const WorldMapSection = ({ countries, currentMonth }: WorldMapSectionProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>세계 지역별 매출 분포</CardTitle>
        <CardDescription>{currentMonth}월 지역별 판매 전망 분포도</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-[4/3] w-full">
          <WorldMap countries={countries} />
        </div>
      </CardContent>
    </Card>
  );
};

export default WorldMapSection;
