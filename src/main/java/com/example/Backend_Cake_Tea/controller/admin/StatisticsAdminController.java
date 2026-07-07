package com.example.Backend_Cake_Tea.controller.admin;

import com.example.Backend_Cake_Tea.service.StatisticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/statistics")
public class StatisticsAdminController {

    private final StatisticsService statisticsService;

    public StatisticsAdminController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/revenue")
    public Map<String, Object> getRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return statisticsService.getRevenueStatistics(from, to);
    }
}
