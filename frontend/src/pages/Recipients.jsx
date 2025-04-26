import { useEffect, useState } from "react";
import { getRecipients, addRecipient, deleteRecipient } from "../api";

const WORK_CODES = ["", "ADF", "AVF", "FVF"];
const TRIP_CODES = ["", "ATB", "FTB"];

export default function Recipients() {
  const [recipients, setRecipients] = useState([]);
  const [form, setForm] = useState({
    Last_Name: "",
    First_Name: "",
    Medicaid_ID: "",
    Work_Service_Code: "",
    Trip_Service_Code: "",
  });

  useEffect(() => {
    getRecipients().then(res => setRecipients(res.data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "Medicaid_ID") {
      if (!/^\d{0,12}$/.test(value)) return;
    }
    setForm({ ...form, [name]: value });
  };

  const isValidMedicaidID = form.Medicaid_ID.length === 12;
  const canSubmit = form.Last_Name && form.First_Name && isValidMedicaidID;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addRecipient(form);
    setForm({
      Last_Name: "",
      First_Name: "",
      Medicaid_ID: "",
      Work_Service_Code: "",
      Trip_Service_Code: "",
    });
    const updated = await getRecipients();
    setRecipients(updated.data);
  };

  const handleDelete = async (id) => {
    await deleteRecipient(id);
    const updated = await getRecipients();
    setRecipients(updated.data);
  };

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const sortedRecipients = [...recipients].sort((a, b) =>
    a.Last_Name.localeCompare(b.Last_Name)
  );

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">Recipients</h1>

      <form onSubmit={handleSubmit} className="space-y-2 mb-4">
        <input
          name="Last_Name"
          value={form.Last_Name}
          onChange={handleChange}
          placeholder="Last Name"
          className="border p-2 block w-full"
        />
        <input
          name="First_Name"
          value={form.First_Name}
          onChange={handleChange}
          placeholder="First Name"
          className="border p-2 block w-full"
        />
        <input
          name="Medicaid_ID"
          value={form.Medicaid_ID}
          onChange={handleChange}
          placeholder="Medicaid ID (12 digits)"
          className="border p-2 block w-full"
          inputMode="numeric"
        />

        <select
          name="Work_Service_Code"
          value={form.Work_Service_Code}
          onChange={handleChange}
          className="border p-2 block w-full"
        >
          <option value="">Work Service Code: Not Billed</option>
          {WORK_CODES.filter(c => c).map(code => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>

        <select
          name="Trip_Service_Code"
          value={form.Trip_Service_Code}
          onChange={handleChange}
          className="border p-2 block w-full"
        >
          <option value="">Transportation Code: Not Billed</option>
          {TRIP_CODES.filter(c => c).map(code => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>

        <button
          disabled={!canSubmit}
          className={`px-4 py-2 rounded text-white ${
            canSubmit ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Add Recipient
        </button>
      </form>

      <ul className="list-disc pl-4 space-y-1">
        {sortedRecipients.map((r) => (
          <li key={r.id} className="flex justify-between items-center">
            <span>
              {capitalize(r.Last_Name)}, {capitalize(r.First_Name)} — {r.Medicaid_ID},
              Work Service Code: {(r.Work_Service_Code || "").toUpperCase()},
              Transportation Service Code: {(r.Trip_Service_Code || "").toUpperCase()}
            </span>
            <button
              onClick={() => handleDelete(r.id)}
              className="ml-4 text-red-600 hover:underline text-sm"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
