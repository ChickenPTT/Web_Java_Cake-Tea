package com.example.Backend_Cake_Tea.service;

import com.example.Backend_Cake_Tea.model.Combo;
import com.example.Backend_Cake_Tea.model.ComboItem;
import com.example.Backend_Cake_Tea.model.Food;
import com.example.Backend_Cake_Tea.repository.ComboRepository;
import com.example.Backend_Cake_Tea.repository.FoodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ComboService {

    private final ComboRepository comboRepository;
    private final FoodRepository foodRepository;

    public ComboService(ComboRepository comboRepository, FoodRepository foodRepository) {
        this.comboRepository = comboRepository;
        this.foodRepository = foodRepository;
    }

    public List<Combo> getAll() {
        return comboRepository.findAll();
    }

    public Combo getById(Long id) {
        return comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy combo id=" + id));
    }

    @Transactional
    public Combo create(Combo combo) {
        if (combo.getItems() != null) {
            combo.getItems().forEach(item -> item.setCombo(combo));
        }
        return comboRepository.save(combo);
    }

    @Transactional
    public Combo update(Long id, Combo updated) {
        Combo existing = getById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setComboPrice(updated.getComboPrice());
        existing.setStartDate(updated.getStartDate());
        existing.setEndDate(updated.getEndDate());
        existing.setActive(updated.getActive());

        existing.getItems().clear();
        if (updated.getItems() != null) {
            for (ComboItem item : updated.getItems()) {
                Food food = foodRepository.findById(item.getFood().getId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
                ComboItem newItem = ComboItem.builder()
                        .combo(existing)
                        .food(food)
                        .quantity(item.getQuantity())
                        .build();
                existing.getItems().add(newItem);
            }
        }
        return comboRepository.save(existing);
    }

    public void delete(Long id) {
        comboRepository.delete(getById(id));
    }
}
