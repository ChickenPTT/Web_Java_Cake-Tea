package com.example.Backend_Cake_Tea.controller.user;

import com.example.Backend_Cake_Tea.model.CartItem;
import com.example.Backend_Cake_Tea.model.Order;
import com.example.Backend_Cake_Tea.model.User;
import com.example.Backend_Cake_Tea.service.OrderService;
import com.example.Backend_Cake_Tea.service.PromotionService;
import com.example.Backend_Cake_Tea.service.UserService;
import tools.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;
    private final PromotionService promotionService;
    private final ObjectMapper objectMapper;

    public OrderController(OrderService orderService,
                           UserService userService,
                           PromotionService promotionService,
                           ObjectMapper objectMapper) {
        this.orderService = orderService;
        this.userService = userService;
        this.promotionService = promotionService;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> createOrder(@RequestBody Order order, HttpSession session) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = null;

            if (auth != null && auth.isAuthenticated() && !(auth.getPrincipal() instanceof String && auth.getPrincipal().equals("anonymousUser"))) {
                Object principal = auth.getPrincipal();
                if (principal instanceof UserDetails) {
                    String email = ((UserDetails) principal).getUsername();
                    user = userService.findByEmail(email).orElse(null);
                }
            }

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("success", false, "message", "Vui lòng đăng nhập để đặt hàng")
                );
            }

            Map<Long, CartItem> cart = (Map<Long, CartItem>) session.getAttribute("cart");
            if (cart == null || cart.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Giỏ hàng đang trống")
                );
            }

            String promoCode = (String) session.getAttribute("promoCode");
            Long comboId = (Long) session.getAttribute("appliedComboId");
            Map<String, Object> pricing = promotionService.quote(cart.values(), promoCode, user, comboId);
            double totalAmount = ((Number) pricing.get("total")).doubleValue();

            Map<String, Object> itemsPayload = new HashMap<>();
            try {
                if (order.getItems() != null && !order.getItems().isBlank()) {
                    itemsPayload = objectMapper.readValue(order.getItems(), Map.class);
                }
            } catch (Exception ignored) {
                itemsPayload = new HashMap<>();
            }
            itemsPayload.put("products", cart.values());
            itemsPayload.put("pricing", pricing);

            order.setUserId(user.getId());
            order.setUserEmail(user.getEmail());
            order.setUserName(user.getName());
            order.setAmount(totalAmount);
            order.setItems(objectMapper.writeValueAsString(itemsPayload));
            if (order.getPaymentMethod() == null) order.setPaymentMethod("COD");
            if (order.getPaymentStatus() == null) order.setPaymentStatus("Pending");
            if (order.getStatus() == null) order.setStatus("Pending");

            Order createdOrder = orderService.createOrder(order);

            session.removeAttribute("cart");
            session.removeAttribute("promoCode");
            session.removeAttribute("appliedComboId");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", createdOrder.getId());
            response.put("message", "Order placed successfully");
            response.put("amount", totalAmount);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("success", false, "message", "Error creating order: " + e.getMessage())
            );
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        try {
            Order order = orderService.getOrderById(id);
            if (order != null) {
                return ResponseEntity.ok(order);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("success", false, "message", "Order not found")
                );
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("success", false, "message", "Error fetching order")
            );
        }
    }

    @GetMapping("/user/current")
    public ResponseEntity<?> getCurrentUserOrders() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if (auth != null && auth.isAuthenticated() && !(auth.getPrincipal() instanceof String && auth.getPrincipal().equals("anonymousUser"))) {
                Object principal = auth.getPrincipal();
                if (principal instanceof UserDetails) {
                    String email = ((UserDetails) principal).getUsername();
                    List<Order> orders = orderService.getOrdersByUserEmail(email);
                    return ResponseEntity.ok(orders);
                }
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("success", false, "message", "Not authenticated")
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("success", false, "message", "Error fetching orders")
            );
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            Order updatedOrder = orderService.updateOrderStatus(id, status);

            if (updatedOrder != null) {
                return ResponseEntity.ok(
                    Map.of("success", true, "message", "Order status updated", "order", updatedOrder)
                );
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("success", false, "message", "Order not found")
                );
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("success", false, "message", "Error updating order")
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Order deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("success", false, "message", "Error deleting order")
            );
        }
    }
}
