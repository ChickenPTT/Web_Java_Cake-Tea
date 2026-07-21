// Check current user session and update navbar
function checkUserSession() {
    fetch('/api/current-user')
        .then(response => response.json())
        .then(data => {
            const signinBtn = document.getElementById('signin-btn');
            const navbarProfile = document.getElementById('navbar-profile');
            
            if (data.authenticated) {
                // User is logged in - show profile, hide signin button
                if (signinBtn) signinBtn.style.display = 'none';
                if (navbarProfile) {
                    navbarProfile.style.display = 'flex';
                    // Optional: update profile with user name
                    const profileText = navbarProfile.querySelector('.profile-name');
                    if (profileText) {
                        profileText.textContent = data.name || data.email;
                    }
                }
            } else {
                // User not logged in - show signin button, hide profile
                if (signinBtn) signinBtn.style.display = 'block';
                if (navbarProfile) navbarProfile.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error checking user session:', error);
            // On error, show signin button by default
            const signinBtn = document.getElementById('signin-btn');
            if (signinBtn) signinBtn.style.display = 'block';
        });
}

// Nạp danh mục vào dropdown "Thực đơn" trên navbar (hiển thị khi hover)
function loadNavCategories() {
    const dropdown = document.getElementById('nav-category-dropdown');
    if (!dropdown) return;

    const allItem = `<li onclick="window.location.href='menu.html'"><span>Tất cả sản phẩm</span></li>`;

    fetch('/api/menu')
        .then(response => response.ok ? response.json() : [])
        .then(menus => {
            const list = Array.isArray(menus) ? menus : [];
            const items = list.map(m => {
                const name = m.menuName || m.menu_name;
                const img = m.menuImage || m.menu_image || '';
                const imgTag = img ? `<img src="${img}" alt="${name}">` : '';
                return `<li onclick="window.location.href='menu.html?category=${encodeURIComponent(name)}'">${imgTag}<span>${name}</span></li>`;
            }).join('');
            dropdown.innerHTML = allItem + items;
        })
        .catch(error => {
            console.error('Error loading nav categories:', error);
            dropdown.innerHTML = allItem;
        });
}

// Track login mode (true = login, false = register)
let isLoginMode = true;

// Logout function
function logout() {
    fetch('/logout', { method: 'GET' })
        .then(() => {
            window.location.href = '/';
        })
        .catch(error => console.error('Logout error:', error));
}

// Show login popup
function showLoginPopup() {
    const popup = document.getElementById('login-popup');
    if (popup) {
        popup.style.display = 'flex';
        popup.style.justifyContent = "center";
        isLoginMode = true;
        resetLoginForm();
    }
}

// Close login popup
function closeLoginPopup() {
    const popup = document.getElementById('login-popup');
    if (popup) {
        popup.style.display = 'none';
    }
}

// Reset login form to default state (login mode)
function resetLoginForm() {
    const nameInput = document.getElementById('name-input');
    const birthdayInput = document.getElementById('birthday-input');
    const loginTitle = document.getElementById('login-title');
    const loginButton = document.getElementById('login-button');
    const loginToggle = document.getElementById('login-toggle');
    const form = document.getElementById('login-form');
    
    nameInput.style.display = 'none';
    nameInput.value = '';
    birthdayInput.style.display = 'none';
    birthdayInput.value = '';
    loginTitle.textContent = 'Đăng nhập';
    loginButton.textContent = 'Đăng nhập';
    loginToggle.innerHTML = 'Tạo tài khoản mới? <span onclick="toggleLoginMode()">Bấm vào đây!</span>';
    
    // Clear form fields
    document.getElementById('email-input').value = '';
    document.getElementById('password-input').value = '';
    document.getElementById('agree-checkbox').checked = false;
}

// Toggle between login and register
function toggleLoginMode() {
    isLoginMode = !isLoginMode;
    
    const nameInput = document.getElementById('name-input');
    const birthdayInput = document.getElementById('birthday-input');
    const loginTitle = document.getElementById('login-title');
    const loginButton = document.getElementById('login-button');
    const loginToggle = document.getElementById('login-toggle');

    if (isLoginMode) {
        // Switch to login mode
        nameInput.style.display = 'none';
        nameInput.value = '';
        birthdayInput.style.display = 'none';
        birthdayInput.value = '';
        loginTitle.textContent = 'Đăng nhập';
        loginButton.textContent = 'Đăng nhập';
        loginToggle.innerHTML = 'Tạo tài khoản mới? <span onclick="toggleLoginMode()">Bấm vào đây!</span>';
    } else {
        // Switch to register mode
        nameInput.style.display = 'block';
        nameInput.value = '';
        birthdayInput.style.display = 'block';
        birthdayInput.value = '';
        loginTitle.textContent = 'Đăng ký';
        loginButton.textContent = 'Đăng ký';
        loginToggle.innerHTML = 'Đã có tài khoản? <span onclick="toggleLoginMode()">Bấm vào đây!</span>';
    }
    // Clear password for security when switching modes
    document.getElementById('password-input').value = '';
}

// Handle login/register form submission
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('name-input');
            const emailInput = document.getElementById('email-input');
            const passwordInput = document.getElementById('password-input');
            const agreeCheckbox = document.getElementById('agree-checkbox');
            
            // Validate checkbox
            if (!agreeCheckbox.checked) {
                alert('Vui lòng đồng ý với điều khoản dịch vụ');
                return;
            }
            
            const formData = new FormData();
            formData.append('email', emailInput.value);
            formData.append('password', passwordInput.value);
            
            const endpoint = isLoginMode ? '/login' : '/register';
            
            if (!isLoginMode) {
                // Register mode - include name and birthday
                if (!nameInput.value.trim()) {
                    alert('Vui lòng nhập tên của bạn');
                    return;
                }
                formData.append('name', nameInput.value);
                
                // Add birthday if provided
                const birthdayInput = document.getElementById('birthday-input');
                if (birthdayInput && birthdayInput.value) {
                    formData.append('birthday', birthdayInput.value);
                }
            }
            
            fetch(endpoint, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            })
            .then(async response => {
                if (response.ok) {
                    if (isLoginMode) {
                        closeLoginPopup();
                        checkUserSession();
                        loginForm.reset();
                        resetLoginForm();
                    } else {
                        alert('Đăng ký thành công! Vui lòng đăng nhập.');
                        isLoginMode = true;
                        const email = emailInput.value;
                        resetLoginForm();
                        document.getElementById('email-input').value = email;
                    }
                } else {
                    let message = 'Đăng nhập/đăng ký thất bại';
                    try {
                        const data = await response.json();
                        message = data.message || message;
                    } catch (_) {
                        const text = await response.text();
                        if (text) message = text;
                    }
                    alert('Lỗi: ' + message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Có lỗi xảy ra. Vui lòng thử lại.');
            });
        });
    }
    
    // Check user session on page load
    checkUserSession();

    // Nạp danh mục cho dropdown "Thực đơn"
    loadNavCategories();
});
