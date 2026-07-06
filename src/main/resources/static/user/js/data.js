// Menu categories
const menulist = [
    {
        menu_name: "Cake",
        menu_image: "/user/assets/menu_1.jpg"
    },
    {
        menu_name: "Cupcake",
        menu_image: "/user/assets/menu_2.jpg"
    },
    {
        menu_name: "Croissant",
        menu_image: "/user/assets/menu_3.jpg"
    },
    {
        menu_name: "Cheesecake",
        menu_image: "/user/assets/menu_4.jpg"
    },
    {
        menu_name: "Donut",
        menu_image: "/user/assets/menu_5.jpg"
    },
    {
        menu_name: "Cookies",
        menu_image: "/user/assets/menu_6.jpg"
    },
    {
        menu_name: "Mousse",
        menu_image: "/user/assets/menu_7.jpg"
    },
    {
        menu_name: "Sweet Buns",
        menu_image: "/user/assets/menu_8.jpg"
    }
];

// Food items
const foodlist = [
    {
        _id: "1",
        name: "Chocolate Cake",
        image: "/user/assets/food_1.jpg",
        price: 30,
        description: "A delicious chocolate cake with rich flavor and moist texture.",
        category: "Cake"
    },
    {
        _id: "2",
        name: "Strawberry Cake",
        image: "/user/assets/food_2.jpg",
        price: 32,
        description: "A delicious strawberry cake with rich flavor and moist texture.",
        category: "Cake"
    },
    {
        _id: "3",
        name: "Vanilla Cake",
        image: "/user/assets/food_3.jpg",
        price: 28,
        description: "A delicious vanilla cake with rich flavor and moist texture.",
        category: "Cake"
    },
    {
        _id: "4",
        name: "Matcha Cake",
        image: "/user/assets/food_4.jpg",
        price: 35,
        description: "A delicious matcha cake with rich flavor and moist texture.",
        category: "Cake"
    },
    {
        _id: "5",
        name: "Orio Cupcake",
        image: "/user/assets/food_5.jpg",
        price: 13,
        description: "A delicious orio cupcake with rich flavor and moist texture.",
        category: "Cupcake"
    },
    {
        _id: "6",
        name: "Mint Cupcake",
        image: "/user/assets/food_6.jpg",
        price: 11,
        description: "A delicious mint cupcake with rich flavor and moist texture.",
        category: "Cupcake"
    },
    {
        _id: "7",
        name: "Blueberry Cupcake",
        image: "/user/assets/food_7.jpg",
        price: 15,
        description: "A delicious blueberry cupcake with rich flavor and moist texture.",
        category: "Cupcake"
    },
    {
        _id: "8",
        name: "Lemon Cupcake",
        image: "/user/assets/food_8.jpg",
        price: 9,
        description: "A delicious lemon cupcake with rich flavor and moist texture.",
        category: "Cupcake"
    }
];

// Cart management
let cartItems = {};
let currentCategory = "All";

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
        cartItems = JSON.parse(savedCart);
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartUI();
}

// Add item to cart
function addToCart(itemId) {
    if (!cartItems[itemId]) {
        cartItems[itemId] = 1;
    } else {
        cartItems[itemId]++;
    }
    saveCart();
}

// Remove item from cart
function removeFromCart(itemId) {
    if (cartItems[itemId]) {
        cartItems[itemId]--;
        if (cartItems[itemId] === 0) {
            delete cartItems[itemId];
        }
    }
    saveCart();
}

// Get total cart amount
function getTotalCartAmount() {
    let totalAmount = 0;
    for (const item in cartItems) {
        if (cartItems[item] > 0) {
            let itemInfo = foodlist.find((product) => product._id === item);
            if (itemInfo) {
                totalAmount += itemInfo.price * cartItems[item];
            }
        }
    }
    return totalAmount;
}

// Update cart UI (dot indicator)
function updateCartUI() {
    const cartDot = document.getElementById('cart-dot');
    if (cartDot) {
        const total = getTotalCartAmount();
        cartDot.style.display = total > 0 ? 'block' : 'none';
    }
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Get user token
function getToken() {
    return localStorage.getItem('token');
}

// Login function
function login(email, password) {
    // This is a template - integrate with your Java backend
    // For now, we'll simulate login
    const token = 'simulated_token_' + Date.now();
    localStorage.setItem('token', token);
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Initialize
loadCart();
updateCartUI();
