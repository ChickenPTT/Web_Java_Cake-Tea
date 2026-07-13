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
}
