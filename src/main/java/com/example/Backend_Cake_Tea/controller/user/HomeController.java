package com.example.Backend_Cake_Tea.controller.user;

import com.example.Backend_Cake_Tea.model.Food;
import com.example.Backend_Cake_Tea.model.Menu;
import com.example.Backend_Cake_Tea.model.User;
import com.example.Backend_Cake_Tea.service.FoodService;
import com.example.Backend_Cake_Tea.service.MenuService;
import com.example.Backend_Cake_Tea.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class HomeController {

    @Autowired
    private FoodService foodService;
    
    @Autowired
    private MenuService menuService;

    @Autowired
    private UserService userService;

    @GetMapping("/")
    public String home(){
        return "User/index";
    }

    @GetMapping("/index.html")
    public String index() {
        return "User/index";
    }

    @GetMapping("/order.html")
    public String order() {
        return "User/order";
    }

    @GetMapping("/myorders.html")
    public String myOrders() {
        return "User/myorders";
    }



    // Handle login
    @PostMapping("/login")
    public String login(@RequestParam("email") String email, 
                       @RequestParam("password") String password,
                       Model model) {
        User user = userService.loginUser(email, password);
        if (user != null) {
            return "redirect:/";
        } else {
            model.addAttribute("error", "Invalid email or password");
            return "User/login";
        }
    }

    // Logout
    @GetMapping("/logout")
    public String logout() {
        return "redirect:/";
    }


    // Handle registration
    @PostMapping("/register")
    public String register(@RequestParam("email") String email,
                         @RequestParam("password") String password,
                         @RequestParam("name") String name,
                         Model model) {
        try {
            User user = User.builder()
                    .email(email)
                    .password(password)
                    .name(name)
                    .build();
            userService.registerUser(user);
            return "redirect:/login";
        } catch (RuntimeException e) {
            model.addAttribute("error", e.getMessage());
            return "User/register";
        }
    }

    // API endpoints for food
    @GetMapping("/api/food")
    @ResponseBody
    public ResponseEntity<List<Food>> getAllFood() {
        List<Food> foods = foodService.getAllFood();
        return ResponseEntity.ok(foods);
    }

    @GetMapping("/api/food/search")
    @ResponseBody
    public ResponseEntity<List<Food>> searchFood(@RequestParam String name) {
        List<Food> foods = foodService.searchFoodByName(name);
        return ResponseEntity.ok(foods);
    }

    // Phân trang: người dùng tự chọn
    @GetMapping("/api/food/page")
    @ResponseBody
    public ResponseEntity<?> getFoodPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        var foodPage = foodService.getFoodPage(page, size);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("content", foodPage.getContent());
        response.put("currentPage", foodPage.getNumber());
        response.put("pageSize", foodPage.getSize());
        response.put("totalItems", foodPage.getTotalElements());
        response.put("totalPages", foodPage.getTotalPages());
        response.put("first", foodPage.isFirst());
        response.put("last", foodPage.isLast());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/food/category/{category}")
    @ResponseBody
    public ResponseEntity<List<Food>> getFoodByCategory(@PathVariable String category) {
        List<Food> foods = foodService.getFoodByCategory(category);
        return ResponseEntity.ok(foods);
    }

    // API endpoints for menu
    @GetMapping("/api/menu")
    @ResponseBody
    public ResponseEntity<List<Menu>> getAllMenus() {
        List<Menu> menus = menuService.getAllMenus();
        return ResponseEntity.ok(menus);
    }

    // Kiểm tra đã login ở các page khác
    @GetMapping("/api/current-user")
    @ResponseBody
    public ResponseEntity<?> getCurrentUser() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth.getPrincipal() instanceof String && auth.getPrincipal().equals("anonymousUser"))) {
            Object principal = auth.getPrincipal();
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                String email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
                var user = userService.findByEmail(email);
                if (user.isPresent()) {
                    java.util.Map<String, Object> response = new java.util.HashMap<>();
                    response.put("authenticated", true);
                    response.put("id", user.get().getId());
                    response.put("email", user.get().getEmail());
                    response.put("name", user.get().getName());
                    return ResponseEntity.ok(response);
                }
            }
        }
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("authenticated", false);
        return ResponseEntity.ok(response);
    }

}

