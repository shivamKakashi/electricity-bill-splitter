import { useEffect, useState } from "react";
import BillDetails from "./components/BillDetails";
import FloorInput from "./components/FloorInput";
import FloorCalculationSummary from "./components/FloorCalculationSummary";


function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [floors, setFloors] = useState(() => {
    return JSON.parse(localStorage.getItem("floors")) || {
      ground: "",
      first: "",
      second: "",
    };
  });

  const API_URL = "https://electricity-bill-backend.onrender.com";


  useEffect(() => {
    localStorage.setItem("floors", JSON.stringify(floors));
  }, [floors]);

  const handleFloorChange = (e) => {
    setFloors({ ...floors, [e.target.name]: e.target.value });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please upload bill PDF");

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/upload-bill`, {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    setData(result.data);
    setLoading(false);
  };

  return (
    <div className="container">
      <h2>Electricity Bill Splitter</h2>

      <form onSubmit={handleSubmit}>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
        <button disabled={loading}>{loading ? "Calculating..." : "Calculate"}</button>
      </form>

      {error && <p className="error">{error}</p>}

      {data && (
  <>
    <BillDetails data={data} />
    <FloorInput floors={floors} onChange={handleFloorChange} />

    {Number(floors.ground) +
      Number(floors.first) +
      Number(floors.second) >
      Number(data.netBilledUnits) ? (
      <p className="error">
        Floor units exceed total billed units
      </p>
    ) : (
      <FloorCalculationSummary bill={data} floors={floors} />
    )}
  </>
)}

    </div>
  );
}

export default App;
