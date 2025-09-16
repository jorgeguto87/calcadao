// Complete JavaScript for Calçadão do Automóvel

// ============================
// GLOBAL UTILITIES
// ============================

// Alert system
function showAlert(type, message) {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = message;
    
    // Clear previous alerts
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    
    // Auto-hide success and info alerts
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
    
    // Scroll to alert
    alertDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Navigation
function showHome() {
    window.location.href = "index.html";
}

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password validation
function validatePassword(password) {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return minLength && hasUppercase && hasSpecialChar;
}

// ============================
// FORMATTING FUNCTIONS
// ============================

// Format currency input
function formatCurrency(input) {
    let value = input.value.replace(/\D/g, '');
    if (value === '') {
        input.value = '';
        return;
    }
    
    value = (parseInt(value) / 100).toFixed(2);
    value = value.replace('.', ',');
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = 'R$ ' + value;
}

// Format phone number
function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length === 11) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length === 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    input.value = value;
}

// Format CEP
function formatCEP(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    input.value = value;
}

// Format CNPJ
function formatCNPJ(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');
    input.value = value;
}

// ============================
// SESSION MANAGEMENT
// ============================

function isUserLoggedIn() {
    return sessionStorage.getItem('userLoggedIn') === 'true';
}

function getUserData() {
    const userData = sessionStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

function logout() {
    sessionStorage.clear();
    localStorage.removeItem('userVehicles');
    window.location.href = 'index.html';
}

// ============================
// VEHICLE MANAGEMENT
// ============================

function getUserVehicles() {
    const vehicles = localStorage.getItem('userVehicles');
    return vehicles ? JSON.parse(vehicles) : [];
}

function removeVehicle(vehicleId) {
    const vehicles = getUserVehicles();
    const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== vehicleId);
    localStorage.setItem('userVehicles', JSON.stringify(updatedVehicles));
    
    const currentCount = parseInt(sessionStorage.getItem('userVehicleCount') || '0');
    sessionStorage.setItem('userVehicleCount', Math.max(0, currentCount - 1).toString());
    
    return updatedVehicles;
}

// Vehicle data
const vehicleData = {
    car: {
        honda: ['Civic', 'Fit', 'HR-V', 'CR-V', 'Accord', 'City', 'WR-V'],
        toyota: ['Corolla', 'Camry', 'RAV4', 'Hilux', 'Prius', 'Yaris', 'SW4'],
        volkswagen: ['Golf', 'Jetta', 'Passat', 'Tiguan', 'T-Cross', 'Polo', 'Virtus'],
        ford: ['Focus', 'Fiesta', 'EcoSport', 'Ranger', 'Mustang', 'Edge', 'Ka'],
        chevrolet: ['Onix', 'Cruze', 'Tracker', 'S10', 'Camaro', 'Equinox', 'Spin'],
        fiat: ['Uno', 'Palio', 'Strada', 'Toro', 'Argo', 'Cronos', 'Mobi'],
        hyundai: ['HB20', 'Elantra', 'Tucson', 'Santa Fe', 'Creta', 'i30'],
        nissan: ['March', 'Versa', 'Sentra', 'Kicks', 'Frontier', 'X-Trail'],
        renault: ['Sandero', 'Logan', 'Duster', 'Captur', 'Kwid', 'Oroch']
    },
    motorcycle: {
        honda: ['CB 600F', 'CBR 600RR', 'CG 160', 'XRE 300', 'PCX', 'Biz 125'],
        yamaha: ['MT-07', 'YZF-R3', 'Factor 150', 'XTZ 250', 'NMAX', 'Crosser'],
        suzuki: ['GSX-R750', 'V-Strom 650', 'Intruder 150', 'Yes 125', 'Burgman'],
        kawasaki: ['Ninja 400', 'Z400', 'Versys 650', 'Z900', 'Ninja ZX-10R'],
        bmw: ['G 310 R', 'F 850 GS', 'S 1000 RR', 'R 1250 GS'],
        ducati: ['Monster 821', 'Panigale V2', 'Multistrada 950', 'Scrambler']
    }
};

// ============================
// SEARCH AND FILTER
// ============================

function searchVehicles(vehicles, searchTerm) {
    if (!searchTerm) return vehicles;
    
    const term = searchTerm.toLowerCase();
    return vehicles.filter(vehicle => {
        return (
            vehicle.brand.toLowerCase().includes(term) ||
            vehicle.model.toLowerCase().includes(term) ||
            vehicle.color.toLowerCase().includes(term) ||
            vehicle.fuel.toLowerCase().includes(term) ||
            (vehicle.description && vehicle.description.toLowerCase().includes(term))
        );
    });
}

function filterVehiclesByType(vehicles, type) {
    if (!type || type === 'all') return vehicles;
    return vehicles.filter(vehicle => vehicle.type === type);
}

