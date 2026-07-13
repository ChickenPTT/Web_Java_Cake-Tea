package com.example.Backend_Cake_Tea.service;

import com.example.Backend_Cake_Tea.model.Order;
import com.example.Backend_Cake_Tea.model.User;
import com.example.Backend_Cake_Tea.repository.OrderRepository;
import com.example.Backend_Cake_Tea.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import com.example.Backend_Cake_Tea.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    public Order createOrder(Order order) {
        return orderRepository.save(order);
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getOrdersByUserEmail(String userEmail) {
        return orderRepository.findByUserEmail(userEmail);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order updateOrder(Order order) {
        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(status);
            return orderRepository.save(order);
        }
        return null;
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
