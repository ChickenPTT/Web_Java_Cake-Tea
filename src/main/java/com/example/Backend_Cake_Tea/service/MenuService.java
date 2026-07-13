package com.example.Backend_Cake_Tea.service;

import com.example.Backend_Cake_Tea.model.Menu;
import com.example.Backend_Cake_Tea.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuService {
    
    @Autowired
    private MenuRepository menuRepository;
    
    public List<Menu> getAllMenus() {
        return menuRepository.findAll();
    }
    
    public Menu getMenuById(Long id) {
        return menuRepository.findById(id).orElse(null);
    }
    
    public Menu getMenuByName(String name) {
        return menuRepository.findByMenuName(name);
    }
    
    public Menu saveMenu(Menu menu) {
        return menuRepository.save(menu);
    }
}
