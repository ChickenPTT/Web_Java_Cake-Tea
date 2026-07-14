package com.example.Backend_Cake_Tea.config;

import com.example.Backend_Cake_Tea.model.Food;
import com.example.Backend_Cake_Tea.model.Menu;
import com.example.Backend_Cake_Tea.model.Role;
import com.example.Backend_Cake_Tea.model.User;
import com.example.Backend_Cake_Tea.repository.FoodRepository;
import com.example.Backend_Cake_Tea.repository.MenuRepository;
import com.example.Backend_Cake_Tea.repository.RoleRepository;
import com.example.Backend_Cake_Tea.repository.UserRepository;
import com.example.Backend_Cake_Tea.util.SlugUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final FoodRepository foodRepository;
    private final MenuRepository menuRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.password:admin123}")
    private String adminPassword;

    public DataLoader(FoodRepository foodRepository, MenuRepository menuRepository,
                      UserRepository userRepository, RoleRepository roleRepository,
                      PasswordEncoder passwordEncoder) {
        this.foodRepository = foodRepository;
        this.menuRepository = menuRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        ensureRoles();

        if (menuRepository.count() == 0) {
            loadMenuCategories();
        }

        if (foodRepository.count() == 0) {
            loadFoodItems();
        }

        if (userRepository.count() == 0) {
            loadSampleUsers();
        }

        ensureAdminUser();
        migrateUsers();
        migrateSlugs();
    }

    private void ensureRoles() {
        if (!roleRepository.existsByName(Role.USER)) {
            roleRepository.save(Role.builder().name(Role.USER).build());
        }
        if (!roleRepository.existsByName(Role.ADMIN)) {
            roleRepository.save(Role.builder().name(Role.ADMIN).build());
        }
        System.out.println("Roles ensured: USER, ADMIN");
    }

    private Role getRole(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new IllegalStateException("Role not found: " + name));
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

    private void loadSampleUsers() {
        Role userRole = getRole(Role.USER);

        userRepository.save(User.builder()
                .email("khach1@example.com")
                .password(passwordEncoder.encode("password"))
                .name("Nguyễn Văn A")
                .role(userRole)
                .birthday(LocalDate.now())
                .emailMarketing(true)
                .build());

        userRepository.save(User.builder()
                .email("khach2@example.com")
                .password(passwordEncoder.encode("password"))
                .name("Trần Thị B")
                .role(userRole)
                .birthday(LocalDate.of(1995, 6, 15))
                .emailMarketing(true)
                .build());

        System.out.println("Sample users loaded successfully!");
    }

    private void ensureAdminUser() {
        Role adminRole = getRole(Role.ADMIN);

        userRepository.findByEmail(adminUsername).ifPresentOrElse(admin -> {
            if (admin.getRole() == null || !Role.ADMIN.equals(admin.getRole().getName())) {
                admin.setRole(adminRole);
                userRepository.save(admin);
            }
            if (!isBcryptHash(admin.getPassword())) {
                admin.setPassword(passwordEncoder.encode(adminPassword));
                userRepository.save(admin);
            }
        }, () -> {
            userRepository.save(User.builder()
                    .email(adminUsername)
                    .password(passwordEncoder.encode(adminPassword))
                    .name("Administrator")
                    .role(adminRole)
                    .emailMarketing(false)
                    .build());
            System.out.println("Admin user created: " + adminUsername);
        });
    }

    private void migrateUsers() {
        Role userRole = getRole(Role.USER);
        List<User> users = userRepository.findAll();
        for (User user : users) {
            boolean changed = false;
            if (user.getRole() == null) {
                user.setRole(userRole);
                changed = true;
            }
            if (!isBcryptHash(user.getPassword())) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
                changed = true;
            }
            if (changed) {
                userRepository.save(user);
            }
        }
    }

    private void migrateSlugs() {
        for (Menu menu : menuRepository.findAll()) {
            if (menu.getSlug() == null || menu.getSlug().isBlank()) {
                String base = SlugUtils.toSlug(menu.getMenuName());
                if (base.isBlank()) base = "category-" + menu.getId();
                String candidate = base;
                int i = 2;
                while (menuRepository.existsBySlugAndIdNot(candidate, menu.getId())) {
                    candidate = base + "-" + i++;
                }
                menu.setSlug(candidate);
                menuRepository.save(menu);
            }
        }
        for (Food food : foodRepository.findAll()) {
            if (food.getSlug() == null || food.getSlug().isBlank()) {
                String base = SlugUtils.toSlug(food.getName());
                if (base.isBlank()) base = "product-" + food.getId();
                String candidate = base;
                int i = 2;
                while (foodRepository.existsBySlugAndIdNot(candidate, food.getId())) {
                    candidate = base + "-" + i++;
                }
                food.setSlug(candidate);
                foodRepository.save(food);
            }
        }
    }

    private boolean isBcryptHash(String password) {
        return password != null && (password.startsWith("$2a$")
                || password.startsWith("$2b$")
                || password.startsWith("$2y$"));
    }
}
