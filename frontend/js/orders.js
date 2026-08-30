const API_BASE = "http://localhost:8080";

function getToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
    }
    return token;
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

async function loadOrders() {
    const token = getToken();
    const errorMsg = document.getElementById("errorMsg");
    const ordersList = document.getElementById("ordersList");

    try {
        const response = await fetch(`${API_BASE}/api/orders/my`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to load orders");
        }

        const orders = await response.json();

        if (orders.length === 0) {
            ordersList.innerHTML = "<p>You haven't placed any orders yet.</p>";
            return;
        }

        ordersList.innerHTML = orders
            .map(
                (order) => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Order #${order.id}</span>
                    <span class="order-status status-${order.status}">${order.status}</span>
                </div>
                ${order.items
                    .map(
                        (item) => `
                    <div class="order-item-row">
                        <span>${item.productName} x ${item.quantity}</span>
                        <span>₹${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                    </div>
                `,
                    )
                    .join("")}
                <div class="order-total">Total: ₹${order.totalAmount.toFixed(2)}</div>
                <div class="order-date">Placed on: ${new Date(order.createdAt).toLocaleString()}</div>

                <div class="status-update">
                    <select id="status-select-${order.id}">
                        <option value="PLACED" ${order.status === "PLACED" ? "selected" : ""}>Placed</option>
                        <option value="SHIPPED" ${order.status === "SHIPPED" ? "selected" : ""}>Shipped</option>
                        <option value="DELIVERED" ${order.status === "DELIVERED" ? "selected" : ""}>Delivered</option>
                        <option value="CANCELLED" ${order.status === "CANCELLED" ? "selected" : ""}>Cancelled</option>
                    </select>
                    <button onclick="updateStatus(${order.id})">Update Status</button>
                </div>
            </div>
        `,
            )
            .join("");
    } catch (err) {
        errorMsg.textContent = "Could not load orders. Please try again.";
    }
}

async function updateStatus(orderId) {
    const token = getToken();
    const newStatus = document.getElementById(`status-select-${orderId}`).value;

    try {
        const response = await fetch(`${API_BASE}/api/orders/${orderId}/status?status=${newStatus}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to update status");
        }

        loadOrders();
    } catch (err) {
        alert("Failed to update order status.");
    }
}
loadOrders();
