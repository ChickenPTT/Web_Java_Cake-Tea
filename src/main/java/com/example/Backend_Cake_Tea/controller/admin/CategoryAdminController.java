package com.example.Backend_Cake_Tea.controller.admin;

import com.example.Backend_Cake_Tea.model.Menu;
import com.example.Backend_Cake_Tea.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/categories")
public class CategoryAdminController {

    private final CategoryService categoryService;

    public CategoryAdminController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<Menu> getAll() {
        return categoryService.getAll();
    }

    @GetMapping("/{id}")
    public Menu getById(@PathVariable Long id) {
        return categoryService.getById(id);
    }

    @PostMapping
    public Menu create(@RequestBody Menu menu) {
        return categoryService.create(menu);
    }

    @PutMapping("/{id}")
    public Menu update(@PathVariable Long id, @RequestBody Menu menu) {
        return categoryService.update(id, menu);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa danh mục"));
    }
}
