const express = require("express");
const app = express();
const cors = require("cors");
const Razorpay = require("razorpay");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/order", async (req, res) => {
  const razorpay = new Razorpay({
    key_id: 'rzp_test_LobYeOEFnXO0Hh',
    key_secret: 'H8ZKSxfq6n6LlFvZ5mZM94sg',
  });
  const options = {
    amount: req.body.amount,
    currency: req.body.currency,
    receipt: "reciept#1",
    payment_capture: 1,
  };
  try {
    const response = await razorpay.orders.create(options);

    res.json({
      orderId: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/payment/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  const razorpay = new Razorpay({
    key_id: 'rzp_test_LobYeOEFnXO0Hh',
    key_secret: 'H8ZKSxfq6n6LlFvZ5mZM94sg',
  });

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    if (!payment) {
      return res.status(404).json({
        status: 404,
        message: "Payment not found",
      });
    }
    res.json({
      status: payment.status,
      message: "Payment successful",
      amount: payment.amount,
      currency: payment.currency,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.listen(8080, () => {
  console.log("Server started on port 8080");
});
