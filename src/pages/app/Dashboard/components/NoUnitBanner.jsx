import { AlertTriangle } from 'lucide-react';

const NoUnitBanner = ({ message }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/25">
    <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
      <AlertTriangle size={18} className="text-amber-500" />
    </div>
    <div>
      <p className="text-sm font-semibold text-text">Chưa được phân vào đơn vị</p>
      <p className="text-xs text-secondary mt-1 leading-relaxed">
        {message || 'Bạn chưa được phân công vào đơn vị nào. Vui lòng liên hệ quản trị viên để được xếp vào một đơn vị trước khi xem dữ liệu này.'}
      </p>
    </div>
  </div>
);

export default NoUnitBanner;
