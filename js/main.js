// Main JavaScript for DeiaAtelie website

document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const modal = document.getElementById('login-modal');
    const loginBtn = document.getElementById('login-btn');
    const modalClose = document.getElementById('modal-close');
    const modalBackdrop = modal?.querySelector('.modal-backdrop');
    const toggleMode = document.getElementById('toggle-mode');
    const modalTitle = document.getElementById('modal-title');
    const submitText = document.getElementById('submit-text');
    const toggleText = document.getElementById('toggle-text');
    const nameField = document.getElementById('name-field');
    const nameInput = document.getElementById('modal-name');
    
    let isLoginMode = true;

    // Open modal
    function openModal() {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Close modal
    function closeModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Toggle between login and register
    function toggleAuthMode() {
        isLoginMode = !isLoginMode;
        
        if (isLoginMode) {
            modalTitle.textContent = 'Entrar na sua conta';
            submitText.textContent = 'Entrar';
            toggleText.textContent = 'Não tem uma conta? ';
            toggleMode.textContent = 'Cadastre-se';
            nameField.style.display = 'none';
            nameInput.required = false;
        } else {
            modalTitle.textContent = 'Criar nova conta';
            submitText.textContent = 'Cadastrar';
            toggleText.textContent = 'Já tem uma conta? ';
            toggleMode.textContent = 'Faça login';
            nameField.style.display = 'block';
            nameInput.required = true;
        }
    }

    // Event listeners
    if (loginBtn) {
        loginBtn.addEventListener('click', openModal);
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeModal);
    }

    if (toggleMode) {
        toggleMode.addEventListener('click', toggleAuthMode);
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            closeModal();
        }
    });

    // Handle login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const email = formData.get('email');
            const senha = formData.get('password');
            const nome = formData.get('name');

            // Adiciona feedback de loading no botão
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            // Você pode adicionar um estilo CSS para .spinner se quiser
            submitBtn.innerHTML = '<span class="spinner"></span> Carregando...'; 

            try {
                if (isLoginMode) {
                    // --- LÓGICA DE LOGIN ---
                    console.log('Tentando login com:', { email, senha });
                    // Chama a função de login da api.js
                    await window.API.loginUser({ email, senha }); 
                    
                    alert('Login realizado com sucesso!');
                    closeModal();
                    // TODO: Atualizar a UI para mostrar que está logado
                    // (ex: mudar o botão "Entrar" para "Minha Conta")
                    
                } else {
                    // --- LÓGICA DE REGISTRO ---
                    console.log('Tentando registrar com:', { nome, email, senha });
                    // Chama a função de registro da api.js
                    await window.API.registerUser({ nome, email, senha }); 
                    
                    alert('Cadastro realizado com sucesso! Você já está logado.');
                    closeModal();
                    // TODO: Atualizar a UI
                }
                
                // Sucesso
                loginForm.reset();

            } catch (error) {
                // Se o backend der um erro (ex: email já existe, senha errada)
                console.error('Falha no login/registro:', error);
                alert(`Erro: ${error.message}`);
            } finally {
                // Restaura o botão
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 64; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Update active navigation link based on scroll position
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`a[href="#${sectionId}"]`);

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                // Remove active class from all nav links
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to current nav link
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    }

    // Listen for scroll events to update active nav link
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                updateActiveNavLink();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Initialize animations on scroll
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.feature-card, .about-content, .services-card, .contact-info, .contact-form-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    // Initialize scroll animations
    initScrollAnimations();
});