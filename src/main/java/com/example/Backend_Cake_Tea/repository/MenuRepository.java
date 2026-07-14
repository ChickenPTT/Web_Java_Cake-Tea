package com.example.Backend_Cake_Tea.repository;

import com.example.Backend_Cake_Tea.model.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    
    Menu findByMenuName(String menuName);

    Menu findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
