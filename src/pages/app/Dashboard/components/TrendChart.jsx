import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const COLORS = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
];

/**
 * Custom tooltip for multi-line chart.
 * Shows name, progress %, and period for each visible line.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-secondary/20 rounded-lg shadow-xl p-3 max-w-xs">
      <p className="text-xs font-semibold text-text mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-text truncate flex-1" title={entry.name}>
              {entry.name}
            </span>
            <span className="text-xs font-semibold text-text shrink-0">
              {Math.round(entry.value * 100) / 100}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Multi-line TrendChart — each series is a separate line with its own color.
 *
 * @param {Object} props
 * @param {Array} props.data - Array of { period, [seriesKey1]: value, [seriesKey2]: value, ... }
 * @param {string} props.xKey - Key for x-axis values (e.g. 'period')
 * @param {string[]} props.series - Array of series keys to plot
 * @param {string[]} props.seriesLabels - Human-readable labels for each series
 * @param {boolean} [props.isLoading] - Show skeleton loader
 * @param {string} [props.emptyMessage] - Message when no data
 * @param {number} [props.height] - Chart height (default: 320)
 * @param {string} [props.title] - Title above the chart
 */
const TrendChart = ({
  data = [],
  xKey = 'period',
  series = [],
  seriesLabels = [],
  isLoading = false,
  emptyMessage = 'Chưa có dữ liệu',
  height = 320,
  title,
}) => {
  if (isLoading) {
    return (
      <div
        className="bg-background border border-secondary/20 rounded-xl p-5"
        style={{ height: height + 60 }}
      >
        {title && (
          <div className="h-5 bg-secondary/20 rounded w-40 mb-4 animate-pulse" />
        )}
        <div
          className="bg-secondary/10 rounded-lg animate-pulse"
          style={{ height }}
        />
      </div>
    );
  }

  if (!data || data.length === 0 || series.length === 0) {
    return (
      <div
        className="bg-background border border-secondary/20 rounded-xl p-5 flex flex-col"
        style={{ height: height + 60 }}
      >
        {title && (
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-primary" />
            <h4 className="text-sm font-semibold text-text">{title}</h4>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-secondary">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border border-secondary/20 rounded-xl p-5">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-primary" />
          <h4 className="text-sm font-semibold text-text">{title}</h4>
          <span className="ml-auto text-xs text-secondary">{series.length} items</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-secondary)" opacity={0.15} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 10, fill: 'var(--color-secondary)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--color-secondary)' }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            formatter={(value) => {
              // Truncate long names in legend
              return value.length > 30 ? value.slice(0, 28) + '…' : value;
            }}
          />
          {series.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={seriesLabels[i] || key}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3, fill: COLORS[i % COLORS.length] }}
              activeDot={{ r: 5, strokeWidth: 2 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
