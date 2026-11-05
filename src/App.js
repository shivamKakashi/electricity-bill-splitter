import { useCallback, useEffect, useMemo, useState } from "react";
import { API_URL, request, postJson } from "./api";
import BillDetails from "./components/BillDetails";
import FloorInput from "./components/FloorInput";
import FloorCalculationSummary from "./components/FloorCalculationSummary";
import History from "./components/History";
import { canSplit, splitBill } from "./lib/splitBill";

const EMPTY_FLOORS = { ground: "", first: "", second: "" };

// localStorage can be unavailable (private mode); the app still works without it.
const load = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};
const store = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const snapshot = (floors, carryIn) =>
  JSON.stringify([floors.ground, floors.first, floors.second, carryIn].map((v) => Number(v) || 0));

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [providers, setProviders] = useState([]);
  const [provider, setProvider] = useState(() => load("provider", "auto"));

  // The last bill is kept so a refresh doesn't lose it.
  const [lastBill, setLastBill] = useState(() => load("lastBill", null));
  const data = lastBill?.data;
  const meta = lastBill?.meta;

  const [floors, setFloors] = useState(() => ({ ...EMPTY_FLOORS, ...load("floors", {}) }));
  const [carryIn, setCarryIn] = useState(() => load("carryIn", ""));
  const [previous, setPrevious] = useState(null);
  const [history, setHistory] = useState([]);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [saveState, setSaveState] = useState({ status: "idle" });

  useEffect(() => store("provider", provider), [provider]);
  useEffect(() => store("lastBill", lastBill), [lastBill]);
  useEffect(() => store("floors", floors), [floors]);
  useEffect(() => store("carryIn", carryIn), [carryIn]);

  useEffect(() => {
    request("/providers")
      .then((result) => setProviders(result.providers))
      .catch(() => setProviders([]));
  }, []);

  // Fetch saved months. For a newly read bill, also fill the inputs from what
  // was saved for it, or start blank with last month's carried units.
  const loadSettlements = useCallback(async (bill, fillInputs) => {
    const params = new URLSearchParams({
      account: bill.accountNumber || "",
      billDate: bill.billDate || "",
    });
    try {
      const result = await request(`/settlements?${params}`);
      setHistory(result.history);
      setPrevious(result.previous);
      if (result.current) {
        setSavedSnapshot(snapshot(result.current.floors, result.current.carryInUnits));
      }
      if (fillInputs) {
        const saved = result.current;
        setFloors(saved ? saved.floors : EMPTY_FLOORS);
        setCarryIn(saved ? saved.carryInUnits : result.previous?.carryOutUnits || "");
      }
    } catch {
      setHistory([]);
      setPrevious(null);
      if (fillInputs) {
        setFloors(EMPTY_FLOORS);
        setCarryIn("");
      }
    }
  }, []);

  useEffect(() => {
    if (data) loadSettlements(data, false);
    // Only on first load; new uploads call loadSettlements themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Choose the bill PDF first.");

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("provider", provider);

    try {
      const result = await request("/upload-bill", { method: "POST", body: formData });
      setLastBill({
        data: result.data,
        meta: { provider: result.provider, model: result.model, warnings: result.warnings },
      });
      setSavedSnapshot(null);
      setSaveState({ status: "idle" });
      await loadSettlements(result.data, true);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? `Can't reach the server at ${API_URL}. Check your connection and try again.`
          : err.message || "Could not read the bill. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFloorChange = (e) => {
    setFloors({ ...floors, [e.target.name]: e.target.value });
  };

  const split = useMemo(
    () => (data && canSplit(data) ? splitBill(data, floors, carryIn) : null),
    [data, floors, carryIn]
  );
  const isSaved = savedSnapshot !== null && savedSnapshot === snapshot(floors, carryIn);

  const handleSave = async () => {
    setSaveState({ status: "saving" });
    try {
      await postJson("/settlements", {
        accountNumber: data.accountNumber,
        billDate: data.billDate,
        netBilledUnits: data.netBilledUnits,
        payableAmount: data.payableAmount,
        floors: Object.fromEntries(split.floors.map((f) => [f.key, f.units])),
        shares: Object.fromEntries(split.floors.map((f) => [f.key, f.share])),
        carryInUnits: split.carryIn,
        waterUnits: split.waterUnits,
        carryOutUnits: split.carryOutUnits,
      });
      setSavedSnapshot(snapshot(floors, carryIn));
      setSaveState({ status: "idle" });
      loadSettlements(data, false);
    } catch (err) {
      setSaveState({
        status: "error",
        message: err instanceof TypeError ? "Can't reach the server to save. Try again." : err.message,
      });
    }
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>Bill Splitter</h1>
        <p>Upload the electricity bill, enter each floor's meter units, and see who pays what.</p>
      </header>

      <form className="card" onSubmit={handleSubmit}>
        <label className={`file-picker${file ? " has-file" : ""}`}>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => {
              setFile(e.target.files[0] || null);
              setError(null);
            }}
          />
          <svg viewBox="0 0 24 24" aria-hidden="true" className="file-icon">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3" />
          </svg>
          <span className="file-name">{file ? file.name : "Choose bill PDF"}</span>
          <span className="hint">{file ? "Tap to choose a different file" : "The PDF from UPPCL / MVVNL"}</span>
        </label>

        <label className="field">
          <span className="field-label">Read with</span>
          <select value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="auto">Auto (Gemini → Groq → Claude)</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id} disabled={!p.available}>
                {p.label}{p.available ? "" : " – no API key"}
              </option>
            ))}
          </select>
        </label>

        <button className="btn btn-primary" disabled={loading}>
          {loading && <span className="spinner" aria-hidden="true" />}
          {loading ? "Reading bill…" : data ? "Read new bill" : "Read bill"}
        </button>
        {loading && <p className="hint center">This usually takes 5–15 seconds.</p>}
      </form>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {data && (
        <>
          <BillDetails data={data} meta={meta} />

          {split ? (
            <>
              <FloorInput
                floors={floors}
                onChange={handleFloorChange}
                carryIn={carryIn}
                onCarryInChange={setCarryIn}
                previous={previous}
                split={split}
                billedUnits={data.netBilledUnits}
              />
              {split.floorTotal > 0 && (
                <FloorCalculationSummary
                  bill={data}
                  split={split}
                  isSaved={isSaved}
                  saveState={saveState}
                  onSave={handleSave}
                />
              )}
            </>
          ) : (
            <div className="alert alert-error">
              The units, energy charges or payable amount couldn't be read from this bill, so it
              can't be split. Try reading it again with another model.
            </div>
          )}

          <History history={history} currentBillDate={data.billDate} />
        </>
      )}
    </div>
  );
}

export default App;
