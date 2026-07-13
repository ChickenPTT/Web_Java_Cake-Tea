package com.example.Backend_Cake_Tea.repository;

import com.example.Backend_Cake_Tea.model.Combo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComboRepository extends JpaRepository<Combo, Long> {
}
