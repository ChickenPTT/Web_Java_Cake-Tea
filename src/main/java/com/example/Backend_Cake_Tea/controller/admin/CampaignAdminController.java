package com.example.Backend_Cake_Tea.controller.admin;

import com.example.Backend_Cake_Tea.model.Campaign;
import com.example.Backend_Cake_Tea.service.CampaignService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/campaigns")
public class CampaignAdminController {

    private final CampaignService campaignService;

    public CampaignAdminController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping
    public List<Campaign> getAll() {
        return campaignService.getAll();
    }

    @GetMapping("/{id}")
    public Campaign getById(@PathVariable Long id) {
        return campaignService.getById(id);
    }

    @PostMapping
    public Campaign create(@RequestBody Campaign campaign) {
        return campaignService.create(campaign);
    }

    @PutMapping("/{id}")
    public Campaign update(@PathVariable Long id, @RequestBody Campaign campaign) {
        return campaignService.update(id, campaign);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        campaignService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa chiến dịch"));
    }
}
