import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  description?: string;
  trend?: string;
  bgColor?: string;
  iconColor?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  description,
  bgColor = 'bg-blue-50/80',
  iconColor = 'text-blue-600',
}: StatsCardProps) {
  return (
    <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow bg-white/90 rounded-2xl overflow-hidden">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>
          {description && <p className="text-xs text-slate-400 font-medium">{description}</p>}
        </div>
        <div className={`p-3.5 rounded-2xl ${bgColor} ${iconColor} flex items-center justify-center shadow-inner`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
