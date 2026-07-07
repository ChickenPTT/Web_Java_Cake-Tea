package com.example.Backend_Cake_Tea.service;

import com.example.Backend_Cake_Tea.model.Campaign;
import com.example.Backend_Cake_Tea.repository.CampaignRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;

    public CampaignService(CampaignRepository campaignRepository) {
        this.campaignRepository = campaignRepository;
    }

    public List<Campaign> getAll() {
        return campaignRepository.findAll();
    }

    public Campaign getById(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chiến dịch id=" + id));
    }

    public Campaign create(Campaign campaign) {
        return campaignRepository.save(campaign);
    }

    public Campaign update(Long id, Campaign updated) {
        Campaign existing = getById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setDiscountPercent(updated.getDiscountPercent());
        existing.setDiscountAmount(updated.getDiscountAmount());
        existing.setStartDate(updated.getStartDate());
        existing.setEndDate(updated.getEndDate());
        existing.setActive(updated.getActive());
        existing.setTargetCategory(updated.getTargetCategory());
        return campaignRepository.save(existing);
    }

    public void delete(Long id) {
        campaignRepository.delete(getById(id));
    }
}
