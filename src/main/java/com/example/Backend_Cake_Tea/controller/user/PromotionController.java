package com.example.Backend_Cake_Tea.controller.user;

import com.example.Backend_Cake_Tea.model.Campaign;
import com.example.Backend_Cake_Tea.model.Combo;
import com.example.Backend_Cake_Tea.service.PromotionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping("/api/campaigns/active")
    public ResponseEntity<List<Map<String, Object>>> activeCampaigns() {
        List<Map<String, Object>> list = promotionService.getActiveCampaigns().stream()
                .map(this::toCampaignDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/api/combos/active")
    public ResponseEntity<List<Map<String, Object>>> activeCombos() {
        List<Map<String, Object>> list = promotionService.getActiveCombos().stream()
                .map(this::toComboDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    private Map<String, Object> toCampaignDto(Campaign c) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("name", c.getName());
        m.put("description", c.getDescription());
        m.put("discountPercent", c.getDiscountPercent());
        m.put("discountAmount", c.getDiscountAmount());
        m.put("targetCategory", c.getTargetCategory());
        m.put("startDate", c.getStartDate());
        m.put("endDate", c.getEndDate());
        m.put("promoCode", PromotionService.toPromoCode(c.getName()));
        return m;
    }

    private Map<String, Object> toComboDto(Combo c) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("name", c.getName());
        m.put("description", c.getDescription());
        m.put("comboPrice", c.getComboPrice());
        m.put("startDate", c.getStartDate());
        m.put("endDate", c.getEndDate());
        m.put("items", c.getItems() == null ? List.of() : c.getItems().stream().map(item -> {
            Map<String, Object> i = new HashMap<>();
            i.put("quantity", item.getQuantity());
            if (item.getFood() != null) {
                i.put("foodId", item.getFood().getId());
                i.put("foodName", item.getFood().getName());
                i.put("foodImage", item.getFood().getImage());
                i.put("foodPrice", item.getFood().getPrice());
            }
            return i;
        }).collect(Collectors.toList()));
        return m;
    }
}
