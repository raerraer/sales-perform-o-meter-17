
import { useDashboardData } from "@/hooks/useDashboardData";
import NavigationHeader from "@/components/common/NavigationHeader";
import MonthlyStatCards from "@/components/dashboard/MonthlyStatCards";
import SalesForecastChart from "@/components/dashboard/SalesForecastChart";
import WorldMapSection from "@/components/dashboard/WorldMapSection";

const Dashboard = () => {
  const { forecastData, countryData, isLoading, currentMonthData, currentMonth } = useDashboardData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavigationHeader />
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-12 bg-gray-200 rounded-md w-1/2"></div>
            <div className="h-80 bg-gray-200 rounded-md w-full"></div>
            <div className="h-40 bg-gray-200 rounded-md w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader />
      
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">통합 영업 대시보드</h1>
        
        {/* 현재 월 지역별 통계 카드 */}
        <MonthlyStatCards data={currentMonthData} currentMonth={currentMonth} />
        
        {/* 차트 및 세계지도 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 차트 컴포넌트 */}
          <SalesForecastChart data={forecastData} />
          
          {/* 세계지도 컴포넌트 */}
          <WorldMapSection countries={countryData} currentMonth={currentMonth} />
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

export default Dashboard;
