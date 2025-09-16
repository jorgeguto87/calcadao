// Global utility functions for Calçadão do Automóvel

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

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showHome(){
    window.location.href = "index.html";
}

// Password validation
function validatePassword(password) {
    // At least 8 characters, 1 uppercase letter, 1 special character
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return minLength && hasUppercase && hasSpecialChar;
}

// File upload setup
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
                // For single file inputs
                if (!input.multiple) {
                    input.files = files;
                    updateFileUploadText(input, files[0].name);
                } else {
                    // For multiple file inputs
                    input.files = files;
                    updateFileUploadText(input, `${files.length} arquivo(s) selecionado(s)`);
                }
                
                // Trigger change event
                input.dispatchEvent(new Event('change'));
            }
        });
        
        // Click to upload
        upload.addEventListener('click', function() {
            const input = this.querySelector('input[type="file"]');
            if (input) {
                input.click();
            }
        });
    });
}

function updateFileUploadText(input, text) {
    const upload = input.closest('.file-upload');
    if (upload) {
        const p = upload.querySelector('p');
        if (p) {
            p.textContent = text;
        }
        upload.style.borderColor = '#28a745';
    }
}

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
        // Mobile: (11) 99999-9999
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length === 10) {
        // Landline: (11) 9999-9999
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

// Session management
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

// Vehicle management
function getUserVehicles() {
    const vehicles = localStorage.getItem('userVehicles');
    return vehicles ? JSON.parse(vehicles) : [];
}

function removeVehicle(vehicleId) {
    const vehicles = getUserVehicles();
    const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== vehicleId);
    localStorage.setItem('userVehicles', JSON.stringify(updatedVehicles));
    
    // Update vehicle count
    const currentCount = parseInt(sessionStorage.getItem('userVehicleCount') || '0');
    sessionStorage.setItem('userVehicleCount', Math.max(0, currentCount - 1).toString());
    
    return updatedVehicles;
}

// Form validation helpers
function validateRequired(fields) {
    for (let field of fields) {
        const element = document.getElementById(field.id);
        if (!element) continue;
        
        const value = element.value.trim();
        if (!value) {
            showAlert('error', field.message || `Campo ${field.label || field.id} é obrigatório.`);
            element.focus();
            return false;
        }
        
        // Custom validation
        if (field.validation && !field.validation(value)) {
            showAlert('error', field.validationMessage || `Campo ${field.label || field.id} é inválido.`);
            element.focus();
            return false;
        }
    }
    return true;
}

// Date helpers
function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getYearsList(startYear = 1990) {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let year = currentYear + 1; year >= startYear; year--) {
        years.push(year);
    }
    
    return years;
}

// Search and filter helpers
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

// Image handling
function createImagePreview(file, container) {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '100px';
        img.style.maxHeight = '100px';
        img.style.objectFit = 'cover';
        img.style.border = '1px solid #ddd';
        img.style.borderRadius = '5px';
        img.style.margin = '5px';
        
        container.appendChild(img);
    };
    reader.readAsDataURL(file);
}

// Loading states
function setLoadingState(button, loading = true) {
    if (loading) {
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<span class="loading"></span> Carregando...';
        button.disabled = true;
    } else {
        button.innerHTML = button.dataset.originalText || button.innerHTML;
        button.disabled = false;
    }
}

// Local storage helpers
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
        return false;
    }
}

function getFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Erro ao ler do localStorage:', error);
        return defaultValue;
    }
}

// URL helpers
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function updateURL(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
        if (params[key]) {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.replaceState({}, '', url);
}

// Debounce helper for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Vehicle card HTML generator
function createVehicleCard(vehicle) {
    const price = vehicle.price || 'Consulte';
    const mileage = vehicle.mileage ? `${parseInt(vehicle.mileage).toLocaleString('pt-BR')} km` : 'N/A';
    const year = vehicle.modelYear || vehicle.manufactureYear || 'N/A';
    
    return `
        <div class="car-card" onclick="viewVehicleDetails(${vehicle.id})">
            <div class="car-image">
                ${vehicle.photos && vehicle.photos.length > 0 ? 
                    `<img src="${vehicle.photos[0]}" alt="${vehicle.brand} ${vehicle.model}" style="width: 100%; height: 100%; object-fit: cover;">` :
                    'Imagem do veículo'
                }
            </div>
            <div class="car-info">
                <div class="car-title">${vehicle.brand} ${vehicle.model} ${year}</div>
                <div class="car-price">${price}</div>
                <div class="car-details">
                    ${vehicle.fuel || 'N/A'} • ${mileage}<br>
                    ${vehicle.location || 'Localização não informada'}
                </div>
            </div>
        </div>
    `;
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function() {
    // Setup form input formatting
    const cepInputs = document.querySelectorAll('input[type="text"][placeholder*="CEP"], #cep');
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
    
    // Setup file uploads if function exists
    if (typeof setupFileUpload === 'function') {
        setupFileUpload();
    }
});

// Export for modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showAlert,
        validateEmail,
        validatePassword,
        formatCurrency,
        formatPhone,
        formatCEP,
        formatCNPJ,
        isUserLoggedIn,
        getUserData,
        getUserVehicles,
        searchVehicles,
        filterVehiclesByType,
        sortVehicles,
        createVehicleCard,
        debounce
    };
}