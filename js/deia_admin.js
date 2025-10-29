// deia_admin.js (MODO FRONTEND - COM DADOS FALSOS E INTERATIVIDADE CORRIGIDA)

// === DADOS FALSOS PARA POPULAR A INTERFACE ===
let fakeServices = [
    { id: 1, nome: "Ajuste de Bainha Simples", preco: "50.00", duracao_estimada_minutos: 30, descricao: "Ajuste de barra em calças ou saias.", ativo: true },
    { id: 2, nome: "Costura de Vestido de Festa", preco: "350.00", duracao_estimada_minutos: 180, descricao: "Ajustes complexos ou confecção.", ativo: true },
    { id: 3, nome: "Troca de Zíper", preco: "70.00", duracao_estimada_minutos: 45, descricao: "Substituição de zíper.", ativo: true },
    { id: 4, nome: "Pequenos Reparos", preco: "30.00", duracao_estimada_minutos: 20, descricao: "Costura de botões, furos simples.", ativo: true }
];
let fakeClients = [
    { id: 101, nome: "Maria Silva", email: "maria@email.com", telefone: "(11) 98765-4321", tipo_usuario: "cliente" },
    { id: 102, nome: "Ana Santos", email: "ana@email.com", telefone: "(11) 97654-3210", tipo_usuario: "cliente" },
    { id: 103, nome: "Carlos Pereira", email: "carlos@email.com", telefone: "(11) 96543-2109", tipo_usuario: "cliente" }
];
// Define uma data de "hoje" dinâmica para os dados falsos
const today = new Date();
const todayISO = today.toISOString().split('T')[0]; // Data de hoje no formato YYYY-MM-DD
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const tomorrowISO = tomorrow.toISOString().split('T')[0];

let fakeAppointments = [
    { id: 1001, id_usuario: 101, id_servico: 1, data_hora_inicio: `${todayISO}T10:00:00Z`, data_hora_fim: `${todayISO}T10:30:00Z`, status: "confirmado", valor_estimado: 50.00, observacoes: "Calça jeans azul" },
    { id: 1002, id_usuario: 102, id_servico: 3, data_hora_inicio: `${todayISO}T14:00:00Z`, data_hora_fim: `${todayISO}T14:45:00Z`, status: "pendente", valor_estimado: 70.00, observacoes: "Jaqueta preta" },
    { id: 1003, id_usuario: 103, id_servico: 2, data_hora_inicio: `${tomorrowISO}T16:00:00Z`, data_hora_fim: `${tomorrowISO}T19:00:00Z`, status: "pendente", valor_estimado: 350.00, observacoes: "Vestido longo vermelho" },
    { id: 1004, id_usuario: 101, id_servico: 4, data_hora_inicio: "2023-10-20T09:00:00Z", data_hora_fim: "2023-10-20T09:20:00Z", status: "concluído", valor_estimado: 30.00, observacoes: "Botão da camisa social" }
];
// ===============================================

// Variáveis globais preenchidas com os dados falsos
let currentAppointments = [...fakeAppointments];
let currentServices = [...fakeServices];
let currentClients = [...fakeClients];

// --- Utility Functions ---
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
        return date.toLocaleDateString('pt-BR'); // Usa fuso local
    } catch { return 'Erro Data'; }
}
function formatTime(isoString) {
     if (!isoString) return 'N/A';
     try {
        const date = new Date(isoString);
         if (isNaN(date.getTime())) return 'Hora Inválida';
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); // Usa fuso local
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
function getClientName(clientId) {
    const client = currentClients.find(c => c.id == clientId);
    return client ? client.nome : 'Cliente Desconhecido';
}
function getServiceName(serviceId) {
    const service = currentServices.find(s => s.id == serviceId);
    return service ? service.nome : 'Serviço Desconhecido';
}
function getServicePrice(serviceId) {
    const service = currentServices.find(s => s.id == serviceId);
    return service ? Number(service.preco) : 0;
}
function getNextId(array) {
    if (!array || array.length === 0) return 1; // Retorna 1 se o array estiver vazio
    const maxId = array.reduce((max, item) => Math.max(max, item.id), 0);
    return maxId + 1;
}

// --- Loading & Modal Functions ---
function showLoading() { document.getElementById('loadingOverlay')?.classList.remove('d-none'); }
function hideLoading() { document.getElementById('loadingOverlay')?.classList.add('d-none'); }
function showToast(message, type = 'info') { alert(`[${type.toUpperCase()}] ${message}`); }

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('overlay');
    if (modal) {
        console.log(`Abrindo modal: ${modalId}`);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (overlay) overlay.classList.add('active');
    } else { console.error(`Modal "${modalId}" não encontrado.`); }
}
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('overlay');
    if (modal) {
        console.log(`Fechando modal: ${modalId}`);
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (overlay) overlay.classList.remove('active');
    } else { console.error(`Tentativa de fechar modal "${modalId}" inexistente.`); }
}

