package com.ecommerce.product.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long productId;
    private String userEmail;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}