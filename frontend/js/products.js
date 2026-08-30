const API_BASE = "http://localhost:8080";

let cart = [];
let allProducts = [];

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
async function loadProducts() {
    const token = getToken();
    const errorMsg = document.getElementById("errorMsg");
    const grid = document.getElementById("productGrid");

    try {
        const response = await fetch(`${API_BASE}/api/products`, {
            headers: {Authorization: `Bearer ${token}`},
        });

        if (!response.ok) throw new Error("Failed to load products");

        allProducts = await response.json();
        grid.innerHTML = "";

        for (const product of allProducts) {
            const summaryRes = await fetch(`${API_BASE}/api/products/${product.id}/reviews/summary`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            const summary = summaryRes.ok ? await summaryRes.json() : {averageRating: 0, totalReviews: 0};

            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
    <a href="product-detail.html?id=${product.id}">
        <img src="${product.imageUrl || "https://via.placeholder.com/300x200"}" alt="${product.name}" class="product-image">
        <h3>${product.name}</h3>
    </a>
    <div class="product-price">₹${product.price}</div>
    <div class="product-stock">In stock: ${product.stockQuantity}</div>
    <div class="product-rating">⭐ ${summary.averageRating} (${summary.totalReviews} review${summary.totalReviews === 1 ? "" : "s"})</div>
    <input type="number" min="1" max="${product.stockQuantity}" value="1" id="qty-${product.id}">
    <button onclick="addToOrder(${product.id})">Add to Order</button>
    <button class="review-toggle" onclick="toggleReviews(${product.id})">Show Reviews</button>
    <div class="reviews-section" id="reviews-${product.id}" style="display:none;"></div>
`;
            grid.appendChild(card);
        }
    } catch (err) {
        errorMsg.textContent = "Could not load products. Please try again.";
    }
}

function addToOrder(productId) {
    const qty = parseInt(document.getElementById(`qty-${productId}`).value);
    const product = allProducts.find((p) => p.id === productId);

    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({productId: product.id, name: product.name, price: product.price, quantity: qty});
    }

    renderCart();
}

function renderCart() {
    const cartSummary = document.getElementById("cartSummary");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    if (cart.length === 0) {
        cartSummary.style.display = "none";
        return;
    }

    cartSummary.style.display = "block";
    cartItems.innerHTML = cart
        .map(
            (item) => `
        <div class="cart-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `,
        )
        .join("");

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.textContent = `Total: ₹${total.toFixed(2)}`;
}

function goToCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "checkout.html";
}

async function toggleReviews(productId) {
    const section = document.getElementById(`reviews-${productId}`);

    if (section.style.display === "block") {
        section.style.display = "none";
        return;
    }

    section.style.display = "block";
    await loadReviews(productId);
}

async function loadReviews(productId) {
    const token = getToken();
    const section = document.getElementById(`reviews-${productId}`);

    try {
        const response = await fetch(`${API_BASE}/api/products/${productId}/reviews`, {
            headers: {Authorization: `Bearer ${token}`},
        });
        const reviews = await response.json();

        const reviewsHtml =
            reviews.length === 0
                ? "<p class='no-reviews'>No reviews yet.</p>"
                : reviews
                      .map(
                          (r) => `
                <div class="review-item">
                    <div class="review-header">
                        <span>${"⭐".repeat(r.rating)}</span>
                        <span class="review-author">${r.userEmail}</span>
                    </div>
                    <p>${r.comment}</p>
                </div>
            `,
                      )
                      .join("");

        section.innerHTML = `
            ${reviewsHtml}
            <div class="add-review">
                <select id="rating-${productId}">
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Bad</option>
                </select>
                <input type="text" id="comment-${productId}" placeholder="Write a review...">
                <button onclick="submitReview(${productId})">Submit</button>
            </div>
        `;
    } catch (err) {
        section.innerHTML = "<p class='no-reviews'>Could not load reviews.</p>";
    }
}

async function submitReview(productId) {
    const token = getToken();
    const rating = parseInt(document.getElementById(`rating-${productId}`).value);
    const comment = document.getElementById(`comment-${productId}`).value;

    try {
        const response = await fetch(`${API_BASE}/api/products/${productId}/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({rating, comment}),
        });

        if (!response.ok) throw new Error("Failed to submit review");

        await loadReviews(productId);
        loadProducts();
    } catch (err) {
        alert("Failed to submit review.");
    }
}

loadProducts();
