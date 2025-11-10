let currentServices = [];
let currentClients = [];
let currentAppointments = [];

function formatCurrency(value) {
    const numValue = Number(value);
    if (isNaN(numValue)) return 'R$ --,--';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
}
function formatDate(isoString) {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return 'Data Inválida';
        return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); 
    } catch { return 'Erro Data'; }
}
function formatTime(isoString) {
     if (!isoString) return 'N/A';
     try {
        const date = new Date(isoString);
         if (isNaN(date.getTime())) return 'Hora Inválida';
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }); 
    } catch { return 'Erro Hora'; }
}
function getStatusBadge(status) {
    const statusMap = {
        'pendente': { class: 'status-pendente', text: 'Pendente' },
        'confirmado': { class: 'status-confirmed', text: 'Confirmado' },
        'concluído': { class: 'status-concluído', text: 'Concluído' },
        'cancelado': { class: 'status-cancelado', text: 'Cancelado' }
    };
    const statusInfo = statusMap[status] || { class: '', text: status };
    return `<span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

function showLoading() { document.getElementById('loadingOverlay')?.classList.remove('d-none'); }
function hideLoading() { document.getElementById('loadingOverlay')?.classList.add('d-none'); }
function showToast(message, type = 'info') { 
    console.log(`[${type.toUpperCase()}] ${message}`);
    alert(`[${type.toUpperCase()}] ${message}`); 
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('overlay');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (overlay) overlay.classList.add('active');
    }
}
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('overlay');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (overlay) overlay.classList.remove('active');
    }
}

async function loadServices() {
    console.log("A carregar serviços da API...");
    showLoading();
    try {
        const services = await window.API.adminFetchServices();
        currentServices = services;
        console.log("Serviços carregados:", currentServices);
        renderServicesGrid();
    } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        showToast(`Erro ao carregar serviços: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

function renderAppointmentsTable() {
    const tbody = document.getElementById('appointmentsTable');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">(Função de Agendamentos de Admin ainda não implementada)</td></tr>';
}

function renderServicesGrid() {
    const container = document.getElementById('servicesGrid');
    if (!container) return;
    container.innerHTML = '';

    if (!currentServices || currentServices.length === 0) {
        container.innerHTML = '<p style="text-align: center;">Nenhum serviço ativo encontrado.</p>';
        return;
    }

    currentServices.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
            <div class="service-header">
                <div class="service-info">
                    <h3>${service.nome}</h3>
                    <div class="service-price">${formatCurrency(service.preco)}</div>
                </div>
            </div>
            <div class="service-body">
                <p class="service-description">${service.descricao || 'Sem descrição'}</p>
                <p><strong>Duração:</strong> ${service.duracao_estimada_minutos} min</p>
                <div class="service-actions">
                    <button class="btn btn-secondary btn-sm" onclick="editService(${service.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteService(${service.id})">Desativar</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderClientsTable() {
    const tbody = document.getElementById('clientsTable');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">(Função de Clientes de Admin ainda não implementada)</td></tr>';
}

function editService(id) {
    const service = currentServices.find(s => s.id == id);
    if (!service) return showToast("Serviço não encontrado.", "error");

    document.getElementById('serviceModalTitle').textContent = 'Editar Serviço';
    document.getElementById('serviceId').value = service.id;
    document.getElementById('serviceName').value = service.nome;
    document.getElementById('servicePrice').value = service.preco;
    document.getElementById('serviceDuration').value = service.duracao_estimada_minutos;
    document.getElementById('serviceDescription').value = service.descricao;
    
    openModal('serviceModal');
}

async function saveService() {
    const id = document.getElementById('serviceId').value;
    const isEditing = !!id;

    const serviceData = {
        nome: document.getElementById('serviceName').value,
        preco: parseFloat(document.getElementById('servicePrice').value),
        duracao_estimada_minutos: parseInt(document.getElementById('serviceDuration').value),
        descricao: document.getElementById('serviceDescription').value || null,
        ativo: true
    };

    if (!serviceData.nome || isNaN(serviceData.preco) || isNaN(serviceData.duracao_estimada_minutos)) {
        return showToast("Nome, Preço e Duração são obrigatórios e devem ser números válidos.", "error");
    }

    showLoading();
    try {
        if (isEditing) {
            console.log("A atualizar serviço:", id, serviceData);
            await window.API.adminUpdateService(id, serviceData);
        } else {
            console.log("A criar novo serviço:", serviceData);
            await window.API.adminCreateService(serviceData);
        }
        
        showToast(`Serviço ${isEditing ? 'atualizado' : 'criado'} com sucesso!`, 'success');
        closeModal('serviceModal');
        document.getElementById('serviceForm').reset();
        await loadServices(); 
        
    } catch (error) {
        console.error("Erro ao salvar serviço:", error);
        showToast(`Erro: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

async function deleteService(id) {
    if (!confirm('Tem a certeza que quer DESATIVAR este serviço?')) return;
     
    showLoading();
    try {
        console.log("A desativar serviço:", id);
        await window.API.adminDeleteService(id);
        showToast('Serviço desativado com sucesso!', 'success');
        await loadServices(); 
        
    } catch (error) {
        console.error("Erro ao desativar serviço:", error);
        showToast(`Erro: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

async function updateDashboard() {
    console.log("A atualizar Dashboard...");
    const todayAppointmentsValueEl = document.querySelector('#dashboard .stats-grid .stat-card:nth-child(1) .stat-value');
    if(todayAppointmentsValueEl) todayAppointmentsValueEl.textContent = 0;

    const monthlyAppointmentsValueEl = document.querySelector('#dashboard .stats-grid .stat-card:nth-child(2) .stat-value');
    if(monthlyAppointmentsValueEl) monthlyAppointmentsValueEl.textContent = 0;

    const monthlyRevenueValueEl = document.querySelector('#dashboard .stats-grid .stat-card:nth-child(3) .stat-value');
    if(monthlyRevenueValueEl) monthlyRevenueValueEl.textContent = formatCurrency(0);

    const dashboardTbody = document.getElementById('dashboardAppointments');
    if (dashboardTbody) {
        dashboardTbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">(Dashboard ainda não implementado)</td></tr>`;
    }
}

function showSection(sectionId) {
    console.log("A mostrar secção:", sectionId);
    document.querySelectorAll('.content-section').forEach(section => { section.classList.remove('active'); });
    const targetSection = document.getElementById(sectionId);
    if(targetSection) { targetSection.classList.add('active'); }
    else { document.getElementById('dashboard')?.classList.add('active'); sectionId = 'dashboard'; }

    document.querySelectorAll('.nav-link').forEach(link => { link.classList.remove('active'); });
    document.querySelector(`.nav-link[data-section="${sectionId}"]`)?.classList.add('active');

    const titles = {
        'dashboard': 'Dashboard', 'appointments': 'Agendamentos',
        'services': 'Serviços', 'clients': 'Clientes'
    };
    document.getElementById('pageTitle').textContent = titles[sectionId] || 'Painel';

    switch(sectionId) {
        case 'appointments': renderAppointmentsTable(); break;
        case 'services': loadServices(); break;
        case 'clients': renderClientsTable(); break;
        case 'dashboard': updateDashboard(); break;
    }
}

async function init() {
    console.log("A inicializar painel admin (MODO REAL)...");
    
    const token = window.API.getToken();
    const user = window.API.getUser();
    
    if (!token || !user || user.tipo_usuario !== 'administrador') {
        alert("Acesso negado. Por favor, faça login como administrador.");
        window.location.href = 'admin.html';
        return;
    }
    
    document.getElementById('pageTitle').textContent = `Bem-vindo(a), ${user.nome}!`;

    console.log("A configurar Event Listeners...");

    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) showSection(section);
        });
    });

    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.toggle('collapsed');
    });

     document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
         document.getElementById('sidebar')?.classList.toggle('mobile-visible');
         document.getElementById('overlay')?.classList.toggle('active');
    });

    document.getElementById('overlay')?.addEventListener('click', () => {
         document.getElementById('sidebar')?.classList.remove('mobile-visible');
         document.getElementById('overlay')?.classList.remove('active');
    });

    document.getElementById('logoutBtnSidebar')?.addEventListener('click', (e) => {
         e.preventDefault();
         if (confirm('Tem certeza que deseja sair?')) {
             window.API.logout();
             console.log("Logout confirmado. A redirecionar para admin.html...");
             window.location.href = 'admin.html'; 
         }
     });

    document.getElementById('newAppointmentBtn')?.addEventListener('click', () => {
        alert("Função de 'Novo Agendamento' ainda não implementada.");
    });
    document.getElementById('addAppointmentBtn')?.addEventListener('click', () => { 
        alert("Função de 'Novo Agendamento' ainda não implementada.");
    });
    
    document.getElementById('addServiceBtn')?.addEventListener('click', () => {
        document.getElementById('serviceModalTitle').textContent = 'Novo Serviço';
        document.getElementById('serviceForm')?.reset();
        document.getElementById('serviceId').value = '';
        openModal('serviceModal');
    });
    
    document.getElementById('addClientBtn')?.addEventListener('click', () => {
        alert("Função de 'Novo Cliente' ainda não implementada.");
    });

    document.getElementById('saveAppointmentBtn')?.addEventListener('click', () => alert("Não implementado."));
    document.getElementById('saveServiceBtn')?.addEventListener('click', saveService);
    document.getElementById('saveClientBtn')?.addEventListener('click', () => alert("Não implementado."));

    document.querySelectorAll('.modal-close, button.btn-secondary[data-modal]').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal') || this.closest('.modal')?.id;
            if (modalId) closeModal(modalId);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => closeModal(modal.id));
        }
    });

    showSection('dashboard');
    console.log("Painel admin inicializado e pronto.");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

window.editService = editService;
window.deleteService = deleteService;