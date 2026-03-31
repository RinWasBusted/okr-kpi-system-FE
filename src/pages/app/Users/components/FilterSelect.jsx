import { ChevronDown } from 'lucide-react';

const FilterSelect = ({ value, onChange, options, placeholder }) => {
  return (
    <div className="relative min-w-[160px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-4 py-2 pr-10 border border-secondary/20 rounded-lg text-sm cursor-pointer text-text bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-background text-text">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
        size={16}
      />
    </div>
  );
};

export default FilterSelect;
