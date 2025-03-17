
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Save,
  RotateCcw,
  FilePlus,
  ArrowLeft,
} from "lucide-react";

interface SalesTableHeaderProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onSaveChanges: () => void;
}

const SalesTableHeader = ({
  isEditMode,
  onToggleEditMode,
  onSaveChanges
}: SalesTableHeaderProps) => {
  // 현재 날짜 정보 가져오기
  const [year, setYear] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [week, setWeek] = useState<string>("");
  const [version, setVersion] = useState<string>("rev1");

  // 연도 리스트 생성 (현재 연도부터 3년 전까지)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => (currentYear - i).toString());

  // 월 리스트 생성
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    return monthNum < 10 ? `0${monthNum}` : monthNum.toString();
  });

  // 주차 리스트 생성 (1~52주)
  const weeks = Array.from({ length: 52 }, (_, i) => `W${i + 1}`);

  // 버전 리스트 생성
  const versions = ["rev1", "rev2", "rev3", "rev4", "rev5"];

  // 현재 날짜 기준으로 연도, 월, 주차 설정
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    
    // 월 포맷팅 (01~12)
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0");
    
    // 현재 날짜의 주차 계산
    const oneJan = new Date(now.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    const currentWeek = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
    
    setYear(currentYear);
    setMonth(currentMonth);
    setWeek(`W${currentWeek}`);
  }, []);

  // 새 버전 저장 핸들러
  const handleNewVersionSave = () => {
    // 새 버전 저장 로직 구현
    alert("새 버전이 저장되었습니다.");
  };

  // 변경 이력 핸들러
  const handleChangeHistory = () => {
    // 변경 이력 보기 로직 구현
    alert("변경 이력을 확인합니다.");
  };

  return (
    <div className="flex flex-wrap justify-between items-center mb-4 px-4 gap-2">
      <div className="flex flex-wrap gap-2 items-center">
        {/* 연도 선택 */}
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="연도" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 월 선택 */}
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-20">
            <SelectValue placeholder="월" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {m}월
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 주차 선택 */}
        <Select value={week} onValueChange={setWeek}>
          <SelectTrigger className="w-20">
            <SelectValue placeholder="주차" />
          </SelectTrigger>
          <SelectContent>
            {weeks.map((w) => (
              <SelectItem key={w} value={w}>
                {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 버전 선택 */}
        <Select value={version} onValueChange={setVersion}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="버전" />
          </SelectTrigger>
          <SelectContent>
            {versions.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 새 버전 저장 버튼 */}
        <Button 
          variant="outline" 
          onClick={handleNewVersionSave}
          disabled={isEditMode}
          className="flex gap-1 items-center"
        >
          <FilePlus className="h-4 w-4" />
          새 버전 저장
        </Button>

        {/* 변경 이력 버튼 */}
        <Button 
          variant="outline" 
          onClick={handleChangeHistory}
          className="flex gap-1 items-center"
        >
          <RotateCcw className="h-4 w-4" />
          변경 이력
        </Button>
      </div>

      <div className="space-x-2">
        {isEditMode ? (
          <>
            <Button 
              variant="outline" 
              onClick={onToggleEditMode} 
              className="border-gray-300 hover:bg-gray-100 flex gap-1 items-center"
            >
              <ArrowLeft className="h-4 w-4" />
              취소
            </Button>
            <Button 
              onClick={onSaveChanges} 
              className="bg-blue-600 hover:bg-blue-700 text-white flex gap-1 items-center"
            >
              <Save className="h-4 w-4" />
              저장
            </Button>
          </>
        ) : (
          <Button 
            onClick={onToggleEditMode} 
            className="bg-blue-600 hover:bg-blue-700 text-white flex gap-1 items-center"
          >
            <Edit className="h-4 w-4" />
            수정 모드
          </Button>
        )}
      </div>
    </div>
  );
};

export default SalesTableHeader;
