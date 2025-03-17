
import { useEffect } from 'react';
import SalesPerformanceTable from '@/components/SalesPerformanceTable';

const Index = () => {
  useEffect(() => {
    // 페이지 로드 시 부드러운 애니메이션 적용
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Sales Perform-O-Meter</h1>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-lg text-gray-600 mb-2">월별 영업실적 관리</h2>
          <p className="text-sm text-gray-500">월별 데이터를 관리하고 영업실적을 추적하세요.</p>
        </div>
        
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
