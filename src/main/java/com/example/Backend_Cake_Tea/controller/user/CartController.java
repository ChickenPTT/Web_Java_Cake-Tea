package com.example.Backend_Cake_Tea.controller.user;

import com.example.Backend_Cake_Tea.model.CartItem;
import com.example.Backend_Cake_Tea.model.Combo;
import com.example.Backend_Cake_Tea.model.ComboItem;
import com.example.Backend_Cake_Tea.model.Food;
import com.example.Backend_Cake_Tea.model.User;
import com.example.Backend_Cake_Tea.service.FoodService;
import com.example.Backend_Cake_Tea.service.PromotionService;
import com.example.Backend_Cake_Tea.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class CartController {

    private final FoodService foodService;
    private final PromotionService promotionService;
    private final UserService userService;

    public CartController(FoodService foodService,
                          PromotionService promotionService,
                          UserService userService) {
        this.foodService = foodService;
        this.promotionService = promotionService;
        this.userService = userService;
    }

    @GetMapping("/cart.html")
    public String viewCart(HttpSession httpSession, Model model) {
        return "User/cart";
    }

    @GetMapping("/api/cart")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCart(HttpSession session) {
        return ResponseEntity.ok(buildCartResponse(session));
    }

    @PostMapping("/api/cart/add/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> addToCart(@PathVariable Long id, HttpSession session) {
        Map<Long, CartItem> cart = getOrCreateCart(session);
        Food food = foodService.getFoodById(id);
        if (food != null) {
            if (cart.containsKey(id)) {
                CartItem item = cart.get(id);
                item.setQuantity(item.getQuantity() + 1);
                item.setTotal((int) (item.getPrice() * item.getQuantity()));
            } else {
                cart.put(id, new CartItem(
                        id,
                        food.getName(),
                        food.getImage(),
                        food.getCategory(),
                        food.getPrice(),
                        1
                ));
            }
        }
        session.setAttribute("cart", cart);
        return ResponseEntity.ok(buildCartResponse(session));
    }

    @PostMapping("/api/cart/add-combo/{id}")
    @ResponseBody
    public ResponseEntity<?> addCombo(@PathVariable Long id, HttpSession session) {
        Combo combo = promotionService.getActiveCombos().stream()
                .filter(c -> c.getId().equals(id))
                .findFirst()
                .orElse(null);
        if (combo == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Combo không khả dụng"));
        }

        Map<Long, CartItem> cart = getOrCreateCart(session);
        for (ComboItem ci : combo.getItems()) {
            if (ci.getFood() == null) continue;
            Food food = ci.getFood();
            int addQty = Math.max(1, ci.getQuantity() != null ? ci.getQuantity() : 1);
            if (cart.containsKey(food.getId())) {
                CartItem item = cart.get(food.getId());
                item.setQuantity(item.getQuantity() + addQty);
                item.setTotal((int) (item.getPrice() * item.getQuantity()));
            } else {
                cart.put(food.getId(), new CartItem(
                        food.getId(),
                        food.getName(),
                        food.getImage(),
                        food.getCategory(),
                        food.getPrice(),
                        addQty
                ));
            }
        }
        session.setAttribute("cart", cart);
        session.setAttribute("appliedComboId", combo.getId());
        Map<String, Object> response = buildCartResponse(session);
        double savings = ((Number) response.getOrDefault("comboSavings", 0)).doubleValue();
        response.put("success", true);
        if (savings > 0) {
            response.put("message", "Đã thêm combo \"" + combo.getName() + "\". Tiết kiệm "
                    + String.format(java.util.Locale.US, "%.0f", savings)
                    + "đ (xem ở Tổng giỏ hàng).");
        } else {
            double retail = combo.getItems().stream()
                    .filter(ci -> ci.getFood() != null && ci.getFood().getPrice() != null)
                    .mapToDouble(ci -> ci.getFood().getPrice() * Math.max(1, ci.getQuantity() != null ? ci.getQuantity() : 1))
                    .sum();
            response.put("message", "Đã thêm món trong combo. Lưu ý: giá combo ("
                    + String.format(java.util.Locale.US, "%.0f", combo.getComboPrice() != null ? combo.getComboPrice() : 0)
                    + "đ) cần thấp hơn tổng giá lẻ ("
                    + String.format(java.util.Locale.US, "%.0f", retail)
                    + "đ) thì mới được giảm.");
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/cart/apply-promo")
    @ResponseBody
    public ResponseEntity<?> applyPromo(@RequestBody Map<String, String> body, HttpSession session) {
        String code = body != null ? body.get("code") : null;
        if (code == null || code.isBlank()) {
            session.removeAttribute("promoCode");
            Map<String, Object> response = buildCartResponse(session);
            response.put("success", true);
            response.put("message", "Đã xóa mã khuyến mãi");
            return ResponseEntity.ok(response);
        }

        String normalized = code.trim().toUpperCase();
        Map<Long, CartItem> cart = getOrCreateCart(session);
        Long comboId = (Long) session.getAttribute("appliedComboId");
        Map<String, Object> preview = promotionService.quote(cart.values(), normalized, currentUser(), comboId);
        double discount = ((Number) preview.getOrDefault("discount", 0)).doubleValue();
        if (discount <= 0) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Mã không hợp lệ hoặc chưa đủ điều kiện (vd: BIRTHDAY10 chỉ dùng trong ngày sinh nhật)"
            ));
        }

        session.setAttribute("promoCode", normalized);
        Map<String, Object> response = buildCartResponse(session);
        response.put("success", true);
        response.put("message", "Áp dụng mã thành công");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/cart/remove/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> removeFromCart(@PathVariable Long id, HttpSession session) {
        Map<Long, CartItem> cart = getOrCreateCart(session);
        cart.remove(id);
        session.setAttribute("cart", cart);
        return ResponseEntity.ok(buildCartResponse(session));
    }

    @PostMapping("/api/cart/update/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateCartQuantity(@PathVariable Long id,
                                                                  @RequestParam int quantity,
                                                                  HttpSession session) {
        Map<Long, CartItem> cart = getOrCreateCart(session);
        if (cart.containsKey(id) && quantity > 0) {
            CartItem item = cart.get(id);
            item.setQuantity(quantity);
            item.setTotal((int) (item.getPrice() * item.getQuantity()));
        } else if (quantity <= 0) {
            cart.remove(id);
        }
        session.setAttribute("cart", cart);
        return ResponseEntity.ok(buildCartResponse(session));
    }

    @PostMapping("/api/cart/clear")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> clearCart(HttpSession session) {
        session.removeAttribute("cart");
        session.removeAttribute("promoCode");
        session.removeAttribute("appliedComboId");
        return ResponseEntity.ok(buildCartResponse(session));
    }

    @SuppressWarnings("unchecked")
    private Map<Long, CartItem> getOrCreateCart(HttpSession session) {
        Map<Long, CartItem> cart = (Map<Long, CartItem>) session.getAttribute("cart");
        if (cart == null) {
            cart = new HashMap<>();
        }
        return cart;
    }

    private Map<String, Object> buildCartResponse(HttpSession session) {
        Map<Long, CartItem> cart = getOrCreateCart(session);
        String promoCode = (String) session.getAttribute("promoCode");
        Object rawComboId = session.getAttribute("appliedComboId");
        Long comboId = rawComboId instanceof Number n ? n.longValue() : null;
        User user = currentUser();

        Map<String, Object> pricing = promotionService.quote(cart.values(), promoCode, user, comboId);

        // Nếu combo không còn hợp lệ (thiếu món / hết hạn) thì gỡ khỏi session
        Object effectiveCombo = pricing.get("appliedComboId");
        if (effectiveCombo == null) {
            session.removeAttribute("appliedComboId");
        } else {
            session.setAttribute("appliedComboId", ((Number) effectiveCombo).longValue());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("cartItems", cart.values());
        response.put("count", cart.values().stream().mapToInt(CartItem::getQuantity).sum());
        response.put("subtotal", pricing.get("subtotal"));
        response.put("discount", pricing.get("discount"));
        response.put("discountLabel", pricing.get("discountLabel"));
        response.put("deliveryFee", pricing.get("deliveryFee"));
        response.put("total", pricing.get("total"));
        response.put("promoCode", pricing.get("promoCode"));
        response.put("appliedComboId", pricing.get("appliedComboId"));
        response.put("comboName", pricing.get("comboName"));
        response.put("comboSavings", pricing.get("comboSavings"));
        return response;
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() instanceof String) {
            return null;
        }
        if (auth.getPrincipal() instanceof UserDetails details) {
            return userService.findByEmail(details.getUsername()).orElse(null);
        }
        return null;
    }
}
