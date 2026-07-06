// Image upload preview
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('image-preview');

imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

// Form submission
document.getElementById('add-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    
    // In real implementation, send to Java backend
    // const response = await fetch(`${API_URL}/api/food/add`, {
    //     method: 'POST',
    //     body: formData
    // });

    // For demo purposes, simulate successful addition
    const name = formData.get('name');
    const description = formData.get('description');
    const price = formData.get('price');
    const category = formData.get('category');
    const imageFile = formData.get('image');

    // Create food item object
    const foodItem = {
        _id: Date.now().toString(),
        name: name,
        description: description,
        price: parseFloat(price),
        category: category,
        image: imageFile.name || 'default.jpg'
    };

    // Save to localStorage for demo
    const foodList = JSON.parse(localStorage.getItem('foodList') || '[]');
    foodList.push(foodItem);
    localStorage.setItem('foodList', JSON.stringify(foodList));

    // Update stats
    localStorage.setItem('totalItems', foodList.length.toString());

    // Reset form
    this.reset();
    imagePreview.src = '/admin/assets/upload_area.png';

    // Show success message
    showNotification('Food item added successfully!');

    console.log('Food item added:', foodItem);
});
