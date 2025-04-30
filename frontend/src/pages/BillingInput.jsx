import { useEffect, useState } from "react";
import { getSchedules, getRecipients, saveBillingInput } from "../api";

const weekdayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const weekdayLabels = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
};

export default function BillingInput() {
  const [recipients, setRecipients] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({});
  const [monday, setMonday] = useState("");
  const [mondayError, setMondayError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const formatDate = (date) => {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${mm}/${dd}/${yy}`;
  };

  const parseMondayDate = (input) => {
    const [mm, dd, yy] = input.split("/");
    const fullYear = parseInt(yy.length === 2 ? `20${yy}` : yy);
    const baseDate = new Date(fullYear, parseInt(mm) - 1, parseInt(dd));
    if (baseDate.getDay() !== 1) {
      setMondayError("The date provided does not fall on Monday.");
      return null;
    }
    setMondayError("");
    return baseDate;
  };

  useEffect(() => {
    getRecipients().then((res) => setRecipients(res.data));
    getSchedules().then((res) => setSchedules(res.data));
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    const mondayDate = parseMondayDate(monday);
    if (!mondayDate) return;

    const entries = schedules.flatMap((s) => {
      const recipient = recipients.find((r) => r.id === s.recipient_id);
      if (!recipient) return [];

      const dayIndex = weekdayOrder.indexOf(s.weekday.toLowerCase());
      const billingDate = new Date(mondayDate);
      billingDate.setDate(billingDate.getDate() + dayIndex);
      const formattedDate = formatDate(billingDate);

      const key = `${s.recipient_id}_${s.weekday}_${s.service_type}`;
      const units = form[key];

      if (!units || units.trim() === "") return [];

      return [{
        recipient_id: s.recipient_id,
        date: formattedDate,
        work_units: s.service_type === "work" ? units : "",
        trip_units: s.service_type === "trip" ? units : "",
      }];
    });

    if (entries.length === 0) {
      alert("No entries to submit.");
      return;
    }

    await saveBillingInput(entries);
    alert("Billing data submitted.");
    setSubmitted(true);
  };

  const sortedSchedules = [...schedules].sort((a, b) => {
    const recA = recipients.find(r => r.id === a.recipient_id);
    const recB = recipients.find(r => r.id === b.recipient_id);
    if (!recA || !recB) return 0;

    const lastA = recA.Last_Name.toLowerCase();
    const lastB = recB.Last_Name.toLowerCase();

    if (lastA !== lastB) return lastA < lastB ? -1 : 1;

    return weekdayOrder.indexOf(a.weekday.toLowerCase()) -
           weekdayOrder.indexOf(b.weekday.toLowerCase());
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-3">Billing Input</h1>

      <div className="mb-4">
        <label className="font-semibold mr-2">Enter Monday’s Date:</label>
        <input
          type="text"
          placeholder="MMDDYY"
          value={monday}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
            setMonday(raw);
            if (raw.length === 6) {
              const [mm, dd, yy] = [raw.slice(0, 2), raw.slice(2, 4), raw.slice(4)];
              const check = parseMondayDate(`${mm}/${dd}/${yy}`);
              if (!check) setMondayError("The date provided does not fall on Monday.");
              else setMondayError("");
            } else {
              setMondayError("");
            }
          }}
          className="border px-2 py-1 border-gray-600"
        />
        {mondayError && (
          <div className="text-red-600 text-sm mt-1">{mondayError}</div>
        )}
      </div>

      {recipients.length > 0 && schedules.length > 0 && (
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 font-semibold">
              <th className="border px-2 py-1">Recipient</th>
              <th className="border px-2 py-1">Weekday</th>
              <th className="border px-2 py-1">Service</th>
              <th className="border px-2 py-1">Units</th>
            </tr>
          </thead>
          <tbody>
            {sortedSchedules.map((s, i) => {
              const r = recipients.find(r => r.id === s.recipient_id);
              if (!r) return null;
              const key = `${s.recipient_id}_${s.weekday}_${s.service_type}`;
              return (
                <tr key={i}>
                  <td className="border px-2 py-1">
                    {r.Last_Name}, {r.First_Name}
                  </td>
                  <td className="border px-2 py-1">
                    {weekdayLabels[s.weekday.toLowerCase()] || s.weekday}
                  </td>
                  <td className="border px-2 py-1">{s.service_type}</td>
                  <td className="border px-2 py-1 text-center">
                    <input
                      type="number"
                      value={form[key] || ""}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-16 px-1 border border-gray-400 rounded-sm text-center"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitted || !!mondayError || monday.length !== 6}
        className={`mt-4 px-4 py-2 rounded text-white ${
          submitted || !!mondayError || monday.length !== 6
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        Submit Billing
      </button>
    </div>
  );
}
