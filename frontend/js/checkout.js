const API_BASE = "http://localhost:8080";

function getToken() {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "login.html";
    return token;
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

function getCart() {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
}

function renderSummary() {
    const cart = getCart();
    const summary = document.getElementById("orderSummary");

    if (cart.length === 0) {
        summary.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    const itemsHtml = cart
        .map(
            (item) => `
        <div class="summary-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `,
        )
        .join("");

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    summary.innerHTML = `
        <h3>Order Summary</h3>
        ${itemsHtml}
        <div class="summary-total">
            <span>Total</span>
            <span>₹${total.toFixed(2)}</span>
        </div>
    `;

    document.getElementById("payButton").textContent = `Pay ₹${total.toFixed(2)}`;
}

async function processPayment() {
    const token = getToken();
    const errorMsg = document.getElementById("errorMsg");
    const payButton = document.getElementById("payButton");
    const cart = getCart();

    if (cart.length === 0) {
        errorMsg.textContent = "Your cart is empty.";
        return;
    }

    payButton.disabled = true;
    payButton.textContent = "Processing payment...";
    errorMsg.textContent = "";

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate occasional failure (~1 in 5 chance)
    const paymentSucceeded = Math.random() > 0.2;

    if (!paymentSucceeded) {
        payButton.disabled = false;
        renderSummary();
        errorMsg.innerHTML = `<div class="payment-failed">Payment failed. Please try again or use a different payment method.</div>`;
        return;
    }

    // Payment "succeeded" - now actually place the real order
    try {
        const orderRequest = {
            items: cart.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            })),
        };

        const response = await fetch(`${API_BASE}/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(orderRequest),
        });

        if (!response.ok) throw new Error("Order creation failed");

        localStorage.removeItem("cart");
        alert("Payment successful! Order placed.");
        window.location.href = "orders.html";
    } catch (err) {
        errorMsg.textContent = "Payment succeeded but order placement failed. Please contact support.";
        payButton.disabled = false;
        renderSummary();
    }
}

renderSummary();
