import { useState } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [orderId, setOrderId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState({});
  const [paymentId, setPaymentId] = useState("");

  // Function to load Razorpay's checkout script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Create a new order and open Razorpay popup
  const createOrder = async () => {
    const isScriptLoaded = await loadRazorpayScript();

    if (!isScriptLoaded) {
      alert("Failed to load Razorpay SDK");
      return;
    }

    try {
      // Create order by calling your backend API
      const response = await axios.post('http://localhost:8080/order', {
        amount: parseInt(amount) * 100, // Amount in paise
        currency: currency
      });

      setOrderId(response.data.orderId);

      // Now trigger the Razorpay payment popup
      const options = {
        key: 'rzp_test_LobYeOEFnXO0Hh', // Your Razorpay test key
        amount: response.data.amount, // Amount in paise
        currency: response.data.currency,
        order_id: response.data.orderId, // Order ID created in your backend
        name: 'Your Company',
        description: 'Test Transaction',
        handler: function (response) {
          // Handle successful payment
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          setPaymentId(response.razorpay_payment_id);
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3399cc'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open(); // Open the Razorpay popup
    } catch (error) {
      console.error("Error creating order", error);
      alert("Failed to create order");
    }
  };

  // Fetch payment status by paymentId
  const fetchPaymentStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/payment/${paymentId}`);
      setPaymentStatus(response.data);
      alert(`Payment status: ${response.data.status}`);
    } catch (error) {
      console.error("Error fetching payment status", error);
      alert("Failed to fetch payment status");
    }
  };

  return (
    <div className="App">
      <h1>Test Razorpay Payment</h1>
      
      {/* Order Creation Form */}
      <div>
        <h2>Create Order and Pay</h2>
        <input
          type="text"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="INR">INR</option>
        </select>
        <button onClick={createOrder}>Create Order & Pay</button>
      </div>

      {/* Display Order ID */}
      {orderId && (
        <div>
          <h3>Order ID: {orderId}</h3>
        </div>
      )}

      {/* Payment Status Section */}
      <div>
        <h2>Fetch Payment Status</h2>
        <input
          type="text"
          placeholder="Payment ID"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
        />
        <button onClick={fetchPaymentStatus}>Fetch Payment Status</button>
      </div>

      {/* Display Payment Status */}
      {paymentStatus && (
        <div>
          <h3>Payment Status</h3>
          <p>Status: {paymentStatus.status}</p>
          <p>Amount: {paymentStatus.amount}</p>
          <p>Currency: {paymentStatus.currency}</p>
        </div>
      )}
    </div>
  );
}

export default App;
