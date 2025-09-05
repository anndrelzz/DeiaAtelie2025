document.addEventListener('DOMContentLoaded', function() {
    // Handle admin login form submission
    const adminForm = document.getElementById('admin-form');
    
    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(adminForm);
            const data = {
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            console.log('Admin login data:', data);
            
            // Here you would typically validate credentials with your backend
            // For demo purposes, we'll use dummy credentials
            if (data.email === 'admin@deiaatelie.com' && data.password === 'admin123') {
                alert('Login administrativo realizado com sucesso!');
                // Redirect to admin dashboard (you would create this page)
                // window.location.href = 'admin-dashboard.html';
            } else {
                alert('Credenciais inválidas. Tente novamente.');
            }
        });
    }

    // Add some interactive effects
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.2s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // Add animation to the admin card on load
    const adminCard = document.querySelector('.admin-card');
    if (adminCard) {
        setTimeout(() => {
            adminCard.style.animation = 'slide-up 0.6s ease-out';
        }, 100);
    }
});