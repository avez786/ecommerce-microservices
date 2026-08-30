package com.ecommerce.order.client;

import com.ecommerce.order.dto.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class ProductClient {

    private final RestTemplate restTemplate;

    public ProductResponse getProductById(Long productId) {
        String url = "http://PRODUCT-SERVICE/api/products/" + productId;
        return restTemplate.getForObject(url, ProductResponse.class);
    }
}