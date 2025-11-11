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
function getClientName(clientId) {
    const client = currentClients.find(c => c.id == clientId);
    return client ? client.nome : `ID ${clientId} Desconhecido`;
}
function getServiceName(serviceId) {
    const service = currentServices.find(s => s.id == serviceId);
    return service ? service.nome : `ID ${serviceId} Desconhecido`;
}
function getServicePrice(serviceId) {
    const service = currentServices.find(s => s.id == serviceId);
    return service ? Number(service.preco) : 0;
}
function isoToLocalDate(isoString) {
    if (!isoString) return { date: '', time: '' };
    try {
        const date = new Date(isoString);
        const yyyy = date.getUTCFullYear();
        const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(date.getUTCDate()).padStart(2, '0');
        const hh = String(date.getUTCHours()).padStart(2, '0');
        const mi = String(date.getUTCMinutes()).padStart(2, '0');
        return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
    } catch {
        return { date: '', time: '' };
    }
}
function localToISO(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    return `${dateStr}T${timeStr}:00.000Z`;
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
        renderServicesGrid(); // <-- CORREÇÃO ESTÁ AQUI
    } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        showToast(`Erro ao carregar serviços: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

async function loadClients() {
    console.log("A carregar clientes da API...");
    showLoading();
    try {
        const clients = await window.API.adminFetchClients();
        currentClients = clients;
        console.log("Clientes carregados:", currentClients);
        renderClientsTable(); // <-- CORREÇÃO ESTÁ AQUI
    } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        showToast(`Erro ao carregar clientes: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

async function loadAppointments() {
    console.log("A carregar agendamentos da API...");
    showLoading();
    try {
        const appointments = await window.API.adminFetchAppointments();
        currentAppointments = appointments;
        console.log("Agendamentos carregados:", currentAppointments);
        renderAppointmentsTable();
    } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
        showToast(`Erro ao carregar agendamentos: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

async function updateClientOptions(selectId = 'appointmentClient', selectedId = null) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um cliente</option>';
    currentClients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id; 
        option.textContent = client.nome;
        if (client.id == selectedId) option.selected = true;
        select.appendChild(option);
    });
}
async function updateServiceOptions(selectId = 'appointmentService', selectedId = null) {
    const select = document.getElementById(selectId);
     if (!select) return;
    select.innerHTML = '<option value="">Selecione um serviço</option>';
    currentServices.forEach(service => {
        if(service.ativo) {
            const option = document.createElement('option');
            option.value = service.id; 
            option.textContent = `${service.nome} - ${formatCurrency(service.preco)}`;
            if (service.id == selectedId) option.selected = true;
            select.appendChild(option);
        }
    });
}

function renderAppointmentsTable() {
    const tbody = document.getElementById('appointmentsTable');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!currentAppointments || currentAppointments.length === 0) {
         tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhum agendamento encontrado.</td></tr>';
         return;
    }

    currentAppointments.forEach(app => {
        const row = document.createElement('tr');
         row.innerHTML = `
            <td data-label="ID">${app.id}</td>
            <td data-label="Cliente">${app.usuario_nome || getClientName(app.id_usuario)}</td>
            <td data-label="Serviço">${app.servico_nome || getServiceName(app.id_servico)}</td>
            <td data-label="Data">${formatDate(app.data_hora_inicio)}</td>
            <td data-label="Horário">${formatTime(app.data_hora_inicio)}</td>
            <td data-label="Valor">${formatCurrency(app.preco || getServicePrice(app.id_servico))}</td>
            <td data-label="Status">${getStatusBadge(app.status)}</td>
            <td data-label="Ações">
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editAppointment(${app.id})" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteAppointment(${app.id})" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderServicesGrid() {
    const container = document.getElementById('servicesGrid');
    if (!container) return;
    container.innerHTML = '';

    if (!currentServices || currentServices.length === 0) {
        container.innerHTML = '<p style="text-align: center;">Nenhum serviço encontrado.</p>';
        return;
    }

    currentServices.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';
        
        const isActive = service.ativo;
        if (!isActive) {
            card.style.opacity = '0.6';
        }

        card.innerHTML = `
            <div class="service-header">
                <div class="service-info">
                    <h3>${service.nome} ${isActive ? '' : '(Inativo)'}</h3>
                    <div class="service-price">${formatCurrency(service.preco)}</div>
                </div>
            </div>
            <div class="service-body">
                <p class="service-description">${service.descricao || 'Sem descrição'}</p>
                <p><strong>Duração:</strong> ${service.duracao_estimada_minutos} min</p>
                <div class="service-actions">
                    <button class="btn btn-secondary btn-sm" onclick="editService(${service.id})">Editar</button>
                    <button class="btn ${isActive ? 'btn-danger' : 'btn-primary'} btn-sm" onclick="toggleServiceActive(${service.id})">
                        ${isActive ? 'Desativar' : 'Ativar'}
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderClientsTable() {
    const tbody = document.getElementById('clientsTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (!currentClients || currentClients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum cliente encontrado.</td></tr>';
        return;
    }

    currentClients.forEach(client => {
        const appointmentCount = currentAppointments.filter(a => a.id_usuario == client.id).length;
        const row = document.createElement('tr');
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

async function editAppointment(id) {
    const app = currentAppointments.find(a => a.id == id);
    if (!app) return showToast("Agendamento não encontrado.", "error");

    document.getElementById('appointmentModalTitle').textContent = 'Editar Agendamento';
    document.getElementById('appointmentForm').reset();
    document.getElementById('appointmentId').value = app.id;
    
    await updateClientOptions('appointmentClient', app.id_usuario);
    await updateServiceOptions('appointmentService', app.id_servico);
    
    const { date, time } = isoToLocalDate(app.data_hora_inicio);
    document.getElementById('appointmentDate').value = date;
    document.getElementById('appointmentTime').value = time;
    
    document.getElementById('appointmentValue').value = app.preco || getServicePrice(app.id_servico);
    document.getElementById('appointmentStatus').value = app.status;
    document.getElementById('appointmentObservations').value = app.observacoes;
    
    openModal('appointmentModal');
}

async function saveAppointment() {
    const id = document.getElementById('appointmentId').value;
    const isEditing = !!id;

    if (!isEditing) {
        return showToast("A criação de novos agendamentos pelo admin ainda não está implementada.", "info");
    }
    
    const dateStr = document.getElementById('appointmentDate').value;
    const timeStr = document.getElementById('appointmentTime').value;
    if (!dateStr || !timeStr) return showToast("Data e Horário são obrigatórios.", "error");

    const dataHoraInicioISO = localToISO(dateStr, timeStr);
    
    const serviceId = document.getElementById('appointmentService').value;
    const service = currentServices.find(s => s.id == serviceId);
    const serviceDuration = service ? service.duracao_estimada_minutos : 60;
    
    const dataHoraFim = new Date(new Date(dataHoraInicioISO).getTime() + serviceDuration * 60000);
    const dataHoraFimISO = dataHoraFim.toISOString();

    const appointmentData = {
        id_usuario: parseInt(document.getElementById('appointmentClient').value),
        id_servico: parseInt(serviceId),
        data_hora_inicio: dataHoraInicioISO,
        data_hora_fim: dataHoraFimISO,
        preco: parseFloat(document.getElementById('appointmentValue').value),
        status: document.getElementById('appointmentStatus').value,
        observacoes: document.getElementById('appointmentObservations').value || null,
    };
    
    if (isNaN(appointmentData.id_usuario) || isNaN(appointmentData.id_servico)) {
        return showToast("Cliente e Serviço são obrigatórios.", "error");
    }

    showLoading();
    try {
        await window.API.adminUpdateAppointment(id, appointmentData);
        showToast(`Agendamento atualizado!`, 'success');
        closeModal('appointmentModal');
        await loadAppointments();
        await updateDashboard();
        
    } catch (error) {
        console.error("Erro ao salvar agendamento:", error);
        showToast(`Erro: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

async function deleteAppointment(id) {
     if (!confirm('Excluir este agendamento permanentemente?')) return;
     showLoading();
     try {
         await window.API.adminDeleteAppointment(id);
         showToast('Agendamento excluído!', 'success');
         await loadAppointments();
         await updateDashboard();
     } catch (error) {
         console.error("Erro ao excluir agendamento:", error);
         showToast(`Erro: ${error.message}`, 'error');
     } finally {
         hideLoading();
     }
}

function editService(id) {
    const service = currentServices.find(s => s.id == id);
    if (!service) return showToast("Serviço não encontrado.", "error");

    document.getElementById('serviceModalTitle').textContent = 'Editar Serviço';
    document.getElementById('serviceForm').reset();
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
    
    if (isEditing) {
        const service = currentServices.find(s => s.id == id);
        serviceData.ativo = service.ativo;
    }

    if (!serviceData.nome || isNaN(serviceData.preco) || isNaN(serviceData.duracao_estimada_minutos)) {
        return showToast("Nome, Preço e Duração são obrigatórios.", "error");
    }

    showLoading();
    try {
        if (isEditing) {
            await window.API.adminUpdateService(id, serviceData);
        } else {
            await window.API.adminCreateService(serviceData);
        }
        
        showToast(`Serviço ${isEditing ? 'atualizado' : 'criado'}!`, 'success');
        closeModal('serviceModal');
        await loadServices();
        
    } catch (error) {
        console.error("Erro ao salvar serviço:", error);
        showToast(`Erro: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

async function toggleServiceActive(id) {
    const service = currentServices.find(s => s.id == id);
    if (!service) return showToast("Serviço não encontrado.", "error");

    const newState = !service.ativo;
    const actionText = newState ? 'ATIVAR' : 'DESATIVAR';

    if (!confirm(`Tem a certeza que quer ${actionText} este serviço?`)) return;
     
    showLoading();
    try {
        const serviceData = { ...service, ativo: newState };
        await window.API.adminUpdateService(id, serviceData);
        
        showToast(`Serviço ${newState ? 'ativado' : 'desativado'}!`, 'success');
        await loadServices(); 
        
    } catch (error) {
        console.error("Erro ao alterar estado do serviço:", error);
        showToast(`Erro: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

function editClient(id) {
    const client = currentClients.find(c => c.id == id);
    if (!client) return showToast("Cliente não encontrado.", "error");

    document.getElementById('clientModalTitle').textContent = 'Editar Cliente';
    document.getElementById('clientForm').reset();
    document.getElementById('clientId').value = client.id;
    document.getElementById('clientName').value = client.nome;
    document.getElementById('clientEmail').value = client.email;
    document.getElementById('clientPhone').value = client.telefone;
    
    const passwordInput = document.getElementById('clientPassword');
    passwordInput.placeholder = "(Deixe em branco para não alterar)";
    passwordInput.required = false; 
    
    openModal('clientModal');
}

async function saveClient() {
     const id = document.getElementById('clientId').value;
     const isEditing = !!id;

     const clientData = {
         nome: document.getElementById('clientName').value,
         email: document.getElementById('clientEmail').value,
         telefone: document.getElementById('clientPhone').value || null,
         tipo_usuario: 'cliente',
         senha: document.getElementById('clientPassword').value || null
     };
     
    if (!clientData.nome || !clientData.email) {
        return showToast("Nome e Email são obrigatórios.", "error");
    }
     
    if (!isEditing && !clientData.senha) {
        return showToast("Senha é obrigatória para novos clientes.", "error");
    }

     showLoading();
     try {
        if (isEditing) {
            if (!clientData.senha) delete clientData.senha;
            await window.API.adminUpdateClient(id, clientData);
        } else {
            await window.API.adminCreateClient(clientData);
        }
        showToast(`Cliente ${isEditing ? 'atualizado' : 'criado'}!`, 'success');
        closeModal('clientModal');
        await loadClients();
        
     } catch (error) {
         console.error("Erro ao salvar cliente:", error);
         showToast(`Erro: ${error.message}`, 'error');
     } finally {
         hideLoading();
     }
}

async function deleteClient(id) {
     if (!confirm('APAGAR este cliente? (Atenção: isto só funciona se o cliente não tiver agendamentos!)')) return;
     showLoading();
     try {
        await window.API.adminDeleteClient(id);
        showToast('Cliente apagado!', 'success');
        await loadClients();
     } catch (error) {
         console.error("Erro ao apagar cliente:", error);
         showToast(`Erro: ${error.message}`, 'error');
     } finally {
         hideLoading();
     }
}

async function updateDashboard() {
    console.log("A atualizar Dashboard...");
    
    showLoading();
    // Garante que os dados estão carregados antes de mostrar o dashboard
    if (currentAppointments.length === 0 || currentClients.length === 0 || currentServices.length === 0) {
        await loadServices();
        await loadClients();
        await loadAppointments(); // loadAppointments já tem hideLoading()
    } else {
        hideLoading();
    }

    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    const todayAppointments = currentAppointments.filter(a =>
        a.data_hora_inicio?.startsWith(today) &&
        a.status !== 'cancelado' && a.status !== 'concluído'
    );
    const todayAppointmentsValueEl = document.querySelector('#dashboard .stats-grid .stat-card:nth-child(1) .stat-value');
    if(todayAppointmentsValueEl) todayAppointmentsValueEl.textContent = todayAppointments.length;

    const monthlyAppointmentsCount = currentAppointments.filter(a => a.data_hora_inicio?.startsWith(thisMonth)).length;
    const monthlyAppointmentsValueEl = document.querySelector('#dashboard .stats-grid .stat-card:nth-child(2) .stat-value');
    if(monthlyAppointmentsValueEl) monthlyAppointmentsValueEl.textContent = monthlyAppointmentsCount;

    const completedThisMonth = currentAppointments.filter(a => a.status === 'concluído' && a.data_hora_inicio?.startsWith(thisMonth));
    const monthlyRevenue = completedThisMonth.reduce((sum, a) => sum + (Number(a.preco) || getServicePrice(a.id_servico)), 0);
    const monthlyRevenueValueEl = document.querySelector('#dashboard .stats-grid .stat-card:nth-child(3) .stat-value');
    if(monthlyRevenueValueEl) monthlyRevenueValueEl.textContent = formatCurrency(monthlyRevenue);

    const dashboardTbody = document.getElementById('dashboardAppointments');
    if (dashboardTbody) {
        dashboardTbody.innerHTML = ''; 
        if (todayAppointments.length === 0) {
            dashboardTbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Nenhum agendamento para hoje.</td></tr>`;
        } else {
            todayAppointments.sort((a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio));
            todayAppointments.forEach(app => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-label="Cliente">${app.usuario_nome || getClientName(app.id_usuario)}</td>
                    <td data-label="Serviço">${app.servico_nome || getServiceName(app.id_servico)}</td>
                    <td data-label="Data">${formatDate(app.data_hora_inicio)}</td>
                    <td data-label="Horário">${formatTime(app.data_hora_inicio)}</td>
                    <td data-label="Status">${getStatusBadge(app.status)}</td>
                `;
                dashboardTbody.appendChild(row);
            });
        }
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
        case 'appointments': loadAppointments(); break;
        case 'services': loadServices(); break;
        case 'clients': loadClients(); break;
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
    
    showLoading();
    await loadServices();
    await loadClients();
    await loadAppointments();
    hideLoading();

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

    document.getElementById('newAppointmentBtn')?.addEventListener('click', async () => {
        document.getElementById('appointmentModalTitle').textContent = 'Novo Agendamento';
        document.getElementById('appointmentForm')?.reset();
        document.getElementById('appointmentId').value = '';
        await updateClientOptions('appointmentClient');
        await updateServiceOptions('appointmentService');
        openModal('appointmentModal');
    });
    document.getElementById('addAppointmentBtn')?.addEventListener('click', () => { 
        document.getElementById('newAppointmentBtn')?.click(); 
    });
    
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
        passwordInput.placeholder = "Senha (obrigatória para novo)";
        passwordInput.required = true;
        openModal('clientModal');
    });

    document.getElementById('saveAppointmentBtn')?.addEventListener('click', saveAppointment);
    document.getElementById('saveServiceBtn')?.addEventListener('click', saveService);
    document.getElementById('saveClientBtn')?.addEventListener('click', saveClient);

    document.querySelectorAll('.modal-close, button.btn-secondary[data-modal]').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal') || this.closest('.modal')?.id;
            if (modalId) closeModal(modalId);
        });
    });
    
    document.getElementById('appointmentService')?.addEventListener('change', function() {
        const serviceId = this.value;
        const servicePrice = getServicePrice(serviceId);
        const valueInput = document.getElementById('appointmentValue');
        if(valueInput) valueInput.value = servicePrice;
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

window.editAppointment = editAppointment;
window.deleteAppointment = deleteAppointment;
window.editService = editService;
window.toggleServiceActive = toggleServiceActive;
window.editClient = editClient;
window.deleteClient = deleteClient;