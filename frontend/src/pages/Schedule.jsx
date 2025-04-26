import { useEffect, useState } from "react";
import { getSchedules, getRecipients, addSchedule, deleteSchedule } from "../api";

const weekdayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const capitalize = (word) => word?.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
const weekdayColors = {
  monday: "#e1ebc5",
  tuesday: "#b9d9ba",
  wednesday: "#add9d5",
  thursday: "#95b8d1",
  friday: "#9aa7bf",
};

export default function Schedule() {
  const [recipients, setRecipients] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({
    recipient_id: "",
    weekday: "monday",
    service_type: "work",
  });

  useEffect(() => {
    getRecipients().then(res => setRecipients(res.data));
    getSchedules().then(res => setSchedules(sortByWeekday(res.data)));
  }, []);

  const sortByWeekday = (list) => {
    return [...list].sort((a, b) => {
      return (
        weekdayOrder.indexOf(a.weekday.toLowerCase()) -
        weekdayOrder.indexOf(b.weekday.toLowerCase())
      );
    });
  };

  const sortedRecipients = [...recipients].sort((a, b) => {
    const lastA = a.Last_Name.toLowerCase();
    const lastB = b.Last_Name.toLowerCase();
    return lastA.localeCompare(lastB);
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await addSchedule(form);
    const updated = await getSchedules();
    setSchedules(sortByWeekday(updated.data));
  };

  const handleDelete = async (id) => {
    await deleteSchedule(id);
    const updated = await getSchedules();
    setSchedules(sortByWeekday(updated.data));
  };

  const rec = recipients.find(r => r.id === Number(form.recipient_id));
  const addingTrip = form.service_type.toLowerCase() === "trip";
  const addingWork = form.service_type.toLowerCase() === "work";

  const validWorkCodes = ["ADF", "AVF", "FVF"];
  const validTripCodes = ["ATB", "FTB"];

  const hasValidServiceCode =
    (addingWork && validWorkCodes.includes((rec?.Work_Service_Code || "").toUpperCase())) ||
    (addingTrip && validTripCodes.includes((rec?.Trip_Service_Code || "").toUpperCase()));

  const isDuplicate = schedules.some(
    (s) =>
      s.recipient_id === Number(form.recipient_id) &&
      s.weekday.toLowerCase() === form.weekday.toLowerCase() &&
      s.service_type.toLowerCase() === form.service_type.toLowerCase()
  );

  const canSubmit =
    form.recipient_id &&
    form.weekday &&
    form.service_type &&
    hasValidServiceCode &&
    !isDuplicate;

  return (
    <div>
      <h1 className="text-xl font-bold mb-3">Schedule Management</h1>

      <div className="mb-4 flex gap-2 items-end">
        <select
          name="recipient_id"
          value={form.recipient_id}
          onChange={handleChange}
          className="border px-2 py-1"
        >
          <option value="">Select Recipient</option>
          {sortedRecipients.map((rec) => (
            <option key={rec.id} value={rec.id}>
              {rec.Last_Name}, {rec.First_Name.charAt(0).toUpperCase()}.
            </option>
          ))}
        </select>

        <select
          name="weekday"
          value={form.weekday.toLowerCase()}
          onChange={handleChange}
          className="border px-2 py-1"
        >
          {weekdayOrder.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>

        <select
          name="service_type"
          value={form.service_type.toLowerCase()}
          onChange={handleChange}
          className="border px-2 py-1"
        >
          <option value="work">work</option>
          <option value="trip">trip</option>
        </select>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`bg-green-600 text-white px-3 py-1 rounded ${
            !canSubmit ? "bg-gray-400 cursor-not-allowed" : ""
          }`}
        >
          Add Schedule
        </button>
      </div>

      {isDuplicate && (
        <div className="text-red-600 text-xs mb-2">
          This schedule already exists.
        </div>
      )}
      {!hasValidServiceCode && form.recipient_id && (
        <div className="text-red-600 text-xs mb-2">
          Recipient does not have a valid service code for the selected service type.
        </div>
      )}

      <table className="text-sm w-full border">
        <thead>
          <tr>
            <th className="border px-2">Recipient</th>
            <th className="border px-2">Weekday</th>
            <th className="border px-2">Service Type</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => {
            const rec = recipients.find(r => r.id === s.recipient_id);
            if (!rec) return null;
            return (
              <tr
                key={s.id}
                style={{
                  backgroundColor: weekdayColors[s.weekday.toLowerCase()] || "white",
                }}
              >
                <td className="border px-2">
                  {rec?.Last_Name && rec?.First_Name &&
                    `${rec.Last_Name.charAt(0).toUpperCase() + rec.Last_Name.slice(1).toLowerCase()}, ${rec.First_Name.charAt(0).toUpperCase()}.`}
                </td>
                <td className="border px-2">{capitalize(s.weekday)}</td>
                <td className="border px-2">{capitalize(s.service_type)}</td>
                <td className="border px-2">
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
