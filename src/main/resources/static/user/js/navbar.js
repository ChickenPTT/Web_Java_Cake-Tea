function buildProfileDropdown() {
    const navbarProfile = document.getElementById('navbar-profile');
    if (!navbarProfile || navbarProfile.dataset.enhanced === '1') return;

    navbarProfile.innerHTML = `
        <button type="button" class="navbar-profile-trigger" id="navbar-profile-trigger" aria-expanded="false" aria-haspopup="true">
            <img class="navbar-profile-avatar" src="/user/assets/profile_icon.png" alt="">
            <span class="navbar-profile-name" id="navbar-profile-name">Tài khoản</span>
            <span class="navbar-profile-caret" aria-hidden="true"></span>
        </button>
        <div class="nav-profile-dropdown" id="nav-profile-dropdown">
            <div class="nav-profile-header">
                <img src="/user/assets/profile_icon.png" alt="">
                <div class="nav-profile-header-text">
                    <p class="nav-profile-header-name" id="nav-profile-header-name">Khách hàng</p>
                    <p class="nav-profile-header-email" id="nav-profile-header-email"></p>
                </div>
            </div>
            <ul class="nav-profile-menu">
                <li>
                    <a href="/myorders.html">
                        <img src="/user/assets/bag_icon.png" alt="">
                        <span>Đơn hàng của tôi</span>
                    </a>
                </li>
                <li>
                    <a href="/cart.html">
                        <img src="/user/assets/icon-basket.jpg" alt="">
                        <span>Giỏ hàng</span>
                    </a>
                </li>
            </ul>
            <div class="nav-profile-divider"></div>
            <ul class="nav-profile-menu">
                <li class="nav-profile-logout">
                    <button type="button" onclick="logout()">
                        <img src="/user/assets/logout_icon.png" alt="">
                        <span>Đăng xuất</span>
                    </button>
                </li>
            </ul>
        </div>
    `;
    navbarProfile.dataset.enhanced = '1';
    initProfileDropdown();
}

function initProfileDropdown() {
    const profile = document.getElementById('navbar-profile');
    const trigger = document.getElementById('navbar-profile-trigger');
    if (!profile || !trigger || trigger.dataset.bound === '1') return;

    trigger.dataset.bound = '1';
    trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        const open = profile.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', function (e) {
        if (!profile.contains(e.target)) {
            profile.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
        }
    });
}

function updateProfileUser(data) {
    const displayName = data.name || data.email || 'Tài khoản';
    const nameEl = document.getElementById('navbar-profile-name');
    const headerName = document.getElementById('nav-profile-header-name');
    const headerEmail = document.getElementById('nav-profile-header-email');
    if (nameEl) nameEl.textContent = displayName;
    if (headerName) headerName.textContent = displayName;
    if (headerEmail) headerEmail.textContent = data.email || '';
}

function checkUserSession() {
    fetch('/api/current-user')
        .then(response => response.json())
        .then(data => {
            const signinBtn = document.getElementById('signin-btn');
            const navbarProfile = document.getElementById('navbar-profile');

            if (data.authenticated) {
                if (signinBtn) signinBtn.style.display = 'none';
                if (navbarProfile) {
                    buildProfileDropdown();
                    navbarProfile.style.display = 'flex';
                    updateProfileUser(data);
                }
            } else {
                if (signinBtn) signinBtn.style.display = 'block';
                if (navbarProfile) {
                    navbarProfile.style.display = 'none';
                    navbarProfile.classList.remove('is-open');
                }
            }
        })
        .catch(error => {
            console.error('Error checking user session:', error);
            const signinBtn = document.getElementById('signin-btn');
            if (signinBtn) signinBtn.style.display = 'block';
        });
}

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

let authMode = 'login';

function logout() {
    fetch('/logout', { method: 'GET' })
        .then(() => {
            window.location.href = '/';
        })
        .catch(error => console.error('Logout error:', error));
}

