package com.example.Backend_Cake_Tea.repository;

import com.example.Backend_Cake_Tea.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {
}
