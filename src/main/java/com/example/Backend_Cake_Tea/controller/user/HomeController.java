package com.example.Backend_Cake_Tea.controller.user;

import com.example.Backend_Cake_Tea.model.Food;
import com.example.Backend_Cake_Tea.model.Menu;
import com.example.Backend_Cake_Tea.service.FoodService;
import com.example.Backend_Cake_Tea.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class HomeController {

    @Autowired
    private FoodService foodService;
    
    @Autowired
    private MenuService menuService;

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

}
