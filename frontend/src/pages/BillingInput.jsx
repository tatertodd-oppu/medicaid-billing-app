import { useEffect, useState } from "react";
import { getRecipients, saveBillingInput, getSchedules } from "../api";

const weekdayColors = {
  monday: "#e1ebc5",
  tuesday: "#b9d9ba",
  wednesday: "#add9d5",
  thursday: "#95b8d1",
  friday: "#9aa7bf",
};

const getDayColor = (dateStr) => {
  const day = new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  return weekdayColors[day] || "white";
};

export default function BillingInput() {
  const [recipients, setRecipients] = useState([]);
  const [scheduledMap, setScheduledMap] = useState({});
  const [form, setForm] = useState([]);
  const [monday, setMonday] = useState("");
  const [dates, setDates] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [mondayError, setMondayError] = useState("");

  const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];

  const formatDate = (date) => {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${mm}/${dd}/${yy}`;
  };

  useEffect(() => {
    getRecipients().then((res) => setRecipients(res.data));
    getSchedules().then((res) => {
      const map = {};
      res.data.forEach((s) => {
        const key = `${s.recipient_id}_${s.weekday.toLowerCase()}_${s.service_type.toLowerCase()}`;
        map[key] = true;
      });
      setScheduledMap(map);
    });
  }, []);

  const parseMondayDate = (input) => {
    try {
      const [mm, dd, yy] = input.split("/");
      const fullYear = parseInt(yy.length === 2 ? `20${yy}` : yy);
      const baseDate = new Date(fullYear, parseInt(mm) - 1, parseInt(dd));
      const result = [];

      for (let i = 0; i < 5; i++) {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() + i);
        result.push(formatDate(d));
      }

      setDates(result);
    } catch (e) {
      console.error("Invalid MM/DD/YY format", e);
    }
  };

  useEffect(() => {
    if (dates.length === 5 && recipients.length > 0) {
      const initial = recipients.flatMap((r) =>
        dates.map((date) => ({
          recipient_id: r.id,
          date,
          work_units: "",
          trip_units: "",
        }))
      );
      setForm(initial);
    }
  }, [dates, recipients]);

  const updateField = (id, date, key, value) => {
    const parsed = parseInt(value || "0");
    const newErrors = { ...errors };
    const errorKey = `${id}_${date}_${key}`;

    if (key === "work_units" && parsed > 20) {
      newErrors[errorKey] = "Max 20 units";
    } else if (key === "trip_units" && parsed > 2) {
      newErrors[errorKey] = "Max 2 trips";
    } else {
      delete newErrors[errorKey];
    }

    setErrors(newErrors);

    setForm((prev) =>
      prev.map((entry) =>
        entry.recipient_id === id && entry.date === date
          ? { ...entry, [key]: value }
          : entry
      )
    );
  };

  const handleSubmit = async () => {
    if (hasErrors) {
      alert("Please fix all errors before submitting.");
      return;
    }
    const validEntries = form.filter((e) => e.work_units || e.trip_units);
    await saveBillingInput(validEntries);
    alert("Billing data submitted.");
    setSubmitted(true);
  };

  const getWeekday = (dateStr) => {
    const d = new Date(dateStr);
    const dayNum = d.getDay();
    const map = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return weekdays.includes(map[dayNum]) ? map[dayNum] : null;
  };

  const hasErrors = Object.keys(errors).length > 0;

  // ✅ Alphabetize recipients by last name
  const sortedRecipients = [...recipients].sort((a, b) => {
    const lastA = a.Last_Name.toLowerCase();
    const lastB = b.Last_Name.toLowerCase();
    return lastA.localeCompare(lastB);
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
            let input = e.target.value.replace(/\D/g, "").slice(0, 6);
            setMonday(input);

            if (input.length === 6) {
              const [mm, dd, yy] = [input.slice(0,2), input.slice(2,4), input.slice(4,6)];
              const fullYear = parseInt(`20${yy}`);
              const parsedDate = new Date(fullYear, parseInt(mm) - 1, parseInt(dd));

              if (parsedDate.getDay() === 1) {
                parseMondayDate(`${mm}/${dd}/${yy}`);
                setMondayError("");
              } else {
                setDates([]);
                setMondayError("The date provided does not fall on Monday.");
              }
            } else {
              setDates([]);
              setMondayError("");
            }
          }}
          className="border px-2 py-1 border-gray-600"
        />
        {mondayError && (
          <div className="text-red-600 text-sm mt-1">{mondayError}</div>
        )}
      </div>

      {dates.length === 5 && (
        <>
          <table className="w-full text-sm border">
            <thead>
              <tr>
                <th className="border p-1">Recipient</th>
                {dates.map((d) => (
                  <th key={d} colSpan={2} className="border p-1 text-center" style={{ backgroundColor: getDayColor(d) }}>
                    {d}
                  </th>
                ))}
              </tr>
              <tr>
                <th></th>
                {dates.map((d) => {
                  const weekday = new Date(d).toLocaleDateString("en-US", { weekday: "long" });
                  return (
                    <th key={d + "_day"} colSpan={2} className="border p-1 text-center font-medium" style={{ backgroundColor: getDayColor(d) }}>
                      {weekday}
                    </th>
                  );
                })}
              </tr>
              <tr>
                <th></th>
                {dates.map((d) => (
                  <>
                    <th key={d + "_work"} className="border px-1" style={{ backgroundColor: getDayColor(d) }}>
                      Work
                    </th>
                    <th key={d + "_trip"} className="border px-1" style={{ backgroundColor: getDayColor(d) }}>
                      Trip
                    </th>
                  </>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRecipients.map((r) => (
                <tr key={r.id}>
                  <td className="border px-2">
                    {r.Last_Name}, {r.First_Name.charAt(0).toUpperCase()}.
                  </td>
                  {dates.map((d) => {
                    const e = form.find((f) => f.recipient_id === r.id && f.date === d);
                    const day = getWeekday(d);
                    if (!day) return <></>;

                    const workKey = `${r.id}_${day}_work`;
                    const tripKey = `${r.id}_${day}_trip`;
                    const workError = errors[`${r.id}_${d}_work_units`];
                    const tripError = errors[`${r.id}_${d}_trip_units`];

                    return (
                      <>
                        <td className="border text-center align-middle" style={{ backgroundColor: getDayColor(d) }}>
                          {scheduledMap[workKey] && (
                            <>
                              <input
                                type="number"
                                className="w-16 px-1 border border-gray-500 rounded-sm appearance-none focus:outline-none text-center"
                                value={e?.work_units || ""}
                                onChange={(e2) => updateField(r.id, d, "work_units", e2.target.value)}
                              />
                              {workError && <div className="text-red-600 text-xs">{workError}</div>}
                            </>
                          )}
                        </td>
                        <td className="border text-center align-middle" style={{ backgroundColor: getDayColor(d) }}>
                          {scheduledMap[tripKey] && (
                            <>
                              <input
                                type="number"
                                className="w-16 px-1 border border-gray-500 rounded-sm appearance-none focus:outline-none text-center"
                                value={e?.trip_units || ""}
                                onChange={(e2) => updateField(r.id, d, "trip_units", e2.target.value)}
                              />
                              {tripError && <div className="text-red-600 text-xs">{tripError}</div>}
                            </>
                          )}
                        </td>
                      </>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleSubmit}
            disabled={submitted || hasErrors}
            className={`mt-4 px-4 py-2 rounded text-white ${
              submitted || hasErrors
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Submit Billing
          </button>
        </>
      )}
    </div>
  );
}
