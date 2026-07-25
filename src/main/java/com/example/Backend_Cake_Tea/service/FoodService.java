package com.example.Backend_Cake_Tea.service;

import com.example.Backend_Cake_Tea.model.Food;
import com.example.Backend_Cake_Tea.model.Order;
import com.example.Backend_Cake_Tea.repository.FoodRepository;
import com.example.Backend_Cake_Tea.repository.OrderRepository;
import com.example.Backend_Cake_Tea.util.SlugUtils;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FoodService {

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public List<Food> getAllFood() {
        return foodRepository.findAll();
    }

    /**
     * Phân trang sản phẩm. Người dùng tự chọn số sản phẩm hiển thị trong 1 trang (size).
     *
     * @param page số thứ tự trang, bắt đầu từ 0
     * @param size số sản phẩm hiển thị trong 1 trang (do người dùng chọn)
     * @return một trang (Page) chứa danh sách sản phẩm và thông tin phân trang
     */
    public Page<Food> getFoodPage(int page, int size) {
        if (page < 0) {
            page = 0;
        }
        if (size < 1) {
            size = 8;
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        return foodRepository.findAll(pageable);
    }

    public List<Food> searchFoodByName(String name) {
        return foodRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Food> getFoodByCategory(String category) {
        return foodRepository.findByCategory(category);
    }

    public Food getFoodById(Long id) {
        return foodRepository.findById(id).orElse(null);
    }

    public Food getFoodBySlug(String slug) {
        if (slug == null || slug.isBlank()) {
            return null;
        }
        return foodRepository.findBySlug(slug.trim());
    }

    /** Sản phẩm mới nhất (Hot) */
    public List<Food> getHotFood(int limit) {
        Pageable pageable = PageRequest.of(0, Math.max(1, limit), Sort.by(Sort.Direction.DESC, "createdAt"));
        return foodRepository.findAll(pageable).getContent();
    }

    /** Bán chạy theo số lượng đã bán từ đơn hàng (trừ Cancelled) */
    public List<Food> getBestSellers(int limit) {
        int size = Math.max(1, limit);
        Map<Long, Integer> soldByProduct = new HashMap<>();

        List<Order> orders = orderRepository.findAll();
        for (Order order : orders) {
            if (order.getStatus() != null && "Cancelled".equalsIgnoreCase(order.getStatus())) {
                continue;
            }
            List<Map<String, Object>> products = extractProducts(order.getItems());
            for (Map<String, Object> p : products) {
                Long productId = toLong(p.get("productId"));
                if (productId == null) productId = toLong(p.get("id"));
                int qty = toInt(p.get("quantity"), 1);
                if (productId != null) {
                    soldByProduct.merge(productId, qty, Integer::sum);
                }
            }
        }

        if (soldByProduct.isEmpty()) {
            Pageable pageable = PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            return foodRepository.findAll(pageable).getContent();
        }

        List<Map.Entry<Long, Integer>> ranked = new ArrayList<>(soldByProduct.entrySet());
        ranked.sort(Map.Entry.<Long, Integer>comparingByValue(Comparator.reverseOrder()));

        List<Food> result = new ArrayList<>();
        for (Map.Entry<Long, Integer> entry : ranked) {
            if (result.size() >= size) break;
            foodRepository.findById(entry.getKey()).ifPresent(result::add);
        }

        if (result.size() < size) {
            for (Food food : foodRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))) {
                if (result.size() >= size) break;
                boolean exists = result.stream().anyMatch(f -> f.getId().equals(food.getId()));
                if (!exists) result.add(food);
            }
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractProducts(String itemsJson) {
        if (itemsJson == null || itemsJson.isBlank()) return List.of();
        try {
            Map<String, Object> root = objectMapper.readValue(itemsJson, new TypeReference<>() {});
            Object products = root.get("products");
            if (products instanceof List<?> list) {
                List<Map<String, Object>> out = new ArrayList<>();
                for (Object o : list) {
                    if (o instanceof Map<?, ?> m) {
                        out.add((Map<String, Object>) m);
                    }
                }
                return out;
            }
        } catch (Exception ignored) {
            try {
                return objectMapper.readValue(itemsJson, new TypeReference<List<Map<String, Object>>>() {});
            } catch (Exception e) {
                return List.of();
            }
        }
        return List.of();
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.longValue();
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception e) {
            return null;
        }
    }

    private int toInt(Object value, int fallback) {
        if (value == null) return fallback;
        if (value instanceof Number n) return n.intValue();
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (Exception e) {
            return fallback;
        }
    }

    public Food create(Food food) {
        food.setSlug(resolveSlug(food.getSlug(), food.getName(), null));
        return foodRepository.save(food);
    }

    public Food update(Long id, Food updated) {
        Food existing = foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm id=" + id));
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setImage(updated.getImage());
        existing.setCategory(updated.getCategory());
        existing.setSlug(resolveSlug(updated.getSlug(), updated.getName(), id));
        return foodRepository.save(existing);
    }

    public void delete(Long id) {
        foodRepository.deleteById(id);
    }

    private String resolveSlug(String rawSlug, String name, Long excludeId) {
        String base = (rawSlug != null && !rawSlug.isBlank())
                ? SlugUtils.toSlug(rawSlug)
                : SlugUtils.toSlug(name);
        if (base.isBlank()) {
            base = "product";
        }
        String candidate = base;
        int i = 2;
        while (isSlugTaken(candidate, excludeId)) {
            candidate = base + "-" + i++;
        }
        return candidate;
    }

    private boolean isSlugTaken(String slug, Long excludeId) {
        if (excludeId == null) {
            return foodRepository.existsBySlug(slug);
        }
        return foodRepository.existsBySlugAndIdNot(slug, excludeId);
    }
}
