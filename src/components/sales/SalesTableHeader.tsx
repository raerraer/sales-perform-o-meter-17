
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
  ArrowLeft,
  History,
} from "lucide-react";

interface SalesTableHeaderProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onSaveChanges: () => void;
  versions: string[];
  currentVersion: string;
  onVersionChange: (version: string) => void;
  onShowHistory: () => void;
  isLatestVersion: boolean;
}

const SalesTableHeader = ({
  isEditMode,
  onToggleEditMode,
  onSaveChanges,
  versions,
  currentVersion,
  onVersionChange,
  onShowHistory,
  isLatestVersion
}: SalesTableHeaderProps) => {
  // 현재 날짜 정보 설정 (2025년, 3월, W12)
  const [year, setYear] = useState<string>("2025");
  const [month, setMonth] = useState<string>("03");
  const [week, setWeek] = useState<string>("W12");

  // 연도 리스트 생성 (현재만 표시)
  const years = ["2025"];

  // 월 리스트 생성 (현재만 표시)
  const months = ["03"];

  // 주차 리스트 생성 (현재만 표시)
  const weeks = ["W12"];

  return (
    <div className="flex flex-wrap justify-between items-center mb-4 px-4 gap-2">
      <div className="flex flex-wrap gap-2 items-center z-50 relative">
        {/* 연도 선택 */}
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="연도" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
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
          <SelectContent className="z-[9999]">
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
          <SelectContent className="z-[9999]">
            {weeks.map((w) => (
              <SelectItem key={w} value={w}>
                {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 버전 선택 */}
        <Select value={currentVersion} onValueChange={onVersionChange}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="버전" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            {versions.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 변경 이력 버튼 */}
        <Button 
          variant="outline" 
          onClick={onShowHistory}
          className="flex gap-1 items-center"
        >
          <History className="h-4 w-4" />
          변경 이력
        </Button>
      </div>

      <div className="flex space-x-2 z-50 relative">
        {isEditMode ? (
          <div className="flex space-x-2">
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
          </div>
        ) : (
          <Button 
            onClick={onToggleEditMode} 
            disabled={!isLatestVersion}
            className={`${
              isLatestVersion 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-gray-400 cursor-not-allowed"
            } text-white flex gap-1 items-center`}
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