function ensureAuthFormLayout() {
    const form = document.getElementById('login-form');
    if (!form || form.dataset.layoutReady === '1') return;

    const title = form.querySelector('.login-popup-title');
    if (title && !document.getElementById('login-subtitle')) {
        const subtitle = document.createElement('p');
        subtitle.id = 'login-subtitle';
        subtitle.className = 'login-popup-subtitle';
        title.insertAdjacentElement('afterend', subtitle);
    }

    const passwordInput = document.getElementById('password-input');
    const inputs = form.querySelector('.login-popup-inputs');
    if (passwordInput && inputs && !passwordInput.closest('.login-password-wrap')) {
        const wrap = document.createElement('div');
        wrap.className = 'login-password-wrap';
        wrap.id = 'login-password-wrap';
        passwordInput.parentNode.insertBefore(wrap, passwordInput);
        wrap.appendChild(passwordInput);

        let forgot = document.getElementById('forgot-link');
        if (!forgot) {
            forgot = document.createElement('p');
            forgot.id = 'forgot-link';
            forgot.className = 'login-forgot-link';
            forgot.innerHTML = '<span onclick="showForgotMode()">Quên mật khẩu?</span>';
        }
        wrap.appendChild(forgot);
    }

    let devBox = document.getElementById('forgot-dev-link');
    if (!devBox) {
        devBox = document.createElement('p');
        devBox.id = 'forgot-dev-link';
        devBox.className = 'login-dev-link';
        form.appendChild(devBox);
    }

    const agreeWrap = form.querySelector('.login-popup-condition');
    const button = document.getElementById('login-button');
    const toggle = document.getElementById('login-toggle');
    if (button && agreeWrap) button.after(agreeWrap);
    if (agreeWrap && toggle) agreeWrap.after(toggle);
    if (toggle && devBox) toggle.after(devBox);

    form.dataset.layoutReady = '1';
}

function setLoginSubtitle(text) {
    const el = document.getElementById('login-subtitle');
    if (!el) return;
    el.textContent = text || '';
    el.style.display = text ? 'block' : 'none';
}

function showLoginPopup() {
    const popup = document.getElementById('login-popup');
    if (popup) {
        ensureAuthFormLayout();
        popup.style.display = 'flex';
        authMode = 'login';
        resetLoginForm();
        const emailInput = document.getElementById('email-input');
        if (emailInput) setTimeout(() => emailInput.focus(), 50);
    }
}

function closeLoginPopup() {
    const popup = document.getElementById('login-popup');
    if (popup) {
        popup.style.display = 'none';
    }
}

function resetLoginForm() {
    ensureAuthFormLayout();

    const nameInput = document.getElementById('name-input');
    const birthdayInput = document.getElementById('birthday-input');
    const passwordInput = document.getElementById('password-input');
    const passwordWrap = document.getElementById('login-password-wrap');
    const agreeWrap = document.querySelector('.login-popup-condition');
    const loginTitle = document.getElementById('login-title');
    const loginButton = document.getElementById('login-button');
    const loginToggle = document.getElementById('login-toggle');
    const forgotLink = document.getElementById('forgot-link');
    const devLink = document.getElementById('forgot-dev-link');

    if (nameInput) {
        nameInput.style.display = 'none';
        nameInput.value = '';
        nameInput.required = false;
    }
    if (birthdayInput) {
        birthdayInput.style.display = 'none';
        birthdayInput.value = '';
    }
    if (passwordWrap) passwordWrap.style.display = 'flex';
    if (passwordInput) {
        passwordInput.style.display = 'block';
        passwordInput.value = '';
        passwordInput.required = true;
    }
    if (agreeWrap) {
        agreeWrap.classList.remove('is-visible');
        agreeWrap.style.display = 'none';
    }
    if (forgotLink) forgotLink.style.display = 'block';
    if (devLink) {
        devLink.classList.remove('is-visible');
        devLink.style.display = 'none';
        devLink.innerHTML = '';
    }

    loginTitle.textContent = 'Đăng nhập';
    loginButton.textContent = 'Đăng nhập';
    setLoginSubtitle('Chào mừng bạn quay lại Sugar Petals');
    loginToggle.innerHTML = 'Chưa có tài khoản? <span onclick="toggleLoginMode()">Đăng ký ngay</span>';

    const emailInput = document.getElementById('email-input');
    if (emailInput) emailInput.value = '';
    const agreeCheckbox = document.getElementById('agree-checkbox');
    if (agreeCheckbox) {
        agreeCheckbox.checked = false;
        agreeCheckbox.required = false;
    }
    authMode = 'login';
}

