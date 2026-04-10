import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Target, Loader2 } from 'lucide-react';
import { getKeyResults } from '../../../../services/okr';

// Key Result Item - compact display
const CompactKeyResultItem = ({ kr }) => {
  const progress = kr.progress_percentage || 0;

  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-emerald-500';
    if (value >= 50) return 'bg-cyan-500';
    if (value >= 30) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="p-3 border-b border-secondary/10 last:border-b-0 hover:bg-secondary/5 transition-colors">
      <div className="flex items-start gap-2">
        <Target size={14} className="text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-text line-clamp-1" title={kr.title}>
            {kr.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(progress)} rounded-full`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-secondary">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Key Results Dropdown Component
const KeyResultsDropdown = ({ objectiveId, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [keyResults, setKeyResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Prefetch key results on hover
  const handleMouseEnter = useCallback(async () => {
    if (!hasFetched && !isLoading) {
      setIsLoading(true);
      try {
        const response = await getKeyResults(objectiveId, { per_page: 100 });
        setKeyResults(response.data || []);
        setHasFetched(true);
      } catch (error) {
        console.error('Failed to fetch key results:', error);
        setKeyResults([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [objectiveId, hasFetched, isLoading]);

  const toggleDropdown = async () => {
    if (!isOpen && !hasFetched) {
      setIsLoading(true);
      try {
        const response = await getKeyResults(objectiveId, { per_page: 100 });
        setKeyResults(response.data || []);
        setHasFetched(true);
      } catch (error) {
        console.error('Failed to fetch key results:', error);
        setKeyResults([]);
      } finally {
        setIsLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter}>
      <button
        onClick={toggleDropdown}
        className={`flex items-center justify-center gap-1 bg-cyan-50 text-cyan-700 text-sm font-medium rounded-lg hover:bg-cyan-100 transition-colors cursor-pointer ${
          compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 w-full'
        }`}
      >
        <Target size={compact ? 12 : 14} />
        <span className={compact ? 'hidden sm:inline' : ''}>Các key result</span>
        {isOpen ? <ChevronUp size={compact ? 12 : 14} /> : <ChevronDown size={compact ? 12 : 14} />}
      </button>

      {isOpen && (
        <div
          className={`bg-background rounded-lg border border-secondary/20 shadow-2xl max-h-64 overflow-y-auto ${
            compact
              ? 'fixed z-9999 left-auto top-auto mt-1 w-64'
              : 'absolute left-0 right-0 top-full mt-2'
          }`}
          style={{ minWidth: compact ? '16rem' : '100%' }}
        >
          {isLoading ? (
            // Loading state
            <div className="p-4 flex items-center justify-center gap-2 text-secondary">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs">Đang tải...</span>
            </div>
          ) : keyResults.length === 0 ? (
            // Empty state
            <div className="p-4 text-center text-secondary text-xs">
              Chưa có key result nào
            </div>
          ) : (
            // Key results list
            <div>
              {keyResults.map((kr) => (
                <CompactKeyResultItem key={kr.id} kr={kr} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KeyResultsDropdown;
