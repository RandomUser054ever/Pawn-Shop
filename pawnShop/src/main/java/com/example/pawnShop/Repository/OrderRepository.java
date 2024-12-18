// pawnShop\src\main\java\com\example\pawnShop\Repository\OrderRepository.java
package com.example.pawnShop.Repository;

import com.example.pawnShop.Entity.Order;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUserId(UUID userId);
    List<Order> findAll(Sort sort);
} 