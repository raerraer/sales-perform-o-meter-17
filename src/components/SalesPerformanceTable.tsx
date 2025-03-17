
import { useEffect, useRef, useState } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// 모든 Handsontable 모듈 등록
registerAllModules();

const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const CATEGORIES = ['전년', '계획', '실행', '속보', '전망', '비고'];
const COUNTRIES = ['미국', '캐나다', '영국', '이태리'];
const MODELS = ['모델1', '모델2'];

// 기본 데이터 구조 생성
const generateInitialData = () => {
  const data: any[] = [];
  
  COUNTRIES.forEach(country => {
    // 국가 행 추가
    data.push([country, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    
    // 각 국가별 모델 행 추가
    MODELS.forEach(model => {
      data.push([model, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    });
  });
  
  return data;
};

const SalesPerformanceTable = () => {
  const hotRef = useRef<any>(null);
  const [data, setData] = useState(generateInitialData());
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalData, setOriginalData] = useState<any[]>([]);
  
  // 현재 보기 모드에 따라 셀 설정을 다르게 적용
  const getCellsSettings = () => {
    const cells = (row: number, col: number, prop: any) => {
      const cellProperties: any = {};
      
      // 국가 행 스타일 (첫번째 열이 국가명이고 col이 0인 경우)
      if (col === 0 && COUNTRIES.includes(data[row][0])) {
        cellProperties.className = 'font-bold bg-gray-200';
      }
      
      // 비고 열은 항상 수정 가능 (읽기 모드에서도)
      if ((col - 1) % 11 === 10) { // 각 월의 비고 열 (11번째 열)
        cellProperties.readOnly = false;
      } 
      // 수정 모드가 아닌 경우 모든 셀을 읽기 전용으로 설정
      else if (!isEditMode) {
        cellProperties.readOnly = true;
      }

      // 변경된 셀에 하이라이트 적용
      if (isEditMode && originalData.length > 0 && originalData[row] && data[row]) {
        if (originalData[row][col] !== data[row][col] && data[row][col] !== '') {
          cellProperties.className = 'highlight-cell';
        }
      }
      
      return cellProperties;
    };
    
    return cells;
  };

  // 헤더 생성 함수
  const generateComplexHeaders = () => {
    const monthHeaders = [];
    
    for (let month = 0; month < 12; month++) {
      const categoryHeaders = [];
      
      for (let category = 0; category < CATEGORIES.length; category++) {
        if (category < 5) { // 전년, 계획, 실행, 속보, 전망
          categoryHeaders.push({
            label: CATEGORIES[category],
            colspan: 2
          });
        } else { // 비고
          categoryHeaders.push({
            label: CATEGORIES[category],
            colspan: 1
          });
        }
      }
      
      monthHeaders.push({
        label: `${MONTHS[month]}월`,
        colspan: categoryHeaders.reduce((acc, curr) => acc + curr.colspan, 0)
      });
    }
    
    // 모든 월에 대한 헤더 생성
    const allColumnHeaders: any[] = [];
    for (let month = 0; month < 12; month++) {
      // 각 월별로 카테고리 헤더 추가
      for (let category = 0; category < 5; category++) {
        allColumnHeaders.push({label: 'Qty', colspan: 1});
        allColumnHeaders.push({label: 'Amt', colspan: 1});
      }
      // 비고 열 추가
      allColumnHeaders.push({label: '', colspan: 1});
    }
    
    return [
      monthHeaders,
      allColumnHeaders
    ];
  };

  const toggleEditMode = () => {
    if (!isEditMode) {
      // 편집 모드로 전환 시 현재 데이터를 백업
      setOriginalData(JSON.parse(JSON.stringify(data)));
      setIsEditMode(true);
      toast.info("편집 모드로 전환되었습니다.");
    } else {
      // 편집 취소
      setData(JSON.parse(JSON.stringify(originalData)));
      setIsEditMode(false);
      setOriginalData([]);
      toast.info("편집이 취소되었습니다.");
    }
  };

  const saveChanges = () => {
    // 변경사항 확인
    const hasChanges = data.some((row, rowIndex) => 
      row.some((cell: any, colIndex: number) => cell !== originalData[rowIndex][colIndex])
    );

    if (!hasChanges) {
      toast.info("변경사항이 없습니다.");
      setIsEditMode(false);
      return;
    }

    // 실제 저장 전 사용자에게 확인
    if (confirm("변경사항을 저장하시겠습니까?")) {
      toast.success("변경사항이 저장되었습니다.");
      setIsEditMode(false);
      setOriginalData([]);
    }
  };

  const afterChange = (changes: any, source: string) => {
    if (source === 'loadData') return;
    
    // 변경사항이 있을 때만 데이터 업데이트
    if (changes && changes.length > 0) {
      const newData = [...data];
      
      changes.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
        newData[row][prop] = newValue;
      });
      
      setData(newData);
    }
  };

  return (
    <div className="w-full animate-fadeIn">
      <div className="flex justify-between items-center mb-4 px-4">
        <h1 className="text-2xl font-bold text-gray-800">영업실적표</h1>
        <div className="space-x-2">
          {isEditMode ? (
            <>
              <Button 
                variant="outline" 
                onClick={toggleEditMode}
                className="border-gray-300 hover:bg-gray-100"
              >
                취소
              </Button>
              <Button 
                onClick={saveChanges}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                저장
              </Button>
            </>
          ) : (
            <Button 
              onClick={toggleEditMode}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              수정
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-auto">
        <div className="relative min-w-full overflow-auto">
          <HotTable
            ref={hotRef}
            data={data}
            licenseKey="non-commercial-and-evaluation"
            rowHeaders={true}
            colHeaders={true}
            width="100%"
            height="calc(100vh - 200px)"
            colWidths={45}
            fixedColumnsLeft={1}
            fixedRowsTop={0}
            manualColumnResize={true}
            contextMenu={isEditMode}
            copyPaste={isEditMode}
            afterChange={afterChange}
            nestedHeaders={generateComplexHeaders()}
            cells={getCellsSettings()}
            wordWrap={false}
            className="sales-performance-table"
            stretchH="all"
            rowHeights={28}
            outsideClickDeselects={false}
            autoWrapRow={true}
            autoWrapCol={true}
            selectionMode="range"
          />
        </div>
      </div>
    </div>
  );
};

export default SalesPerformanceTable;
