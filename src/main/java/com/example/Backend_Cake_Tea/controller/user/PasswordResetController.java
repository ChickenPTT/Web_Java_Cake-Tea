package com.example.Backend_Cake_Tea.controller.user;

import com.example.Backend_Cake_Tea.service.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @GetMapping("/reset-password")
    public String resetPasswordPage(@RequestParam(required = false) String token, Model model) {
        boolean valid = passwordResetService.isTokenValid(token);
        model.addAttribute("token", token);
        model.addAttribute("tokenValid", valid);
        return "User/reset-password";
    }

    @PostMapping("/api/auth/forgot-password")
    @ResponseBody
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        Map<String, Object> result = passwordResetService.requestReset(body.get("email"));
        boolean ok = Boolean.TRUE.equals(result.get("success"));
        return ok ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    @PostMapping("/api/auth/reset-password")
    @ResponseBody
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        Map<String, Object> result = passwordResetService.resetPassword(
                body.get("token"),
                body.get("password")
        );
        boolean ok = Boolean.TRUE.equals(result.get("success"));
        return ok ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }
}
