package com.example.Backend_Cake_Tea.controller.admin;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminPageController {

    @GetMapping({"", "/", "/index"})
    public String dashboard() {
        return "admin/index";
    }

    @GetMapping("/login")
    public String login() {
        return "admin/login";
    }

    @GetMapping("/categories")
    public String categories() {
        return "admin/categories";
    }

    @GetMapping("/categories/add")
    public String addCategory() {
        return "admin/category-form";
    }

    @GetMapping("/categories/edit/{id}")
    public String editCategory() {
        return "admin/category-form";
    }

    @GetMapping("/products")
    public String products() {
        return "admin/list";
    }

    @GetMapping("/products/add")
    public String addProduct() {
        return "admin/add";
    }

    @GetMapping("/products/edit/{id}")
    public String editProduct() {
        return "admin/add";
    }

    @GetMapping("/orders")
    public String orders() {
        return "admin/orders";
    }

    @GetMapping("/campaigns")
    public String campaigns() {
        return "admin/campaigns";
    }

    @GetMapping("/combos")
    public String combos() {
        return "admin/combos";
    }

    @GetMapping("/customers")
    public String customers() {
        return "admin/customers";
    }

    @GetMapping("/statistics")
    public String statistics() {
        return "admin/statistics";
    }
}
