"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import type { SalesGroup } from "@/lib/admin/sales";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);
const palette = [
  "#8981dc",
  "#80c99e",
  "#ffc653",
  "#ff7f3f",
  "#88d0df",
  "#a3dd6b",
  "#b4a4e6",
  "#a9d8bf",
  "#ffd995",
  "#b4dfe8",
];
const semanticColors: Record<string, string> = {
  의류: "#80c99e",
  홈: "#8981dc",
  뷰티: "#ffc653",
  "결제 완료": "#80c99e",
  취소: "#ff7f3f",
  환불: "#8981dc",
  "결제 대기": "#ffc653",
};
const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;
const count = (value: number) => `${value.toLocaleString("ko-KR")}건`;
const base = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : 500,
    easing: "easeOutQuart" as const,
  },
  locale: "ko-KR",
  color: "#52525b",
  font: { family: "Arial, sans-serif", size: 11 },
};
export type DailyChartRow = {
  day: string;
  revenue: number;
  orders?: number;
  href?: string;
};
export function DailySalesChart({
  rows,
  valueLabel = "순매출",
}: {
  rows: DailyChartRow[];
  valueLabel?: string;
}) {
  const router = useRouter();
  const options: ChartOptions<"line"> = {
    ...base,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => rows[items[0]?.dataIndex]?.day ?? "",
          label: (item) => `${valueLabel} ${won(item.parsed.y ?? 0)}`,
          afterLabel: (item) =>
            rows[item.dataIndex]?.orders === undefined
              ? ""
              : `주문 ${count(rows[item.dataIndex].orders!)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 8, maxRotation: 0 },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: "#f0f0ed" },
        ticks: {
          maxTicksLimit: 5,
          precision: 0,
          callback: (value) =>
            `${new Intl.NumberFormat("ko-KR", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value))}원`,
        },
      },
    },
    onClick: (_event, elements) => {
      const href = rows[elements[0]?.index]?.href;
      if (href) router.push(href);
    },
    onHover: (_event, elements, chart) => {
      chart.canvas.style.cursor =
        elements.length && rows[elements[0].index]?.href
          ? "pointer"
          : "default";
    },
  };
  return (
    <>
      <div className="relative mt-5 h-64 min-w-0 sm:h-72">
        <Line
          role="img"
          aria-label="일별 매출 추이. 정확한 금액과 판매 내역 링크는 아래 날짜별 데이터에서 확인하세요."
          options={options}
          data={{
            labels: rows.map((r) =>
              r.day.length === 10 ? r.day.slice(5) : r.day,
            ),
            datasets: [
              {
                label: valueLabel,
                data: rows.map((r) => r.revenue),
                borderColor: palette[0],
                backgroundColor: palette[0],
                borderWidth: 2,
                pointRadius: rows.length > 30 ? 1 : 3,
                pointHoverRadius: 5,
                tension: 0.2,
              },
            ],
          }}
        />
      </div>
      <details className="mt-4 text-xs">
        <summary className="cursor-pointer text-gray-600">
          날짜별 데이터 · 판매 내역 보기
        </summary>
        <div className="mt-3 max-h-64 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">날짜</th>
                <th>{valueLabel}</th>
                {rows.some((r) => r.orders !== undefined) && <th>주문 수</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.day} className="border-b">
                  <td className="py-2">
                    {r.href ? (
                      <Link
                        href={r.href}
                        className="underline underline-offset-2"
                      >
                        {r.day}
                      </Link>
                    ) : (
                      r.day
                    )}
                  </td>
                  <td>{won(r.revenue)}</td>
                  {r.orders !== undefined && <td>{count(r.orders)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
export function SalesBreakdownChart({
  title,
  rows,
  kind = "bar",
}: {
  title: string;
  rows: SalesGroup[];
  kind?: "bar" | "doughnut" | "hours";
}) {
  const labels = rows.map((r) => (kind === "hours" ? `${r.label}시` : r.label));
  const total = rows.reduce((sum, r) => sum + r.orders, 0);
  if (!total)
    return (
      <p className="mt-5 py-6 text-sm text-gray-500">
        해당 기간 데이터가 없습니다.
      </p>
    );
  const colors = rows.map((r, i) =>
    kind === "hours"
      ? palette[0]
      : (semanticColors[r.label] ?? palette[i % palette.length]),
  );
  const data = {
    labels,
    datasets: [
      {
        label: "주문 수",
        data: rows.map((r) => r.orders),
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: kind === "doughnut" ? 2 : 0,
        hoverOffset: kind === "doughnut" ? 5 : 0,
        borderRadius: kind === "doughnut" ? 0 : 2,
      },
    ],
  };
  const tooltip = {
    callbacks: {
      label: (item: { dataIndex: number }) => {
        const row = rows[item.dataIndex];
        return [
          `주문 ${count(row.orders)} (${((row.orders / total) * 100).toFixed(1)}%)`,
          `순매출 ${won(row.revenue)}`,
        ];
      },
    },
  };
  const barOptions: ChartOptions<"bar"> = {
    ...base,
    indexAxis: kind === "hours" ? "x" : "y",
    plugins: { legend: { display: false }, tooltip },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "#f0f0ed" },
        border: { display: false },
        ticks:
          kind === "hours"
            ? { maxTicksLimit: 8, maxRotation: 0 }
            : { precision: 0, maxTicksLimit: 5 },
      },
      y: {
        beginAtZero: true,
        grid: { display: false },
        border: { display: false },
        ticks: { precision: 0 },
      },
    },
  };
  const doughnutOptions: ChartOptions<"doughnut"> = {
    ...base,
    cutout: "68%",
    animation: { ...base.animation, animateRotate: true, animateScale: true },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 18,
          boxWidth: 8,
          font: { size: 11 },
        },
      },
      tooltip,
    },
  };
  return (
    <>
      <div
        className="relative mt-5 min-w-0"
        style={{
          height: kind === "bar" ? Math.max(220, rows.length * 34) : 280,
        }}
      >
        {kind === "doughnut" ? (
          <Doughnut
            role="img"
            aria-label={`${title}, 주문 수 비중. 아래 상세 데이터에서 정확한 값을 확인하세요.`}
            data={data}
            options={doughnutOptions}
          />
        ) : (
          <Bar
            role="img"
            aria-label={`${title}, 주문 수 비교. 아래 상세 데이터에서 정확한 값을 확인하세요.`}
            data={data}
            options={barOptions}
          />
        )}
      </div>
      <details className="mt-4 text-xs">
        <summary className="cursor-pointer text-gray-600">
          상세 데이터 보기 · 총 {count(total)}
        </summary>
        <div className="mt-3 max-h-64 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">항목</th>
                <th>주문 수</th>
                <th>순매출</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.label} className="border-b">
                  <td className="py-2">
                    <span
                      aria-hidden="true"
                      className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: colors[i] }}
                    />
                    {labels[i]}
                  </td>
                  <td>{count(r.orders)}</td>
                  <td>{won(r.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
