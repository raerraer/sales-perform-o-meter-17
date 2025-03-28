
import { useHandleDataChanges } from './useHandleDataChanges';
import { useToggleEditMode } from './useToggleEditMode';
import { UseEditModeReturn } from './useEditMode';
import { CellChange, VersionHistory } from './useSalesHistory';

export interface UseChangeManagerReturn {
  handleSaveChanges: () => void;
  handleToggleEditMode: () => void;
}

/**
 * 데이터 변경 처리 관련 기능을 모두 관리하는 메인 커스텀 훅
 */
export const useChangeManager = (
  data: any[][],
  originalData: any[][],
  isLatestVersion: boolean,
  currentVersion: string,
  currentYear: string,
  currentMonth: string,
  currentWeek: string,
  editMode: UseEditModeReturn,
  clearHighlighting: () => void,
  setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
  setData: React.Dispatch<React.SetStateAction<any[][]>>,
  updateVersionData: (version: string, data: any[]) => void,
  addVersionHistory: (historyEntry: VersionHistory) => void,
  saveNewVersionWithData: (data: any[][]) => string | null
): UseChangeManagerReturn => {
  const { 
    isEditMode, 
    setIsEditMode, 
    toggleEditMode, 
    saveChanges,
    getChangesFromData 
  } = editMode;

  // 데이터 저장 관련 훅
  const { handleSaveChanges: baseHandleSaveChanges } = useHandleDataChanges();
  
  // 편집 모드 관련 훅
  const { handleToggleEditMode: baseHandleToggleEditMode } = useToggleEditMode();

  // 편집 모드 전환 래퍼 함수
  const handleToggleEditMode = () => {
    console.log('편집 모드 전환 시작');
    baseHandleToggleEditMode(
      isLatestVersion,
      isEditMode,
      toggleEditMode,
      data,
      originalData,
      setOriginalData,
      setData,
      clearHighlighting
    );
    console.log('편집 모드 전환 완료, 현재 모드:', !isEditMode);
  };

  // 변경 사항 저장 래퍼 함수
  const handleSaveChanges = () => {
    console.log('변경 사항 저장 시작');
    
    // 변경 사항 감지 (국가별 변경 로깅)
    const allChanges = getChangesFromData(data, originalData);
    
    // 수정 전/후 변경된 데이터 로깅 (디버깅용)
    console.log('---- 원본 데이터 주요 국가 값 ----');
    for (let row = 0; row < originalData.length; row++) {
      if (originalData[row] && originalData[row][0] === '영국') {
        console.log(`영국 행: ${row}`);
        for (let i = 0; i < 5; i++) {
          const modelRow = row + 1 + i;
          if (originalData[modelRow] && (originalData[modelRow][0] === '모델1' || originalData[modelRow][0] === '모델2')) {
            console.log(`영국 ${originalData[modelRow][0]} 1월 원본: ${originalData[modelRow][10]}`);
          }
        }
      }
      else if (originalData[row] && originalData[row][0] === '캐나다') {
        console.log(`캐나다 행: ${row}`);
        for (let i = 0; i < 5; i++) {
          const modelRow = row + 1 + i;
          if (originalData[modelRow] && (originalData[modelRow][0] === '모델1' || originalData[modelRow][0] === '모델2')) {
            console.log(`캐나다 ${originalData[modelRow][0]} 1월 원본: ${originalData[modelRow][10]}`);
          }
        }
      }
    }
    
    console.log('---- 변경된 데이터 주요 국가 값 ----');
    for (let row = 0; row < data.length; row++) {
      if (data[row] && data[row][0] === '영국') {
        console.log(`영국 행: ${row}`);
        for (let i = 0; i < 5; i++) {
          const modelRow = row + 1 + i;
          if (data[modelRow] && (data[modelRow][0] === '모델1' || data[modelRow][0] === '모델2')) {
            console.log(`영국 ${data[modelRow][0]} 1월 변경: ${data[modelRow][10]}`);
          }
        }
      }
      else if (data[row] && data[row][0] === '캐나다') {
        console.log(`캐나다 행: ${row}`);
        for (let i = 0; i < 5; i++) {
          const modelRow = row + 1 + i;
          if (data[modelRow] && (data[modelRow][0] === '모델1' || data[modelRow][0] === '모델2')) {
            console.log(`캐나다 ${data[modelRow][0]} 1월 변경: ${data[modelRow][10]}`);
          }
        }
      }
    }
    
    // 국가별 변경 분석 - 디버깅용
    const countryChanges = new Map<string, CellChange[]>();
    
    allChanges.forEach(change => {
      const country = change.country || '미지정';
      if (!countryChanges.has(country)) {
        countryChanges.set(country, []);
      }
      countryChanges.get(country)?.push(change);
    });
    
    // 국가별 변경 요약 로그
    console.log('국가별 변경사항 요약:');
    countryChanges.forEach((changes, country) => {
      console.log(`${country}: ${changes.length}개 변경`);
      
      // 첫 3개 변경사항 상세 로그 (너무 많은 로그 방지)
      changes.slice(0, 3).forEach((change, idx) => {
        console.log(`  ${idx+1}. ${change.model} ${change.month} ${change.col % 2 === 0 ? 'AMT' : 'QTY'}: ${change.oldValue} => ${change.newValue}`);
      });
      
      if (changes.length > 3) {
        console.log(`  ... 외 ${changes.length - 3}개`);
      }
    });
    
    // 변경사항 저장 처리
    baseHandleSaveChanges(
      data,
      originalData,
      isLatestVersion,
      currentVersion,
      currentYear,
      currentMonth,
      currentWeek,
      isEditMode,
      getChangesFromData,
      saveChanges,
      setOriginalData,
      updateVersionData,
      addVersionHistory,
      saveNewVersionWithData,
      clearHighlighting,
      setIsEditMode
    );
    console.log('변경 사항 저장 완료');
  };

  return {
    handleSaveChanges,
    handleToggleEditMode
  };
};
