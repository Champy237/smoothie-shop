// Shopping Cart Management
class ShoppingCart {
    constructor() {
        this.items = [];
        this.loadFromStorage();
        this.initializeEventListeners();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Cart icon click
        document.getElementById('cartIcon').addEventListener('click', () => {
            this.openModal();
        });

        // Close modal
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Click outside modal to close
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('cartModal');
            if (event.target === modal) {
                this.closeModal();
            }
        });

        // Clear cart button
        const clearCartBtn = document.getElementById('clearCart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                this.clearCart();
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.checkout();
            });
        }

        // Add to cart buttons
        this.initializeAddToCartButtons();

        // Filter buttons (for catalog page)
        this.initializeFilterButtons();

        // Contact form
        this.initializeContactForm();

        // Mobile menu
        this.initializeMobileMenu();
    }

    // Initialize add to cart button listeners
    initializeAddToCartButtons() {
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('add-to-cart')) {
                const productId = event.target.getAttribute('data-id');
                const productElement = event.target.closest('.product');
                
                if (productElement) {
                    const product = {
                        id: productId,
                        name: productElement.getAttribute('data-name'),
                        price: parseFloat(productElement.getAttribute('data-price'))
                    };
                    
                    this.addToCart(product);
                    
                    // Visual feedback
                    event.target.style.background = '#22C55E';
                    event.target.textContent = 'Ajouté !';
                    
                    setTimeout(() => {
                        event.target.style.background = '';
                        event.target.textContent = 'Ajouter au panier';
                    }, 1500);
                }
            }
        });
    }

    // Add product to cart
    addToCart(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveToStorage();
        this.updateCartCount();
        this.showNotification(`${product.name} ajouté au panier !`);
    }

    // Remove product from cart
    removeFromCart(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToStorage();
        this.updateCartCount();
        this.updateCartDisplay();
    }

    // Update quantity of a product
    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }
        
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveToStorage();
            this.updateCartCount();
            this.updateCartDisplay();
        }
    }

    // Clear entire cart
    clearCart() {
        if (this.items.length === 0) {
            this.showNotification('Le panier est déjà vide !', 'info');
            return;
        }
        
        if (confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
            this.items = [];
            this.saveToStorage();
            this.updateCartCount();
            this.updateCartDisplay();
            this.showNotification('Panier vidé avec succès !', 'success');
        }
    }

    // Calculate total price
    calculateTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Update cart count in header
    updateCartCount() {
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
            cartCountElement.textContent = totalItems;
            
            // Add bounce animation when count changes
            cartCountElement.classList.add('animate-bounce');
            setTimeout(() => {
                cartCountElement.classList.remove('animate-bounce');
            }, 2000);
        }
    }

    // Open cart modal
    openModal() {
        const modal = document.getElementById('cartModal');
        if (modal) {
            this.updateCartDisplay();
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    // Close cart modal
    closeModal() {
        const modal = document.getElementById('cartModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Update cart display in modal
    updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalElement = document.getElementById('cartTotal');
        
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        
        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <p>Votre panier est vide</p>
                    <a href="catalog.html" class="cta-button">Découvrir nos produits</a>
                </div>
            `;
            if (cartTotalElement) {
                cartTotalElement.textContent = '0,00€';
            }
            return;
        }
        
        this.items.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">${item.price.toFixed(2)}€</p>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-item" onclick="cart.removeFromCart('${item.id}')">Supprimer</button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
        
        // Update total
        if (cartTotalElement) {
            cartTotalElement.textContent = `${this.calculateTotal().toFixed(2)}€`;
        }
    }

    // Checkout process - prepare data for Django backend
    checkout() {
        if (this.items.length === 0) {
            this.showNotification('Votre panier est vide !', 'error');
            return;
        }

        // Prepare order data in JSON format for Django backend
        const orderData = {
            items: this.items.map(item => ({
                product_id: item.id,
                product_name: item.name,
                price: item.price,
                quantity: item.quantity,
                total_price: (item.price * item.quantity).toFixed(2)
            })),
            total_amount: this.calculateTotal().toFixed(2),
            currency: 'EUR',
            timestamp: new Date().toISOString(),
            customer_info: {
                // This will be filled by Django authentication or form
                user_id: null,
                email: null,
                name: null
            }
        };

        // Log the JSON data that would be sent to Django
        console.log('Order data for Django backend:', JSON.stringify(orderData, null, 2));

        // Create a hidden form to send data to Django backend
        // This is the format Django can easily process
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/api/orders/create/'; // Django endpoint
        form.style.display = 'none';

        // Add CSRF token (required for Django)
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrfmiddlewaretoken';
            csrfInput.value = csrfToken.value;
            form.appendChild(csrfInput);
        }

        // Add order data as JSON
        const orderInput = document.createElement('input');
        orderInput.type = 'hidden';
        orderInput.name = 'order_data';
        orderInput.value = JSON.stringify(orderData);
        form.appendChild(orderInput);

        // For demonstration purposes, show the data instead of submitting
        alert(`Commande préparée !\n\nDonnées JSON pour Django :\n${JSON.stringify(orderData, null, 2)}\n\nDans un vrai projet, ces données seraient envoyées à votre backend Django.`);

        // In a real application, you would submit the form:
        // document.body.appendChild(form);
        // form.submit();

        // Clear cart after successful order
        this.clearCart();
        this.closeModal();
        this.showNotification('Commande passée avec succès !', 'success');
    }

    // Save cart to localStorage
    saveToStorage() {
        localStorage.setItem('freshjuice_cart', JSON.stringify(this.items));
    }

    // Load cart from localStorage
    loadFromStorage() {
        const savedCart = localStorage.getItem('freshjuice_cart');
        if (savedCart) {
            try {
                this.items = JSON.parse(savedCart);
                this.updateCartCount();
            } catch (error) {
                console.error('Error loading cart from storage:', error);
                this.items = [];
            }
        }
    }

    // Show notification to user
    showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#22C55E' : type === 'error' ? '#EF4444' : '#3B82F6'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 3000;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Initialize filter buttons for catalog page
    initializeFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const products = document.querySelectorAll('.product');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filter = button.getAttribute('data-filter');

                // Filter products
                products.forEach(product => {
                    if (filter === 'all' || product.getAttribute('data-category') === filter) {
                        product.style.display = 'block';
                        product.classList.add('animate-fadeIn');
                    } else {
                        product.style.display = 'none';
                        product.classList.remove('animate-fadeIn');
                    }
                });
            });
        });
    }

    // Initialize contact form
    initializeContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.handleContactForm(contactForm);
            });
        }
    }

    // Handle contact form submission
    handleContactForm(form) {
        const formData = new FormData(form);
        const formMessage = document.getElementById('formMessage');

        // Basic validation
        const requiredFields = ['firstName', 'lastName', 'email', 'subject', 'message'];
        let isValid = true;

        requiredFields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (!input || !input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#EF4444';
            } else {
                input.style.borderColor = '#E2E8F0';
            }
        });

        // Check consent checkbox
        const consent = form.querySelector('[name="consent"]');
        if (!consent.checked) {
            isValid = false;
            this.showNotification('Vous devez accepter l\'utilisation de vos données.', 'error');
        }

        if (!isValid) {
            this.showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
            return;
        }

        // Prepare data for Django backend
        const contactData = {
            first_name: formData.get('firstName'),
            last_name: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone') || '',
            subject: formData.get('subject'),
            message: formData.get('message'),
            newsletter: formData.get('newsletter') === 'on',
            timestamp: new Date().toISOString()
        };

        // Simulate form submission
        console.log('Contact form data for Django:', JSON.stringify(contactData, null, 2));

        // Show success message
        formMessage.className = 'form-message success';
        formMessage.textContent = 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.';
        formMessage.classList.remove('hidden');

        // Reset form
        form.reset();

        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 5000);

        this.showNotification('Message envoyé avec succès !', 'success');
    }

    // Initialize mobile menu
    initializeMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close menu when clicking on a link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }

    // Initialize login functionality
    initializeLogin() {
        const loginForm = document.getElementById('loginForm');
        const adminLoginBtn = document.getElementById('adminLoginBtn');

        if (loginForm) {
            loginForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.handleLogin(loginForm);
            });
        }

        if (adminLoginBtn) {
            adminLoginBtn.addEventListener('click', () => {
                this.handleAdminLogin();
            });
        }
    }

    // Handle regular login
    handleLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const remember = formData.get('remember');

        // Simulate login validation
        if (email && password) {
            // Store user session
            const userData = {
                email: email,
                name: email.split('@')[0],
                loginTime: new Date().toISOString(),
                remember: remember === 'on'
            };

            if (remember === 'on') {
                localStorage.setItem('freshjuice_user', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('freshjuice_user', JSON.stringify(userData));
            }

            this.showNotification('Connexion réussie ! Redirection...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            this.showNotification('Veuillez remplir tous les champs.', 'error');
        }
    }

    // Handle admin login
    handleAdminLogin() {
        const adminCredentials = prompt('Mot de passe administrateur:');
        
        if (adminCredentials === 'admin123') {
            // Store admin session
            const adminData = {
                role: 'admin',
                email: 'admin@freshjuice.fr',
                name: 'Administrateur',
                loginTime: new Date().toISOString()
            };

            sessionStorage.setItem('freshjuice_admin', JSON.stringify(adminData));
            this.showNotification('Connexion administrateur réussie !', 'success');
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1500);
        } else if (adminCredentials !== null) {
            this.showNotification('Mot de passe administrateur incorrect.', 'error');
        }
    }

    // Initialize product detail functionality
    initializeProductDetail() {
        // Get product ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId && PRODUCTS[productId]) {
            this.loadProductDetail(productId);
        }

        // Initialize quantity controls
        const decreaseBtn = document.getElementById('decreaseQty');
        const increaseBtn = document.getElementById('increaseQty');
        const quantityInput = document.getElementById('quantity');
        const addToCartDetailBtn = document.getElementById('addToCartDetail');

        if (decreaseBtn && increaseBtn && quantityInput) {
            decreaseBtn.addEventListener('click', () => {
                const currentQty = parseInt(quantityInput.value);
                if (currentQty > 1) {
                    quantityInput.value = currentQty - 1;
                    this.updateTotalPrice();
                }
            });

            increaseBtn.addEventListener('click', () => {
                const currentQty = parseInt(quantityInput.value);
                if (currentQty < 10) {
                    quantityInput.value = currentQty + 1;
                    this.updateTotalPrice();
                }
            });

            quantityInput.addEventListener('change', () => {
                this.updateTotalPrice();
            });
        }

        if (addToCartDetailBtn) {
            addToCartDetailBtn.addEventListener('click', () => {
                const productId = urlParams.get('id');
                const quantity = parseInt(quantityInput.value);
                
                if (productId && PRODUCTS[productId]) {
                    const product = PRODUCTS[productId];
                    for (let i = 0; i < quantity; i++) {
                        this.addToCart(product);
                    }
                }
            });
        }

        // Initialize thumbnail clicks
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById('mainProductImage').src = e.target.src.replace('w=200', 'w=800');
            });
        });
    }

    // Load product detail data
    loadProductDetail(productId) {
        const product = PRODUCTS[productId];
        if (!product) return;

        // Update page content
        document.getElementById('productBreadcrumb').textContent = product.name;
        document.getElementById('productTitle').textContent = product.name;
        document.getElementById('productPrice').textContent = `${product.price.toFixed(2)}€`;
        
        // Update description based on product
        const descriptions = {
            '1': 'Notre jus d\'orange frais est pressé à froid pour conserver tous les nutriments et vitamines.',
            '2': 'Jus de pomme biologique, sans pesticides, au goût authentique et naturel.',
            '3': 'Smoothie onctueux à la mangue, mélangé avec de la banane et du lait de coco.',
            '4': 'Jus de fraise fraîche, riche en antioxydants et en vitamine C.',
            '5': 'Jus d\'ananas tropical, source naturelle d\'enzymes digestives.',
            '6': 'Smoothie aux fruits rouges, mélange de fraises, framboises et myrtilles.',
            '7': 'Jus de fruit de la passion exotique, intense et rafraîchissant.',
            '8': 'Green smoothie détox aux épinards, pomme verte et concombre.'
        };

        const description = descriptions[productId] || 'Délicieux jus de fruit naturel.';
        document.getElementById('productDescription').textContent = description;

        this.updateTotalPrice();
    }

    // Update total price based on quantity
    updateTotalPrice() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const quantity = parseInt(document.getElementById('quantity')?.value || 1);
        
        if (productId && PRODUCTS[productId]) {
            const product = PRODUCTS[productId];
            const total = (product.price * quantity).toFixed(2);
            const totalPriceElement = document.getElementById('totalPrice');
            if (totalPriceElement) {
                totalPriceElement.textContent = `${total}€`;
            }
        }
    }

    // Initialize admin functionality
    initializeAdmin() {
        // Check admin authentication
        const adminData = sessionStorage.getItem('freshjuice_admin');
        if (!adminData) {
            window.location.href = 'login.html';
            return;
        }

        // Initialize admin event listeners
        this.initializeAdminEventListeners();
    }

    // Initialize admin event listeners
    initializeAdminEventListeners() {
        // Add product form
        const addProductForm = document.getElementById('addProductForm');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.handleAddProduct(addProductForm);
            });
        }
    }

    // Handle add product
    handleAddProduct(form) {
        const formData = new FormData(form);
        const productData = {
            id: Date.now().toString(),
            name: formData.get('productName'),
            category: formData.get('productCategory'),
            price: parseFloat(formData.get('productPrice')),
            stock: parseInt(formData.get('productStock')),
            description: formData.get('productDescription'),
            image: formData.get('productImage') || 'https://images.pexels.com/photos/1002740/pexels-photo-1002740.jpeg?auto=compress&cs=tinysrgb&w=400'
        };

        // Add to products (in real app, this would be sent to backend)
        console.log('New product data for Django:', JSON.stringify(productData, null, 2));
        
        this.showNotification('Produit ajouté avec succès !', 'success');
        this.closeAddProductForm();
        form.reset();
    }

    // Show add product form
    showAddProductForm() {
        const modal = document.getElementById('addProductModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    // Close add product form
    closeAddProductForm() {
        const modal = document.getElementById('addProductModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Product data structure for easy Django integration
const PRODUCTS = {
    1: { id: '1', name: 'Jus d\'Orange Frais', price: 4.50, category: 'classic' },
    2: { id: '2', name: 'Jus de Pomme Bio', price: 4.00, category: 'classic' },
    3: { id: '3', name: 'Smoothie Mangue', price: 5.50, category: 'smoothie' },
    4: { id: '4', name: 'Jus de Fraise', price: 5.00, category: 'classic' },
    5: { id: '5', name: 'Jus d\'Ananas Tropical', price: 4.80, category: 'exotic' },
    6: { id: '6', name: 'Smoothie Fruits Rouges', price: 5.80, category: 'smoothie' },
    7: { id: '7', name: 'Jus de Passion Exotique', price: 6.00, category: 'exotic' },
    8: { id: '8', name: 'Green Smoothie Détox', price: 6.50, category: 'smoothie' }
};

// Initialize cart when DOM is loaded
let cart;

document.addEventListener('DOMContentLoaded', () => {
    cart = new ShoppingCart();
    
    // Initialize page-specific functionality
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'login.html') {
        cart.initializeLogin();
    } else if (currentPage === 'product-detail.html') {
        cart.initializeProductDetail();
    } else if (currentPage === 'admin.html') {
        cart.initializeAdmin();
    }
    
    // Add smooth scrolling to CTA buttons
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add fade-in animation to elements when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeIn');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .product, .product-card, .faq-item').forEach(el => {
        observer.observe(el);
    });

    // Add click handlers for product cards to go to detail page
    document.querySelectorAll('.product-card.preview').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-to-cart')) {
                const productId = card.getAttribute('data-id');
                window.location.href = `product-detail.html?id=${productId}`;
            }
        });
    });
});

// Admin Functions (Global scope for onclick handlers)
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    event.target.classList.add('active');
}

function showAddProductForm() {
    if (cart) {
        cart.showAddProductForm();
    }
}

function closeAddProductForm() {
    if (cart) {
        cart.closeAddProductForm();
    }
}

function editProduct(id) {
    alert(`Modifier le produit ${id} - Fonctionnalité à implémenter avec Django`);
}

function deleteProduct(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        alert(`Produit ${id} supprimé - Fonctionnalité à implémenter avec Django`);
    }
}

function filterOrders(status) {
    const rows = document.querySelectorAll('#ordersTableBody tr');
    
    rows.forEach(row => {
        if (status === 'all' || row.getAttribute('data-status') === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function viewOrder(orderId) {
    alert(`Voir détails de la commande ${orderId} - Fonctionnalité à implémenter avec Django`);
}

function updateOrderStatus(orderId) {
    const newStatus = prompt('Nouveau statut (pending/processing/shipped/delivered):');
    if (newStatus) {
        alert(`Statut de la commande ${orderId} mis à jour: ${newStatus} - Fonctionnalité à implémenter avec Django`);
    }
}

function viewCustomer(id) {
    alert(`Voir détails du client ${id} - Fonctionnalité à implémenter avec Django`);
}

function contactCustomer(id) {
    alert(`Contacter le client ${id} - Fonctionnalité à implémenter avec Django`);
}

function exportCustomers() {
    alert('Export de la liste des clients - Fonctionnalité à implémenter avec Django');
}

function logout() {
    sessionStorage.removeItem('freshjuice_admin');
    sessionStorage.removeItem('freshjuice_user');
    localStorage.removeItem('freshjuice_user');
    window.location.href = 'login.html';
}

// Utility function for Django CSRF token
function getCsrfToken() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    return csrfToken ? csrfToken.value : '';
}

// Utility function to format price
function formatPrice(price) {
    return `${parseFloat(price).toFixed(2)}€`;
}

// Export for potential Django template integration
window.FreshJuiceCart = {
    cart: null,
    products: PRODUCTS,
    initializeCart: () => {
        cart = new ShoppingCart();
        return cart;
    },
    addProduct: (productData) => {
        if (cart) {
            cart.addToCart(productData);
        }
    },
    getCartData: () => {
        return cart ? cart.items : [];
    },
    clearCart: () => {
        if (cart) {
            cart.clearCart();
        }
    }
};