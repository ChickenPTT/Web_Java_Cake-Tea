// Fetch and display food list
function fetchFoodList() {
    // In real implementation, fetch from Java backend
    // const response = await fetch(`${API_URL}/api/food/list`);
    // const data = await response.json();

    // For demo purposes, use localStorage
    const foodList = JSON.parse(localStorage.getItem('foodList') || '[]');
    
    // Add some demo data if empty
    if (foodList.length === 0) {
        const demoData = [
            {
                _id: "1",
                name: "Chocolate Cake",
                description: "A delicious chocolate cake with rich flavor and moist texture.",
                price: 30,
                category: "Cake",
                image: "food_1.jpg"
            },
            {
                _id: "2",
                name: "Strawberry Cake",
                description: "A delicious strawberry cake with rich flavor and moist texture.",
                price: 32,
                category: "Cake",
                image: "food_2.jpg"
            },
            {
                _id: "3",
                name: "Orio Cupcake",
                description: "A delicious orio cupcake with rich flavor and moist texture.",
                price: 13,
                category: "Cupcake",
                image: "food_5.jpg"
            }
        ];
        localStorage.setItem('foodList', JSON.stringify(demoData));
        localStorage.setItem('totalItems', demoData.length.toString());
        return demoData;
    }

    return foodList;
}

// Render food list
function renderFoodList() {
    const foodList = fetchFoodList();
    const container = document.getElementById('food-list-container');

    if (foodList.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No food items found. Add some items!</p>';
        return;
    }

    container.innerHTML = foodList.map(item => `
        <div class="list-table-format">
            <img src="/admin/assets/${item.image}" alt="${item.name}">
            <p>${item.name}</p>
            <p>${item.category}</p>
            <p>$${item.price}</p>
            <p onclick="removeFood('${item._id}')" class="cursor">x</p>
        </div>
    `).join('');
}

// Remove food item
async function removeFood(foodId) {
    if (!confirm('Are you sure you want to remove this item?')) {
        return;
    }

    // In real implementation, call Java backend
    // const response = await fetch(`${API_URL}/api/food/remove`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ id: foodId })
    // });

    // For demo purposes, remove from localStorage
    const foodList = JSON.parse(localStorage.getItem('foodList') || '[]');
    const updatedList = foodList.filter(item => item._id !== foodId);
    localStorage.setItem('foodList', JSON.stringify(updatedList));
    localStorage.setItem('totalItems', updatedList.length.toString());

    renderFoodList();
    showNotification('Food item removed successfully!');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderFoodList();
});

// Make function globally available
window.removeFood = removeFood;
