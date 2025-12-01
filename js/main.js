document.addEventListener("DOMContentLoaded", function () {
  // --- ELEMENTOS GERAIS ---
  const meusAgSection = document.getElementById("meus-agendamentos");
  const meusAgContainer = document.getElementById("meus-agendamentos-conteudo");

  // Cache para agendamento
  let servicosCache = [];
  let agendaConfigCache = [];
  let horariosDisponiveisCache = [];
  let selectedService = null;

  // --- MODAL DE LOGIN / CADASTRO ---
  const loginModal = document.getElementById("login-modal");
  // O loginBtn antigo pode não existir mais no navbar, então tratamos com cuidado
  const navbarLoginBtn = document.getElementById("login-btn");

  const modalClose = document.getElementById("modal-close");
  const modalBackdrop = loginModal?.querySelector(".modal-backdrop");
  const toggleMode = document.getElementById("toggle-mode");
  const modalTitle = document.getElementById("modal-title");
  const submitText = document.getElementById("submit-text");
  const toggleText = document.getElementById("toggle-text");
  const nameField = document.getElementById("name-field");
  const nameInput = document.getElementById("modal-name");
  const loginForm = document.getElementById("login-form");

  // --- ELEMENTOS DO MENU LATERAL (NOVO) ---
  const sidebarGuestView = document.getElementById("sidebar-guest-view");
  const sidebarLoggedView = document.getElementById("sidebar-logged-view");
  const sidebarUsername = document.getElementById("sidebar-username");
  const sidebarLoginBtn = document.getElementById("sidebar-login-btn");
  const sidebarLogoutBtn = document.getElementById("sidebar-logout-btn");

  // --- MODAL DE AGENDAMENTO ---
  const agendamentoModal = document.getElementById("agendamento-modal");
  const agendamentoModalClose = document.getElementById("agendamento-modal-close");
  const agendamentoBackdrop = agendamentoModal?.querySelector(".modal-backdrop");
  const agendamentoForm = document.getElementById("agendamento-form");
  const btnAgendarHero = document.getElementById("btn-agendar-hero");

  let isLoginMode = true;

  // Função para limpar HTML e evitar injeção de código
  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // --- CARREGAR AGENDAMENTOS ---
  async function carregarHistoricoAgendamentos() {
    if (!meusAgContainer) return;

    const user = window.API.getUser();
    if (!user) {
      meusAgContainer.innerHTML = "<p>Faça login para visualizar seus agendamentos.</p>";
      return;
    }

    meusAgContainer.innerHTML = "<p style='text-align:center; padding:10px;'>🔄 Carregando...</p>";

    try {
      const itens = await window.API.fetchMyAppointments();

      if (!itens || itens.length === 0) {
        meusAgContainer.innerHTML = "<p style='text-align:center; color:#666;'>Você ainda não possui agendamentos.</p>";
        return;
      }

      const html = itens
        .map((a) => {
          const inicio = new Date(a.data_hora_inicio);
          const fim = new Date(a.data_hora_fim);

          const dataStr = inicio.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          const horaInicioStr = inicio.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const servicoNome = a.servico_nome || "Serviço";
          const status = (a.status || "pendente").toLowerCase();

          // Tratamento visual para cards dentro da sidebar
          let statusColor = "#f0ad4e"; // Amarelo (pendente)
          if (status === "confirmado") statusColor = "#5cb85c"; // Verde
          if (status === "cancelado") statusColor = "#d9534f"; // Vermelho

          return `
            <div class="appointment-card" style="border-left: 4px solid ${statusColor}; background: #fff; padding: 10px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <strong style="color:#333; font-size:0.95rem;">${escapeHtml(servicoNome)}</strong>
                    <span style="font-size:0.75rem; background:${statusColor}; color:white; padding:2px 6px; border-radius:4px;">${status}</span>
                </div>
                <div style="font-size:0.85rem; color:#555;">
                    📅 ${dataStr}<br>
                    ⏰ ${horaInicioStr}
                </div>
                ${
                  a.observacoes
                    ? `<div style="font-size:0.8rem; color:#888; margin-top:4px; font-style:italic;">"${escapeHtml(a.observacoes)}"</div>`
                    : ""
                }
            </div>
          `;
        })
        .join("");

      meusAgContainer.innerHTML = html;
    } catch (error) {
      console.error("Erro ao carregar histórico de agendamentos:", error);
      meusAgContainer.innerHTML = "<p>Erro ao carregar. Tente novamente.</p>";
    }
  }

  // --- CONTROLE DE MODAIS ---
  function openModal(modal) {
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }
  function closeModal(modal) {
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  function openLoginModal() {
    openModal(loginModal);
  }

  // --- LÓGICA DE LOGIN ---
  function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
      modalTitle.textContent = "Entrar na sua conta";
      submitText.textContent = "Entrar";
      toggleText.textContent = "Não tem uma conta? ";
      toggleMode.textContent = "Cadastre-se";
      nameField.style.display = "none";
      nameInput.required = false;
    } else {
      modalTitle.textContent = "Criar nova conta";
      submitText.textContent = "Cadastrar";
      toggleText.textContent = "Já tem uma conta? ";
      toggleMode.textContent = "Faça login";
      nameField.style.display = "block";
      nameInput.required = true;
    }
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(loginForm);
      const email = formData.get("email");
      const senha = formData.get("password");
      const nome = formData.get("name");

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Processando...';

      try {
        if (isLoginMode) {
          await window.API.loginUser({email, senha});
          alert("Login realizado com sucesso!");
        } else {
          await window.API.registerUser({nome, email, senha});
          alert("Cadastro realizado com sucesso!");
        }

        closeModal(loginModal);

        checkLoginStatus();

        loginForm.reset();
      } catch (error) {
        console.error("Falha no login/registro:", error);
        alert(`Erro: ${error.message}`);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  // --- GERENCIAMENTO DE ESTADO (LOGIN/LOGOUT) ---
  function checkLoginStatus() {
    const user = window.API.getUser();

    if (user) {
      // --- USUÁRIO LOGADO ---

      // 1. Atualiza Menu Lateral
      if (sidebarGuestView) sidebarGuestView.style.display = "none";
      if (sidebarLoggedView) sidebarLoggedView.style.display = "flex"; // ou block

      // 2. Define o nome do usuário
      if (sidebarUsername) {
        sidebarUsername.textContent = user.name || user.nome || "Cliente VIP";
      }

      // 3. Botão Logout do Menu Lateral
      if (sidebarLogoutBtn) {
        // Remove listener antigo para não duplicar
        sidebarLogoutBtn.replaceWith(sidebarLogoutBtn.cloneNode(true));
        // Pega a nova referência após o clone
        const newLogoutBtn = document.getElementById("sidebar-logout-btn");
        newLogoutBtn.addEventListener("click", handleLogout);
      }

      // 4. Botão Principal da Home (Hero) -> Abre modal de agendamento
      if (btnAgendarHero) {
        btnAgendarHero.onclick = openAgendamentoModal; // Sobrescreve evento anterior
      }

      // 5. Carrega os agendamentos na sidebar
      carregarHistoricoAgendamentos();
    } else {
      // --- USUÁRIO DESLOGADO ---

      // 1. Atualiza Menu Lateral
      if (sidebarGuestView) sidebarGuestView.style.display = "block"; // ou flex
      if (sidebarLoggedView) sidebarLoggedView.style.display = "none";

      // 2. Botão Login do Menu Lateral
      if (sidebarLoginBtn) {
        sidebarLoginBtn.onclick = openLoginModal;
      }

      // 3. Botão Principal da Home (Hero) -> Abre modal de login
      if (btnAgendarHero) {
        btnAgendarHero.onclick = openLoginModal;
      }

      // 4. Limpa lista de agendamentos (segurança visual)
      if (meusAgContainer) {
        meusAgContainer.innerHTML = "<p style='text-align:center; padding:10px; color:#777;'>Faça login para ver.</p>";
      }
    }
  }

  function handleLogout() {
    if (confirm("Tem certeza que deseja sair?")) {
      window.API.logout();
      checkLoginStatus();
      window.location.reload();
    }
  }

  function localToISO(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    return `${dateStr}T${timeStr}:00.000Z`;
  }

  async function openAgendamentoModal() {
    agendamentoForm.reset();
    document.getElementById("ag-horarios").innerHTML = "<p>Selecione um serviço e uma data.</p>";

    const selectServico = document.getElementById("ag-servico");
    selectServico.disabled = true;
    selectServico.innerHTML = '<option value="">Carregando serviços...</option>';

    openModal(agendamentoModal);

    try {
      const [servicos, agenda] = await Promise.all([window.API.fetchServices(), window.API.fetchAgendaConfig()]);

      servicosCache = servicos;
      agendaConfigCache = agenda;

      selectServico.innerHTML = '<option value="">Selecione um serviço</option>';
      servicos.forEach((s) => {
        const option = document.createElement("option");
        option.value = s.id;
        option.textContent = `${s.nome} (${s.duracao_estimada_minutos} min) - R$${s.preco}`;
        selectServico.appendChild(option);
      });
      selectServico.disabled = false;
    } catch (error) {
      console.error("Erro ao carregar dados do modal:", error);
      alert("Erro ao carregar dados para agendamento. Verifique sua conexão.");
      closeModal(agendamentoModal);
    }
  }

  function renderHorariosDisponiveis() {
    const servicoId = document.getElementById("ag-servico").value;
    const dataInput = document.getElementById("ag-data").value;
    const container = document.getElementById("ag-horarios");

    if (!servicoId || !dataInput) {
      container.innerHTML = "<p>Selecione um serviço e uma data.</p>";
      return;
    }

    selectedService = servicosCache.find((s) => s.id == servicoId);
    if (!selectedService) return;

    const dateParts = dataInput.split("-");
    const localDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const diaDaSemana = localDate.getDay();

    const duracaoServico = selectedService.duracao_estimada_minutos;
    const blocosDoDia = agendaConfigCache.filter((b) => b.dia_da_semana === diaDaSemana);

    if (blocosDoDia.length === 0) {
      container.innerHTML = "<p>Não há atendimento neste dia da semana.</p>";
      return;
    }

    horariosDisponiveisCache = [];
    blocosDoDia.forEach((bloco) => {
      let [hInicio, mInicio] = bloco.hora_inicio.split(":").map(Number);
      let [hFim, mFim] = bloco.hora_fim.split(":").map(Number);

      let tempoAtual = hInicio * 60 + mInicio;
      const tempoFim = hFim * 60 + mFim;

      while (tempoAtual + duracaoServico <= tempoFim) {
        const h = Math.floor(tempoAtual / 60);
        const m = tempoAtual % 60;
        const horaFormatada = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        horariosDisponiveisCache.push(horaFormatada);
        tempoAtual += duracaoServico;
      }
    });

    if (horariosDisponiveisCache.length === 0) {
      container.innerHTML = "<p>Sem horários para a duração deste serviço.</p>";
      return;
    }

    container.innerHTML = "";
    horariosDisponiveisCache.forEach((hora) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-horario";
      btn.textContent = hora;
      btn.dataset.hora = hora;
      btn.addEventListener("click", () => {
        container.querySelectorAll(".btn-horario").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
      container.appendChild(btn);
    });
  }

  async function handleAgendamentoSubmit(e) {
    e.preventDefault();

    const servicoId = document.getElementById("ag-servico").value;
    const dataStr = document.getElementById("ag-data").value;
    const horaBtn = document.querySelector("#ag-horarios .btn-horario.selected");
    const observacoes = document.getElementById("ag-observacoes").value;

    if (!servicoId || !dataStr || !horaBtn) {
      alert("Por favor, selecione um serviço, data e horário.");
      return;
    }

    if (!selectedService) {
      selectedService = servicosCache.find((s) => s.id == servicoId);
    }

    const horaStr = horaBtn.dataset.hora;
    const inicioISO = localToISO(dataStr, horaStr);

    const duracao = selectedService.duracao_estimada_minutos;
    const dataInicioObj = new Date(inicioISO);
    const fimISO = new Date(dataInicioObj.getTime() + duracao * 60000).toISOString();

    const submitBtn = agendamentoForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Agendando...";

    try {
      await window.API.createAppointment({
        id_servico: parseInt(servicoId),
        inicioISO: inicioISO,
        fimISO: fimISO,
        observacoes: observacoes || null,
      });

      alert("Agendamento marcado!");
      closeModal(agendamentoModal);

      carregarHistoricoAgendamentos();
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      alert(`Erro ao agendar: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  }

  // --- EVENT LISTENERS GERAIS ---

  // Login Antigo (se ainda existir, por segurança)
  if (navbarLoginBtn) navbarLoginBtn.addEventListener("click", openLoginModal);

  // Modais Login
  if (modalClose) modalClose.addEventListener("click", () => closeModal(loginModal));
  if (modalBackdrop) modalBackdrop.addEventListener("click", () => closeModal(loginModal));
  if (toggleMode) toggleMode.addEventListener("click", toggleAuthMode);

  // Modais Agendamento
  if (agendamentoModalClose) agendamentoModalClose.addEventListener("click", () => closeModal(agendamentoModal));
  if (agendamentoBackdrop) agendamentoBackdrop.addEventListener("click", () => closeModal(agendamentoModal));

  if (agendamentoForm) {
    agendamentoForm.addEventListener("submit", handleAgendamentoSubmit);
    document.getElementById("ag-servico").addEventListener("change", renderHorariosDisponiveis);
    document.getElementById("ag-data").addEventListener("change", renderHorariosDisponiveis);
  }

  // Scroll suave para links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        // Se for um modal ou algo que não é seção, ignora
        if (!targetElement.classList.contains("section") && targetElement.tagName !== "SECTION") return;

        const offsetTop = targetElement.offsetTop - 64;
        window.scrollTo({top: offsetTop, behavior: "smooth"});
      }
    });
  });

  // Animações de Scroll
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(".feature-card, .about-content, .services-card, .contact-info, .contact-form-card");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.style.animationPlayState = "running";
        });
      },
      {threshold: 0.1, rootMargin: "0px 0px -50px 0px"}
    );
    animatedElements.forEach((el) => observer.observe(el));
  }

  // INICIALIZAÇÃO
  checkLoginStatus();
  initScrollAnimations();
});
