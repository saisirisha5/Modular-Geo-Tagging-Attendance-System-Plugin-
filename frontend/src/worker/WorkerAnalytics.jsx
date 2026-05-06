import { useEffect, useState } from "react";
import apiService from "../services/api";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell,
  BarChart, Bar, Legend, ResponsiveContainer
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./WorkerAnalytics.css";

const COLORS = ["#00C49F", "#FF8042", "#FFBB28"];

const WorkerAnalytics = ({ goBack }) => {

  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("day");

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const res = await apiService.getWorkerAnalytics(filter);
      setData(res);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) return <div className="worker-loading">Loading...</div>;

  const pieData = [
    { name: "Completed", value: data.summary.completed },
    { name: "In Progress", value: data.summary.inProgress },
    { name: "Rejected", value: data.summary.rejected }
  ];

  const trendData = data.trend.map(t => ({
    date: t._id,
    count: t.count
  }));

  const failureData = data.failures.map(f => ({
    type: f._id,
    count: f.count
  }));

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text("Worker Analytics Report", 14, 20);

    doc.text(`Total: ${data.summary.total}`, 14, 40);
    doc.text(`Completed: ${data.summary.completed}`, 14, 50);
    doc.text(`In Progress: ${data.summary.inProgress}`, 14, 60);
    doc.text(`Rejected: ${data.summary.rejected}`, 14, 70);

    const table = trendData.map(t => [t.date, t.count]);

    autoTable(doc, {
      startY: 90,
      head: [["Date", "Count"]],
      body: table
    });

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().slice(0,5).replace(":", "-");

    doc.save(`Analysis_Report_${date}_${time}.pdf`);
  };

  return (
    <div className="worker-container">

      <div className="worker-header">
        <div className="worker-header-content">
          <h1 className="worker-title">Work Analytics</h1>

          <div>
            <button className="worker-back-btn" onClick={goBack}>← Back</button>
            <button className="download-btn" onClick={downloadPDF}>⬇ Download</button>
          </div>
        </div>
      </div>

      <div className="worker-main">

        <div className="worker-dashboard-grid">
          <div className="card"><h3>Total</h3><p>{data.summary.total}</p></div>
          <div className="card"><h3>Completed</h3><p>{data.summary.completed}</p></div>
          <div className="card"><h3>In Progress</h3><p>{data.summary.inProgress}</p></div>
          <div className="card"><h3>Rejected</h3><p>{data.summary.rejected}</p></div>
        </div>

        <div className="filter-box">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="day">Day Wise</option>
            <option value="month">Month Wise</option>
            <option value="year">Year Wise</option>
          </select>
        </div>

        <div className="chart-box">
          <h3>Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="count" stroke="#667eea" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-grid">

          <div className="chart-box">
            <h3>Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={100}>
                  {pieData.map((e, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h3>Failures</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={failureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#ff6b6b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>
    </div>
  );
};

export default WorkerAnalytics;