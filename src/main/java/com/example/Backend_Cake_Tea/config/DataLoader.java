package com.example.Backend_Cake_Tea.config;

import com.example.Backend_Cake_Tea.model.Food;
import com.example.Backend_Cake_Tea.model.Menu;
import com.example.Backend_Cake_Tea.repository.FoodRepository;
import com.example.Backend_Cake_Tea.repository.MenuRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final FoodRepository foodRepository;
    private final MenuRepository menuRepository;

    public DataLoader(FoodRepository foodRepository, MenuRepository menuRepository) {
        this.foodRepository = foodRepository;
        this.menuRepository = menuRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Load menu categories if database is empty
        if (menuRepository.count() == 0) {
            loadMenuCategories();
        }

        // Load food items if database is empty
        if (foodRepository.count() == 0) {
            loadFoodItems();
        }
    }

    private void loadMenuCategories() {
        menuRepository.save(Menu.builder()
                .menuName("Cake")
                .menuImage("/user/assets/menu_1.jpg")
                .build());

        menuRepository.save(Menu.builder()
                .menuName("Cupcake")
                .menuImage("/user/assets/menu_2.jpg")
                .build());

        menuRepository.save(Menu.builder()
                .menuName("Croissant")
                .menuImage("/user/assets/menu_3.jpg")
                .build());

        menuRepository.save(Menu.builder()
                .menuName("Cheesecake")
                .menuImage("/user/assets/menu_4.jpg")
                .build());

        menuRepository.save(Menu.builder()
                .menuName("Donut")
                .menuImage("/user/assets/menu_5.jpg")
                .build());

        menuRepository.save(Menu.builder()
                .menuName("Cookies")
                .menuImage("/user/assets/menu_6.jpg")
                .build());

        menuRepository.save(Menu.builder()
                .menuName("Mousse")
                .menuImage("/user/assets/menu_7.jpg")
                .build());

        menuRepository.save(Menu.builder()
                .menuName("Sweet Buns")
                .menuImage("/user/assets/menu_8.jpg")
                .build());

        System.out.println("Menu categories loaded successfully!");
    }

    private void loadFoodItems() {
        // Cakes
        foodRepository.save(Food.builder()
                .name("Chocolate Cake")
                .image("/user/assets/food_1.jpg")
                .price(30.0)
                .description("A delicious chocolate cake with rich flavor and moist texture.")
                .category("Cake")
                .build());

        foodRepository.save(Food.builder()
                .name("Strawberry Cake")
                .image("/user/assets/food_2.jpg")
                .price(32.0)
                .description("A delicious strawberry cake with rich flavor and moist texture.")
                .category("Cake")
                .build());

        foodRepository.save(Food.builder()
                .name("Vanilla Cake")
                .image("/user/assets/food_3.jpg")
                .price(28.0)
                .description("A delicious vanilla cake with rich flavor and moist texture.")
                .category("Cake")
                .build());

        foodRepository.save(Food.builder()
                .name("Matcha Cake")
                .image("/user/assets/food_4.jpg")
                .price(35.0)
                .description("A delicious matcha cake with rich flavor and moist texture.")
                .category("Cake")
                .build());

        // Cupcakes
        foodRepository.save(Food.builder()
                .name("Orio Cupcake")
                .image("/user/assets/food_5.jpg")
                .price(13.0)
                .description("A delicious orio cupcake with rich flavor and moist texture.")
                .category("Cupcake")
                .build());

        foodRepository.save(Food.builder()
                .name("Mint Cupcake")
                .image("/user/assets/food_6.jpg")
                .price(11.0)
                .description("A delicious mint cupcake with rich flavor and moist texture.")
                .category("Cupcake")
                .build());

        foodRepository.save(Food.builder()
                .name("Blueberry Cupcake")
                .image("/user/assets/food_7.jpg")
                .price(15.0)
                .description("A delicious blueberry cupcake with rich flavor and moist texture.")
                .category("Cupcake")
                .build());

        foodRepository.save(Food.builder()
                .name("Lemon Cupcake")
                .image("/user/assets/food_8.jpg")
                .price(9.0)
                .description("A delicious lemon cupcake with rich flavor and moist texture.")
                .category("Cupcake")
                .build());

        System.out.println("Food items loaded successfully!");
    }
}
