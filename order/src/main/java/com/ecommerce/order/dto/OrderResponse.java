package com.ecommerce.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {
    private Long id;
    private String userEmail;
    private List<OrderItemResponse> items;
    private Double totalAmount;
    private String status;
    private LocalDateTime createdAt;
}