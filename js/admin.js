document.addEventListener('DOMContentLoaded', function() {
    
    // --- Seletores do Formulário ---
    const adminForm = document.getElementById('admin-form');
    const errorMessage = document.getElementById('error-message'); // Para mostrar erros de login
    
    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Limpa mensagens de erro antigas
            if (errorMessage) {
                errorMessage.textContent = '';
            }

            const formData = new FormData(adminForm);
            const data = {
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            console.log('Admin login data:', data);
            
            // ---------------------------------------------------------------
            // !!! CUIDADO: SIMULAÇÃO DE LOGIN - VULNERÁVEL !!!
            // ---------------------------------------------------------------
            // Esta lógica NUNCA deve existir no JavaScript (lado do cliente).
            // O correto é enviar 'data' para um backend (servidor) usando fetch()
            // e o servidor deve verificar as credenciais no banco de dados.
            
            if (data.email === 'admin@deiaatelie.com' && data.password === 'admin123') {
                alert('Login administrativo realizado com sucesso!');
                
                // Redireciona para o painel admin
                window.location.href = 'deia_admin.html'; // <--- AQUI ESTÁ A SUA ALTERAÇÃO
                
            } else {
                // Mostra a mensagem de erro no HTML em vez de um alert()
                if (errorMessage) {
                    errorMessage.textContent = 'Credenciais inválidas. Tente novamente.';
                } else {
                    alert('Credenciais inválidas. Tente novamente.');
                }
            }
            // --- FIM DA SIMULAÇÃO DE LOGIN ---
        });
    }

    // --- Efeitos de UI (Interativos) ---
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        // Efeito de zoom no foco
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.2s ease';
            
            // Limpa a mensagem de erro ao começar a digitar
            if (errorMessage) {
                errorMessage.textContent = '';
            }
        });
        
        // Reseta o zoom ao sair do foco
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // --- Animação de Entrada ---
    const adminCard = document.querySelector('.admin-card');
    if (adminCard) {
        // Garante que a animação CSS seja aplicada
        adminCard.classList.add('slide-up-animation');
    }
});