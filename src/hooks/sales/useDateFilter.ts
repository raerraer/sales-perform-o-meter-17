
import { useState, useEffect } from 'react';

export interface UseDateFilterReturn {
  currentYear: string;
  setCurrentYear: React.Dispatch<React.SetStateAction<string>>;
  currentMonth: string;
  setCurrentMonth: React.Dispatch<React.SetStateAction<string>>;
  currentWeek: string;
  setCurrentWeek: React.Dispatch<React.SetStateAction<string>>;
}

export const useDateFilter = (): UseDateFilterReturn => {
  const [currentYear, setCurrentYear] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState<string>("");
  const [currentWeek, setCurrentWeek] = useState<string>("");

  // 초기화 시 현재 날짜 정보 설정
  useEffect(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear().toString());
    setCurrentMonth((now.getMonth() + 1).toString().padStart(2, '0'));
    
    // 현재 날짜의 주차 계산
    const oneJan = new Date(now.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    const currentWeek = `W${Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7)}`;
    setCurrentWeek(currentWeek);
  }, []);

  return {
    currentYear,
    setCurrentYear,
    currentMonth,
    setCurrentMonth,
    currentWeek,
    setCurrentWeek
  };
};
