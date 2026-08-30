package com.ecommerce.product.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewSummary{
    private Double averageRating;
    private Integer totalReviews;
}