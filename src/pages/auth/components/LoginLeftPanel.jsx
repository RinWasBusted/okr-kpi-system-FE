import { Target } from 'lucide-react';

const features = [
  'Set and track strategic objectives',
  'Monitor KPIs in real-time',
  'Align teams across the organization',
];

export default function LoginLeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] bg-primary/5 flex-col justify-center px-12 xl:px-20">
      <div className="max-w-md">
        {/* Logo */}
        <div className="w-16 h-16 mb-8">
          <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-primary flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-primary"></div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl xl:text-4xl font-bold text-text mb-4 leading-tight">
          Align Your Goals,
          <br />
          Drive Your Success
        </h1>

        {/* Subtitle */}
        <p className="text-secondary text-base mb-8 leading-relaxed">
          Enterprise OKR & KPI Management Platform for high-performing teams.
        </p>

        {/* Features */}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-secondary text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
