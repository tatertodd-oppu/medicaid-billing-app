import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Recipients from "./pages/Recipients";
import Schedule from "./pages/Schedule";
import BillingInput from "./pages/BillingInput";
import Output from "./pages/Output";

export default function App() {
  return (
    <Router>
      {/* Top Navbar with Logo */}
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Medicaid FlatFile logo" className="h-10 w-auto" />
          <span className="text-2xl font-bold text-gray-800">Medicaid FlatFile</span>
        </div>
        <nav className="space-x-4 text-blue-700">
          <Link to="/">Recipients</Link>
          <Link to="/schedule">Schedule</Link>
          <Link to="/billing">Billing</Link>
          <Link to="/output">Output</Link>
        </nav>
      </header>

      {/* Page Content */}
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Recipients />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/billing" element={<BillingInput />} />
          <Route path="/output" element={<Output />} />
        </Routes>
      </main>
    </Router>
  );
}
