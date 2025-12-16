import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useGetMessagesPerDayQuery } from '../redux/chatAnalyticsSlice';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const COLORS = ['#0d6efd', '#198754', '#0dcaf0', '#ffc107', '#dc3545', '#6f42c1', '#20c997'];

const MessagesPerDayChart = () => {
  const { data, isLoading, error } = useGetMessagesPerDayQuery();

  if (isLoading) return <div className="card my-4"><div className="card-body text-center">Loading messages per day...</div></div>;
  if (error) return <div className="card my-4"><div className="card-body text-danger text-center">Error loading data.</div></div>;
  if (!data) return null;

  const labels = data.map(item => item.date);
  const values = data.map(item => item.count);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Messages',
        data: values,
        backgroundColor: COLORS[0],
        borderRadius: 6,
        maxBarThickness: 24,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: COLORS[2],
        titleColor: '#212529',
        bodyColor: '#212529',
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6c757d', font: { weight: 'bold' } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f8f9fa' },
        ticks: { color: '#6c757d', font: { weight: 'bold' } },
      },
    },
  };

  return (
    <div className="card my-4 shadow-sm border-info">
      <div className="card-body">
        <h5 className="card-title mb-3 text-info fw-bold">Messages Per Day (Last 30 Days)</h5>
        <Bar data={chartData} options={options} height={80} />
      </div>
    </div>
  );
};

export default MessagesPerDayChart; 