function showForgotMode() {
    authMode = 'forgot';
    ensureAuthFormLayout();

    const nameInput = document.getElementById('name-input');
    const birthdayInput = document.getElementById('birthday-input');
    const passwordInput = document.getElementById('password-input');
    const passwordWrap = document.getElementById('login-password-wrap');
    const agreeWrap = document.querySelector('.login-popup-condition');
    const loginTitle = document.getElementById('login-title');
    const loginButton = document.getElementById('login-button');
    const loginToggle = document.getElementById('login-toggle');
    const forgotLink = document.getElementById('forgot-link');
    const agreeCheckbox = document.getElementById('agree-checkbox');
    const devLink = document.getElementById('forgot-dev-link');

    if (nameInput) {
        nameInput.style.display = 'none';
        nameInput.required = false;
    }
    if (birthdayInput) birthdayInput.style.display = 'none';
    if (passwordWrap) passwordWrap.style.display = 'none';
    if (passwordInput) {
        passwordInput.style.display = 'none';
        passwordInput.required = false;
        passwordInput.value = '';
    }
    if (agreeWrap) {
        agreeWrap.classList.remove('is-visible');
        agreeWrap.style.display = 'none';
    }
    if (forgotLink) forgotLink.style.display = 'none';
    if (agreeCheckbox) agreeCheckbox.required = false;
    if (devLink) {
        devLink.classList.remove('is-visible');
        devLink.style.display = 'none';
        devLink.innerHTML = '';
    }

    loginTitle.textContent = 'Quên mật khẩu';
    loginButton.textContent = 'Gửi link đặt lại';
    setLoginSubtitle('Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.');
    loginToggle.innerHTML = 'Nhớ mật khẩu? <span onclick="backToLoginMode()">Quay lại đăng nhập</span>';
}

function backToLoginMode() {
    authMode = 'login';
    resetLoginForm();
}

function toggleLoginMode() {
    if (authMode === 'forgot') {
        backToLoginMode();
        return;
    }

    authMode = authMode === 'login' ? 'register' : 'login';
    ensureAuthFormLayout();

    const nameInput = document.getElementById('name-input');
    const birthdayInput = document.getElementById('birthday-input');
    const passwordInput = document.getElementById('password-input');
    const passwordWrap = document.getElementById('login-password-wrap');
    const agreeWrap = document.querySelector('.login-popup-condition');
    const loginTitle = document.getElementById('login-title');
    const loginButton = document.getElementById('login-button');
    const loginToggle = document.getElementById('login-toggle');
    const forgotLink = document.getElementById('forgot-link');
    const agreeCheckbox = document.getElementById('agree-checkbox');
    const devLink = document.getElementById('forgot-dev-link');

    if (passwordWrap) passwordWrap.style.display = 'flex';
    if (passwordInput) {
        passwordInput.style.display = 'block';
        passwordInput.required = true;
        passwordInput.value = '';
    }
    if (devLink) {
        devLink.classList.remove('is-visible');
        devLink.style.display = 'none';
        devLink.innerHTML = '';
    }

    if (authMode === 'login') {
        nameInput.style.display = 'none';
        nameInput.value = '';
        nameInput.required = false;
        birthdayInput.style.display = 'none';
        birthdayInput.value = '';
        if (agreeWrap) {
            agreeWrap.classList.remove('is-visible');
            agreeWrap.style.display = 'none';
        }
        if (agreeCheckbox) {
            agreeCheckbox.checked = false;
            agreeCheckbox.required = false;
        }
        loginTitle.textContent = 'Đăng nhập';
        loginButton.textContent = 'Đăng nhập';
        setLoginSubtitle('Chào mừng bạn quay lại Sugar Petals');
        loginToggle.innerHTML = 'Chưa có tài khoản? <span onclick="toggleLoginMode()">Đăng ký ngay</span>';
        if (forgotLink) forgotLink.style.display = 'block';
    } else {
        nameInput.style.display = 'block';
        nameInput.value = '';
        nameInput.required = true;
        birthdayInput.style.display = 'block';
        birthdayInput.value = '';
        if (agreeWrap) {
            agreeWrap.classList.add('is-visible');
            agreeWrap.style.display = 'flex';
        }
        if (agreeCheckbox) {
            agreeCheckbox.checked = false;
            agreeCheckbox.required = true;
        }
        loginTitle.textContent = 'Tạo tài khoản';
        loginButton.textContent = 'Đăng ký';
        setLoginSubtitle('Đăng ký để đặt bánh và theo dõi đơn hàng dễ dàng.');
        loginToggle.innerHTML = 'Đã có tài khoản? <span onclick="toggleLoginMode()">Đăng nhập</span>';
        if (forgotLink) forgotLink.style.display = 'none';
    }
}

