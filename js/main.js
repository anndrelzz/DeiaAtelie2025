document.addEventListener('DOMContentLoaded', function() {
    
    let servicosCache = [];
    let agendaConfigCache = [];
    let horariosDisponiveisCache = [];
    let selectedService = null;

    const loginModal = document.getElementById('login-modal');
    const loginBtn = document.getElementById('login-btn');
    const modalClose = document.getElementById('modal-close');
    const modalBackdrop = loginModal?.querySelector('.modal-backdrop');
    const toggleMode = document.getElementById('toggle-mode');
    const modalTitle = document.getElementById('modal-title');
    const submitText = document.getElementById('submit-text');
    const toggleText = document.getElementById('toggle-text');
    const nameField = document.getElementById('name-field');
    const nameInput = document.getElementById('modal-name');
    const loginForm = document.getElementById('login-form');

    const agendamentoModal = document.getElementById('agendamento-modal');
    const agendamentoModalClose = document.getElementById('agendamento-modal-close');
    const agendamentoBackdrop = agendamentoModal?.querySelector('.modal-backdrop');
    const agendamentoForm = document.getElementById('agendamento-form');
    const btnAgendarHero = document.getElementById('btn-agendar-hero');
    
    let isLoginMode = true;

    function openModal(modal) {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function localToISO(dateStr, timeStr) {
        if (!dateStr || !timeStr) return null;
        return `${dateStr}T${timeStr}:00.000Z`;
    }

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

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const email = formData.get('email');
            const senha = formData.get('password');
            const nome = formData.get('name');
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Carregando...'; 

            try {
                if (isLoginMode) {
                    await window.API.loginUser({ email, senha });
                    alert('Login realizado com sucesso!');
                } else {
                    await window.API.registerUser({ nome, email, senha });
                    alert('Cadastro realizado com sucesso! Você já está logado.');
                }
                closeModal(loginModal);
                checkLoginStatus();
                loginForm.reset();
            } catch (error) {
                console.error('Falha no login/registro:', error);
                alert(`Erro: ${error.message}`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    function checkLoginStatus() {
        const user = window.API.getUser();
        if (user) {
            loginBtn.textContent = "Sair";
            loginBtn.removeEventListener('click', openLoginModal);
            loginBtn.addEventListener('click', handleLogout);
            
            if (btnAgendarHero) {
                btnAgendarHero.removeEventListener('click', openLoginModal);
                btnAgendarHero.addEventListener('click', openAgendamentoModal);
            }
        } else {
            loginBtn.textContent = "Entrar";
            loginBtn.removeEventListener('click', handleLogout);
            loginBtn.addEventListener('click', openLoginModal);

            if (btnAgendarHero) {
                btnAgendarHero.removeEventListener('click', openAgendamentoModal);
                btnAgendarHero.addEventListener('click', openLoginModal);
            }
        }
    }
    
    function openLoginModal() {
        openModal(loginModal);
    }
    
    function handleLogout() {
        if (confirm("Tem a certeza que deseja sair?")) {
            window.API.logout();
            checkLoginStatus();
        }
    }
    
    async function openAgendamentoModal() {
        agendamentoForm.reset();
        document.getElementById('ag-horarios').innerHTML = '<p>Selecione um serviço e uma data.</p>';
        
        const selectServico = document.getElementById('ag-servico');
        selectServico.disabled = true;
        selectServico.innerHTML = '<option value="">A carregar serviços...</option>';
        
        openModal(agendamentoModal);

        try {
            const [servicos, agenda] = await Promise.all([
                window.API.fetchServices(),
                window.API.fetchAgendaConfig()
            ]);
            
            servicosCache = servicos;
            agendaConfigCache = agenda;
            
            selectServico.innerHTML = '<option value="">Selecione um serviço</option>';
            servicos.forEach(s => {
                const option = document.createElement('option');
                option.value = s.id;
                option.textContent = `${s.nome} (${s.duracao_estimada_minutos} min) - R$${s.preco}`;
                selectServico.appendChild(option);
            });
            selectServico.disabled = false;

        } catch (error) {
            console.error("Erro ao carregar dados do modal:", error);
            alert("Erro ao carregar dados para agendamento. Tente novamente.");
            closeModal(agendamentoModal);
        }
    }

    function renderHorariosDisponiveis() {
        const servicoId = document.getElementById('ag-servico').value;
        const dataInput = document.getElementById('ag-data').value;
        const container = document.getElementById('ag-horarios');

        if (!servicoId || !dataInput) {
            container.innerHTML = '<p>Selecione um serviço e uma data.</p>';
            return;
        }

        selectedService = servicosCache.find(s => s.id == servicoId);
        if (!selectedService) return;

        const diaDaSemana = new Date(`${dataInput}T12:00:00Z`).getUTCDay();
        const duracaoServico = selectedService.duracao_estimada_minutos;

        const blocosDoDia = agendaConfigCache.filter(b => b.dia_da_semana === diaDaSemana);

        if (blocosDoDia.length === 0) {
            container.innerHTML = '<p>Não há atendimento neste dia da semana.</p>';
            return;
        }

        horariosDisponiveisCache = [];
        blocosDoDia.forEach(bloco => {
            let [hInicio, mInicio] = bloco.hora_inicio.split(':').map(Number);
            let [hFim, mFim] = bloco.hora_fim.split(':').map(Number);
            
            let tempoAtual = (hInicio * 60) + mInicio;
            const tempoFim = (hFim * 60) + mFim;

            while (tempoAtual + duracaoServico <= tempoFim) {
                const h = Math.floor(tempoAtual / 60);
                const m = tempoAtual % 60;
                const horaFormatada = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                horariosDisponiveisCache.push(horaFormatada);
                tempoAtual += duracaoServico;
            }
        });

        if (horariosDisponiveisCache.length === 0) {
            container.innerHTML = '<p>Não há horários disponíveis neste dia (talvez a duração do serviço seja muito longa).</p>';
            return;
        }
        
        container.innerHTML = '';
        horariosDisponiveisCache.forEach(hora => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-horario';
            btn.textContent = hora;
            btn.dataset.hora = hora;
            btn.addEventListener('click', () => {
                container.querySelectorAll('.btn-horario').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
            container.appendChild(btn);
        });
    }

    async function handleAgendamentoSubmit(e) {
        e.preventDefault();
        
        const servicoId = document.getElementById('ag-servico').value;
        const dataStr = document.getElementById('ag-data').value;
        const horaBtn = document.querySelector('#ag-horarios .btn-horario.selected');
        const observacoes = document.getElementById('ag-observacoes').value;

        if (!servicoId || !dataStr || !horaBtn) {
            alert("Por favor, selecione um serviço, data e horário.");
            return;
        }

        if (!selectedService) {
            selectedService = servicosCache.find(s => s.id == servicoId);
        }

        const horaStr = horaBtn.dataset.hora;
        const inicioISO = localToISO(dataStr, horaStr);
        const duracao = selectedService.duracao_estimada_minutos;
        const fimISO = new Date(new Date(inicioISO).getTime() + duracao * 60000).toISOString();
        
        const submitBtn = agendamentoForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'A agendar...';

        try {
            await window.API.createAppointment({
                id_servico: parseInt(servicoId),
                inicioISO: inicioISO,
                fimISO: fimISO,
                observacoes: observacoes || null
            });
            
            alert("Agendamento realizado com sucesso!");
            closeModal(agendamentoModal);

        } catch (error) {
            console.error("Erro ao criar agendamento:", error);
            alert(`Erro ao agendar: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }

    if (loginBtn) loginBtn.addEventListener('click', openLoginModal);
    if (modalClose) modalClose.addEventListener('click', () => closeModal(loginModal));
    if (modalBackdrop) modalBackdrop.addEventListener('click', () => closeModal(loginModal));
    if (toggleMode) toggleMode.addEventListener('click', toggleAuthMode);

    if (btnAgendarHero) btnAgendarHero.addEventListener('click', openLoginModal);
    if (agendamentoModalClose) agendamentoModalClose.addEventListener('click', () => closeModal(agendamentoModal));
    if (agendamentoBackdrop) agendamentoBackdrop.addEventListener('click', () => closeModal(agendamentoModal));
    
    if (agendamentoForm) {
        agendamentoForm.addEventListener('submit', handleAgendamentoSubmit);
        document.getElementById('ag-servico').addEventListener('change', renderHorariosDisponiveis);
        document.getElementById('ag-data').addEventListener('change', renderHorariosDisponiveis);
    }
    
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 64;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });

    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`a[href="#${sectionId}"]`);
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                if (navLink) navLink.classList.add('active');
            }
        });
    }

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

    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.feature-card, .about-content, .services-card, .contact-info, .contact-form-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.style.animationPlayState = 'running';
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        animatedElements.forEach(el => observer.observe(el));
    }

    checkLoginStatus();
    initScrollAnimations();
});