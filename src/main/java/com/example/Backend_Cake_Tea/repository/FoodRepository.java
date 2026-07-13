package com.example.Backend_Cake_Tea.repository;

import com.example.Backend_Cake_Tea.model.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {
    
    List<Food> findByNameContainingIgnoreCase(String name);
    
    List<Food> findByCategory(String category);
}
