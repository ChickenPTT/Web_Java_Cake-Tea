package com.example.Backend_Cake_Tea.controller.admin;

import com.example.Backend_Cake_Tea.model.Menu;
import com.example.Backend_Cake_Tea.service.CategoryService;
import com.example.Backend_Cake_Tea.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/categories")
public class CategoryAdminController {

    private final CategoryService categoryService;
    private final FileStorageService fileStorageService;

    public CategoryAdminController(CategoryService categoryService, FileStorageService fileStorageService) {
        this.categoryService = categoryService;
        this.fileStorageService = fileStorageService;
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

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("image") MultipartFile file) {
        try {
            String imageUrl = fileStorageService.store(file, "categories");
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl, "message", "Upload thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Upload thất bại: " + e.getMessage()));
        }
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
