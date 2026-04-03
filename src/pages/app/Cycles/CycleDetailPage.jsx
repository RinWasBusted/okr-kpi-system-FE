import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';

const CycleDetailPage = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Custom styles for DatePicker to match existing design
  const datePickerClassName = "w-full px-4 py-2 rounded-lg border border-secondary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer";

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-text">Chi tiết chu kỳ</h1>

      {/* Example date pickers with dd/MM/yyyy format */}
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Ngày bắt đầu
          </label>
          <div className="relative">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn ngày"
              className={datePickerClassName}
              calendarClassName="bg-background border border-secondary/20 rounded-lg shadow-lg"
            />
            <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Ngày kết thúc
          </label>
          <div className="relative">
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn ngày"
              className={datePickerClassName}
              calendarClassName="bg-background border border-secondary/20 rounded-lg shadow-lg"
            />
            <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleDetailPage;
