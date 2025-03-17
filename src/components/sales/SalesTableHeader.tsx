import { Button } from "@/components/ui/button";
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
  return <div className="flex justify-between items-center mb-4 px-4">
      <h1 className="text-2xl font-bold text-gray-800">
    </h1>
      <div className="space-x-2">
        {isEditMode ? <>
            <Button variant="outline" onClick={onToggleEditMode} className="border-gray-300 hover:bg-gray-100">
              취소
            </Button>
            <Button onClick={onSaveChanges} className="bg-blue-600 hover:bg-blue-700 text-white">
              저장
            </Button>
          </> : <Button onClick={onToggleEditMode} className="bg-blue-600 hover:bg-blue-700 text-white">
            수정
          </Button>}
      </div>
    </div>;
};
export default SalesTableHeader;