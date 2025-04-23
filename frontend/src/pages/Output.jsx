import { downloadExport, getOutput, clearOutput } from "../api";
import { useState, useEffect } from "react";

export default function Output() {
  const [lines, setLines] = useState([]);

  const load = async () => {
    const res = await getOutput();
    setLines(res.data);
  };

  const handleClear = async () => {
    await clearOutput();
    setLines([]);
  };

  const handleDownload = async () => {
    const res = await downloadExport();

    // 🔍 Extract filename from response headers
    const disposition = res.headers["content-disposition"];
    let filename = "billing.txt"; // fallback

    if (disposition && disposition.includes("filename=")) {
      filename = disposition
        .split("filename=")[1]
        .replace(/['"]/g, '')
        .trim();
    }

    console.log("Filename from header:", filename); // 🐛 Debug
    const blob = new Blob([res.data], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename; // ✅ Use the dynamic name
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    load();
  }, []);

return (
  <div>
    <h2 className="text-xl font-bold mb-4">Output</h2>
    <div className="flex gap-4 mb-4">
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleDownload}>
        Download .txt
      </button>
      <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleClear}>
        Clear Output
      </button>
    </div>
    <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-auto font-mono">
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </pre>
  </div>
);
}
