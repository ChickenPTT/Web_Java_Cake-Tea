package com.example.Backend_Cake_Tea.service;

import com.example.Backend_Cake_Tea.model.CartItem;
import com.example.Backend_Cake_Tea.model.Campaign;
import com.example.Backend_Cake_Tea.model.Combo;
import com.example.Backend_Cake_Tea.model.ComboItem;
import com.example.Backend_Cake_Tea.model.Food;
import com.example.Backend_Cake_Tea.model.User;
import com.example.Backend_Cake_Tea.repository.CampaignRepository;
import com.example.Backend_Cake_Tea.repository.ComboRepository;
import com.example.Backend_Cake_Tea.repository.FoodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class PromotionService {

    public static final String BIRTHDAY_CODE = "BIRTHDAY10";
    public static final double BIRTHDAY_PERCENT = 10.0;
    public static final double DELIVERY_FEE = 2.0;

    private final CampaignRepository campaignRepository;
    private final ComboRepository comboRepository;
    private final FoodRepository foodRepository;

    public PromotionService(CampaignRepository campaignRepository,
                            ComboRepository comboRepository,
                            FoodRepository foodRepository) {
        this.campaignRepository = campaignRepository;
        this.comboRepository = comboRepository;
        this.foodRepository = foodRepository;
    }

    @Transactional(readOnly = true)
    public List<Campaign> getActiveCampaigns() {
        return campaignRepository.findActiveAt(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<Combo> getActiveCombos() {
        return comboRepository.findActiveAt(LocalDateTime.now());
    }

    public boolean isBirthdayToday(User user) {
        if (user == null || user.getBirthday() == null) return false;
        LocalDate today = LocalDate.now();
        LocalDate birthday = user.getBirthday();
        return birthday.getMonthValue() == today.getMonthValue()
                && birthday.getDayOfMonth() == today.getDayOfMonth();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> quote(Collection<CartItem> items, String promoCode, User user, Long appliedComboId) {
        List<CartItem> cartItems = items == null ? List.of() : new ArrayList<>(items);
        enrichCategories(cartItems);

        double subtotal = cartItems.stream()
                .mapToDouble(i -> (i.getPrice() != null ? i.getPrice() : 0) * i.getQuantity())
                .sum();

        double campaignDiscount = calculateCampaignDiscount(cartItems);
        String campaignLabel = campaignDiscount > 0 ? "Chiến dịch đang diễn ra" : null;

        double comboDiscount = 0;
        String comboLabel = null;
        String comboName = null;
        if (appliedComboId != null) {
            ComboDiscount cd = calculateComboDiscount(cartItems, appliedComboId);
            comboDiscount = cd.discount;
            comboLabel = cd.label;
            comboName = cd.comboName;
        }

        double promoDiscount = 0;
        String promoLabel = null;
        if (promoCode != null && !promoCode.isBlank()) {
            PromoResult pr = applyPromoCode(cartItems, subtotal, promoCode.trim(), user);
            promoDiscount = pr.discount;
            promoLabel = pr.label;
        }

        // Combo luôn được giữ nếu hợp lệ; mã KM / campaign chỉ thay thế khi cao hơn
        double discount = comboDiscount;
        String discountLabel = comboLabel;
        double other = Math.max(campaignDiscount, promoDiscount);
        String otherLabel = promoDiscount >= campaignDiscount ? promoLabel : campaignLabel;
        if (other > discount) {
            discount = other;
            discountLabel = otherLabel;
        }

        discount = Math.min(discount, subtotal);
        double deliveryFee = subtotal > 0 ? DELIVERY_FEE : 0;
        double total = Math.max(0, subtotal - discount + deliveryFee);

        Long effectiveComboId = (comboDiscount > 0) ? appliedComboId : null;

        Map<String, Object> result = new HashMap<>();
        result.put("subtotal", round2(subtotal));
        result.put("discount", round2(discount));
        result.put("discountLabel", discountLabel);
        result.put("deliveryFee", round2(deliveryFee));
        result.put("total", round2(total));
        result.put("promoCode", promoCode);
        result.put("appliedComboId", effectiveComboId);
        result.put("comboName", comboName);
        result.put("comboSavings", round2(comboDiscount));
        result.put("comboPrice", comboDiscount > 0 ? round2(subtotal - comboDiscount) : null);
        return result;
    }

    private void enrichCategories(List<CartItem> items) {
        for (CartItem item : items) {
            if (item.getCategory() != null && !item.getCategory().isBlank()) continue;
            if (item.getProductId() == null) continue;
            foodRepository.findById(item.getProductId()).ifPresent(food -> {
                item.setCategory(food.getCategory());
                if (item.getImage() == null) item.setImage(food.getImage());
            });
        }
    }

    private double calculateCampaignDiscount(List<CartItem> items) {
        List<Campaign> campaigns = getActiveCampaigns();
        if (campaigns.isEmpty() || items.isEmpty()) return 0;

        double best = 0;
        for (Campaign campaign : campaigns) {
            double eligible = 0;
            for (CartItem item : items) {
                if (isCampaignApplicable(campaign, item.getCategory())) {
                    eligible += (item.getPrice() != null ? item.getPrice() : 0) * item.getQuantity();
                }
            }
            if (eligible <= 0) continue;

            double d = 0;
            if (campaign.getDiscountPercent() != null && campaign.getDiscountPercent() > 0) {
                d = eligible * campaign.getDiscountPercent() / 100.0;
            }
            if (campaign.getDiscountAmount() != null && campaign.getDiscountAmount() > 0) {
                d = Math.max(d, Math.min(campaign.getDiscountAmount(), eligible));
            }
            best = Math.max(best, d);
        }
        return best;
    }

    private boolean isCampaignApplicable(Campaign campaign, String category) {
        String target = campaign.getTargetCategory();
        if (target == null || target.isBlank()) return true;
        if (category == null) return false;
        return target.trim().equalsIgnoreCase(category.trim());
    }

    private ComboDiscount calculateComboDiscount(List<CartItem> items, Long comboId) {
        Combo combo = comboRepository.findByIdWithItems(comboId).orElse(null);
        if (combo == null || !Boolean.TRUE.equals(combo.getActive())) {
            return new ComboDiscount(0, null, null);
        }
        LocalDateTime now = LocalDateTime.now();
        if (combo.getStartDate() != null && now.isBefore(combo.getStartDate())) {
            return new ComboDiscount(0, null, null);
        }
        if (combo.getEndDate() != null && now.isAfter(combo.getEndDate())) {
            return new ComboDiscount(0, null, null);
        }
        if (combo.getItems() == null || combo.getItems().isEmpty()) {
            return new ComboDiscount(0, null, null);
        }

        Map<Long, Integer> cartQty = new HashMap<>();
        Map<Long, Double> cartPrice = new HashMap<>();
        for (CartItem item : items) {
            if (item.getProductId() == null) continue;
            cartQty.merge(item.getProductId(), item.getQuantity(), Integer::sum);
            cartPrice.put(item.getProductId(), item.getPrice() != null ? item.getPrice() : 0);
        }

        int sets = Integer.MAX_VALUE;
        double normalSetPrice = 0;
        for (ComboItem ci : combo.getItems()) {
            if (ci.getFood() == null || ci.getFood().getId() == null) {
                return new ComboDiscount(0, null, null);
            }
            Long foodId = ci.getFood().getId();
            int need = Math.max(1, ci.getQuantity() != null ? ci.getQuantity() : 1);
            int have = cartQty.getOrDefault(foodId, 0);
            sets = Math.min(sets, have / need);
            double unit = cartPrice.getOrDefault(foodId,
                    ci.getFood().getPrice() != null ? ci.getFood().getPrice() : 0);
            normalSetPrice += unit * need;
        }
        if (sets == Integer.MAX_VALUE || sets <= 0) {
            return new ComboDiscount(0, null, null);
        }

        double comboPrice = combo.getComboPrice() != null ? combo.getComboPrice() : 0;
        double discount = Math.max(0, (normalSetPrice - comboPrice) * sets);
        if (discount <= 0) {
            return new ComboDiscount(0, null, combo.getName());
        }
        return new ComboDiscount(
                discount,
                "Combo \"" + combo.getName() + "\" (−" + round2(discount) + "đ)",
                combo.getName()
        );
    }

    private PromoResult applyPromoCode(List<CartItem> items, double subtotal, String code, User user) {
        if (BIRTHDAY_CODE.equalsIgnoreCase(code)) {
            if (user == null) {
                return new PromoResult(0, null);
            }
            if (!isBirthdayToday(user)) {
                return new PromoResult(0, null);
            }
            return new PromoResult(subtotal * BIRTHDAY_PERCENT / 100.0, "Mã sinh nhật BIRTHDAY10 (-10%)");
        }

        for (Campaign campaign : getActiveCampaigns()) {
            String campaignCode = toPromoCode(campaign.getName());
            if (campaignCode.equalsIgnoreCase(code) || ("CAMP" + campaign.getId()).equalsIgnoreCase(code)) {
                double eligible = 0;
                for (CartItem item : items) {
                    if (isCampaignApplicable(campaign, item.getCategory())) {
                        eligible += (item.getPrice() != null ? item.getPrice() : 0) * item.getQuantity();
                    }
                }
                if (eligible <= 0) eligible = subtotal;
                double d = 0;
                if (campaign.getDiscountPercent() != null && campaign.getDiscountPercent() > 0) {
                    d = eligible * campaign.getDiscountPercent() / 100.0;
                }
                if (campaign.getDiscountAmount() != null && campaign.getDiscountAmount() > 0) {
                    d = Math.max(d, Math.min(campaign.getDiscountAmount(), eligible));
                }
                return new PromoResult(d, "Mã KM: " + campaign.getName());
            }
        }
        return new PromoResult(0, null);
    }

    public static String toPromoCode(String name) {
        if (name == null) return "";
        return name.trim().toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]+", "");
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private record PromoResult(double discount, String label) {}
    private record ComboDiscount(double discount, String label, String comboName) {}
}
