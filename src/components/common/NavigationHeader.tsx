
import { Link, useLocation } from "react-router-dom";

export const NavigationHeader = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex flex-wrap items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800 mr-8">영업실적관리</h1>
            
            <div className="hidden sm:flex space-x-6">
              <Link 
                to="/" 
                className={`text-sm font-medium px-1 py-2 border-b-2 ${
                  isActive('/') 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-400'
                }`}
              >
                영업실적표
              </Link>
              <Link 
                to="/dashboard1" 
                className={`text-sm font-medium px-1 py-2 border-b-2 ${
                  isActive('/dashboard1') 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-400'
                }`}
              >
                대시보드1
              </Link>
              <Link 
                to="/dashboard2" 
                className={`text-sm font-medium px-1 py-2 border-b-2 ${
                  isActive('/dashboard2') 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-400'
                }`}
              >
                대시보드2
              </Link>
              <Link 
                to="/dashboard3" 
                className={`text-sm font-medium px-1 py-2 border-b-2 ${
                  isActive('/dashboard3') 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-400'
                }`}
              >
                대시보드3
              </Link>
            </div>
          </div>

          <div className="flex sm:hidden">
            <select 
              className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
              value={location.pathname}
              onChange={(e) => {
                window.location.href = e.target.value;
              }}
            >
              <option value="/">영업실적표</option>
              <option value="/dashboard1">대시보드1</option>
              <option value="/dashboard2">대시보드2</option>
              <option value="/dashboard3">대시보드3</option>
            </select>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default NavigationHeader;
