document.addEventListener('DOMContentLoaded', function() {
    
    const adminForm = document.getElementById('admin-form');
    const errorMessageContainer = document.createElement('p');
    errorMessageContainer.id = 'error-message';
    errorMessageContainer.style.color = 'var(--destructive)';
    errorMessageContainer.style.textAlign = 'center';
    errorMessageContainer.style.marginTop = '1rem';
    
    if (adminForm) {
        adminForm.querySelector('button[type="submit"]').before(errorMessageContainer);
        
        adminForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            errorMessageContainer.textContent = '';

            const formData = new FormData(adminForm);
            
            // --- ESTA É A CORREÇÃO ---
            const data = {
                email: formData.get('email'),
                senha: formData.get('password') // Alterado de 'password' para 'senha'
            };
            // --- FIM DA CORREÇÃO ---

            const submitBtn = adminForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'A aceder...';
            
            try {
                console.log('A tentar login de admin com:', data.email);
                await window.API.loginAdmin(data); 
                
                window.location.href = 'deia_admin.html';
                
            } catch (error) {
                console.error('Falha no login de admin:', error);
                errorMessageContainer.textContent = error.message;
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.2s ease';
            
            errorMessageContainer.textContent = '';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    const adminCard = document.querySelector('.admin-card');
    if (adminCard) {
        adminCard.classList.add('slide-up-animation');
    }
});