// --- Funções de Carregamento (Usam dados FALSOS) ---
async function loadData() {
    console.log("Carregando dados falsos...");
    showLoading();
    await new Promise(resolve => setTimeout(resolve, 100)); // Pequeno delay
    // Garante que estamos usando as cópias atualizadas dos arrays
    currentAppointments = [...fakeAppointments];
    currentServices = [...fakeServices];
    currentClients = [...fakeClients];
    console.log("Dados falsos carregados.");
    hideLoading();
}

// --- Functions to Populate Selects ---
async function updateClientOptions() {
    const select = document.getElementById('appointmentClient');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um cliente</option>';
    currentClients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id; option.textContent = client.nome;
        select.appendChild(option);
    });
}
async function updateServiceOptions() {
    const select = document.getElementById('appointmentService');
     if (!select) return;
    select.innerHTML = '<option value="">Selecione um serviço</option>';
    currentServices.forEach(service => {
        const option = document.createElement('option');
        option.value = service.id; option.textContent = `${service.nome} - ${formatCurrency(service.preco)}`;
        select.appendChild(option);
    });
}

// --- CRUD Functions (Renderização) ---
function renderAppointmentsTable() {
    const tbody = document.getElementById('appointmentsTable');
    if (!tbody) { console.error("#appointmentsTable não encontrado"); return; }
    tbody.innerHTML = '';

    const appointmentsToRender = currentAppointments; // Usa a variável global atualizada

    if (appointmentsToRender.length === 0) {
         tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhum agendamento encontrado.</td></tr>';
         return;
    }

    appointmentsToRender.sort((a, b) => new Date(b.data_hora_inicio) - new Date(a.data_hora_inicio));

    appointmentsToRender.forEach(appointment => {
        const row = document.createElement('tr');
        // ... (código HTML da linha da tabela como antes) ...
         row.innerHTML = `
            <td data-label="ID">${appointment.id}</td>
            <td data-label="Cliente">${getClientName(appointment.id_usuario)}</td>
            <td data-label="Serviço">${getServiceName(appointment.id_servico)}</td>
            <td data-label="Data">${formatDate(appointment.data_hora_inicio)}</td>
            <td data-label="Horário">${formatTime(appointment.data_hora_inicio)}</td>
            <td data-label="Valor">${formatCurrency(appointment.valor_estimado || getServicePrice(appointment.id_servico))}</td>
            <td data-label="Status">${getStatusBadge(appointment.status)}</td>
            <td data-label="Ações">
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editAppointment(${appointment.id})" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteAppointment(${appointment.id})" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderServicesGrid() {
    const container = document.getElementById('servicesGrid');
    if (!container) { console.error("#servicesGrid não encontrado"); return; }
    container.innerHTML = '';
    if (currentServices.length === 0) {
        container.innerHTML = '<p style="text-align: center;">Nenhum serviço cadastrado.</p>';
        return;
    }

    currentServices.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';
        // ... (código HTML do card como antes) ...
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
                    <button class="btn btn-danger btn-sm" onclick="deleteService(${service.id})">Excluir</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderClientsTable() {
    const tbody = document.getElementById('clientsTable');
    if (!tbody) { console.error("#clientsTable não encontrado"); return; }
    tbody.innerHTML = '';
    if (currentClients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum cliente encontrado.</td></tr>';
        return;
    }

    currentClients.forEach(client => {
        const appointmentCount = currentAppointments.filter(a => a.id_usuario == client.id).length;
        const row = document.createElement('tr');
         // ... (código HTML da linha da tabela como antes) ...
         row.innerHTML = `
            <td data-label="ID">${client.id}</td>
            <td data-label="Nome">${client.nome}</td>
            <td data-label="Email">${client.email}</td>
            <td data-label="Telefone">${client.telefone || 'N/A'}</td>
            <td data-label="Agendamentos">${appointmentCount}</td>
            <td data-label="Ações">
                <div class="action-buttons">
                     <button class="action-btn edit-btn" onclick="editClient(${client.id})" title="Editar"><i class="fas fa-edit"></i></button>
                     <button class="action-btn delete-btn" onclick="deleteClient(${client.id})" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}


// --- CRUD Functions (Ações - SIMULADAS) ---
function editAppointment(id) { /* ... (como antes) ... */ }
async function saveAppointment() {
    const id = document.getElementById('appointmentId').value;
    const isEditing = !!id;

    const dateStr = document.getElementById('appointmentDate').value;
    const timeStr = document.getElementById('appointmentTime').value;
    if (!dateStr || !timeStr) return showToast("Data e Horário são obrigatórios.", "error");

    const localDateTime = new Date(`${dateStr}T${timeStr}:00`);
     if (isNaN(localDateTime.getTime())) return showToast("Data ou Horário inválido.", "error");
    const dataHoraInicioISO = localDateTime.toISOString();

    const serviceId = document.getElementById('appointmentService').value;
    const service = currentServices.find(s => s.id == serviceId);
    const serviceDuration = service ? service.duracao_estimada_minutos : 60;
    const dataHoraFim = new Date(localDateTime.getTime() + serviceDuration * 60000);
    const dataHoraFimISO = dataHoraFim.toISOString();

    const appointmentData = {
        id_usuario: parseInt(document.getElementById('appointmentClient').value),
        id_servico: parseInt(serviceId),
        data_hora_inicio: dataHoraInicioISO,
        data_hora_fim: dataHoraFimISO,
        valor_estimado: parseFloat(document.getElementById('appointmentValue').value),
        status: document.getElementById('appointmentStatus').value,
        observacoes: document.getElementById('appointmentObservations').value || null,
    };

    showLoading();
    console.log("Simulando salvar agendamento:", appointmentData);

    if (isEditing) {
        appointmentData.id = parseInt(id);
        const index = currentAppointments.findIndex(a => a.id == id);
        if (index > -1) currentAppointments[index] = appointmentData;
        else { showToast("Erro: Agendamento não encontrado para edição.", "error"); hideLoading(); return; }
    } else {
        appointmentData.id = getNextId(currentAppointments);
        currentAppointments.push(appointmentData);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    hideLoading();
    showToast(`Agendamento ${isEditing ? 'atualizado' : 'criado'}!`, 'success');
    closeModal('appointmentModal');
    renderAppointmentsTable(); // Re-renderiza a tabela principal
    updateDashboard(); // Atualiza contadores e próximos agendamentos
    document.getElementById('appointmentForm').reset();
}
async function deleteAppointment(id) {
     if (!confirm('Excluir este agendamento?')) return;
     showLoading();
     console.log("Simulando exclusão de agendamento:", id);
     const index = currentAppointments.findIndex(a => a.id == id);
     if (index > -1) currentAppointments.splice(index, 1);
     else { showToast("Erro: Agendamento não encontrado.", "error"); hideLoading(); return; }
     await new Promise(resolve => setTimeout(resolve, 200));
     hideLoading();
     showToast('Agendamento excluído!', 'success');
     renderAppointmentsTable();
     updateDashboard();
}

function editService(id) { /* ... (como antes) ... */ }
async function saveService() {
     /* ... (lógica de pegar dados e validar como antes) ... */
     const id = document.getElementById('serviceId').value;
     const isEditing = !!id;
     const serviceData = { /* ... (pegar dados do form) ... */ };
     showLoading();
     console.log("Simulando salvar serviço:", serviceData);
     if (isEditing) {
         serviceData.id = parseInt(id);
         const index = currentServices.findIndex(s => s.id == id);
         if(index > -1) currentServices[index] = serviceData;
     } else {
         serviceData.id = getNextId(currentServices);
         currentServices.push(serviceData);
     }
     await new Promise(resolve => setTimeout(resolve, 300));
     hideLoading();
     showToast(`Serviço ${isEditing ? 'atualizado' : 'criado'}!`, 'success');
     closeModal('serviceModal');
     renderServicesGrid();
     updateDashboard();
     document.getElementById('serviceForm').reset();
}
async function deleteService(id) {
     if (!confirm('Excluir este serviço?')) return;
     showLoading();
     console.log("Simulando exclusão de serviço:", id);
     currentServices = currentServices.filter(s => s.id != id);
     await new Promise(resolve => setTimeout(resolve, 200));
     hideLoading();
     showToast('Serviço excluído!', 'success');
     renderServicesGrid();
     updateDashboard();
}

function editClient(id) { /* ... (como antes) ... */ }
async function saveClient() {
    /* ... (lógica de pegar dados e validar como antes) ... */
     const id = document.getElementById('clientId').value;
     const isEditing = !!id;
     const clientData = { /* ... (pegar dados do form) ... */ };
     showLoading();
     console.log("Simulando salvar cliente:", clientData);
     if (isEditing) {
         clientData.id = parseInt(id);
         const index = currentClients.findIndex(c => c.id == id);
         if(index > -1) currentClients[index] = clientData;
     } else {
         clientData.id = getNextId(currentClients);
         currentClients.push(clientData);
     }
     await new Promise(resolve => setTimeout(resolve, 300));
     hideLoading();
     showToast(`Cliente ${isEditing ? 'atualizado' : 'criado'}!`, 'success');
     closeModal('clientModal');
     renderClientsTable();
     updateDashboard();
     document.getElementById('clientForm').reset();
}
async function deleteClient(id) {
     if (!confirm('Excluir este cliente?')) return;
     showLoading();
     console.log("Simulando exclusão de cliente:", id);
     currentClients = currentClients.filter(c => c.id != id);
     await new Promise(resolve => setTimeout(resolve, 200));
     hideLoading();
     showToast('Cliente excluído!', 'success');
     renderClientsTable();
     updateDashboard();
}

// --- Dashboard Update ---
async function updateDashboard() {
    console.log("Atualizando Dashboard...");
    showLoading();
    try {
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = new Date().toISOString().slice(0, 7);

        // Agendamentos Hoje (ativos)
        const todayAppointments = currentAppointments.filter(a =>
            a.data_hora_inicio?.startsWith(today) &&
            a.status !== 'cancelado' && a.status !== 'concluído'
        );
        // Seletores corrigidos para pegar os cards corretos
        const todayAppointmentsValueEl = document.querySelector('#dashboard .stats-grid .stat-card:nth-child(1) .stat-value');
        if(todayAppointmentsValueEl) todayAppointmentsValueEl.textContent = todayAppointments.length;

        // Agendamentos no Mês
        const monthlyAppointmentsCount = currentAppointments.filter(a => a.data_hora_inicio?.startsWith(thisMonth)).length;
         const monthlyAppointmentsValueEl = document.querySelector('#dashboard .stats-grid .stat-card:nth-child(2) .stat-value');
         if(monthlyAppointmentsValueEl) monthlyAppointmentsValueEl.textContent = monthlyAppointmentsCount;

        // Faturamento Estimado
         const completedThisMonth = currentAppointments.filter(a => a.status === 'concluído' && a.data_hora_inicio?.startsWith(thisMonth));
         const monthlyRevenue = completedThisMonth.reduce((sum, a) => sum + (Number(a.valor_estimado) || getServicePrice(a.id_servico)), 0);
         const monthlyRevenueValueEl = document.querySelector('#dashboard .stats-grid .stat-card:nth-child(3) .stat-value');
         if(monthlyRevenueValueEl) monthlyRevenueValueEl.textContent = formatCurrency(monthlyRevenue);

        // Tabela Próximos Agendamentos
        const dashboardTbody = document.getElementById('dashboardAppointments');
        if (dashboardTbody) {
             dashboardTbody.innerHTML = ''; // Limpa
             if (todayAppointments.length === 0) {
                 dashboardTbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Nenhum agendamento para hoje.</td></tr>`;
             } else {
                todayAppointments.sort((a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio));
                todayAppointments.forEach(app => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td data-label="Cliente">${getClientName(app.id_usuario)}</td>
                        <td data-label="Serviço">${getServiceName(app.id_servico)}</td>
                        <td data-label="Data">${formatDate(app.data_hora_inicio)}</td>
                        <td data-label="Horário">${formatTime(app.data_hora_inicio)}</td>
                        <td data-label="Status">${getStatusBadge(app.status)}</td>
                    `;
                    dashboardTbody.appendChild(row);
                });
            }
        } else { console.error("#dashboardAppointments não encontrado"); }

    } catch (error) { console.error("Erro ao atualizar dashboard:", error); }
    finally { hideLoading(); }
}

// --- Navigation and Setup ---
function showSection(sectionId) {
    console.log("Mostrando seção:", sectionId);
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

    // Renderiza os dados da seção ativa
    switch(sectionId) {
        case 'appointments': renderAppointmentsTable(); break;
        case 'services': renderServicesGrid(); break;
        case 'clients': renderClientsTable(); break;
        case 'dashboard': updateDashboard(); break;
    }
}

// --- Init Function ---
async function init() {
    console.log("Inicializando painel admin (MODO FRONTEND COM DADOS FALSOS)...");
    document.getElementById('pageTitle').textContent = `Bem-vindo(a)!`;

    await loadData(); // Carrega os dados falsos nas variáveis globais
    await updateDashboard(); // Atualiza a UI com os dados

    console.log("Configurando Event Listeners...");

    // Navegação Sidebar
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) showSection(section);
        });
    });

    // Botão Toggle Sidebar
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.toggle('collapsed');
    });

    // Botão Menu Mobile
     document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
         document.getElementById('sidebar')?.classList.toggle('mobile-visible');
         document.getElementById('overlay')?.classList.toggle('active');
    });

    // Fechar sidebar mobile com overlay
    document.getElementById('overlay')?.addEventListener('click', () => {
         document.getElementById('sidebar')?.classList.remove('mobile-visible');
         document.getElementById('overlay')?.classList.remove('active');
    });

    // Botão Logout
    document.getElementById('logoutBtnSidebar')?.addEventListener('click', (e) => {
         e.preventDefault();
         if (confirm('Tem certeza que deseja sair?')) {
             console.log("Logout confirmado. Redirecionando para admin.html...");
             window.location.href = 'admin.html'; // Redireciona para o login
         }
     });

    // Botões "Novo/Adicionar"
    document.getElementById('newAppointmentBtn')?.addEventListener('click', async () => {
        document.getElementById('appointmentModalTitle').textContent = 'Novo Agendamento';
        document.getElementById('appointmentForm')?.reset();
        document.getElementById('appointmentId').value = '';
        await updateClientOptions();
        await updateServiceOptions();
        openModal('appointmentModal');
    });
    document.getElementById('addAppointmentBtn')?.addEventListener('click', () => { document.getElementById('newAppointmentBtn')?.click(); });
    document.getElementById('addServiceBtn')?.addEventListener('click', () => {
        document.getElementById('serviceModalTitle').textContent = 'Novo Serviço';
        document.getElementById('serviceForm')?.reset();
        document.getElementById('serviceId').value = '';
        openModal('serviceModal');
    });
    document.getElementById('addClientBtn')?.addEventListener('click', () => {
        document.getElementById('clientModalTitle').textContent = 'Novo Cliente';
        document.getElementById('clientForm')?.reset();
        document.getElementById('clientId').value = '';
        const passwordInput = document.getElementById('clientPassword');
        if(passwordInput) passwordInput.required = true; // Senha obrigatória para novo
        openModal('clientModal');
    });

    // Botões Salvar nos Modais
    document.getElementById('saveAppointmentBtn')?.addEventListener('click', saveAppointment);
    document.getElementById('saveServiceBtn')?.addEventListener('click', saveService);
    document.getElementById('saveClientBtn')?.addEventListener('click', saveClient);

    // Botões Fechar Modais e Botões Cancelar
    document.querySelectorAll('.modal-close, button.btn-secondary[data-modal]').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal') || this.closest('.modal')?.id;
            if (modalId) {
                closeModal(modalId);
            } else { console.warn("Não foi possível encontrar o ID do modal para fechar.", this); }
        });
    });

    // Atualizar valor no modal de agendamento
    document.getElementById('appointmentService')?.addEventListener('change', function() {
        const serviceId = this.value;
        const servicePrice = getServicePrice(serviceId);
        const valueInput = document.getElementById('appointmentValue');
        if(valueInput) valueInput.value = servicePrice;
    });

    // Fechar modal com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => closeModal(modal.id));
        }
    });

    // Configura a aba inicial como Dashboard
    showSection('dashboard');
    console.log("Painel admin inicializado e pronto para interação.");
}

// --- Start ---
// Garante que o DOM está pronto antes de executar o init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init(); // Chama imediatamente se o DOM já estiver pronto
}

// --- Funções Globais para Botões de Ação (onclick) ---
window.editAppointment = editAppointment;
window.deleteAppointment = deleteAppointment;
window.editService = editService;
window.deleteService = deleteService;
window.editClient = editClient;
window.deleteClient = deleteClient;