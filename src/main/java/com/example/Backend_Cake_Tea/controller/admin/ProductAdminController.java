package com.example.Backend_Cake_Tea.controller.admin;

import com.example.Backend_Cake_Tea.model.Food;
import com.example.Backend_Cake_Tea.service.FileStorageService;
import com.example.Backend_Cake_Tea.service.FoodService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
public class ProductAdminController {

    private final FoodService foodService;
    private final FileStorageService fileStorageService;

    public ProductAdminController(FoodService foodService, FileStorageService fileStorageService) {
        this.foodService = foodService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public List<Food> getAll() {
        return foodService.getAllFood();
    }

    @GetMapping("/{id}")
    public Food getById(@PathVariable Long id) {
        return foodService.getFoodById(id);
    }

    @PostMapping
    public Food create(@RequestBody Food food) {
        return foodService.create(food);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("image") MultipartFile file) {
        try {
            String imageUrl = fileStorageService.store(file, "products");
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl, "message", "Upload thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Upload thất bại: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public Food update(@PathVariable Long id, @RequestBody Food food) {
        return foodService.update(id, food);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        foodService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm"));
    }
}
