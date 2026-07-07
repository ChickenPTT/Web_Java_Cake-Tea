package com.example.Backend_Cake_Tea.model;

public class CartItem {
    private Long productId;
    private String Items;
    private String title;
    private String image;
    private Double price;
    private int quantity;
    private int total;


    public CartItem(Long productId, String items, String title, Double price, int quantity, int total) {
        this.productId = productId;
        Items = items;
        this.title = title;
        this.price = price;
        this.quantity = quantity;
        this.total = total;
    }

    // Constructor with 4 parameters for cart functionality
    public CartItem(Long productId, String title, Double price, int quantity) {
        this.productId = productId;
        this.title = title;
        this.price = price;
        this.quantity = quantity;
        this.total = (int) (price * quantity);
    }

    // Constructor with 5 parameters including image
    public CartItem(Long productId, String title, String image, Double price, int quantity) {
        this.productId = productId;
        this.title = title;
        this.image = image;
        this.price = price;
        this.quantity = quantity;
        this.total = (int) (price * quantity);
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getItems() {
        return Items;
    }

    public void setItems(String items) {
        Items = items;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }
}
