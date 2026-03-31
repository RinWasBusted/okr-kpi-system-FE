import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Tìm kiếm nhân viên...' }) => {
  return (
    <div className="relative flex-1 max-w-xs">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
        size={18}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text bg-background"
      />
    </div>
  );
};

export default SearchBar;
