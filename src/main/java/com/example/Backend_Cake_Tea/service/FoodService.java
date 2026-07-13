package com.example.Backend_Cake_Tea.service;

import com.example.Backend_Cake_Tea.model.Food;
import com.example.Backend_Cake_Tea.repository.FoodRepository;
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
        // Chặn giá trị không hợp lệ để tránh lỗi khi người dùng gửi tham số bất thường
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
}
