
import { CellChange } from '@/hooks/sales/useSalesHistory';

interface HistoryChangeTableProps {
  changes: CellChange[];
}

const HistoryChangeTable = ({ changes }: HistoryChangeTableProps) => {
  return (
    <div className="overflow-auto">
      <table className="w-full text-xs divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-2 text-left font-medium">국가</th>
            <th className="px-2 py-2 text-left font-medium">월</th>
            <th className="px-2 py-2 text-left font-medium">구분</th>
            <th className="px-2 py-2 text-left font-medium">모델</th>
            <th className="px-2 py-2 text-left font-medium">항목</th>
            <th className="px-2 py-2 text-center font-medium">변경 전</th>
            <th className="px-2 py-2 text-center font-medium">변경 후</th>
          </tr>
        </thead>
        <tbody>
          {changes.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-2 py-4 text-center text-gray-500">
                실제 변경된 내용이 없습니다.
              </td>
            </tr>
          ) : (
            changes.map((change, changeIdx) => {
              // 항목(QTY/AMT) 구분 - 직접 변경 감지 결과 사용
              const itemType = change.col % 2 === 0 ? 'AMT' : 'QTY';
              
              return (
                <tr 
                  key={changeIdx} 
                  className="hover:bg-gray-50 border-t border-gray-100"
                >
                  <td className="px-2 py-1.5">{change.country || '-'}</td>
                  <td className="px-2 py-1.5">{change.month}</td>
                  <td className="px-2 py-1.5">{change.category || '전망'}</td>
                  <td className="px-2 py-1.5">{change.model || '-'}</td>
                  <td className="px-2 py-1.5">{itemType}</td>
                  <td className="px-2 py-1.5 text-center">
                    {change.oldValue || '-'}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <span className="text-blue-600 font-medium">
                      {change.newValue || '-'}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryChangeTable;
