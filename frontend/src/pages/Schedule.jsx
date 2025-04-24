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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const rec = recipients.find(r => r.id === Number(form.recipient_id));
    const addingTrip = form.service_type.toLowerCase() === "trip";
    const addingWork = form.service_type.toLowerCase() === "work";

    const validWork = ["ADF", "AVF", "FVF"];
    const validTrip = ["ATB", "FTB"];

    if (
      (addingWork && !validWork.includes((rec?.Work_Service_Code || "").toUpperCase())) ||
      (addingTrip && !validTrip.includes((rec?.Trip_Service_Code || "").toUpperCase()))
    ) {
      alert("This recipient does not have a valid service code for the selected service type.");
      return;
    }

    // ✅ Service code is valid, proceed to add
    await addSchedule(form);
    const updated = await getSchedules();
    setSchedules(sortByWeekday(updated.data));
  };

  const handleDelete = async (id) => {
    await deleteSchedule(id);
    const updated = await getSchedules();
    setSchedules(sortByWeekday(updated.data));
  };

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
          {recipients.map(r => (
            <option key={r.id} value={r.id}>
              {capitalize(r.Last_Name)}, {capitalize(r.First_Name)}
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
          <option value="work">Work</option>
          <option value="trip">Trip</option>
        </select>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Add Schedule
        </button>
      </div>

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
                <td className="border px-2">{rec?.First_Name &&
    					      rec.First_Name.charAt(0).toUpperCase() + rec.First_Name.slice(1).toLowerCase()}</td>
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
