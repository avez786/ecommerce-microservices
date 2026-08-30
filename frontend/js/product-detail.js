function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function loadProductDetail() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const productId = getIdFromUrl();
    const container = document.getElementById("productDetail");
    const errorMsg = document.getElementById("errorMsg");

    if (!productId) {
        errorMsg.textContent = "No product specified.";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/products/${productId}`, {
            headers: {Authorization: `Bearer ${token}`},
        });

        if (!response.ok) throw new Error("Failed to load product");

        const product = await response.json();

        container.innerHTML = `
            <div class="detail-card">
                <img src="${product.imageUrl || "https://via.placeholder.com/350x350"}" alt="${product.name}" class="detail-image">
                <div class="detail-info">
                    <div class="detail-category">${product.category || ""}</div>
                    <h2>${product.name}</h2>
                    <p class="detail-description">${product.description}</p>
                    <div class="detail-price">₹${product.price}</div>
                    <div class="detail-stock">In stock: ${product.stockQuantity}</div>
                    <input type="number" min="1" max="${product.stockQuantity}" value="1" id="qty-${product.id}">
                    <button onclick="addToOrderFromDetail(${product.id})">Add to Order</button>
                </div>
            </div>
        `;
    } catch (err) {
        errorMsg.textContent = "Could not load product details.";
    }
}

function addToOrderFromDetail(productId) {
    alert("Added to cart! Go to Products page to review your cart and place the order.");
}

loadProductDetail();
