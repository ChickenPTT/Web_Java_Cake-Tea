package com.example.Backend_Cake_Tea.controller.user;


import com.example.Backend_Cake_Tea.model.CartItem;
import com.example.Backend_Cake_Tea.model.Food;
import com.example.Backend_Cake_Tea.service.FoodService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class CartController {
    @Autowired
    private FoodService foodService;

    @GetMapping("/cart.html")
    public String viewCart(HttpSession httpSession, Model model) {
        return "User/cart";
    }

    // API endpoints for cart operations
    @GetMapping("/api/cart")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCart(HttpSession session) {
        Map<Long, CartItem> cart = (Map<Long, CartItem>) session.getAttribute("cart");
        if (cart == null) {
            cart = new HashMap<>();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("cartItems", cart.values());
        response.put("total", cart.values().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity()).sum());
        response.put("count", cart.values().stream().mapToInt(CartItem::getQuantity).sum());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/cart/add/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> addToCart(@PathVariable Long id, HttpSession session) {
        Map<Long, CartItem> cart = (Map<Long, CartItem>) session.getAttribute("cart");
        if (cart == null) {
            cart = new HashMap<>();
        }
        
        Food food = foodService.getFoodById(id);
        if (food != null) {
            if (cart.containsKey(id)) {
                CartItem item = cart.get(id);
                item.setQuantity(item.getQuantity() + 1);
                item.setTotal((int) (item.getPrice() * item.getQuantity()));
            } else {
                cart.put(id, new CartItem(id, food.getName(), food.getImage(), food.getPrice(), 1));
            }
        }
        
        session.setAttribute("cart", cart);
        Map<String, Object> response = new HashMap<>();
        response.put("cartItems", cart.values());
        response.put("total", cart.values().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity()).sum());
        response.put("count", cart.values().stream().mapToInt(CartItem::getQuantity).sum());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/cart/remove/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> removeFromCart(@PathVariable Long id, HttpSession session) {
        Map<Long, CartItem> cart = (Map<Long, CartItem>) session.getAttribute("cart");
        if (cart == null) {
            cart = new HashMap<>();
        }
        
        cart.remove(id);
        session.setAttribute("cart", cart);
        
        Map<String, Object> response = new HashMap<>();
        response.put("cartItems", cart.values());
        response.put("total", cart.values().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity()).sum());
        response.put("count", cart.values().stream().mapToInt(CartItem::getQuantity).sum());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/cart/update/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateCartQuantity(@PathVariable Long id, @RequestParam int quantity, HttpSession session) {
        Map<Long, CartItem> cart = (Map<Long, CartItem>) session.getAttribute("cart");
        if (cart == null) {
            cart = new HashMap<>();
        }
        
        if (cart.containsKey(id) && quantity > 0) {
            CartItem item = cart.get(id);
            item.setQuantity(quantity);
            item.setTotal((int) (item.getPrice() * item.getQuantity()));
        } else if (quantity <= 0) {
            cart.remove(id);
        }
        
        session.setAttribute("cart", cart);
        
        Map<String, Object> response = new HashMap<>();
        response.put("cartItems", cart.values());
        response.put("total", cart.values().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity()).sum());
        response.put("count", cart.values().stream().mapToInt(CartItem::getQuantity).sum());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/cart/clear")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> clearCart(HttpSession session) {
        session.removeAttribute("cart");
        
        Map<String, Object> response = new HashMap<>();
        response.put("cartItems", new HashMap<>().values());
        response.put("total", 0);
        response.put("count", 0);
        
        return ResponseEntity.ok(response);
    }
}