package com.example.Backend_Cake_Tea.service;

import com.example.Backend_Cake_Tea.model.Food;
import com.example.Backend_Cake_Tea.repository.FoodRepository;
import com.example.Backend_Cake_Tea.util.SlugUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoodService {

    @Autowired
    private FoodRepository foodRepository;

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

    /** Sản phẩm mới nhất (Hot) */
    public List<Food> getHotFood(int limit) {
        Pageable pageable = PageRequest.of(0, Math.max(1, limit), Sort.by(Sort.Direction.DESC, "createdAt"));
        return foodRepository.findAll(pageable).getContent();
    }

    /** Bán chạy — tạm thời lấy sản phẩm theo giá phổ biến / id; có thể thay bằng thống kê đơn hàng sau */
    public List<Food> getBestSellers(int limit) {
        Pageable pageable = PageRequest.of(0, Math.max(1, limit), Sort.by(Sort.Direction.ASC, "price"));
        return foodRepository.findAll(pageable).getContent();
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
