import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000")
      .then(res => res.text())
      .then(data => setMessage(data));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>SmartHire</h1>
      <p>AI Assisted Job Portal</p>
      <hr />
      <p>{message}</p>
    </div>
  );
}

export default App;