function FloorInput({ floors, onChange }) {
  return (
    <div className="card">
      <h3>Floor Units</h3>

      {["ground", "first", "second"].map((floor) => (
        <div key={floor} className="field">
          <label>{floor.charAt(0).toUpperCase() + floor.slice(1)} Floor</label>
          <input
            type="number"
            step="0.01"
            name={floor}
            value={floors[floor]}
            placeholder="0.00"
            onChange={onChange}
          />
        </div>
      ))}
    </div>
  );
}

export default FloorInput;
