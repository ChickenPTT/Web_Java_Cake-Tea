package com.example.Backend_Cake_Tea.controller.admin;

import com.example.Backend_Cake_Tea.model.Combo;
import com.example.Backend_Cake_Tea.service.ComboService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/combos")
public class ComboAdminController {

    private final ComboService comboService;

    public ComboAdminController(ComboService comboService) {
        this.comboService = comboService;
    }

    @GetMapping
    public List<Combo> getAll() {
        return comboService.getAll();
    }

    @GetMapping("/{id}")
    public Combo getById(@PathVariable Long id) {
        return comboService.getById(id);
    }

    @PostMapping
    public Combo create(@RequestBody Combo combo) {
        return comboService.create(combo);
    }

    @PutMapping("/{id}")
    public Combo update(@PathVariable Long id, @RequestBody Combo combo) {
        return comboService.update(id, combo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        comboService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa combo"));
    }
}
