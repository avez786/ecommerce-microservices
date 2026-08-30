package com.ecommerce.order.service;

import com.ecommerce.order.client.ProductClient;
import com.ecommerce.order.dto.*;
import com.ecommerce.order.model.Order;
import com.ecommerce.order.model.OrderItem;
import com.ecommerce.order.model.OrderStatus;
import com.ecommerce.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;

    public OrderResponse placeOrder(String userEmail, OrderRequest request) {

        List<OrderItem> orderItems = request.getItems().stream()
                .map(itemReq -> {
                    ProductResponse product = productClient.getProductById(itemReq.getProductId());

                    if (product == null) {
                        throw new RuntimeException("Product not found with id: " + itemReq.getProductId());
                    }

                    return OrderItem.builder()
                            .productId(product.getId())
                            .productName(product.getName())
                            .quantity(itemReq.getQuantity())
                            .priceAtPurchase(product.getPrice())
                            .build();
                })
                .toList();

        double total = orderItems.stream()
                .mapToDouble(item -> item.getPriceAtPurchase() * item.getQuantity())
                .sum();

        Order order = Order.builder()
                .userEmail(userEmail)
                .items(orderItems)
                .totalAmount(total)
                .status(OrderStatus.PLACED)
                .createdAt(LocalDateTime.now())
                .build();

        orderItems.forEach(item -> item.setOrder(order));

        Order saved = orderRepository.save(order);
        return toResponse(saved);
    }

    public List<OrderResponse> getOrdersByUser(String userEmail) {
        return orderRepository.findByUserEmail(userEmail)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return toResponse(order);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getProductId(),
                        item.getProductName(),
                        item.getQuantity(),
                        item.getPriceAtPurchase()
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getUserEmail(),
                itemResponses,
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getCreatedAt()
        );
    }
    public OrderResponse updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        OrderStatus status;
        try {
            status = OrderStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + newStatus);
        }

        order.setStatus(status);
        Order updated = orderRepository.save(order);
        return toResponse(updated);
    }
}