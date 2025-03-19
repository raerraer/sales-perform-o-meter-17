
import { useEffect } from 'react';
import SalesPerformanceTable from '@/components/SalesPerformanceTable';
import NavigationHeader from '@/components/common/NavigationHeader';
import useSalesPerformance from '@/hooks/useSalesPerformance';

const Index = () => {
  const { versionData, currentVersion } = useSalesPerformance();

  useEffect(() => {
    // 페이지 로드 시 부드러운 애니메이션 적용
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // 로컬스토리지에 데이터 저장 (대시보드용)
    if (versionData && Object.keys(versionData).length > 0) {
      localStorage.setItem('salesVersionData', JSON.stringify(versionData));
      console.info(`${currentVersion} 버전 데이터 로드:`, versionData[currentVersion]);
    }
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [versionData, currentVersion]);
  
  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader />
      
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">영업실적표</h1>
        <SalesPerformanceTable />
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Sales Perform-O-Meter. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
