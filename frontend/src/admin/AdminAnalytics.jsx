import { useEffect, useState } from "react";
import apiService from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AdminAnalytics.css";

const COLORS = ["#00C49F", "#FF8042", "#FFBB28", "#FF4D4F"];

const AdminAnalytics = ({ goBack }) => {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("today");
  const [visibleCount, setVisibleCount] = useState(5);

    useEffect(() => {

      const fetchAnalytics = async () => {
        try {
          const res = await apiService.getAdminAnalytics(filter);
          setData(res);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchAnalytics();
    }, [filter]);

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (!data) return <div className="loading">Failed to load analytics</div>;


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
  try {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Admin Analytics Report", 14, 20);

    doc.setFontSize(12);

    doc.text(`Total Assignments: ${data.summary?.totalAssignments || 0}`, 14, 40);
    doc.text(`Completed: ${data.summary?.completed || 0}`, 14, 50);
    doc.text(`In Progress: ${data.summary?.inProgress || 0}`, 14, 60);
    doc.text(`Rejected: ${data.summary?.rejected || 0}`, 14, 70);


    let tableData = [];
    if (data.trend && data.trend.length > 0) {
      tableData = data.trend.map(item => [
        item._id,
        item.count
      ]);
    } 
    else if (data.dailyAttendance) {
      tableData = Object.entries(data.dailyAttendance).map(
        ([date, count]) => [date, count]
      );
    }

    if (tableData.length > 0) {
      autoTable(doc, {
        startY: 90,
        head: [["Date", "Attendance Count"]],
        body: tableData
      });
    }

   const now = new Date();

const date = now.toISOString().split("T")[0];

const time = now.toLocaleTimeString("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true
}).replace(/:/g, "-"); 

const fileName = `Analysis_Report_${date}_${time}.pdf`;

doc.save(fileName);

  } catch (err) {
    console.error("PDF ERROR:", err);
    alert("Failed to generate report");
  }
};
  return (
    <div className="admin-container">

      <div className="admin-header">
        <div className="header-content">
          <h1 className="admin-title">📊 Admin Analytics</h1>
          <div className="user-info">
            <button className="back-btn" onClick={goBack}>
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="admin-main">

        <div className="analytics-cards">
          <div className="card">
            <h3>Total Assignments</h3>
            <p>{data.summary.totalAssignments}</p>
          </div>

          <div className="card">
            <h3>Completed</h3>
            <p>{data.summary.completed}</p>
          </div>

          <div className="card">
            <h3>In Progress</h3>
            <p>{data.summary.inProgress}</p>
          </div>

          <div className="card">
            <h3>Rejected</h3>
            <p>{data.summary.rejected}</p>
          </div>
        </div>

        <div className="download-wrapper">
          <button className="download-btn" onClick={downloadPDF}>
            ⬇ Download Report
          </button>
        </div>

        <div className="filter-wrapper">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="analytics-filter"
          >
            <option value="today">Today</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <div className="chart-box">
          <h3>📈 Daily Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#667eea" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-grid">
          <div className="chart-box">
            <h3>📊 Attendance Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={100} label>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h3>🚨 Failure Reasons</h3>
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

          <div className="verification-section">
            <h2>📸 Attendance Verification</h2>
            <div className="verification-grid">
              {data.recentAttendancePhotos
                .slice(0, visibleCount)
                .map((item) => (
                  <div className="verification-card" key={item._id}>
                    <div className="verification-top">
                      <div>
                        <h3>{item.worker?.name}</h3>
                        <p>{item.assignment?.title}</p>
                        <small>{item.assignment?.date}</small>
                      </div>
                      <div className={`verification-status ${item.status}`}>
                        {item.status === "completed" && "✅ Attendance Marked"}
                        {item.status === "checked-in" && "🟠 In Progress"}
                        {item.status === "rejected" && "❌ Invalid"}
                      </div>
                    </div>

                    <div className="photo-row">
                      <div className="photo-box">
                        <p>Check-In</p>
                        {item.checkInPhoto ? (
                          <img src={item.checkInPhoto} alt="checkin" />
                        ) : (
                          <div className="photo-placeholder">No Photo</div>
                        )}
                      </div>

                      <div className="photo-box">
                        <p>Check-Out</p>
                        {item.checkOutPhoto ? (
                          <img src={item.checkOutPhoto} alt="checkout" />
                        ) : (
                          <div className="photo-placeholder">No Photo</div>
                        )}
                      </div>
                    </div>

                    {item.failureReason && (
                      <div className="failure-box">
                        <strong>Reason:</strong> {item.failureReason.message}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {visibleCount < data.recentAttendancePhotos.length && (
          <div className="show-more-wrapper">
            <button
              className="show-more-btn"
              onClick={() => setVisibleCount((prev) => prev + 5)}
            >
              Show More
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminAnalytics;