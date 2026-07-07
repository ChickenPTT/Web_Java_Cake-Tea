package com.example.Backend_Cake_Tea.service;

import com.example.Backend_Cake_Tea.model.Order;
import com.example.Backend_Cake_Tea.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> getAll() {
        return orderRepository.findAll();
    }

    public List<Order> getByStatus(String status) {
        return orderRepository.findByStatus(status);
    }

    public Order getById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng id=" + id));
    }

    public Order updateStatus(Long id, String status) {
        Order order = getById(id);
        order.setStatus(status);
        return orderRepository.save(order);
    }

    public long countAll() {
        return orderRepository.count();
    }

    public long countByStatus(String status) {
        return orderRepository.countByStatus(status);
    }
}
