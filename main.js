// ===== MAIN JAVASCRIPT FILE =====

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // ===== GLOBAL VARIABLES =====
    let cart = JSON.parse(localStorage.getItem('lePalankaCart')) || [];
    
    // ===== INITIALIZATION =====
    initNavigation();
    initSmoothScrolling();
    initCart();
    initMenuCategoryToggle();
    initPaymentModal();
    initReservationForm();
    initCheckout();
    initBackToTop();
    
    // Update cart count on all pages
    updateCartCount();
    
    // ===== NAVIGATION =====
    function initNavigation() {
        // Mobile menu toggle
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (hamburger && mobileMenu) {
            hamburger.addEventListener('click', function() {
                mobileMenu.classList.toggle('active');
                hamburger.innerHTML = mobileMenu.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
            });
            
            // Close mobile menu when clicking a link
            const mobileLinks = mobileMenu.querySelectorAll('a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                });
            });
        }
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (mobileMenu && mobileMenu.classList.contains('active') && 
                !mobileMenu.contains(event.target) && 
                !hamburger.contains(event.target)) {
                mobileMenu.classList.remove('active');
                if (hamburger) {
                    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    }
    
    // ===== SMOOTH SCROLLING =====
    function initSmoothScrolling() {
        const scrollLinks = document.querySelectorAll('.scroll-link');
        
        scrollLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Close mobile menu if open
                    const mobileMenu = document.getElementById('mobileMenu');
                    const hamburger = document.getElementById('hamburger');
                    
                    if (mobileMenu && mobileMenu.classList.contains('active')) {
                        mobileMenu.classList.remove('active');
                        if (hamburger) {
                            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                        }
                    }
                    
                    // Smooth scroll to target
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // ===== CART FUNCTIONALITY =====
    function initCart() {
        // Add to cart buttons
        const addToCartButtons = document.querySelectorAll('.btn-add, .btn-add-item');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const name = this.getAttribute('data-name');
                const price = parseInt(this.getAttribute('data-price'));
                
                addToCart(name, price);
                
                // Show quick cart
                const quickCart = document.getElementById('quickCart');
                if (quickCart) {
                    quickCart.classList.add('active');
                    
                    // Auto-hide after 3 seconds
                    setTimeout(() => {
                        quickCart.classList.remove('active');
                    }, 3000);
                }
                
                // Visual feedback
                this.textContent = 'Added!';
                this.style.backgroundColor = '#2e8b57';
                
                setTimeout(() => {
                    this.textContent = 'Add to Cart';
                    this.style.backgroundColor = '';
                }, 1000);
            });
        });
        
        // Quick cart toggle
        const cartLinks = document.querySelectorAll('.cart-link, .cart-link-mobile');
        const quickCart = document.getElementById('quickCart');
        const quickCartClose = document.querySelector('.quick-cart-close');
        
        if (cartLinks.length > 0 && quickCart) {
            cartLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    // Don't prevent default if it's a link to checkout page
                    if (this.getAttribute('href') === 'checkout.html') return;
                    
                    e.preventDefault();
                    quickCart.classList.toggle('active');
                });
            });
            
            // Close quick cart when clicking the close button
            if (quickCartClose) {
                quickCartClose.addEventListener('click', () => {
                    quickCart.classList.remove('active');
                });
            }
            
            // Close quick cart when clicking outside
            document.addEventListener('click', function(event) {
                if (quickCart.classList.contains('active') && 
                    !quickCart.contains(event.target) && 
                    !Array.from(cartLinks).some(link => link.contains(event.target))) {
                    quickCart.classList.remove('active');
                }
            });
        }
    }
    
    function addToCart(name, price) {
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(item => item.name === name);
        
        if (existingItemIndex !== -1) {
            // Update quantity
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item
            cart.push({
                name: name,
                price: price,
                quantity: 1
            });
        }
        
        // Save to localStorage
        localStorage.setItem('lePalankaCart', JSON.stringify(cart));
        
        // Update UI
        updateCartCount();
        updateQuickCart();
        
        // If on checkout page, update it too
        if (document.querySelector('.checkout')) {
            updateCheckoutPage();
        }
    }
    
    function removeFromCart(index) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        
        // Save to localStorage
        localStorage.setItem('lePalankaCart', JSON.stringify(cart));
        
        // Update UI
        updateCartCount();
        updateQuickCart();
        
        // If on checkout page, update it too
        if (document.querySelector('.checkout')) {
            updateCheckoutPage();
        }
    }
    
    function updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });
    }
    
    function updateQuickCart() {
        const quickCartItems = document.getElementById('quickCartItems');
        const cartTotalElement = document.getElementById('cartTotal');
        
        if (!quickCartItems) return;
        
        // Clear current items
        quickCartItems.innerHTML = '';
        
        if (cart.length === 0) {
            quickCartItems.innerHTML = '<p class="empty-cart-msg">Your cart is empty</p>';
            if (cartTotalElement) {
                cartTotalElement.textContent = 'KSH 0';
            }
            return;
        }
        
        // Add cart items
        let total = 0;
        
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div>
                    <div class="cart-item-name">${item.name}</div>
                    <div>${item.quantity} x KSH ${item.price.toLocaleString()}</div>
                </div>
                <div>
                    <span class="cart-item-price">KSH ${(item.price * item.quantity).toLocaleString()}</span>
                    <button class="cart-item-remove" data-index="${index}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            quickCartItems.appendChild(itemElement);
            total += item.price * item.quantity;
        });
        
        // Update total
        if (cartTotalElement) {
            cartTotalElement.textContent = `KSH ${total.toLocaleString()}`;
        }
        
        // Add event listeners to remove buttons
        const removeButtons = quickCartItems.querySelectorAll('.cart-item-remove');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
    }
    
    // ===== MENU CATEGORY TOGGLE =====
    function initMenuCategoryToggle() {
        const categoryButtons = document.querySelectorAll('.category-btn');
        const categories = document.querySelectorAll('.menu-category');
        
        if (categoryButtons.length === 0) return;
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetCategory = this.getAttribute('data-category');
                
                // Update active button
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Show target category
                categories.forEach(category => {
                    category.classList.remove('active');
                    if (category.id === targetCategory) {
                        category.classList.add('active');
                    }
                });
            });
        });
    }
    
    // ===== PAYMENT MODAL =====
    function initPaymentModal() {
        const paymentInstructionButtons = document.querySelectorAll('.btn-payment-instructions');
        const paymentModal = document.getElementById('paymentModal');
        const modalClose = document.getElementById('modalClose');
        
        if (paymentInstructionButtons.length === 0 || !paymentModal) return;
        
        paymentInstructionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const method = this.getAttribute('data-method');
                showPaymentInstructions(method);
                paymentModal.classList.add('active');
            });
        });
        
        // Close modal
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                paymentModal.classList.remove('active');
            });
        }
        
        // Close modal when clicking outside
        paymentModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
    
    function showPaymentInstructions(method) {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (!modalTitle || !modalBody) return;
        
        let title = '';
        let content = '';
        
        switch(method) {
            case 'mpesa':
                title = 'M-Pesa Payment Instructions';
                content = `
                    <ol>
                        <li>Go to M-Pesa on your phone</li>
                        <li>Select <strong>"Lipa Na M-Pesa"</strong></li>
                        <li>Select <strong>"Pay Bill"</strong></li>
                        <li>Enter Business No: <strong>123456</strong></li>
                        <li>Enter Account No: <strong>LE PALANKA</strong></li>
                        <li>Enter the amount you wish to pay</li>
                        <li>Enter your M-Pesa PIN</li>
                        <li>You will receive a confirmation SMS</li>
                        <li>Present the confirmation SMS at the restaurant</li>
                    </ol>
                    <p style="margin-top: 20px; color: var(--accent);">For assistance, call +254 700 123 456</p>
                `;
                break;
                
            case 'card':
                title = 'Card Payment Information';
                content = `
                    <p>We accept Visa, MasterCard, and American Express.</p>
                    <p>All transactions are securely processed through our payment gateway with SSL encryption.</p>
                    <p>Your card information is never stored on our servers.</p>
                    <p style="margin-top: 20px;"><strong>Note:</strong> A temporary hold may be placed on your card for the estimated total. The final charge will be processed after your meal.</p>
                `;
                break;
                
            case 'cash':
                title = 'Cash Payment';
                content = `
                    <p>You can pay with cash at the restaurant.</p>
                    <p>We accept Kenyan Shillings (KSH).</p>
                    <p>For large groups or special events, please inform us in advance if you plan to pay with cash.</p>
                    <p style="margin-top: 20px;"><strong>Note:</strong> We do not accept foreign currency. Please convert to KSH before your visit.</p>
                `;
                break;
        }
        
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
    }
    
    // ===== RESERVATION FORM =====
    function initReservationForm() {
        const reservationForm = document.getElementById('reservationForm');
        
        if (!reservationForm) return;
        
        // Set minimum date to today
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            
            // Set default to 3 days from now
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 3);
            dateInput.value = defaultDate.toISOString().split('T')[0];
        }
        
        // Set default time to 7:00 PM
        const timeInput = document.getElementById('time');
        if (timeInput) {
            timeInput.value = '19:00';
        }
        
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const guests = document.getElementById('guests').value;
            const requests = document.getElementById('requests').value;
            
            // Simple validation
            if (!name || !email || !phone || !date || !time || !guests) {
                alert('Please fill in all required fields');
                return;
            }
            
            // In a real application, you would send this data to a server
            // For now, we'll just show a success message and store in localStorage
            
            const reservation = {
                name,
                email,
                phone,
                date,
                time,
                guests,
                requests,
                timestamp: new Date().toISOString()
            };
            
            // Save to localStorage
            let reservations = JSON.parse(localStorage.getItem('lePalankaReservations')) || [];
            reservations.push(reservation);
            localStorage.setItem('lePalankaReservations', JSON.stringify(reservations));
            
            // Show success message
            alert(`Thank you, ${name}! Your table for ${guests} on ${date} at ${time} has been reserved. We've sent a confirmation to ${email}.`);
            
            // Reset form
            reservationForm.reset();
            
            // Reset date and time to defaults
            if (dateInput) {
                const defaultDate = new Date();
                defaultDate.setDate(defaultDate.getDate() + 3);
                dateInput.value = defaultDate.toISOString().split('T')[0];
            }
            
            if (timeInput) {
                timeInput.value = '19:00';
            }
        });
    }
    
    // ===== CHECKOUT PAGE =====
    function initCheckout() {
        // Only run on checkout page
        if (!document.querySelector('.checkout')) return;
        
        updateCheckoutPage();
        
        // Payment method toggle
        const paymentOptions = document.querySelectorAll('input[name="payment"]');
        const paymentInstructions = document.querySelectorAll('.payment-instructions');
        
        paymentOptions.forEach(option => {
            option.addEventListener('change', function() {
                const selectedMethod = this.value;
                
                // Hide all instructions
                paymentInstructions.forEach(instruction => {
                    instruction.classList.remove('active');
                });
                
                // Show selected instruction
                const selectedInstruction = document.getElementById(`${selectedMethod}Instructions`);
                if (selectedInstruction) {
                    selectedInstruction.classList.add('active');
                }
                
                // Update M-Pesa amount if needed
                if (selectedMethod === 'mpesa') {
                    updateMpesaAmount();
                }
            });
        });
        
        // Place order button
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', function() {
                placeOrder();
            });
        }
        
        // Order confirmation modal
        const confirmationClose = document.getElementById('confirmationClose');
        if (confirmationClose) {
            confirmationClose.addEventListener('click', () => {
                document.getElementById('orderConfirmation').classList.remove('active');
            });
        }
    }
    
    function updateCheckoutPage() {
        const checkoutItems = document.getElementById('checkoutItems');
        const subtotalElement = document.getElementById('subtotal');
        const serviceChargeElement = document.getElementById('serviceCharge');
        const taxElement = document.getElementById('tax');
        const checkoutTotalElement = document.getElementById('checkoutTotal');
        
        if (!checkoutItems) return;
        
        // Clear current items
        checkoutItems
