import React, { useState, useEffect } from "react";

export default function RickshawPayTracker() {
  const DAILY_RATE = 250;
  const [payments, setPayments] = useState([]);
  const [name, setName] = useState("Ali");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  // Fetch payments from backend
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch("http://localhost:5000/payments");
        const data = await res.json();
        setPayments(data);
      } catch (err) {
        console.error("Error fetching payments:", err);
      }
    };
    fetchPayments();
  }, []);

  // Add a new payment
  const addPayment = async () => {
    if (!amount) return;

    const newPayment = {
      id: Date.now(),
      name,
      amount: parseFloat(amount),
      reason,
      date: new Date().toISOString(),
    };

    // Optimistically update frontend
    setPayments([newPayment, ...payments]);
    setAmount("");
    setReason("");

    // Send to backend
    try {
      const res = await fetch("http://localhost:5000/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPayment),
      });
      const savedPayment = await res.json();
      console.log("Saved payment:", savedPayment);
    } catch (err) {
      console.error("Error saving to backend:", err);
    }
  };

  // Calculate total paid per person
  const getTotal = (person) =>
    payments
      .filter((p) => p.name === person)
      .reduce((sum, p) => sum + p.amount, 0);

  // Calculate total expected and due per person
  const getDue = (person) => {
    if (payments.length === 0) return 0;
    const firstDay = new Date(
      Math.min(...payments.map((p) => new Date(p.date)))
    );
    const daysPassed =
      Math.floor((new Date() - firstDay) / (1000 * 60 * 60 * 24)) + 1;
    const expected = daysPassed * DAILY_RATE;
    return expected - getTotal(person);
  };

  // Calculate missed days
  const getMissedDays = (person) => {
    const due = getDue(person);
    return Math.max(0, Math.floor(due / DAILY_RATE));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Rickshaw Payment Tracker</h1>

      {/* Input Section */}
      <div className="bg-white shadow-md rounded-2xl p-4 w-full max-w-md">
        <label className="block mb-2 font-medium">Select Name</label>
        <select
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg p-2 mb-4"
        >
          <option>Ali</option>
          <option>Nasir</option>
        </select>

        <label className="block mb-2 font-medium">Enter Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded-lg p-2 mb-4"
          placeholder="e.g. 120"
        />

        <label className="block mb-2 font-medium">Reason / Notes</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border rounded-lg p-2 mb-4"
          placeholder="e.g. maintenance deduction"
        />

        <button
          onClick={addPayment}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Add Payment
        </button>
      </div>

      {/* Totals */}
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <div className="bg-green-100 px-4 py-2 rounded-xl font-medium">
          Ali Total: ৳{getTotal("Ali")} <br />
          Ali Due: ৳{getDue("Ali")} <br />
          Missed Days: {getMissedDays("Ali")}
        </div>
        <div className="bg-yellow-100 px-4 py-2 rounded-xl font-medium">
          Nasir Total: ৳{getTotal("Nasir")} <br />
          Nasir Due: ৳{getDue("Nasir")} <br />
          Missed Days: {getMissedDays("Nasir")}
        </div>
      </div>

      {/* Payment List */}
      <h2 className="text-xl font-semibold mt-6">Payment History</h2>
      <ul className="w-full max-w-md mt-2">
        {payments.length === 0 && (
          <p className="text-gray-500">No payments added yet.</p>
        )}
        {payments.map((p) => (
          <li
            key={p.id}
            className="bg-white shadow-sm border rounded-lg p-3 my-2 flex flex-col"
          >
            <div className="flex justify-between">
              <span>
                {p.name} - ৳{p.amount}
              </span>
              <span className="text-gray-500 text-sm">
                {new Date(p.date).toLocaleDateString()}
              </span>
            </div>
            {p.reason && (
              <p className="text-sm text-gray-600">Reason: {p.reason}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
