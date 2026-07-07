package com.example.Backend_Cake_Tea.controller.admin;

import com.example.Backend_Cake_Tea.model.Food;
import com.example.Backend_Cake_Tea.service.FoodService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products")
public class ProductAdminController {

    private final FoodService foodService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public ProductAdminController(FoodService foodService) {
        this.foodService = foodService;
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
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("image") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File rỗng"));
        }
        Path uploadPath = Paths.get(uploadDir, "products");
        Files.createDirectories(uploadPath);

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        String imageUrl = "/uploads/products/" + filename;
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
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
