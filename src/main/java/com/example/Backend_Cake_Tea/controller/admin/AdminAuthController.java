package com.example.Backend_Cake_Tea.controller.admin;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.password:admin123}")
    private String adminPassword;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (adminUsername.equals(username) && adminPassword.equals(password)) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đăng nhập thành công"
            ));
        }
        return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Sai tên đăng nhập hoặc mật khẩu"
        ));
    }
}
