import { useMemo } from 'react';

/**
 * UnitTreeSelect Component
 * Dropdown select with hierarchical unit tree display
 *
 * @param {Object} props
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.units - Units tree data
 * @param {boolean} props.isLoading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.label - Label text
 */
const UnitTreeSelect = ({
  value,
  onChange,
  units = [],
  isLoading = false,
  disabled = false,
  placeholder = 'Tất cả đơn vị',
  label,
}) => {
  // Flatten units for dropdown with hierarchy indicators
  const unitOptions = useMemo(() => {
    const options = [];

    const traverse = (items, level = 0) => {
      items.forEach((item) => {
        options.push({
          id: item.id,
          name: item.name,
          level,
          prefix: level > 0 ? '\u3000'.repeat(level) + '\u2514 ' : '',
        });
        if (item.sub_units?.length) {
          traverse(item.sub_units, level + 1);
        }
      });
    };

    // Add "All units" option at top
    options.push({ id: '', name: placeholder, level: 0, prefix: '', isPlaceholder: true });

    traverse(units);
    return options;
  }, [units, placeholder]);

  // Get all unit IDs including children for filtering
  const getUnitAndDescendantIds = (unitId) => {
    if (!unitId) return [];

    const ids = [];
    const findUnit = (items, targetId) => {
      for (const item of items) {
        if (item.id === targetId) {
          return item;
        }
        if (item.sub_units?.length) {
          const found = findUnit(item.sub_units, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const collectIds = (unit) => {
      if (!unit) return;
      ids.push(unit.id);
      if (unit.sub_units?.length) {
        unit.sub_units.forEach(collectIds);
      }
    };

    const targetUnit = findUnit(units, parseInt(unitId));
    collectIds(targetUnit);

    return ids;
  };

  const handleChange = (e) => {
    const selectedId = e.target.value;
    const descendantIds = getUnitAndDescendantIds(selectedId);
    onChange?.({
      value: selectedId,
      unitId: selectedId ? parseInt(selectedId) : null,
      descendantIds,
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {label && <div className="h-4 w-20 bg-secondary/20 rounded mb-2" />}
        <div className="w-full h-10 bg-secondary/20 rounded-lg" />
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-text mb-2">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled || isLoading}
        className="w-full px-3 py-2 rounded-lg border border-secondary/20 bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer disabled:opacity-50"
      >
        {unitOptions.map((option) => (
          <option
            key={option.id}
            value={option.id}
            disabled={option.isPlaceholder}
            style={{ paddingLeft: `${option.level * 12}px` }}
          >
            {option.prefix + option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UnitTreeSelect;
