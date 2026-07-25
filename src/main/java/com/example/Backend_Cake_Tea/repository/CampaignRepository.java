package com.example.Backend_Cake_Tea.repository;

import com.example.Backend_Cake_Tea.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    @Query("SELECT c FROM Campaign c WHERE c.active = true " +
           "AND (c.startDate IS NULL OR c.startDate <= :now) " +
           "AND (c.endDate IS NULL OR c.endDate >= :now)")
    List<Campaign> findActiveAt(@Param("now") LocalDateTime now);
}
