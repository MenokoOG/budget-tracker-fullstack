import { useMemo } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { Transaction, Category } from "../App";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
}

export function Dashboard({ transactions, categories }: DashboardProps) {
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  // Metrics
  const totalSpent = useMemo(
    () => transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalIncome = useMemo(
    () => transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const thisMonthSpent = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          tDate.getMonth() === now.getMonth() &&
          tDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const thisMonthIncome = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          t.type === 'income' &&
          tDate.getMonth() === now.getMonth() &&
          tDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const lastMonthSpent = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    return transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          tDate.getMonth() === lastMonth.getMonth() &&
          tDate.getFullYear() === lastMonth.getFullYear()
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const momChange = useMemo(() => {
    if (lastMonthSpent === 0) return 0;
    return ((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100;
  }, [thisMonthSpent, lastMonthSpent]);

  const balance = useMemo(() => {
    return totalIncome - totalSpent;
  }, [totalIncome, totalSpent]);

  // Monthly Trend (last 6 months)
  const monthlyData = useMemo(() => {
    const months: { [key: string]: number } = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      months[key] = 0;
    }

    transactions.forEach((t) => {
      const tDate = new Date(t.date);
      const key = tDate.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      if (key in months) months[key] += t.amount;
    });

    return {
      labels: Object.keys(months),
      datasets: [
        {
          label: "Spending",
          data: Object.values(months),
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [transactions]);

  // Weekly Breakdown (this month)
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weeks: { [key: string]: number } = {};

    for (let i = 0; i < 5; i++) {
      weeks[`Week ${i + 1}`] = 0;
    }

    transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getMonth() === now.getMonth() &&
          tDate.getFullYear() === now.getFullYear()
        );
      })
      .forEach((t) => {
        const tDate = new Date(t.date);
        const week = Math.ceil(tDate.getDate() / 7);
        const key = `Week ${week}`;
        if (key in weeks) weeks[key] += t.amount;
      });

    return {
      labels: Object.keys(weeks),
      datasets: [
        {
          label: "Weekly Spend",
          data: Object.values(weeks),
          backgroundColor: [
            "#4f46e5",
            "#7c3aed",
            "#db2777",
            "#ea580c",
            "#f59e0b",
          ],
        },
      ],
    };
  }, [transactions]);

  // Top Categories
  const topCategoriesData = useMemo(() => {
    const catTotals: { [key: string]: number } = {};

    transactions.forEach((t) => {
      const cat = categoryMap.get(t.categoryId);
      if (cat) {
        catTotals[cat.name] = (catTotals[cat.name] || 0) + t.amount;
      }
    });

    const sorted = Object.entries(catTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const colors = [
      "#4f46e5",
      "#7c3aed",
      "#db2777",
      "#ea580c",
      "#f59e0b",
    ];

    return {
      labels: sorted.map(([name]) => name),
      datasets: [
        {
          label: "Amount Spent",
          data: sorted.map(([, amount]) => amount),
          backgroundColor: colors.slice(0, sorted.length),
        },
      ],
    };
  }, [transactions, categoryMap]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: "#e2e8f0",
        },
      },
    },
    scales: {
      y: {
        ticks: { color: "#e2e8f0" },
        grid: { color: "rgba(226, 232, 240, 0.1)" },
      },
      x: {
        ticks: { color: "#e2e8f0" },
        grid: { color: "rgba(226, 232, 240, 0.1)" },
      },
    },
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Summary Cards - Reorganized by importance */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Primary Card: Balance — full row on mobile so it reads first */}
        <div className={`col-span-2 sm:col-span-3 lg:col-span-1 relative rounded-xl overflow-hidden shadow-2xl ${
          balance >= 0
            ? 'bg-gradient-to-br from-emerald-600/40 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-red-600/40 via-slate-800 to-slate-900'
        } border border-slate-700/60`}>
          <div className="relative z-10 p-4 sm:p-6">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Balance</p>
            <p
              className={`text-3xl font-bold ${
                balance >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              ${balance.toFixed(2)}
            </p>
            <p className={`text-xs mt-2 font-semibold ${
              balance >= 0 ? "text-emerald-300" : "text-red-300"
            }`}>
              {balance >= 0 ? "✓ Positive" : "⚠ Deficit"}
            </p>
          </div>
        </div>

        {/* Secondary Cards */}
        <div className="relative rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-emerald-600/30 via-slate-800 to-slate-900 border border-emerald-600/40">
          <div className="relative z-10 p-4 sm:p-6">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Income</p>
            <p className="text-2xl font-bold text-emerald-400">
              ${totalIncome.toFixed(2)}
            </p>
            <p className="text-slate-500 text-xs mt-1">All time</p>
          </div>
        </div>
        <div className="relative rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-orange-600/30 via-slate-800 to-slate-900 border border-orange-600/40">
          <div className="relative z-10 p-4 sm:p-6">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Expenses</p>
            <p className="text-2xl font-bold text-orange-400">
              ${totalSpent.toFixed(2)}
            </p>
            <p className="text-slate-500 text-xs mt-1">All time</p>
          </div>
        </div>
        <div className="relative rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-indigo-600/30 via-slate-800 to-slate-900 border border-indigo-600/40">
          <div className="relative z-10 p-4 sm:p-6">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">This Month</p>
            <p className="text-2xl font-bold text-indigo-400">
              ${thisMonthSpent.toFixed(2)}
            </p>
            <p className="text-slate-500 text-xs mt-1">Expenses</p>
          </div>
        </div>
        <div className={`relative rounded-xl overflow-hidden shadow-xl border ${
          momChange >= 0
            ? 'bg-gradient-to-br from-red-600/30 via-slate-800 to-slate-900 border-red-600/40'
            : 'bg-gradient-to-br from-emerald-600/30 via-slate-800 to-slate-900 border-emerald-600/40'
        }`}>
          <div className="relative z-10 p-4 sm:p-6">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">MoM Change</p>
            <p
              className={`text-2xl font-bold ${
                momChange >= 0 ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {momChange >= 0 ? "↑" : "↓"} {Math.abs(momChange).toFixed(1)}%
            </p>
            <p className="text-slate-500 text-xs mt-1">vs last month</p>
          </div>
        </div>
      </div>

      {/* Charts Grid - stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Trend */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-700/60 via-slate-800 to-slate-900 border border-slate-700/60">
          <div className="relative z-10 p-4 sm:p-6">
            <h3 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">
              6-Month Trend
            </h3>
            <Line data={monthlyData} options={chartOptions} height={60} />
          </div>
        </div>

        {/* Weekly Breakdown */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-700/60 via-slate-800 to-slate-900 border border-slate-700/60">
          <div className="relative z-10 p-4 sm:p-6">
            <h3 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">
              Weekly Breakdown
            </h3>
            <Bar
              data={weeklyData}
              options={{
                ...chartOptions,
                indexAxis: "x" as const,
              }}
              height={60}
            />
          </div>
        </div>

        {/* Top Categories */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-700/60 via-slate-800 to-slate-900 border border-slate-700/60 col-span-2">
          <div className="relative z-10 p-4 sm:p-6">
            <h3 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">
              Top 5 Categories
            </h3>
            <Bar
              data={topCategoriesData}
              options={{
                ...chartOptions,
                indexAxis: "y" as const,
              }}
              height={60}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
