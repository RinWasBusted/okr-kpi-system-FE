import { ChevronRight } from "lucide-react";

// Status badge for Key Result
const KRStatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "COMPLETED":
      case "On Track":
      case "on-track":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          label: "on-track",
        };
      case "WARNING":
      case "At Risk":
      case "at-risk":
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
          label: "at-risk",
        };
      case "DANGER":
      case "Not Started":
      case "not-started":
        return { bg: "bg-red-100", text: "text-red-700", label: "at-risk" };
      default:
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
          label: "at-risk",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

const KeyResultItem = ({ keyResult, index }) => {
  const progress = keyResult.progress_percentage;

  const getProgressColor = () => {
    if (progress >= 80) return "bg-emerald-500";
    if (progress >= 50) return "bg-cyan-500";
    return "bg-orange-400";
  };

  const getBorderColor = () => {
    if (progress < 50) return "border-orange-200";
    return "border-secondary/20";
  };

  const progressColor = getProgressColor();
  const borderColor = getBorderColor();

  // Format value with unit if available
  const formatValue = (value) => {
    if (keyResult.unit) {
      return `${value}${keyResult.unit}`;
    }
    return value;
  };

  return (
    <div className={`bg-background rounded-xl border ${borderColor} p-4`}>
      <div className="flex items-start gap-4">
        {/* Key Result Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-medium text-text">{keyResult.title}</h5>
            <KRStatusBadge status={keyResult.status || "At Risk"} />
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-primary">
              Weight: {(keyResult.weight || 33.33).toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-secondary mb-3">
            <span>Owner: {keyResult.owner?.full_name || "Product Team"}</span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full ${progressColor} rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Value Indicators */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-secondary">
              Bắt đầu:{" "}
              <span className="font-medium text-text">
                {formatValue(keyResult.start_value || 0)}
              </span>
            </span>
            <ChevronRight size={12} className="text-secondary" />
            <span className="text-secondary">
              Hiện tại:{" "}
              <span
                className={`font-medium ${progress >= 50 ? "text-cyan-600" : "text-orange-600"}`}
              >
                {formatValue(keyResult.current_value || 0)}
              </span>
            </span>
            <ChevronRight size={12} className="text-secondary" />
            <span className="text-secondary">
              Mục tiêu:{" "}
              <span className="font-medium text-emerald-600">
                {formatValue(keyResult.target_value || 100)}%
              </span>
            </span>
          </div>
        </div>

        {/* Progress Percentage */}
        <div className="text-right shrink-0">
          <span className="text-xl font-bold text-text">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default KeyResultItem;