function sortVehicles(vehicles, sortBy) {
    const vehiclesCopy = [...vehicles];
    
    switch (sortBy) {
        case 'price-asc':
            return vehiclesCopy.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        case 'price-desc':
            return vehiclesCopy.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        case 'year-desc':
            return vehiclesCopy.sort((a, b) => b.modelYear - a.modelYear);
        case 'year-asc':
            return vehiclesCopy.sort((a, b) => a.modelYear - b.modelYear);
        case 'mileage-asc':
            return vehiclesCopy.sort((a, b) => a.mileage - b.mileage);
        case 'mileage-desc':
            return vehiclesCopy.sort((a, b) => b.mileage - a.mileage);
        case 'date-desc':
        default:
            return vehiclesCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
}

function parsePrice(priceString) {
    return parseFloat(priceString.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
}

// ============================
// INDEX PAGE FUNCTIONS
// ============================

function performSearch() {
    const searchTerm = document.getElementById('search-input')?.value;
    if (searchTerm && searchTerm.trim()) {
        showAlert('info', `Pesquisando por: ${searchTerm}. Funcionalidade será implementada nas próximas etapas.`);
    }
}

function viewVehicle(id) {
    showAlert('info', `Visualizando detalhes do veículo ${id}. Esta funcionalidade será implementada nas próximas etapas.`);
}

function viewVehicleDetails(id) {
    showAlert('info', `Visualizando detalhes do veículo ${id}. Esta funcionalidade será implementada nas próximas etapas.`);
}

function applyFilters() {
    const type = document.getElementById('filter-type')?.value;
    const brand = document.getElementById('filter-brand')?.value;
    const price = document.getElementById('filter-price')?.value;
    const year = document.getElementById('filter-year')?.value;
    
    showAlert('info', 'Aplicando filtros. Funcionalidade será implementada nas próximas etapas.');
}

function clearFilters() {
    const filters = ['filter-type', 'filter-brand', 'filter-price', 'filter-year'];
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) element.value = '';
    });
    showAlert('info', 'Filtros limpos.');
}

function sortFeaturedVehicles() {
    const sortBy = document.getElementById('sort-vehicles')?.value;
    showAlert('info', `Ordenando por: ${sortBy}. Funcionalidade será implementada nas próximas etapas.`);
}

function loadMoreVehicles() {
    showAlert('info', 'Carregando mais veículos. Funcionalidade será implementada nas próximas etapas.');
}

function showContact() {
    showAlert('info', 'Redirecionando para fale conosco.');
}

function showReport() {
    showAlert('info', 'Redirecionando para denúncias.');
}

function showHelp() {
    showAlert('info', 'Redirecionando para ajuda.');
}

// ============================
// PAINEL FUNCTIONS
// ============================

function checkPanelAccess() {
    if (!isUserLoggedIn()) {
        document.getElementById('login-required').classList.remove('hidden');
        document.getElementById('dashboard-content').classList.add('hidden');
        return false;
    } else {
        document.getElementById('login-required').classList.add('hidden');
        document.getElementById('dashboard-content').classList.remove('hidden');
        loadDashboard();
        return true;
    }
}

function loadDashboard() {
    const userData = getUserData();
    if (userData) {
        document.getElementById('user-welcome').textContent = `Bem-vindo, ${userData.name}!`;
        loadUserStats();
        loadUserProfile();
        checkVerificationStatus();
    }
}

function loadUserStats() {
    const vehicles = getUserVehicles();
    const userData = getUserData();
    const userType = userData?.userType || 'individual';
    const maxAds = userType === 'company' ? 20 : 2;
    
    document.getElementById('total-ads').textContent = vehicles.length;
    document.getElementById('vehicle-count').textContent = `${vehicles.length} anúncios ativos`;
    document.getElementById('ads-limit-info').textContent = `Limite: ${maxAds} anúncios`;
    document.getElementById('current-ads-count').textContent = vehicles.length;
    document.getElementById('max-ads-count').textContent = maxAds;
    
    // Update other stats (simulated)
    document.getElementById('total-views').textContent = Math.floor(Math.random() * 500);
    document.getElementById('total-messages').textContent = Math.floor(Math.random() * 20);
}

function checkVerificationStatus() {
    const isVerified = sessionStorage.getItem('identityVerified') === 'true';
    const verificationAlert = document.getElementById('verification-alert');
    const verificationStatus = document.getElementById('verification-status');
    const profileVerificationStatus = document.getElementById('profile-verification-status');
    const accountStatusIcon = document.getElementById('account-status-icon');
    const accountStatusText = document.getElementById('account-status-text');
    const verifyBtn = document.getElementById('verify-identity-btn');
    
    if (isVerified) {
        if (verificationAlert) verificationAlert.style.display = 'none';
        if (verificationStatus) {
            verificationStatus.textContent = 'Verificado';
            verificationStatus.className = 'status-badge verified';
        }
        if (profileVerificationStatus) {
            profileVerificationStatus.textContent = 'Verificado';
            profileVerificationStatus.className = 'status-badge verified';
        }
        if (accountStatusIcon) accountStatusIcon.textContent = '✅';
        if (accountStatusText) accountStatusText.textContent = 'Verificado';
        if (verifyBtn) verifyBtn.style.display = 'none';
    } else {
        if (verificationStatus) {
            verificationStatus.textContent = 'Pendente';
            verificationStatus.className = 'status-badge pending';
        }
        if (profileVerificationStatus) {
            profileVerificationStatus.textContent = 'Pendente';
            profileVerificationStatus.className = 'status-badge pending';
        }
    }
}

