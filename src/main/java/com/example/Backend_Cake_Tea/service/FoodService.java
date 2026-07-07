package com.example.Backend_Cake_Tea.service;

import com.example.Backend_Cake_Tea.model.Food;
import com.example.Backend_Cake_Tea.repository.FoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoodService {
    
    @Autowired
    private FoodRepository foodRepository;
    
    public List<Food> getAllFood() {
        return foodRepository.findAll();
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

    public Food create(Food food) {
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
        return foodRepository.save(existing);
    }

    public void delete(Long id) {
        foodRepository.deleteById(id);
    }
}
