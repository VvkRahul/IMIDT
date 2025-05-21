import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [sensorDocs, setSensorDocs] = useState([]);
  const [resultDocs, setResultDocs] = useState([]);
  const [eventCount, setEventCount] = useState([]);

  useEffect(() => {
    const unsubSensor = onSnapshot(collection(db, "sensor_data"), (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSensorDocs(docs);

      const newTime = new Date().toLocaleTimeString();
      setEventCount(prev => {
        const updated = [...prev, { time: newTime, events: docs.length }];
        return updated.length > 10 ? updated.slice(-10) : updated;
      });
    });

    const unsubResults = onSnapshot(collection(db, "disease_results"), (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResultDocs(docs);

      const newTime = new Date().toLocaleTimeString();
      setEventCount(prev => {
        const updated = [...prev, { time: newTime, events: docs.length }];
        return updated.length > 10 ? updated.slice(-10) : updated;
      });
    });

    return () => {
      unsubSensor();
      unsubResults();
    };
  }, []);

  const eventData = eventCount.map(item => ({
    name: item.time,
    uv: item.events,
  }));

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🩺 IMIDT Dashboard</h1>

      <section style={styles.section}>
        <h2 style={styles.subheading}>📈 Live Sensor Data</h2>
        <div style={styles.cardGrid}>
          {sensorDocs.map((doc) => (
            <div key={doc.id} style={styles.card}>
              <h3 style={styles.cardTitle}>{doc.id}</h3>
              <p>❤️ Heart Rate: {doc.heart_rate}</p>
              <p>🫁 SpO₂: {doc.spo2}</p>
              <p>🌡 Temperature: {doc.temperature}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.subheading}>🧬 Disease Predictions</h2>
        <div style={styles.cardGrid}>
          {resultDocs.map((doc) => (
            <div key={doc.id} style={styles.resultCard}>
              <h3 style={styles.cardTitle}>{doc.id}</h3>
              <p>🦠 Condition: <strong>{doc.detected_condition}</strong></p>
              <p>❤️ Heart Rate: {doc.heart_rate}</p>
              <p>🫁 SpO₂: {doc.spo2}</p>
              <p>🌡 Temp: {doc.temperature}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 📊 Data Analytics */}
      <section style={styles.analyticsSection}>
        <h2 style={styles.subheading}>📊 Cloud Activity Analytics</h2>
        <div style={styles.analyticsFlex}>
          <div style={styles.chartContainer}>
            <h3 style={styles.cardTitle}>Live Cloud Event Chart</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={eventData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="uv" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.trendCard}>
            <h3 style={styles.cardTitle}>📈 Event Trends</h3>
            <p style={styles.trendInfo}>
              🔹 Total Events: {eventCount.length > 0 ? eventCount[eventCount.length - 1].events : 0}
            </p>
            <p style={styles.trendInfo}>
              🔹 Last Event Time: {eventCount.length > 0 ? eventCount[eventCount.length - 1].time : "N/A"}
            </p>
            <p style={styles.trendInfo}>🔹 Real-time updates on Firestore activity</p>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem",
    fontFamily: "'Segoe UI', sans-serif",
    background: "linear-gradient(135deg, #6ee7b7, #3b82f6)",
    minHeight: "100vh",
  },
  heading: {
    fontSize: "2.4rem",
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  section: {
    marginBottom: "3rem",
    width: "100%",
    backgroundColor: "#ffffff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  subheading: {
    fontSize: "1.4rem",
    marginBottom: "1rem",
    color: "#1f2937",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    padding: "1rem",
    background: "#f8fafc",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    lineHeight: "1.6",
  },
  resultCard: {
    padding: "1rem",
    background: "#e0f2fe",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    lineHeight: "1.6",
  },
  analyticsSection: {
    marginBottom: "3rem",
    width: "100%",
    backgroundColor: "#f9fafb",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  analyticsFlex: {
    display: "flex",
    flexWrap: "wrap",
    gap: "2rem",
    justifyContent: "space-between",
  },
  chartContainer: {
    flex: 2,
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    padding: "1rem",
    minWidth: "300px",
  },
  trendCard: {
    flex: 1,
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    padding: "1rem",
    minWidth: "250px",
    alignSelf: "flex-start",
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: "1.1rem",
    color: "#374151",
    marginBottom: "0.5rem",
  },
  trendInfo: {
    fontSize: "1rem",
    color: "#4b5563",
    margin: "0.4rem 0",
  },
};