function showDashboardSection(section) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(sec => {
        sec.classList.add('hidden');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${section}-section`).classList.remove('hidden');
    
    // Add active class to clicked tab
    event.target.closest('.nav-tab').classList.add('active');
    
    // Load section-specific data
    switch(section) {
        case 'my-ads':
            loadMyAds();
            break;
        case 'profile':
            loadUserProfile();
            break;
    }
}

function goToVerification() {
    window.location.href = 'selfie-verification.html';
}

function goToVehicleForm() {
    const userData = getUserData();
    const userType = userData?.userType || 'individual';
    const maxAds = userType === 'company' ? 20 : 2;
    const currentAds = getUserVehicles().length;
    
    if (currentAds >= maxAds) {
        showAlert('error', 'Limite de anúncios atingido. Remova um anúncio existente para cadastrar outro.');
        return;
    }
    
    window.location.href = 'cadastro-veiculo.html';
}

function loadMyAds() {
    const vehicles = getUserVehicles();
    const noAds = document.getElementById('no-ads');
    const adsGrid = document.getElementById('ads-grid');
    
    if (vehicles.length === 0) {
        noAds.classList.remove('hidden');
        adsGrid.classList.add('hidden');
    } else {
        noAds.classList.add('hidden');
        adsGrid.classList.remove('hidden');
        
        adsGrid.innerHTML = vehicles.map(vehicle => createVehicleAdCard(vehicle)).join('');
    }
}

function createVehicleAdCard(vehicle) {
    const price = vehicle.price || 'Consulte';
    const mileage = vehicle.mileage ? `${parseInt(vehicle.mileage).toLocaleString('pt-BR')} km` : 'N/A';
    const year = vehicle.modelYear || vehicle.manufactureYear || 'N/A';
    const status = vehicle.status || 'active';
    
    return `
        <div class="car-card ad-card">
            <div class="car-image">
                ${vehicle.photos && vehicle.photos.length > 0 ? 
                    `<img src="${vehicle.photos[0]}" alt="${vehicle.brand} ${vehicle.model}" style="width: 100%; height: 100%; object-fit: cover;">` :
                    'Imagem do veículo'
                }
                <div class="ad-status status-${status}">${status === 'active' ? 'Ativo' : status === 'sold' ? 'Vendido' : 'Inativo'}</div>
            </div>
            <div class="car-info">
                <div class="car-title">${vehicle.brand} ${vehicle.model} ${year}</div>
                <div class="car-price">${price}</div>
                <div class="car-details">
                    ${vehicle.fuel || 'N/A'} • ${mileage}<br>
                    ${vehicle.location || 'Localização não informada'}
                </div>
                <div class="ad-actions">
                    <button class="btn btn-small btn-primary" onclick="editVehicle(${vehicle.id})">Editar</button>
                    <button class="btn btn-small btn-secondary" onclick="toggleVehicleStatus(${vehicle.id})">${status === 'active' ? 'Desativar' : 'Ativar'}</button>
                    <button class="btn btn-small btn-danger" onclick="deleteVehicle(${vehicle.id})">Excluir</button>
                </div>
            </div>
        </div>
    `;
}

function filterMyAds() {
    const filter = document.getElementById('ads-status-filter')?.value || 'all';
    loadMyAds(); // Reload with filter - implementation would filter the results
}

function editVehicle(vehicleId) {
    showAlert('info', `Editando veículo ${vehicleId}. Funcionalidade será implementada.`);
}

function toggleVehicleStatus(vehicleId) {
    const vehicles = getUserVehicles();
    const vehicle = vehicles.find(v => v.id === vehicleId);
    
    if (vehicle) {
        vehicle.status = vehicle.status === 'active' ? 'inactive' : 'active';
        localStorage.setItem('userVehicles', JSON.stringify(vehicles));
        loadMyAds();
        showAlert('success', `Anúncio ${vehicle.status === 'active' ? 'ativado' : 'desativado'} com sucesso!`);
    }
}

function deleteVehicle(vehicleId) {
    if (confirm('Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.')) {
        removeVehicle(vehicleId);
        loadMyAds();
        loadUserStats();
        showAlert('success', 'Anúncio excluído com sucesso!');
    }
}

function loadUserProfile() {
    const userData = getUserData();
    if (!userData) return;
    
    const fields = ['name', 'email', 'phone', 'birthdate', 'cpf', 'cep', 'city', 'state'];
    fields.forEach(field => {
        const element = document.getElementById(`profile-${field}`);
        if (element && userData[field]) {
            element.value = userData[field];
        }
    });
}

function enableProfileEdit() {
    const inputs = document.querySelectorAll('#profile-section .form-input');
    const editButtons = document.getElementById('profile-edit-buttons');
    
    inputs.forEach(input => {
        if (input.id !== 'profile-cpf' && input.id !== 'profile-email') { // Don't allow editing CPF and email
            input.removeAttribute('readonly');
        }
    });
    
    editButtons.classList.remove('hidden');
}

function saveProfile() {
    const userData = getUserData();
    
    // Validate required fields
    const requiredFields = [
        { id: 'profile-name', key: 'name' },
        { id: 'profile-phone', key: 'phone' },
        { id: 'profile-cep', key: 'cep' },
        { id: 'profile-city', key: 'city' },
        { id: 'profile-state', key: 'state' }
    ];
    
    for (let field of requiredFields) {
        const element = document.getElementById(field.id);
        const value = element.value.trim();
        
        if (!value) {
            showAlert('error', `Campo ${field.id.replace('profile-', '')} é obrigatório.`);
            element.focus();
            return;
        }
        
        userData[field.key] = value;
    }
    
    // Save updated data
    sessionStorage.setItem('userData', JSON.stringify(userData));
    cancelProfileEdit();
    showAlert('success', 'Perfil atualizado com sucesso!');
}

function cancelProfileEdit() {
    const inputs = document.querySelectorAll('#profile-section .form-input');
    const editButtons = document.getElementById('profile-edit-buttons');
    
    inputs.forEach(input => {
        input.setAttribute('readonly', true);
    });
    
    editButtons.classList.add('hidden');
    loadUserProfile(); // Reload original data
}

function showChangePassword() {
    document.getElementById('password-modal').classList.remove('hidden');
}

function hidePasswordModal() {
    document.getElementById('password-modal').classList.add('hidden');
    document.getElementById('password-modal').querySelectorAll('input').forEach(input => {
        input.value = '';
    });
}

function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showAlert('error', 'Preencha todos os campos.');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAlert('error', 'Nova senha e confirmação não coincidem.');
        return;
    }
    
    if (!validatePassword(newPassword)) {
        showAlert('error', 'Nova senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um caractere especial.');
        return;
    }
    
    // Simulate password change
    hidePasswordModal();
    showAlert('success', 'Senha alterada com sucesso!');
}

function confirmDeleteAccount() {
    if (confirm('ATENÇÃO: Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos seus dados serão perdidos.')) {
        if (confirm('Esta é sua última chance. Confirma a exclusão da conta?')) {
            logout();
            showAlert('success', 'Conta excluída com sucesso.');
        }
    }
}

// Support functions
function showContactForm() {
    document.querySelectorAll('.support-form').forEach(form => form.classList.add('hidden'));
    document.getElementById('contact-form').classList.remove('hidden');
}

function hideContactForm() {
    document.getElementById('contact-form').classList.add('hidden');
}

function submitContactForm(event) {
    event.preventDefault();
    
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value;
    
    if (!subject || !message) {
        showAlert('error', 'Preencha todos os campos.');
        return;
    }
    
    // Simulate form submission
    hideContactForm();
    showAlert('success', 'Mensagem enviada com sucesso! Retornaremos em breve.');
    event.target.reset();
}

function showReportForm() {
    document.querySelectorAll('.support-form').forEach(form => form.classList.add('hidden'));
    document.getElementById('report-form').classList.remove('hidden');
}

function hideReportForm() {
    document.getElementById('report-form').classList.add('hidden');
}

function submitReportForm(event) {
    event.preventDefault();
    
    const reportType = document.getElementById('report-type').value;
    const description = document.getElementById('report-description').value;
    
    if (!reportType || !description) {
        showAlert('error', 'Preencha todos os campos obrigatórios.');
        return;
    }
    
    // Simulate form submission
    hideReportForm();
    showAlert('success', 'Denúncia enviada com sucesso! Analisaremos em breve.');
    event.target.reset();
}

function showFAQ() {
    document.querySelectorAll('.support-form').forEach(form => form.classList.add('hidden'));
    document.getElementById('faq-content').classList.remove('hidden');
}

function toggleFAQ(element) {
    const question = element;
    const answer = question.nextElementSibling;
    const arrow = question.querySelector('.faq-arrow');
    
    question.classList.toggle('open');
    answer.classList.toggle('open');
}

// ============================
// VEHICLE FORM FUNCTIONS
// ============================

function loadUserLimits() {
    const userData = getUserData();
    const userType = userData?.userType || 'individual';
    const currentVehicles = parseInt(sessionStorage.getItem('userVehicleCount') || '0');
    
    const limits = {
        individual: { max: 2, label: 'Pessoa Física pode cadastrar até 2 veículos' },
        company: { max: 20, label: 'Pessoa Jurídica pode cadastrar até 20 veículos' }
    };
    
    const limit = limits[userType];
    const limitText = document.getElementById('limit-text');
    if (limitText) {
        limitText.textContent = `${limit.label}. Você possui ${currentVehicles} anúncio(s) ativo(s).`;
    }
    
    if (currentVehicles >= limit.max) {
        showAlert('error', 'Limite de anúncios atingido. Remova um anúncio existente para cadastrar outro.');
        const submitBtn = document.getElementById('vehicle-submit-btn');
        if (submitBtn) submitBtn.disabled = true;
    }
}

function populateBrands() {
    const brandSelect = document.getElementById('brand');
    const vehicleType = document.getElementById('vehicle-type')?.value;
    
    if (!brandSelect) return;
    
    brandSelect.innerHTML = '<option value="">Selecione a marca</option>';
    
    if (vehicleType && vehicleData[vehicleType]) {
        Object.keys(vehicleData[vehicleType]).forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand.charAt(0).toUpperCase() + brand.slice(1);
            brandSelect.appendChild(option);
        });
    }
}

function updateModels() {
    const vehicleType = document.getElementById('vehicle-type')?.value;
    const brand = document.getElementById('brand')?.value;
    const modelSelect = document.getElementById('model');
    
    if (!modelSelect) return;
    
    modelSelect.innerHTML = '<option value="">Selecione o modelo</option>';
    modelSelect.disabled = false;
    
    if (vehicleType && brand && vehicleData[vehicleType][brand]) {
        vehicleData[vehicleType][brand].forEach(model => {
            const option = document.createElement('option');
            option.value = model.toLowerCase().replace(/\s+/g, '-');
            option.textContent = model;
            modelSelect.appendChild(option);
        });
    }
}

function updatePhotoGuidelines() {
    const vehicleType = document.getElementById('vehicle-type')?.value;
    const guidelines = document.getElementById('photo-guidelines');
    const optionals = document.querySelectorAll('.car-optional, .motorcycle-optional');
    
    // Update optionals visibility
    optionals.forEach(optional => {
        const isCar = optional.classList.contains('car-optional');
        const isMoto = optional.classList.contains('motorcycle-optional');
        
        if (vehicleType === 'car' && isCar) {
            optional.style.display = 'flex';
        } else if (vehicleType === 'motorcycle' && isMoto) {
            optional.style.display = 'flex';
        } else {
            optional.style.display = 'none';
            const checkbox = optional.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
        }
    });
    
    // Update photo guidelines
    if (!guidelines) return;
    
    if (vehicleType === 'motorcycle') {
        guidelines.innerHTML = `
            <h4>📸 Fotos Obrigatórias para Motos (6 fotos):</h4>
            <ul>
                <li><strong>Frente:</strong> Moto de frente mostrando farol e placa</li>
                <li><strong>Lateral esquerda:</strong> Vista completa do lado esquerdo</li>
                <li><strong>Lateral direita:</strong> Vista completa do lado direito</li>
                <li><strong>Traseira:</strong> Moto de trás mostrando placa e lanterna</li>
                <li><strong>Painel:</strong> Instrumentos e painel de controle</li>
                <li><strong>Chassi:</strong> Número do chassi no garfo ou chassi</li>
            </ul>
        `;
    } else if (vehicleType === 'car') {
        guidelines.innerHTML = `
            <h4>📸 Fotos Obrigatórias para Carros (7 fotos):</h4>
            <ul>
                <li><strong>Frente com placa:</strong> Carro de frente mostrando a placa</li>
                <li><strong>Motor:</strong> Capô aberto mostrando o motor</li>
                <li><strong>Lateral esquerda:</strong> Vista completa do lado esquerdo</li>
                <li><strong>Traseira com placa:</strong> Carro de trás mostrando a placa</li>
                <li><strong>Porta-malas:</strong> Porta-malas aberto</li>
                <li><strong>Lateral direita:</strong> Vista completa do lado direito</li>
                <li><strong>Interior:</strong> Painel e bancos internos</li>
            </ul>
        `;
    } else {
        guidelines.innerHTML = '<h4>Selecione o tipo de veículo para ver as instruções de fotos</h4>';
    }
    
    populateBrands();
}

function fillAddressByCEP() {
    const cep = document.getElementById('location-cep')?.value;
    if (cep && cep.length === 9) {
        // Simulate CEP lookup
        setTimeout(() => {
            const cityElement = document.getElementById('location-city');
            const stateElement = document.getElementById('location-state');
            
            if (cityElement && !cityElement.value) {
                cityElement.value = 'São Paulo';
            }
            if (stateElement && !stateElement.value) {
                stateElement.value = 'SP';
            }
        }, 500);
    }
}

function validateLicensePlate(plate) {
    const cleanPlate = plate.replace(/\s/g, '').toUpperCase();
    const oldFormat = /^[A-Z]{3}-?\d{4}$/;
    const mercosulFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/;
    
    return oldFormat.test(cleanPlate) || mercosulFormat.test(cleanPlate);
}

function validateVehicleForm() {
    const vehicleType = document.getElementById('vehicle-type')?.value;
    const brand = document.getElementById('brand')?.value;
    const model = document.getElementById('model')?.value;
    const manufactureYear = document.getElementById('manufacture-year')?.value;
    const modelYear = document.getElementById('model-year')?.value;
    const color = document.getElementById('color')?.value;
    const chassis = document.getElementById('chassis')?.value;
    const licensePlate = document.getElementById('license-plate')?.value;
    const fuel = document.getElementById('fuel')?.value;
    const mileage = document.getElementById('mileage')?.value;
    const price = document.getElementById('price')?.value;
    const photos = document.getElementById('vehicle-photos')?.files;

    if (!vehicleType || !brand || !model) {
        showAlert('error', 'Selecione o tipo, marca e modelo do veículo.');
        return false;
    }

    const currentYear = new Date().getFullYear();
    if (!manufactureYear || manufactureYear < 1990 || manufactureYear > currentYear) {
        showAlert('error', `Ano de fabricação deve estar entre 1990 e ${currentYear}.`);
        return false;
    }

    if (!modelYear || modelYear < 1990 || modelYear > (currentYear + 1)) {
        showAlert('error', `Ano do modelo deve estar entre 1990 e ${currentYear + 1}.`);
        return false;
    }

    if (!color) {
        showAlert('error', 'Selecione a cor do veículo.');
        return false;
    }

    if (!chassis || chassis.length !== 8) {
        showAlert('error', 'Final do chassi deve ter exatamente 8 dígitos.');
        return false;
    }

    if (!validateLicensePlate(licensePlate)) {
        showAlert('error', 'Placa inválida. Use formato ABC-1234 ou ABC1D23.');
        return false;
    }

    if (!fuel) {
        showAlert('error', 'Selecione o tipo de combustível.');
        return false;
    }

    if (!mileage || mileage < 0) {
        showAlert('error', 'Quilometragem deve ser um número válido.');
        return false;
    }

    if (!price || parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.')) <= 0) {
        showAlert('error', 'Preço deve ser um valor válido.');
        return false;
    }

    const requiredPhotos = vehicleType === 'motorcycle' ? 6 : 7;
    if (photos && photos.length < requiredPhotos) {
        showAlert('error', `São necessárias ${requiredPhotos} fotos para o tipo de veículo selecionado.`);
        return false;
    }

    // Check terms agreement
    const termsAgreement = document.getElementById('terms-agreement')?.checked;
    const photoConsent = document.getElementById('photo-consent')?.checked;
    
    if (!termsAgreement || !photoConsent) {
        showAlert('error', 'Você deve concordar com os termos de uso e autorizar o uso das fotos.');
        return false;
    }

    return true;
}

function validateVehiclePhotos() {
    showAlert('info', 'Validando fotos e dados do veículo com IA...');
    
    // Simulate AI validation
    return new Promise((resolve) => {
        setTimeout(() => {
            const isValid = Math.random() > 0.15; // 85% success rate
            
            if (isValid) {
                showAlert('success', 'Fotos e dados validados com sucesso!');
                resolve(true);
            } else {
                showAlert('error', 'Algumas fotos não puderam ser validadas. Verifique se todas as fotos obrigatórias foram enviadas e estão nítidas.');
                resolve(false);
            }
        }, 3000);
    });
}

function collectVehicleData() {
    const optionals = [];
    document.querySelectorAll('#optionals-grid input[type="checkbox"]:checked').forEach(checkbox => {
        optionals.push(checkbox.id);
    });

    return {
        id: Date.now(),
        type: document.getElementById('vehicle-type').value,
        brand: document.getElementById('brand').value,
        model: document.getElementById('model').value,
        manufactureYear: document.getElementById('manufacture-year').value,
        modelYear: document.getElementById('model-year').value,
        color: document.getElementById('color').value,
        chassis: document.getElementById('chassis').value,
        licensePlate: document.getElementById('license-plate').value,
        fuel: document.getElementById('fuel').value,
        mileage: document.getElementById('mileage').value,
        hasGNV: document.getElementById('gnv')?.checked || false,
        price: document.getElementById('price').value,
        acceptsTrade: document.getElementById('accepts-trade')?.value || 'no',
        acceptsFinancing: document.getElementById('accepts-financing')?.checked || false,
        adTitle: document.getElementById('ad-title')?.value || '',
        description: document.getElementById('description')?.value || '',
        saleReason: document.getElementById('sale-reason')?.value || '',
        locationCep: document.getElementById('location-cep')?.value || '',
        locationCity: document.getElementById('location-city')?.value || '',
        locationState: document.getElementById('location-state')?.value || '',
        locationNeighborhood: document.getElementById('location-neighborhood')?.value || '',
        contactTime: document.getElementById('contact-time')?.value || 'any',
        contactPhone: document.getElementById('contact-phone')?.checked !== false,
        contactMessage: document.getElementById('contact-message')?.checked !== false,
        acceptVisits: document.getElementById('accept-visits')?.checked || false,
        optionals: optionals,
        createdAt: new Date().toISOString(),
        status: 'active'
    };
}

function clearPhotos() {
    const photosInput = document.getElementById('vehicle-photos');
    const preview = document.getElementById('photo-preview');
    const upload = document.querySelector('.file-upload');
    
    if (photosInput) photosInput.value = '';
    if (preview) preview.innerHTML = '';
    if (upload) {
        upload.querySelector('p').textContent = 'Clique para adicionar fotos (múltiplas fotos obrigatórias)';
        upload.style.borderColor = '#ddd';
    }
}

function showTerms() {
    showAlert('info', 'Termos de uso serão exibidos aqui.');
}

// ============================
// SELFIE VERIFICATION FUNCTIONS
// ============================

function nextToSelfie() {
    document.getElementById('document-step').classList.add('hidden');
    document.getElementById('selfie-step').classList.remove('hidden');
    
    // Update progress
    const steps = document.querySelectorAll('.progress-step');
    steps[0].classList.add('completed');
    steps[0].classList.remove('active');
    steps[1].classList.add('active');
}

function backToDocument() {
    document.getElementById('selfie-step').classList.add('hidden');
    document.getElementById('document-step').classList.remove('hidden');
    
    // Update progress
    const steps = document.querySelectorAll('.progress-step');
    steps[1].classList.remove('active');
    steps[0].classList.add('active');
    steps[0].classList.remove('completed');
}

function startVerification() {
    document.getElementById('selfie-step').classList.add('hidden');
    document.getElementById('processing-step').classList.remove('hidden');
    
    // Update progress
    const steps = document.querySelectorAll('.progress-step');
    steps[1].classList.add('completed');
    steps[1].classList.remove('active');
    steps[2].classList.add('active');
    
    // Simulate verification process
    simulateVerificationProcess();
}

function simulateVerificationProcess() {
    const processingSteps = [
        { id: 'step-document', delay: 2000 },
        { id: 'step-face', delay: 4000 },
        { id: 'step-comparison', delay: 6000 }
    ];
    
    processingSteps.forEach(step => {
        setTimeout(() => {
            const element = document.getElementById(step.id);
            element.classList.add('completed');
            element.querySelector('.processing-icon').textContent = '✅';
        }, step.delay);
    });
    
    // Show results after verification
    setTimeout(() => {
        showVerificationResults();
    }, 8000);
}

function showVerificationResults() {
    document.getElementById('processing-step').classList.add('hidden');
    document.getElementById('result-step').classList.remove('hidden');
    
    // Simulate 90% success rate
    const isSuccessful = Math.random() > 0.1;
    
    if (isSuccessful) {
        document.getElementById('success-result').classList.remove('hidden');
        document.getElementById('failure-result').classList.add('hidden');
        
        // Update verified document type
        const documentType = document.querySelector('input[name="document-type"]:checked')?.value || 'RG';
        const verifiedDocType = document.getElementById('verified-document-type');
        if (verifiedDocType) {
            verifiedDocType.textContent = documentType.toUpperCase();
        }
    } else {
        document.getElementById('success-result').classList.add('hidden');
        document.getElementById('failure-result').classList.remove('hidden');
        
        const reasons = [
            'Documento não pôde ser validado - verifique se está nítido e completo',
            'Selfie não corresponde ao documento - tente novamente com melhor iluminação',
            'Qualidade das imagens insuficiente - use um ambiente bem iluminado'
        ];
        
        const failureReason = document.getElementById('failure-reason');
        if (failureReason) {
            failureReason.textContent = reasons[Math.floor(Math.random() * reasons.length)];
        }
    }
}

function completeVerification() {
    sessionStorage.setItem('identityVerified', 'true');
    showAlert('success', 'Identidade verificada com sucesso! Redirecionando para o painel...');
    setTimeout(() => {
        window.location.href = 'painel.html';
    }, 2000);
}

function restartVerification() {
    // Reset to first step
    document.getElementById('result-step').classList.add('hidden');
    document.getElementById('document-step').classList.remove('hidden');
    
    // Reset progress
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === 0) step.classList.add('active');
    });
    
    // Reset forms
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.value = '';
    });
    
    document.querySelectorAll('#document-preview, #selfie-preview').forEach(preview => {
        preview.innerHTML = '';
    });
}

function contactSupport() {
    showAlert('info', 'Redirecionando para o suporte...');
    setTimeout(() => {
        window.location.href = 'painel.html#support';
    }, 1000);
}

// ============================
// FILE UPLOAD HANDLING
// ============================

function setupFileUpload() {
    document.querySelectorAll('.file-upload').forEach(upload => {
        // Drag and drop functionality
        upload.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        upload.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });
        
        upload.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            const input = this.querySelector('input[type="file"]');
            
            if (input && files.length > 0) {
                input.files = files;
                handleFileUpload(input);
            }
        });
        
        // File input change
        const fileInput = upload.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.addEventListener('change', function() {
                handleFileUpload(this);
            });
        }
    });
}

function handleFileUpload(input) {
    const files = input.files;
    const uploadContainer = input.closest('.file-upload');
    
    if (files.length > 0) {
        // Update upload container appearance
        const p = uploadContainer.querySelector('p');
        if (input.multiple) {
            p.textContent = `${files.length} arquivo(s) selecionado(s)`;
        } else {
            p.textContent = files[0].name;
        }
        uploadContainer.style.borderColor = '#28a745';
        
        // Handle preview for specific inputs
        if (input.id === 'vehicle-photos') {
            handleVehiclePhotos(files);
        } else if (input.id === 'document-photo') {
            handleDocumentPhoto(files[0]);
        } else if (input.id === 'selfie-photo') {
            handleSelfiePhoto(files[0]);
        }
    }
}

function handleVehiclePhotos(files) {
    const preview = document.getElementById('photo-preview');
    if (!preview) return;
    
    preview.innerHTML = '';
    
    Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgContainer = document.createElement('div');
                imgContainer.style.cssText = 'display: inline-block; margin: 5px; position: relative;';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.cssText = 'width: 100px; height: 100px; object-fit: cover; border: 1px solid #ddd; border-radius: 5px;';
                
                const removeBtn = document.createElement('button');
                removeBtn.textContent = '×';
                removeBtn.style.cssText = 'position: absolute; top: -5px; right: -5px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px;';
                removeBtn.onclick = () => imgContainer.remove();
                
                imgContainer.appendChild(img);
                imgContainer.appendChild(removeBtn);
                preview.appendChild(imgContainer);
            };
            reader.readAsDataURL(file);
        }
    });
}

function handleDocumentPhoto(file) {
    const preview = document.getElementById('document-preview');
    const nextBtn = document.getElementById('document-next-btn');
    
    if (!preview) return;
    
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <div style="margin-top: 15px;">
                    <img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border: 1px solid #ddd; border-radius: 5px;">
                    <p style="color: #666; margin-top: 5px;">Documento capturado ✓</p>
                </div>
            `;
            
            if (nextBtn) nextBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
}

function handleSelfiePhoto(file) {
    const preview = document.getElementById('selfie-preview');
    const nextBtn = document.getElementById('selfie-next-btn');
    
    if (!preview) return;
    
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <div style="margin-top: 15px;">
                    <img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border: 1px solid #ddd; border-radius: 5px;">
                    <p style="color: #666; margin-top: 5px;">Selfie capturada ✓</p>
                </div>
            `;
            
            if (nextBtn) nextBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
}

// ============================
// FORM SUBMISSION HANDLERS
// ============================

async function handleVehicleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateVehicleForm()) {
        return;
    }
    
    const submitBtn = document.getElementById('vehicle-submit-btn');
    const originalText = submitBtn.textContent;
    
    try {
        // Show loading state
        submitBtn.textContent = 'Validando...';
        submitBtn.disabled = true;
        
        // Validate photos with AI
        const isValid = await validateVehiclePhotos();
        
        if (!isValid) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }
        
        // Collect vehicle data
        const vehicleData = collectVehicleData();
        
        // Handle photo files (simulate upload)
        const photos = document.getElementById('vehicle-photos').files;
        vehicleData.photos = [];
        
        for (let i = 0; i < photos.length; i++) {
            // In a real implementation, you would upload to a server
            // For now, we'll create local URLs
            const reader = new FileReader();
            reader.onload = function(e) {
                vehicleData.photos.push(e.target.result);
            };
            reader.readAsDataURL(photos[i]);
        }
        
        // Wait a moment for file reading
        setTimeout(() => {
            // Save to localStorage
            const existingVehicles = getUserVehicles();
            existingVehicles.push(vehicleData);
            localStorage.setItem('userVehicles', JSON.stringify(existingVehicles));
            
            // Update vehicle count
            const currentCount = parseInt(sessionStorage.getItem('userVehicleCount') || '0');
            sessionStorage.setItem('userVehicleCount', (currentCount + 1).toString());
            
            showAlert('success', 'Anúncio cadastrado com sucesso! Redirecionando para o painel...');
            
            setTimeout(() => {
                window.location.href = 'painel.html';
            }, 2000);
        }, 1000);
        
    } catch (error) {
        showAlert('error', 'Erro ao cadastrar veículo. Tente novamente.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ============================
// INITIALIZATION
// ============================

document.addEventListener('DOMContentLoaded', function() {
    // Setup form input formatting
    const cepInputs = document.querySelectorAll('input[type="text"][placeholder*="CEP"], #cep, #location-cep');
    cepInputs.forEach(input => {
        input.addEventListener('input', () => formatCEP(input));
    });
    
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', () => formatPhone(input));
    });
    
    const cnpjInputs = document.querySelectorAll('#cnpj');
    cnpjInputs.forEach(input => {
        input.addEventListener('input', () => formatCNPJ(input));
    });
    
    const priceInputs = document.querySelectorAll('#price');
    priceInputs.forEach(input => {
        input.addEventListener('input', () => formatCurrency(input));
    });
    
    // Setup file uploads
    setupFileUpload();
    
    // Vehicle form specific initialization
    const vehicleForm = document.getElementById('vehicle-form');
    if (vehicleForm) {
        loadUserLimits();
        vehicleForm.addEventListener('submit', handleVehicleFormSubmit);
    }
    
    // Panel specific initialization
    if (document.getElementById('dashboard-content')) {
        checkPanelAccess();
    }
    
    // Verification page initialization
    if (document.querySelector('.verification-container')) {
        // Any verification-specific setup
    }
});