package com.ecommerce.product.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Integer rating;
    private String comment;
}
