package com.example.Backend_Cake_Tea.controller.admin;

import com.example.Backend_Cake_Tea.model.User;
import com.example.Backend_Cake_Tea.service.CustomerCareService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/customers")
public class CustomerAdminController {

    private final CustomerCareService customerCareService;

    public CustomerAdminController(CustomerCareService customerCareService) {
        this.customerCareService = customerCareService;
    }

    @GetMapping
    public List<User> getAll() {
        return customerCareService.getAllCustomers();
    }

    @GetMapping("/birthdays-today")
    public List<User> getBirthdaysToday() {
        return customerCareService.getBirthdayCustomersToday();
    }

    @PostMapping("/{id}/send-birthday-email")
    public ResponseEntity<Map<String, String>> sendBirthdayEmail(@PathVariable Long id) {
        customerCareService.sendBirthdayEmail(id);
        return ResponseEntity.ok(Map.of("message", "Đã gửi email chúc mừng sinh nhật"));
    }
}