async function submitForgotPassword(email) {
    const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
        notify.error(data.message || 'Không gửi được yêu cầu');
        return;
    }

    notify.success(data.message || 'Đã gửi hướng dẫn đặt lại mật khẩu');

    const devLink = document.getElementById('forgot-dev-link');
    if (data.resetLink && devLink) {
        devLink.classList.add('is-visible');
        devLink.style.display = 'block';
        devLink.innerHTML = `Link đặt lại (dev): <a href="${data.resetLink}">Mở trang đặt lại mật khẩu</a>`;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    ensureAuthFormLayout();

    const popup = document.getElementById('login-popup');
    if (popup) {
        popup.addEventListener('click', function (e) {
            if (e.target === popup) closeLoginPopup();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLoginPopup();
    });

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const nameInput = document.getElementById('name-input');
            const emailInput = document.getElementById('email-input');
            const passwordInput = document.getElementById('password-input');
            const agreeCheckbox = document.getElementById('agree-checkbox');

            if (authMode === 'forgot') {
                if (!emailInput.value.trim()) {
                    notify.warning('Vui lòng nhập email');
                    return;
                }
                const btn = document.getElementById('login-button');
                if (btn) {
                    btn.disabled = true;
                    btn.textContent = 'Đang gửi...';
                }
                submitForgotPassword(emailInput.value.trim())
                    .finally(() => {
                        if (btn) {
                            btn.disabled = false;
                            btn.textContent = 'Gửi link đặt lại';
                        }
                    });
                return;
            }

            if (authMode === 'register' && !agreeCheckbox.checked) {
                notify.warning('Vui lòng đồng ý với điều khoản dịch vụ');
                return;
            }

            const formData = new FormData();
            formData.append('email', emailInput.value);
            formData.append('password', passwordInput.value);

            const endpoint = authMode === 'login' ? '/login' : '/register';

            if (authMode === 'register') {
                if (!nameInput.value.trim()) {
                    notify.warning('Vui lòng nhập tên của bạn');
                    return;
                }
                formData.append('name', nameInput.value);

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
                        if (authMode === 'login') {
                            closeLoginPopup();
                            checkUserSession();
                            loginForm.reset();
                            resetLoginForm();
                        } else {
                            notify.success('Đăng ký thành công! Vui lòng đăng nhập.');
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
                        notify.error(message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    notify.error('Có lỗi xảy ra. Vui lòng thử lại.');
                });
        });
    }

    checkUserSession();
    loadNavCategories();
    initMobileNav();
});

function initMobileNav() {
    const navbar = document.querySelector('.navbar');
    if (!navbar || navbar.querySelector('.nav-toggle')) return;

    const toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('type', 'button');
    toggle.setAttribute('aria-label', 'Mở menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    navbar.appendChild(toggle);

    toggle.addEventListener('click', function () {
        const isOpen = navbar.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    const menu = navbar.querySelector('.navbar-menu');
    if (menu) {
        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navbar.classList.remove('nav-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            navbar.classList.remove('nav-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

window.showLoginPopup = showLoginPopup;
window.closeLoginPopup = closeLoginPopup;
window.toggleLoginMode = toggleLoginMode;
window.showForgotMode = showForgotMode;
window.backToLoginMode = backToLoginMode;
window.logout = logout;
