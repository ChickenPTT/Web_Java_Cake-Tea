package com.example.Backend_Cake_Tea.service;

import com.example.Backend_Cake_Tea.model.Menu;
import com.example.Backend_Cake_Tea.repository.MenuRepository;
import com.example.Backend_Cake_Tea.util.SlugUtils;
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
        menu.setSlug(resolveSlug(menu.getSlug(), menu.getMenuName(), null));
        return menuRepository.save(menu);
    }

    public Menu update(Long id, Menu updated) {
        Menu existing = getById(id);
        existing.setMenuName(updated.getMenuName());
        existing.setMenuImage(updated.getMenuImage());
        existing.setSlug(resolveSlug(updated.getSlug(), updated.getMenuName(), id));
        return menuRepository.save(existing);
    }

    public void delete(Long id) {
        menuRepository.delete(getById(id));
    }

    private String resolveSlug(String rawSlug, String name, Long excludeId) {
        String base = (rawSlug != null && !rawSlug.isBlank())
                ? SlugUtils.toSlug(rawSlug)
                : SlugUtils.toSlug(name);
        if (base.isBlank()) {
            base = "category";
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
            return menuRepository.existsBySlug(slug);
        }
        return menuRepository.existsBySlugAndIdNot(slug, excludeId);
    }
}
