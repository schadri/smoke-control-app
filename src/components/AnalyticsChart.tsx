import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';

interface Log {
  id: string;
  created_at: string;
  es_emergencia: boolean;
}

interface Props {
  logs: Log[];
}

export function AnalyticsChart({ logs }: Props) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Aggregate emergencies by hour (0-23)
  const emergenciesByHour = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: 0,
    label: `${i.toString().padStart(2, '0')}:00`
  }));

  logs.forEach(log => {
    if (log.es_emergencia) {
      const hour = new Date(log.created_at).getHours();
      emergenciesByHour[hour].count += 1;
    }
  });

  return (
    <div className="w-full min-h-[300px] bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="text-slate-700 dark:text-slate-200 font-semibold mb-6 flex justify-between items-center">
        <span>Patrón de Ansiedad (Emergencias)</span>
        <span className="text-xs font-normal bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-md">Últimos 7 días</span>
      </h3>
      
      <div className="w-full aspect-[4/3] min-h-[200px] max-h-[250px] min-w-0 overflow-hidden relative">
        {hasMounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={emergenciesByHour}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(226, 232, 240, 0.1)' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any) => [`${value} urgencias`, '']}
                labelFormatter={(label) => `Hora: ${label}`}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {emergenciesByHour.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.count > 2 ? '#ef4444' : entry.count > 0 ? '#fb923c' : '#e2e8f0'} 
                    className="transition-all duration-300 dark:opacity-80 hover:opacity-100"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
