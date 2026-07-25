package com.example.Backend_Cake_Tea.controller.user;

import com.example.Backend_Cake_Tea.model.Food;
import com.example.Backend_Cake_Tea.model.Menu;
import com.example.Backend_Cake_Tea.model.User;
import com.example.Backend_Cake_Tea.service.FoodService;
import com.example.Backend_Cake_Tea.service.MenuService;
import com.example.Backend_Cake_Tea.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;
import java.util.Map;

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

    @GetMapping("/product/{slug}")
    public String productBySlug(@PathVariable String slug, Model model) {
        model.addAttribute("productSlug", slug);
        Food food = foodService.getFoodBySlug(slug);
        if (food != null) {
            model.addAttribute("pageTitle", food.getName() + " - Sugar Petals");
            if (food.getDescription() != null && !food.getDescription().isBlank()) {
                model.addAttribute("pageDescription", food.getDescription());
            }
        }
        return "User/product";
    }

    @GetMapping("/product.html")
    public Object productDetailLegacy(
            @RequestParam(required = false) String slug,
            @RequestParam(required = false) Long id) {
        if (slug != null && !slug.isBlank()) {
            return permanentRedirect("/product/" + slug.trim());
        }
        if (id != null) {
            Food food = foodService.getFoodById(id);
            if (food != null && food.getSlug() != null && !food.getSlug().isBlank()) {
                return permanentRedirect("/product/" + food.getSlug());
            }
        }
        return "User/product";
    }

    private RedirectView permanentRedirect(String path) {
        RedirectView view = new RedirectView(path, true);
        view.setStatusCode(HttpStatus.MOVED_PERMANENTLY);
        return view;
    }

    @GetMapping("/myorders.html")
    public String myOrders() {
        return "User/myorders";
    }

    @GetMapping("/contact.html")
    public String contact() {
        return "User/contact";
    }

    @GetMapping("/menu.html")
    public String menu() {
        return "User/menu";
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestParam("email") String email,
                                      @RequestParam("password") String password,
                                      @RequestParam("name") String name,
                                      @RequestParam(value = "birthday", required = false) String birthday) {

        try {
            User.UserBuilder userBuilder = User.builder()
                    .email(email)
                    .password(password)
                    .name(name);

            if (birthday != null && !birthday.isEmpty()) {
                try {
                    java.time.LocalDate birthdayDate = java.time.LocalDate.parse(birthday);
                    userBuilder.birthday(birthdayDate);
                } catch (Exception e) {
                    throw new IllegalArgumentException("Lỗi định dạng ngày sinh: yyyy-MM-dd");
                }
            }

            User user = userBuilder.build();
            userService.registerUser(user);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đăng ký thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/api/food")
    @ResponseBody
    public ResponseEntity<List<Food>> getAllFood() {
        List<Food> foods = foodService.getAllFood();
        return ResponseEntity.ok(foods);
    }

    @GetMapping("/api/food/hot")
    @ResponseBody
    public ResponseEntity<List<Food>> getHotFood(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(foodService.getHotFood(limit));
    }

    @GetMapping("/api/food/bestsellers")
    @ResponseBody
    public ResponseEntity<List<Food>> getBestSellers(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(foodService.getBestSellers(limit));
    }

    @GetMapping("/api/food/search")
    @ResponseBody
    public ResponseEntity<List<Food>> searchFood(@RequestParam String name) {
        List<Food> foods = foodService.searchFoodByName(name);
        return ResponseEntity.ok(foods);
    }

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

    @GetMapping("/api/food/{id:\\d+}")
    @ResponseBody
    public ResponseEntity<Food> getFoodById(@PathVariable Long id) {
        Food food = foodService.getFoodById(id);
        if (food == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(food);
    }

    @GetMapping("/api/food/slug/{slug}")
    @ResponseBody
    public ResponseEntity<Food> getFoodBySlug(@PathVariable String slug) {
        Food food = foodService.getFoodBySlug(slug);
        if (food == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(food);
    }

    @GetMapping("/api/food/category/{category}")
    @ResponseBody
    public ResponseEntity<List<Food>> getFoodByCategory(@PathVariable String category) {
        List<Food> foods = foodService.getFoodByCategory(category);
        return ResponseEntity.ok(foods);
    }

    @GetMapping("/api/menu")
    @ResponseBody
    public ResponseEntity<List<Menu>> getAllMenus() {
        List<Menu> menus = menuService.getAllMenus();
        return ResponseEntity.ok(menus);
    }

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
