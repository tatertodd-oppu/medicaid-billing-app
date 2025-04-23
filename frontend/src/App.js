import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Recipients from "./pages/Recipients";
import Schedule from "./pages/Schedule";
import BillingInput from "./pages/BillingInput";
import Output from "./pages/Output";

export default function App() {
  return (
    <Router>
      <div className="p-4">
        <nav className="mb-4 space-x-4 text-blue-700">
          <Link to="/">Recipients</Link>
          <Link to="/schedule">Schedule</Link>
          <Link to="/billing">Billing</Link>
          <Link to="/output">Output</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Recipients />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/billing" element={<BillingInput />} />
          <Route path="/output" element={<Output />} />
        </Routes>
      </div>
    </Router>
  );
}
