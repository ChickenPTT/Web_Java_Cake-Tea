package com.example.Backend_Cake_Tea.security;

public final class SecurityPaths {

    private SecurityPaths() {}

    public static final String[] PUBLIC = {
            "/",
            "/index.html",
            "/cart.html",
            "/login",
            "/register",
            "/logout",
            "/admin/login",
            "/api/admin/auth/login",
            "/api/food/**",
            "/api/menu",
            "/api/cart/**",
            "/user/**",
            "/admin/extensions/**",
            "/admin/themes/**",
            "/admin/js/**",
            "/admin/assets/**",
            "/admin/css/**",
            "/uploads/**"
    };

    public static final String[] ADMIN = {
            "/admin/**",
            "/api/admin/**"
    };
}
