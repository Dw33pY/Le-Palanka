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
            hamburger.addEventListener('click', function(e) {
                e.stopPropagation();
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
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', function(event) {
                if (mobileMenu.classList.contains('active') && 
                    !mobileMenu.contains(event.target) && 
                    !hamburger.contains(event.target)) {
                    mobileMenu.classList.remove('active');
                    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        }
    }
    
    // ===== SMOOTH SCROLLING =====
    function initSmoothScrolling() {
        const scrollLinks = document.querySelectorAll('.scroll-link');
        
        scrollLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#' || !targetId.startsWith('#')) return;
                
                e.preventDefault();
                
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
                const originalText = this.textContent;
                this.textContent = 'Added!';
                this.style.backgroundColor = '#2e8b57';
                
                setTimeout(() => {
                    this.textContent = originalText;
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
                    
                    // Close mobile menu if open
                    const mobileMenu = document.getElementById('mobileMenu');
                    const hamburger = document.getElementById('hamburger');
                    
                    if (mobileMenu && mobileMenu.classList.contains('active')) {
                        mobileMenu.classList.remove('active');
                        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                    }
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
                    <button class="cart-item-remove" data-index="${index}" aria-label="Remove item"><i class="fas fa-trash"></i></button>
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
                
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobileMenu');
                const hamburger = document.getElementById('hamburger');
                
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                }
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
        const timeInput = document.getElementById('time');
        
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            
            // Set default to tomorrow
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 1);
            dateInput.value = defaultDate.toISOString().split('T')[0];
            
            // Add placeholder attribute
            dateInput.setAttribute('placeholder', 'Select Date');
        }
        
        if (timeInput) {
            // Set default time to 7:00 PM
            timeInput.value = '19:00';
            
            // Add placeholder attribute
            timeInput.setAttribute('placeholder', 'Select Time');
            
            // Set min and max times (restaurant hours)
            timeInput.min = '11:00';
            timeInput.max = '23:00';
        }
        
        // Set default guests to 2
        const guestsSelect = document.getElementById('guests');
        if (guestsSelect) {
            guestsSelect.value = '2';
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
            
            // Format date for display
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            // Format time for display
            const timeParts = time.split(':');
            let hours = parseInt(timeParts[0]);
            const minutes = timeParts[1];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // Convert 0 to 12
            const formattedTime = `${hours}:${minutes} ${ampm}`;
            
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
            alert(`Thank you, ${name}!\n\nYour table for ${guests} on ${formattedDate} at ${formattedTime} has been reserved.\n\nWe've sent a confirmation to ${email} and will call you at ${phone} to confirm.`);
            
            // Reset form
            reservationForm.reset();
            
            // Reset date and time to defaults
            if (dateInput) {
                const defaultDate = new Date();
                defaultDate.setDate(defaultDate.getDate() + 1);
                dateInput.value = defaultDate.toISOString().split('T')[0];
            }
            
            if (timeInput) {
                timeInput.value = '19:00';
            }
            
            if (guestsSelect) {
                guestsSelect.value = '2';
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
        const orderConfirmationModal = document.getElementById('orderConfirmation');
        
        if (confirmationClose && orderConfirmationModal) {
            confirmationClose.addEventListener('click', () => {
                orderConfirmationModal.classList.remove('active');
            });
            
            // Close modal when clicking outside
            orderConfirmationModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
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
        checkoutItems.innerHTML = '';
        
        if (cart.length === 0) {
            checkoutItems.innerHTML = '<p class="empty-order-msg">Your cart is empty. <a href="menu.html">Browse our menu</a></p>';
            
            // Set all totals to 0
            if (subtotalElement) subtotalElement.textContent = 'KSH 0';
            if (serviceChargeElement) serviceChargeElement.textContent = 'KSH 0';
            if (taxElement) taxElement.textContent = 'KSH 0';
            if (checkoutTotalElement) checkoutTotalElement.textContent = 'KSH 0';
            
            // Disable place order button
            const placeOrderBtn = document.getElementById('placeOrderBtn');
            if (placeOrderBtn) {
                placeOrderBtn.disabled = true;
                placeOrderBtn.textContent = 'Cart is Empty';
                placeOrderBtn.style.opacity = '0.6';
                placeOrderBtn.style.cursor = 'not-allowed';
            }
            
            return;
        }
        
        // Calculate totals
        let subtotal = 0;
        
        // Add cart items
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <div class="order-item-name">${item.name} x ${item.quantity}</div>
                <div>
                    <span class="order-item-price">KSH ${(item.price * item.quantity).toLocaleString()}</span>
                    <button class="order-item-remove" data-index="${index}" aria-label="Remove item"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            checkoutItems.appendChild(itemElement);
            subtotal += item.price * item.quantity;
        });
        
        // Calculate charges
        const serviceCharge = subtotal * 0.10; // 10% service charge
        const tax = (subtotal + serviceCharge) * 0.16; // 16% VAT
        const total = subtotal + serviceCharge + tax;
        
        // Update UI
        if (subtotalElement) subtotalElement.textContent = `KSH ${Math.round(subtotal).toLocaleString()}`;
        if (serviceChargeElement) serviceChargeElement.textContent = `KSH ${Math.round(serviceCharge).toLocaleString()}`;
        if (taxElement) taxElement.textContent = `KSH ${Math.round(tax).toLocaleString()}`;
        if (checkoutTotalElement) checkoutTotalElement.textContent = `KSH ${Math.round(total).toLocaleString()}`;
        
        // Update M-Pesa amount
        updateMpesaAmount();
        
        // Add event listeners to remove buttons
        const removeButtons = checkoutItems.querySelectorAll('.order-item-remove');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
        
        // Enable place order button
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        if (placeOrderBtn) {
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = 'Place Order';
            placeOrderBtn.style.opacity = '1';
            placeOrderBtn.style.cursor = 'pointer';
        }
    }
    
    function updateMpesaAmount() {
        const checkoutTotalElement = document.getElementById('checkoutTotal');
        const mpesaAmountElement = document.getElementById('mpesaAmount');
        
        if (!checkoutTotalElement || !mpesaAmountElement) return;
        
        // Extract the total amount from the text
        const totalText = checkoutTotalElement.textContent;
        const amount = totalText.replace('KSH ', '').replace(/,/g, '');
        
        mpesaAmountElement.textContent = amount;
    }
    
    function placeOrder() {
        // Get customer details
        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const deliveryAddress = document.getElementById('deliveryAddress').value;
        const orderNotes = document.getElementById('orderNotes').value;
        
        // Get selected payment method
        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        if (!selectedPayment) {
            alert('Please select a payment method');
            return;
        }
        
        const paymentMethod = selectedPayment.value;
        
        // Validation
        if (!customerName || !customerEmail || !customerPhone) {
            alert('Please fill in all required customer details');
            return;
        }
        
        // Calculate totals
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        
        const serviceCharge = subtotal * 0.10;
        const tax = (subtotal + serviceCharge) * 0.16;
        const total = subtotal + serviceCharge + tax;
        
        // Create order object
        const order = {
            id: Date.now(),
            customer: {
                name: customerName,
                email: customerEmail,
                phone: customerPhone,
                address: deliveryAddress
            },
            items: [...cart],
            subtotal: Math.round(subtotal),
            serviceCharge: Math.round(serviceCharge),
            tax: Math.round(tax),
            total: Math.round(total),
            paymentMethod: paymentMethod,
            notes: orderNotes,
            date: new Date().toISOString(),
            status: 'pending'
        };
        
        // Save order to localStorage
        let orders = JSON.parse(localStorage.getItem('lePalankaOrders')) || [];
        orders.push(order);
        localStorage.setItem('lePalankaOrders', JSON.stringify(orders));
        
        // Clear cart
        cart = [];
        localStorage.setItem('lePalankaCart', JSON.stringify(cart));
        updateCartCount();
        
        // Show order summary in modal
        const orderSummaryText = document.getElementById('orderSummaryText');
        if (orderSummaryText) {
            orderSummaryText.innerHTML = `
                <strong>Order #${order.id}</strong><br>
                <strong>Total:</strong> KSH ${order.total.toLocaleString()}<br>
                <strong>Payment:</strong> ${paymentMethod.toUpperCase()}<br>
                ${deliveryAddress ? `<strong>Delivery to:</strong> ${deliveryAddress}` : '<strong>Pickup at restaurant</strong>'}
            `;
        }
        
        // Show confirmation modal
        document.getElementById('orderConfirmation').classList.add('active');
        
        // Clear checkout form
        document.getElementById('customerName').value = '';
        document.getElementById('customerEmail').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('deliveryAddress').value = '';
        document.getElementById('orderNotes').value = '';
        
        // Update checkout page to show empty cart
        updateCheckoutPage();
    }
    
    // ===== BACK TO TOP BUTTON =====
    function initBackToTop() {
        const backToTopButton = document.getElementById('backToTop');
        
        if (!backToTopButton) return;
        
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        // Scroll to top when clicked
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ===== INITIALIZE QUICK CART =====
    updateQuickCart();
});

// Fix for mobile viewport height
function setVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Initial set
setVH();

// Update on resize
window.addEventListener('resize', setVH);