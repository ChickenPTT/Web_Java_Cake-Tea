// Fetch all orders
function fetchAllOrders() {
    // In real implementation, fetch from Java backend
    // const response = await fetch(`${API_URL}/api/order/list`);
    // const data = await response.json();

    // For demo purposes, use localStorage
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    
    // Add some demo data if empty
    if (orders.length === 0) {
        const demoOrders = [
            {
                _id: "1",
                items: [
                    { name: "Chocolate Cake", quantity: 2 },
                    { name: "Orio Cupcake", quantity: 1 }
                ],
                address: {
                    firstName: "John",
                    lastName: "Doe",
                    street: "123 Main St",
                    city: "New York",
                    state: "NY",
                    country: "USA",
                    zipcode: "10001",
                    phone: "1234567890"
                },
                amount: 73,
                status: "Processing"
            },
            {
                _id: "2",
                items: [
                    { name: "Strawberry Cake", quantity: 1 }
                ],
                address: {
                    firstName: "Jane",
                    lastName: "Smith",
                    street: "456 Oak Ave",
                    city: "Los Angeles",
                    state: "CA",
                    country: "USA",
                    zipcode: "90001",
                    phone: "0987654321"
                },
                amount: 34,
                status: "Preparing"
            }
        ];
        localStorage.setItem('adminOrders', JSON.stringify(demoOrders));
        localStorage.setItem('totalOrders', demoOrders.length.toString());
        localStorage.setItem('pendingOrders', demoOrders.filter(o => o.status !== 'Delivered').length.toString());
        return demoOrders;
    }

    return orders;
}

// Render orders
function renderOrders() {
    const orders = fetchAllOrders();
    const container = document.getElementById('order-list-container');

    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">No orders found.</p>';
        return;
    }

    container.innerHTML = orders.map(order => {
        const itemsText = order.items.map((item, idx) => {
            if (idx === order.items.length - 1) {
                return item.name + " x " + item.quantity;
            } else {
                return item.name + " x " + item.quantity + ", ";
            }
        }).join('');

        const addressText = `${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.country}, ${order.address.zipcode}`;

        return `
            <div class="order-item">
                <img src="/admin/assets/parcel_icon.png" alt="">
                <div>
                    <p class="order-item-food">${itemsText}</p>
                    <p class="order-item-name">${order.address.firstName} ${order.address.lastName}</p>
                    <div class="order-item-address">
                        <p>${addressText}</p>
                    </div>
                    <p class="order-item-phone">${order.address.phone}</p>
                </div>
                <p>Items: ${order.items.length}</p>
                <p>$${order.amount}</p>
                <select onchange="updateStatus('${order._id}', this.value)">
                    <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                    <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </div>
        `;
    }).join('');
}

// Update order status
async function updateStatus(orderId, newStatus) {
    // In real implementation, call Java backend
    // const response = await fetch(`${API_URL}/api/order/status`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ orderId, status: newStatus })
    // });

    // For demo purposes, update localStorage
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    const updatedOrders = orders.map(order => {
        if (order._id === orderId) {
            return { ...order, status: newStatus };
        }
        return order;
    });
    
    localStorage.setItem('adminOrders', JSON.stringify(updatedOrders));
    localStorage.setItem('pendingOrders', updatedOrders.filter(o => o.status !== 'Delivered').length.toString());

    showNotification('Order status updated successfully!');
    renderOrders();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderOrders();
});

// Make function globally available
window.updateStatus = updateStatus;
