import { useMemo } from 'react';
import Timeline from 'react-calendar-timeline';
import moment from 'moment';
import 'react-calendar-timeline/dist/style.css';

import { Calendar, Lock, Unlock } from 'lucide-react';

/**
 * Cycle Timeline Component
 * Displays company cycles on a horizontal timeline
 *
 * @param {Object} props
 * @param {Array} props.cycles - Array of cycle objects from API
 * @param {boolean} props.isLoading - Loading state
 */
const CycleTimeline = ({ cycles = [], isLoading }) => {

  // Transform cycles data for react-calendar-timeline
  const { groups, items, defaultTimeStart, defaultTimeEnd } = useMemo(() => {
    if (!cycles || cycles.length === 0) {
      // Return default empty state with current year range
      const now = moment();
      return {
        groups: [],
        items: [],
        defaultTimeStart: now.clone().startOf('year').toDate(),
        defaultTimeEnd: now.clone().endOf('year').toDate(),
      };
    }

    // Sort cycles by duration (longer cycles first) then by start date
    const sortedCycles = [...cycles].sort((a, b) => {
      const durationA = moment(a.end_date).diff(moment(a.start_date), 'days');
      const durationB = moment(b.end_date).diff(moment(b.start_date), 'days');

      // If durations are significantly different, longer cycle comes first
      if (Math.abs(durationA - durationB) > 30) {
        return durationB - durationA;
      }

      // Otherwise sort by start date
      return moment(a.start_date).diff(moment(b.start_date));
    });

    // Create groups (one per cycle, sorted by duration)
    const groupsData = sortedCycles.map((cycle, index) => ({
      id: cycle.id,
      title: cycle.name,
      height: 40,
      // Store additional data for rendering
      isLocked: cycle.is_locked,
      daysRemaining: cycle.days_remaining,
      stackOrder: index,
    }));

    // Create timeline items
    const itemsData = sortedCycles.map((cycle) => ({
      id: cycle.id,
      group: cycle.id,
      title: cycle.name,
      start_time: moment(cycle.start_date),
      end_time: moment(cycle.end_date),
      // Store cycle data directly on item object for use in renderer
      isLocked: cycle.is_locked,
      cycleName: cycle.name,
    }));

    // Calculate time range for initial view
    const allStartDates = cycles.map((c) => moment(c.start_date));
    const allEndDates = cycles.map((c) => moment(c.end_date));
    const minDate = moment.min(allStartDates).clone().subtract(1, 'month');
    const maxDate = moment.max(allEndDates).clone().add(1, 'month');

    return {
      groups: groupsData,
      items: itemsData,
      defaultTimeStart: minDate.toDate(),
      defaultTimeEnd: maxDate.toDate(),
    };
  }, [cycles]);

  // Custom item renderer
  const itemRenderer = ({ item, itemContext, getItemProps }) => {
    const { style, ...props } = getItemProps();
    const isLocked = item.isLocked;
    const cycleName = item.cycleName;

    // Define hardcoded colors
    const activeColor = '#2563eb'; // blue
    const activeColorLight = 'rgba(37, 99, 235, 0.8)';
    const lockedColor = '#9ca3af'; // gray
    const lockedColorLight = 'rgba(156, 163, 175, 0.4)';
    const textColorActive = '#ffffff';
    const textColorLocked = '#1f2937';
    const borderColorActive = '#2563eb';
    const borderColorLocked = '#9ca3af';

    // Determine colors based on state
    const bgColor = isLocked ? lockedColorLight : activeColorLight;
    const textColor = isLocked ? textColorLocked : textColorActive;
    const borderColor = isLocked ? borderColorLocked : borderColorActive;

    return (
      <div
        {...props}
        style={{
          ...style,
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '6px',
        }}
        className="h-full"
      >
        <div
          style={{
            backgroundColor: bgColor,
            borderColor: borderColor,
            color: textColor,
          }}
          className="h-full w-full border rounded-md px-2 py-1 flex items-center gap-1.5 overflow-hidden transition-opacity hover:opacity-90"
          title={`${cycleName} (${moment(item.start_time).format('DD/MM/YYYY')} - ${moment(item.end_time).format('DD/MM/YYYY')})`}
        >
          {isLocked ? (
            <Lock size={12} style={{ color: textColor }} className="shrink-0" />
          ) : (
            <Unlock size={12} style={{ color: textColor }} className="shrink-0" />
          )}
          <span className="text-xs font-medium truncate">
            {cycleName}
          </span>
        </div>
      </div>
    );
  };

  // Custom group renderer
  const groupRenderer = ({ group }) => {
    const secondaryColor = '#6b7280';
    const textColor = '#1f2937';

    return (
      <div className="flex items-center gap-2 px-2 h-full" style={{ color: textColor }}>
        <Calendar size={14} style={{ color: secondaryColor }} className="shrink-0" />
        <span className="text-sm truncate" title={group.title}>
          {group.title}
        </span>
        {group.isLocked && (
          <Lock size={12} style={{ color: secondaryColor }} className="shrink-0 ml-auto" />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-lg p-4 h-full" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
        <div className="h-5 rounded w-32 mb-4 animate-pulse" style={{ backgroundColor: '#e5e7eb' }}></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-10 rounded animate-pulse"
              style={{ backgroundColor: '#f3f4f6' }}
            ></div>
          ))}
        </div>
      </div>
    );
  }
  

  if (cycles.length === 0) {
    return (
      <div className="rounded-lg p-4 h-full flex flex-col" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={18} style={{ color: '#ea580c' }} />
          <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>Cycle Timeline</h3>
        </div>
        <div className="flex-1 flex items-center justify-center rounded-lg min-h-37.5" style={{ backgroundColor: '#f9fafb' }}>
          <p className="text-sm" style={{ color: '#6b7280' }}>No cycles available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-4 h-full flex flex-col" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={18} style={{ color: '#ea580c' }} />
        <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>Cycle Timeline</h3>
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(37, 99, 235, 0.8)' }}></div>
            <span className="text-xs" style={{ color: '#6b7280' }}>Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(156, 163, 175, 0.4)' }}></div>
            <span className="text-xs" style={{ color: '#6b7280' }}>Locked</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-50 overflow-hidden">
        <Timeline
          groups={groups}
          items={items}
          defaultTimeStart={defaultTimeStart}
          defaultTimeEnd={defaultTimeEnd}
          lineHeight={40}
          itemHeightRatio={0.75}
          stackItems
          canMove={false}
          canResize={false}
          canChangeGroup={false}
          itemRenderer={itemRenderer}
          groupRenderer={groupRenderer}
          showCursorLine
          traditionalZoom={false}
          sidebarWidth={0}
          sidebarContent={<div className="text-xs font-medium px-2 py-2" style={{ color: '#6b7280' }}>Cycles</div>}
        >
          {/* Custom timeline markers */}
          <TimelineMarkers>
            <TodayMarker />
          </TimelineMarkers>
        </Timeline>
      </div>
    </div>
  );
};

// Timeline Markers Component
const TimelineMarkers = ({ children }) => children;

// Today Marker Component
const TodayMarker = () => {
  const today = moment();
  return null; // react-calendar-timeline has built-in current time indicator
};

export default CycleTimeline;
