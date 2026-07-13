package com.example.Backend_Cake_Tea.service;

import com.example.Backend_Cake_Tea.model.Menu;
import com.example.Backend_Cake_Tea.repository.MenuRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final MenuRepository menuRepository;

    public CategoryService(MenuRepository menuRepository) {
        this.menuRepository = menuRepository;
    }

    public List<Menu> getAll() {
        return menuRepository.findAll();
    }

    public Menu getById(Long id) {
        return menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục id=" + id));
    }

    public Menu create(Menu menu) {
        if (menuRepository.findByMenuName(menu.getMenuName()) != null) {
            throw new RuntimeException("Danh mục đã tồn tại: " + menu.getMenuName());
        }
        return menuRepository.save(menu);
    }

    public Menu update(Long id, Menu updated) {
        Menu existing = getById(id);
        existing.setMenuName(updated.getMenuName());
        existing.setMenuImage(updated.getMenuImage());
        return menuRepository.save(existing);
    }

    public void delete(Long id) {
        menuRepository.delete(getById(id));
    }
}
