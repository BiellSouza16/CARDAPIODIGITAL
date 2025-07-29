// Estado global da aplicação
let orderState = {
    salgados: {},
    combos: {},
    bebidas: {},
    cliente: {
        nome: '',
        data: '',
        horario: '',
        loja: ''
    },
    total: 0
};

// Mapeamento de nomes dos sabores
const saborNames = {
    'coxinha': 'Coxinha',
    'palitinho': 'Palitinho',
    'balaozinho': 'Balãozinho',
    'travesseirinho': 'Travesseirinho',
    'kibe-queijo': 'Kibe de Queijo',
    'kibe-carne': 'Kibe de Carne',
    'churros-doce': 'Churros de Doce de Leite',
    'churros-chocolate': 'Churros de Chocolate',
    'enroladinho': 'Enroladinho de Salsicha',
    'boliviano': 'Boliviano'
};

// Mapeamento de nomes dos refrigerantes
const refriNames = {
    'pepsi-200': 'Pepsi 200ml',
    'guarana-200': 'Guaraná 200ml',
    'pepsi-1l': 'Pepsi 1L',
    'guarana-1l': 'Guaraná 1L',
    'it-cola-2l': 'It Cola 2L',
    'it-guarana-2l': 'It Guaraná 2L'
};

// Configurações dos combos atualizadas
const comboConfigs = {
    'combo-25-sem': {
        name: '25 Minis Salgados',
        units: 25,
        refriCount: 0,
        hasRefri: false
    },
    'combo-25-com': {
        name: 'Combo a Dois com 2 Refri 200ml',
        units: 25,
        refriCount: 2,
        hasRefri: true
    },
    'combo-50-sem': {
        name: '50 Minis Salgados',
        units: 50,
        refriCount: 0,
        hasRefri: false
    },
    'combo-50-com': {
        name: 'Combo Grupinho com 1 Refri 1L',
        units: 50,
        refriCount: 1,
        hasRefri: true
    },
    'combo-100-sem': {
        name: '100 Minis Salgados',
        units: 100,
        refriCount: 0,
        hasRefri: false
    },
    'combo-100-com': {
        name: 'Combo Galera com 1 Refri 2L',
        units: 100,
        refriCount: 1,
        hasRefri: true
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Detectar e otimizar para diferentes navegadores
    detectBrowserOptimizations();
    
    initializeNavigation();
    initializeSalgados();
    initializeCombos();
    initializeBebidas();
    initializeFinalizacao();
    initializeModal();
    initializeBackToTop();
    initializePageProtection();
});

// Proteção contra recarregamento da página
function initializePageProtection() {
    window.addEventListener('beforeunload', function(e) {
        // Verificar se há itens no pedido
        const hasItems = hasOrderItems();
        
        if (hasItems) {
            const message = 'Tem certeza que deseja sair? Você perderá o progresso do pedido.';
            e.preventDefault();
            e.returnValue = message;
            return message;
        }
    });
}

// Verificar se há itens no pedido
function hasOrderItems() {
    // Verificar salgados
    const hasSalgados = Object.values(orderState.salgados).some(item => item.quantity > 0);
    if (hasSalgados) return true;
    
    // Verificar combos
    const hasCombos = Object.values(orderState.combos).some(combo => combo.quantity > 0);
    if (hasCombos) return true;
    
    // Verificar bebidas
    const hasBebidas = Object.values(orderState.bebidas).some(item => item.quantity > 0);
    if (hasBebidas) return true;
    
    return false;
}

// Detectar navegador e aplicar otimizações específicas
function detectBrowserOptimizations() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    
    // Otimizações para iOS
    if (isIOS) {
        document.body.style.webkitTextSizeAdjust = '100%';
        // Prevenir zoom em inputs
        const inputs = document.querySelectorAll('input[type="number"], input[type="text"], input[type="date"], input[type="time"]');
        inputs.forEach(input => {
            if (parseFloat(getComputedStyle(input).fontSize) < 16) {
                input.style.fontSize = '16px';
            }
        });
    }
    
    // Otimizações para Android
    if (isAndroid) {
        // Melhorar performance de scroll
        document.body.style.overflowScrolling = 'touch';
    }
    
    // Otimizações para Safari
    if (isSafari) {
        // Corrigir problemas de viewport
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    }
    
    // Otimizações para Firefox
    if (isFirefox) {
        // Melhorar renderização de animações
        document.documentElement.style.scrollBehavior = 'smooth';
    }
}

// Navegação entre seções
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            // Atualizar botões ativos
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar seção correspondente
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            
            // Scroll para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// Inicializar salgados
function initializeSalgados() {
    const salgadoCards = document.querySelectorAll('#salgados .item-card');
    
    salgadoCards.forEach(card => {
        const itemName = card.getAttribute('data-item');
        const price = parseFloat(card.getAttribute('data-price'));
        const qtyInput = card.querySelector('.qty-input');
        const minusBtn = card.querySelector('.minus');
        const plusBtn = card.querySelector('.plus');
        const totalElement = card.querySelector('.item-total');
        
        // Inicializar estado
        orderState.salgados[itemName] = { quantity: 0, price: price };
        
        // Aplicar validação numérica
        applyNumericValidation(qtyInput);
        
        // Event listeners para botões
        minusBtn.addEventListener('click', () => {
            let currentQty = parseInt(qtyInput.value) || 0;
            if (currentQty > 0) {
                currentQty--;
                qtyInput.value = currentQty;
                updateSalgadoItem(itemName, currentQty, price, totalElement, card);
            }
        });
        
        plusBtn.addEventListener('click', () => {
            let currentQty = parseInt(qtyInput.value) || 0;
            currentQty++;
            qtyInput.value = currentQty;
            updateSalgadoItem(itemName, currentQty, price, totalElement, card);
        });
        
        // Event listener para input direto
        qtyInput.addEventListener('input', () => {
            let currentQty = parseInt(qtyInput.value) || 0;
            if (currentQty < 0) {
                currentQty = 0;
                qtyInput.value = 0;
            }
            updateSalgadoItem(itemName, currentQty, price, totalElement, card);
        });
    });
}

function updateSalgadoItem(itemName, quantity, price, totalElement, card) {
    orderState.salgados[itemName].quantity = quantity;
    const total = quantity * price;
    totalElement.textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
    
    // Adicionar classe visual se tem quantidade
    if (quantity > 0) {
        card.classList.add('has-quantity');
    } else {
        card.classList.remove('has-quantity');
    }
    
    updateGrandTotal();
    updateOrderSummary();
}

// Inicializar combos com nova estrutura
function initializeCombos() {
    const comboCards = document.querySelectorAll('.combo-card');
    
    comboCards.forEach(card => {
        const comboName = card.getAttribute('data-combo');
        const config = comboConfigs[comboName];
        
        // Inicializar estado do combo
        orderState.combos[comboName] = {
            quantity: 0,
            price: parseFloat(card.getAttribute('data-price')),
            sabores: {},
            refrigerantes: {}
        };
        
        initializeComboCard(card, comboName, config);
    });
}

function initializeComboCard(card, comboName, config) {
    const qtyInput = card.querySelector('.combo-qty-input');
    const minusBtn = card.querySelector('.minus');
    const plusBtn = card.querySelector('.plus');
    const saboresSection = card.querySelector('.sabores-selection');
    const refriSection = card.querySelector('.refri-selection');
    const totalElement = card.querySelector('.combo-total');
    
    // Event listeners para quantidade
    minusBtn.addEventListener('click', () => {
        let currentQty = parseInt(qtyInput.value) || 0;
        if (currentQty > 0) {
            currentQty--;
            qtyInput.value = currentQty;
            updateComboQuantity(comboName, currentQty, card, config);
        }
    });
    
    plusBtn.addEventListener('click', () => {
        let currentQty = parseInt(qtyInput.value) || 0;
        currentQty++;
        qtyInput.value = currentQty;
        updateComboQuantity(comboName, currentQty, card, config);
    });
    
    qtyInput.addEventListener('input', () => {
        let currentQty = parseInt(qtyInput.value) || 0;
        if (currentQty < 0) {
            currentQty = 0;
            qtyInput.value = 0;
        }
        updateComboQuantity(comboName, currentQty, card, config);
    });
    
    // Inicializar sabores
    initializeComboSabores(card, comboName, config);
    
    // Inicializar refrigerantes se necessário
    if (config.hasRefri) {
        initializeComboRefrigerantes(card, comboName, config);
    }
}

function initializeComboSabores(card, comboName, config) {
    const saborInputs = card.querySelectorAll('.sabor-qty');
    
    saborInputs.forEach(input => {
        const saborName = input.getAttribute('data-sabor');
        orderState.combos[comboName].sabores[saborName] = 0;
        
        input.addEventListener('input', () => {
            let quantity = parseInt(input.value) || 0;
            if (quantity < 0) {
                quantity = 0;
                input.value = 0;
            }
            
            // Aplicar controle rígido de limite com correção automática
            quantity = applySaborLimitStrict(comboName, saborName, quantity, input, config);
            
            orderState.combos[comboName].sabores[saborName] = quantity;
            updateComboSaboresCounter(comboName, card, config);
        });
        
        // Validação em tempo real durante digitação
        input.addEventListener('keyup', () => {
            let quantity = parseInt(input.value) || 0;
            if (quantity < 0) {
                quantity = 0;
                input.value = 0;
            }
            
            quantity = applySaborLimitStrict(comboName, saborName, quantity, input, config);
            orderState.combos[comboName].sabores[saborName] = quantity;
            updateComboSaboresCounter(comboName, card, config);
        });
        
        // Aplicar validação de entrada numérica
        applyNumericValidation(input);
        
        // Validar novamente ao perder foco
        input.addEventListener('blur', () => {
            let quantity = parseInt(input.value) || 0;
            quantity = applySaborLimitStrict(comboName, saborName, quantity, input, config);
            orderState.combos[comboName].sabores[saborName] = quantity;
            updateComboSaboresCounter(comboName, card, config);
        });
    });
}

function initializeComboRefrigerantes(card, comboName, config) {
    const refriInputs = card.querySelectorAll('.refri-qty');
    
    refriInputs.forEach(input => {
        const refriName = input.getAttribute('data-refri');
        orderState.combos[comboName].refrigerantes[refriName] = 0;
        
        input.addEventListener('input', () => {
            let quantity = parseInt(input.value) || 0;
            if (quantity < 0) {
                quantity = 0;
                input.value = 0;
            }
            
            // Aplicar controle rígido de limite para refrigerantes
            quantity = applyRefriLimitStrict(comboName, refriName, quantity, input, config);
            
            orderState.combos[comboName].refrigerantes[refriName] = quantity;
            updateComboRefriCounter(comboName, card.querySelector('.refri-selection'), config);
        });
        
        // Validação em tempo real durante digitação
        input.addEventListener('keyup', () => {
            let quantity = parseInt(input.value) || 0;
            if (quantity < 0) {
                quantity = 0;
                input.value = 0;
            }
            
            quantity = applyRefriLimitStrict(comboName, refriName, quantity, input, config);
            orderState.combos[comboName].refrigerantes[refriName] = quantity;
            updateComboRefriCounter(comboName, card.querySelector('.refri-selection'), config);
        });
        
        // Aplicar validação de entrada numérica
        applyNumericValidation(input);
        
        // Validar novamente ao perder foco
        input.addEventListener('blur', () => {
            let quantity = parseInt(input.value) || 0;
            quantity = applyRefriLimitStrict(comboName, refriName, quantity, input, config);
            orderState.combos[comboName].refrigerantes[refriName] = quantity;
            updateComboRefriCounter(comboName, card.querySelector('.refri-selection'), config);
        });
    });
}

function updateComboQuantity(comboName, quantity, card, config) {
    orderState.combos[comboName].quantity = quantity;
    
    const saboresSection = card.querySelector('.sabores-selection');
    const refriSection = card.querySelector('.refri-selection');
    const totalElement = card.querySelector('.combo-total');
    
    if (quantity > 0) {
        saboresSection.style.display = 'block';
        if (config.hasRefri && refriSection) {
            refriSection.style.display = 'block';
        }
        card.classList.add('has-selection');
    } else {
        saboresSection.style.display = 'none';
        if (refriSection) {
            refriSection.style.display = 'none';
        }
        card.classList.remove('has-selection');
        
        // Limpar sabores e refrigerantes
        Object.keys(orderState.combos[comboName].sabores).forEach(sabor => {
            orderState.combos[comboName].sabores[sabor] = 0;
        });
        Object.keys(orderState.combos[comboName].refrigerantes).forEach(refri => {
            orderState.combos[comboName].refrigerantes[refri] = 0;
        });
        
        // Resetar inputs
        const saborInputs = saboresSection.querySelectorAll('.sabor-qty');
        saborInputs.forEach(input => input.value = 0);
        
        if (refriSection) {
            const refriInputs = refriSection.querySelectorAll('.refri-qty');
            refriInputs.forEach(input => input.value = 0);
        }
    }
    
    updateComboSaboresCounter(comboName, card, config);
    if (config.hasRefri) {
        updateComboRefriCounter(comboName, card.querySelector('.refri-selection'), config);
    }
    updateComboTotal(comboName, totalElement);
    updateGrandTotal();
    updateOrderSummary();
}

function updateComboSaboresCounter(comboName, card, config) {
    const combo = orderState.combos[comboName];
    const totalSabores = Object.values(combo.sabores).reduce((sum, qty) => sum + qty, 0);
    const totalNeeded = combo.quantity * config.units;
    
    const counter = card.querySelector('.sabores-counter');
    const selectedSpan = counter.querySelector('.selected-count');
    const totalSpan = counter.querySelector('.total-needed');
    
    selectedSpan.textContent = totalSabores;
    totalSpan.textContent = totalNeeded;
    
    // Destacar se não está correto
    if (combo.quantity > 0 && totalSabores !== totalNeeded) {
        counter.style.color = '#DC143C';
        counter.style.fontWeight = 'bold';
    } else {
        counter.style.color = '#25D366';
        counter.style.fontWeight = 'bold';
    }
}

function updateComboRefriCounter(comboName, refriSection, config) {
    if (!refriSection) return;
    
    const combo = orderState.combos[comboName];
    const totalRefri = Object.values(combo.refrigerantes).reduce((sum, qty) => sum + qty, 0);
    const totalNeeded = combo.quantity * config.refriCount;
    
    const counter = refriSection.querySelector('.refri-counter');
    if (counter) {
        const selectedSpan = counter.querySelector('.refri-selected-count');
        const totalSpan = counter.querySelector('.refri-total-needed');
        
        selectedSpan.textContent = totalRefri;
        totalSpan.textContent = totalNeeded;
        
        // Destacar se não está correto
        if (combo.quantity > 0 && totalRefri !== totalNeeded) {
            counter.style.color = '#DC143C';
            counter.style.fontWeight = 'bold';
        } else {
            counter.style.color = '#25D366';
            counter.style.fontWeight = 'bold';
        }
    }
}

function updateComboTotal(comboName, totalElement) {
    const combo = orderState.combos[comboName];
    const total = combo.quantity * combo.price;
    totalElement.textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Controle rígido de sabores - impede ultrapassar o limite
function applySaborLimitStrict(comboName, saborName, quantity, input, config) {
    const combo = orderState.combos[comboName];
    if (combo.quantity === 0) return 0;
    
    const maxAllowed = combo.quantity * config.units;
    const currentTotal = getCurrentSaboresTotal(comboName, saborName);
    const maxForThisInput = maxAllowed - currentTotal;
    
    if (quantity > maxForThisInput) {
        const correctedQty = Math.max(0, maxForThisInput);
        input.value = correctedQty;
        
        if (quantity > maxForThisInput && maxForThisInput >= 0) {
            showErrorMessage(`Limite atingido! O ${config.name} permite apenas ${maxAllowed} salgados no total.`);
        }
        
        return correctedQty;
    }
    
    return quantity;
}

// Controle rígido de refrigerantes - impede ultrapassar o limite
function applyRefriLimitStrict(comboName, refriName, quantity, input, config) {
    const combo = orderState.combos[comboName];
    if (combo.quantity === 0) return 0;
    
    const maxAllowed = combo.quantity * config.refriCount;
    const currentTotal = getCurrentRefriTotal(comboName, refriName);
    const maxForThisInput = maxAllowed - currentTotal;
    
    if (quantity > maxForThisInput) {
        const correctedQty = Math.max(0, maxForThisInput);
        input.value = correctedQty;
        
        if (quantity > maxForThisInput && maxForThisInput >= 0) {
            showErrorMessage(`Limite atingido! O ${config.name} permite apenas ${maxAllowed} refrigerantes no total.`);
        }
        
        return correctedQty;
    }
    
    return quantity;
}

// Funções auxiliares para cálculo de totais
function getCurrentSaboresTotal(comboName, excludeSabor = null) {
    const combo = orderState.combos[comboName];
    let total = 0;
    Object.entries(combo.sabores).forEach(([sabor, qty]) => {
        if (sabor !== excludeSabor) {
            total += qty;
        }
    });
    return total;
}

function getCurrentRefriTotal(comboName, excludeRefri = null) {
    const combo = orderState.combos[comboName];
    let total = 0;
    Object.entries(combo.refrigerantes).forEach(([refri, qty]) => {
        if (refri !== excludeRefri) {
            total += qty;
        }
    });
    return total;
}

// Inicializar bebidas
function initializeBebidas() {
    const bebidaCards = document.querySelectorAll('#bebidas .item-card');
    
    bebidaCards.forEach(card => {
        const itemName = card.getAttribute('data-item');
        const price = parseFloat(card.getAttribute('data-price'));
        const qtyInput = card.querySelector('.qty-input');
        const minusBtn = card.querySelector('.minus');
        const plusBtn = card.querySelector('.plus');
        const totalElement = card.querySelector('.item-total');
        
        // Inicializar estado
        orderState.bebidas[itemName] = { quantity: 0, price: price };
        
        // Aplicar validação numérica
        applyNumericValidation(qtyInput);
        
        // Event listeners para botões
        minusBtn.addEventListener('click', () => {
            let currentQty = parseInt(qtyInput.value) || 0;
            if (currentQty > 0) {
                currentQty--;
                qtyInput.value = currentQty;
                updateBebidaItem(itemName, currentQty, price, totalElement, card);
            }
        });
        
        plusBtn.addEventListener('click', () => {
            let currentQty = parseInt(qtyInput.value) || 0;
            currentQty++;
            qtyInput.value = currentQty;
            updateBebidaItem(itemName, currentQty, price, totalElement, card);
        });
        
        // Event listener para input direto
        qtyInput.addEventListener('input', () => {
            let currentQty = parseInt(qtyInput.value) || 0;
            if (currentQty < 0) {
                currentQty = 0;
                qtyInput.value = 0;
            }
            updateBebidaItem(itemName, currentQty, price, totalElement, card);
        });
    });
}

function updateBebidaItem(itemName, quantity, price, totalElement, card) {
    orderState.bebidas[itemName].quantity = quantity;
    const total = quantity * price;
    totalElement.textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
    
    // Adicionar classe visual se tem quantidade
    if (quantity > 0) {
        card.classList.add('has-quantity');
    } else {
        card.classList.remove('has-quantity');
    }
    
    updateGrandTotal();
    updateOrderSummary();
}

// Função para aplicar validação numérica em inputs
function applyNumericValidation(input) {
    // Prevenir entrada de valores inválidos
    input.addEventListener('keydown', (e) => {
        // Permitir apenas números, backspace, delete, tab, escape, enter
        if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
            // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true) ||
            // Permitir home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }
        // Garantir que é um número
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
    
    // Prevenir entrada de caracteres não numéricos via paste
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        const numericValue = parseInt(paste) || 0;
        if (numericValue >= 0) {
            input.value = numericValue;
            input.dispatchEvent(new Event('input'));
        }
    });
}

// Sistema de mensagens de erro melhorado
function showErrorMessage(message, type = 'error') {
    const messageContainer = document.getElementById('error-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `error-message ${type}`;
    messageDiv.textContent = message;
    
    // Estilos baseados no tipo
    if (type === 'warning') {
        messageDiv.style.backgroundColor = '#FF8C00';
        messageDiv.style.color = '#fff';
    } else if (type === 'success') {
        messageDiv.style.backgroundColor = '#25D366';
        messageDiv.style.color = '#fff';
    } else {
        messageDiv.style.backgroundColor = '#DC143C';
        messageDiv.style.color = '#fff';
    }
    
    messageDiv.style.padding = '15px 20px';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.marginBottom = '10px';
    messageDiv.style.fontWeight = 'bold';
    messageDiv.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    messageDiv.style.animation = 'slideInRight 0.3s ease';
    messageDiv.style.cursor = 'pointer';
    
    // Permitir fechar clicando na mensagem
    messageDiv.addEventListener('click', () => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }
    });
    
    messageContainer.appendChild(messageDiv);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }
    }, 5000);
}

// Atualizar total geral
function updateGrandTotal() {
    let total = 0;
    
    // Somar salgados
    Object.values(orderState.salgados).forEach(item => {
        total += item.quantity * item.price;
    });
    
    // Somar combos
    Object.values(orderState.combos).forEach(combo => {
        total += combo.quantity * combo.price;
    });
    
    // Somar bebidas
    Object.values(orderState.bebidas).forEach(item => {
        total += item.quantity * item.price;
    });
    
    orderState.total = total;
    
    const totalElement = document.getElementById('grand-total-value');
    if (totalElement) {
        totalElement.textContent = total.toFixed(2).replace('.', ',');
    }
    
    // Habilitar/desabilitar botão de finalizar
    const finalizarBtn = document.getElementById('finalizar-pedido-btn');
    if (finalizarBtn) {
        finalizarBtn.disabled = total === 0;
    }
}

// Atualizar resumo do pedido
function updateOrderSummary() {
    const summaryContent = document.getElementById('order-summary-content');
    if (!summaryContent) return;
    
    let html = '';
    let hasItems = false;
    
    // Salgados
    const salgadosWithQty = Object.entries(orderState.salgados).filter(([_, item]) => item.quantity > 0);
    if (salgadosWithQty.length > 0) {
        hasItems = true;
        html += '<div class="summary-section"><h4><img src="public/Logo Principal Header.jpg" alt="Logo" class="summary-logo"> Salgados de R$1,00:</h4><ul>';
        salgadosWithQty.forEach(([name, item]) => {
            const displayName = saborNames[name] || name;
            const total = item.quantity * item.price;
            html += `<li>${item.quantity} ${displayName} - R$ ${total.toFixed(2).replace('.', ',')}</li>`;
        });
        html += '</ul></div>';
    }
    
    // Combos
    const combosWithQty = Object.entries(orderState.combos).filter(([_, combo]) => combo.quantity > 0);
    if (combosWithQty.length > 0) {
        hasItems = true;
        html += '<div class="summary-section"><h4>🍱 Combos:</h4>';
        combosWithQty.forEach(([name, combo]) => {
            const config = comboConfigs[name];
            const total = combo.quantity * combo.price;
            html += `<div class="combo-summary">`;
            html += `<p><strong>${combo.quantity} ${config.name} - R$ ${total.toFixed(2).replace('.', ',')}</strong></p>`;
            
            // Sabores do combo
            const saboresWithQty = Object.entries(combo.sabores).filter(([_, qty]) => qty > 0);
            if (saboresWithQty.length > 0) {
                html += '<ul class="sabores-list">';
                saboresWithQty.forEach(([saborName, qty]) => {
                    const displayName = saborNames[saborName] || saborName;
                    html += `<li>${qty} ${displayName}</li>`;
                });
                html += '</ul>';
            }
            
            // Refrigerantes do combo
            if (config.hasRefri) {
                const refrisWithQty = Object.entries(combo.refrigerantes).filter(([_, qty]) => qty > 0);
                if (refrisWithQty.length > 0) {
                    html += '<ul class="refris-list">';
                    refrisWithQty.forEach(([refriName, qty]) => {
                        const displayName = refriNames[refriName] || refriName;
                        html += `<li>${qty} ${displayName}</li>`;
                    });
                    html += '</ul>';
                }
            }
            html += '</div>';
        });
        html += '</div>';
    }
    
    // Bebidas
    const bebidasWithQty = Object.entries(orderState.bebidas).filter(([_, item]) => item.quantity > 0);
    if (bebidasWithQty.length > 0) {
        hasItems = true;
        html += '<div class="summary-section"><h4>🥤 Bebidas Avulsas:</h4><ul>';
        bebidasWithQty.forEach(([name, item]) => {
            const total = item.quantity * item.price;
            // Converter nome da bebida para display com formatação correta
            let displayName = formatBebidaName(name);
            html += `<li>${item.quantity} ${displayName} - R$ ${total.toFixed(2).replace('.', ',')}</li>`;
        });
        html += '</ul></div>';
    }
    
    if (!hasItems) {
        html = '<p class="empty-order">Adicione itens ao seu pedido para ver o resumo aqui.</p>';
    } else {
        html += `<div class="summary-total"><strong>Total Geral: R$ ${orderState.total.toFixed(2).replace('.', ',')}</strong></div>`;
        
        // Adicionar informação da loja selecionada
        if (orderState.cliente.loja) {
            html += '<div class="summary-store-info">';
            if (orderState.cliente.loja === 'loja1') {
                html += '<p><strong>📍 Retirada na Loja 1:</strong><br>Júlio Aragão - Ao lado do Budegão Supermercado</p>';
            } else if (orderState.cliente.loja === 'loja2') {
                html += '<p><strong>📍 Retirada na Loja 2:</strong><br>Castro Alves - Próximo ao Mundo de R$1,00</p>';
            }
            html += '</div>';
        }
    }
    
    summaryContent.innerHTML = html;
}

// Função para formatar nomes das bebidas corretamente
function formatBebidaName(name) {
    const bebidaFormats = {
        'pepsi-200': 'Pepsi 200ml',
        'guarana-200': 'Guaraná 200ml',
        'pepsi-350': 'Pepsi 350ml',
        'guarana-350': 'Guaraná 350ml',
        'pepsi-1l': 'Pepsi 1L',
        'guarana-1l': 'Guaraná 1L',
        'it-cola-2l': 'It Cola 2L',
        'it-guarana-2l': 'It Guaraná 2L',
        'agua-mineral': 'Água Mineral',
        'agua-gas': 'Água com Gás'
    };
    
    return bebidaFormats[name] || capitalizeWords(name.replace(/-/g, ' '));
}

// Função auxiliar para capitalizar palavras (adicionada no escopo global)
function capitalizeWords(str) {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

// Inicializar finalização
function initializeFinalizacao() {
    const nomeInput = document.getElementById('cliente-nome');
    const dataInput = document.getElementById('data-retirada');
    const horarioInput = document.getElementById('horario-retirada');
    const lojaInputs = document.querySelectorAll('input[name="loja"]');
    const finalizarBtn = document.getElementById('finalizar-pedido-btn');
    
    // Event listeners para campos obrigatórios
    [nomeInput, dataInput, horarioInput].forEach(input => {
        input.addEventListener('input', () => {
            orderState.cliente[input.id.replace('cliente-', '').replace('-retirada', '')] = input.value;
            validateFinalizacao();
        });
    });
    
    // Event listeners para seleção de loja
    lojaInputs.forEach(input => {
        input.addEventListener('change', () => {
            orderState.cliente.loja = input.value;
            validateFinalizacao();
            updateOrderSummary(); // Atualizar resumo em tempo real
        });
    });
    
    // Event listener para botão finalizar
    finalizarBtn.addEventListener('click', () => {
        if (validateOrderComplete()) {
            showOrderModal();
        }
    });
}

function validateFinalizacao() {
    const nome = document.getElementById('cliente-nome').value.trim();
    const data = document.getElementById('data-retirada').value;
    const horario = document.getElementById('horario-retirada').value;
    const loja = orderState.cliente.loja;
    const finalizarBtn = document.getElementById('finalizar-pedido-btn');
    
    const isValid = nome && data && horario && loja && orderState.total > 0;
    finalizarBtn.disabled = !isValid;
}

// Validação completa do pedido com mensagens de erro específicas
function validateOrderComplete() {
    const errors = [];
    
    // Validar dados do cliente
    const nome = document.getElementById('cliente-nome').value.trim();
    const data = document.getElementById('data-retirada').value;
    const horario = document.getElementById('horario-retirada').value;
    const loja = orderState.cliente.loja;
    
    if (!nome) {
        errors.push('👤 Informe seu nome completo');
    }

    if (!data) {
        errors.push('📅 Selecione a data de retirada');
    }
    
    if (!horario) {
        errors.push('🕐 Selecione o horário de retirada');
    }
    
    if (!loja) {
        errors.push('📍 Selecione a loja para retirada do pedido');
    }
    
    // Validar se tem pelo menos um item no pedido
    if (!hasOrderItems()) {
        errors.push('🛒 Adicione pelo menos um item ao seu pedido');
    }
    
    // Validar combos rigorosamente
    Object.entries(orderState.combos).forEach(([comboName, combo]) => {
        if (combo.quantity > 0) {
            const config = comboConfigs[comboName];
            
            // Validar sabores
            const totalSabores = Object.values(combo.sabores).reduce((sum, qty) => sum + qty, 0);
            const expectedSabores = combo.quantity * config.units;
            
            if (totalSabores < expectedSabores) {
                errors.push(`Falta selecionar ${expectedSabores - totalSabores} salgados no ${config.name}`);
            } else if (totalSabores > expectedSabores) {
                errors.push(`Remova ${totalSabores - expectedSabores} salgados do ${config.name} (máximo: ${expectedSabores})`);
            }
            
            // Validar refrigerantes se necessário
            if (config.hasRefri) {
                const totalRefris = Object.values(combo.refrigerantes).reduce((sum, qty) => sum + qty, 0);
                const expectedRefris = combo.quantity * config.refriCount;
                
                if (totalRefris < expectedRefris) {
                    errors.push(`Selecione ${expectedRefris - totalRefris} refrigerantes no ${config.name}`);
                } else if (totalRefris > expectedRefris) {
                    errors.push(`Remova ${totalRefris - expectedRefris} refrigerantes do ${config.name} (máximo: ${expectedRefris})`);
                }
            }
        }
    });
    
    // Mostrar erros se houver
    if (errors.length > 0) {
        errors.forEach(error => showErrorMessage(error));
        return false;
    }
    
    return true;
}

// Modal
function initializeModal() {
    const modal = document.getElementById('resumo-modal');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = document.getElementById('fechar-modal');
    const whatsappBtn = document.getElementById('enviar-whatsapp');
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    whatsappBtn.addEventListener('click', () => {
        sendToWhatsApp();
    });
    
    // Fechar modal clicando fora
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function showOrderModal() {
    const modal = document.getElementById('resumo-modal');
    const resumoContent = document.getElementById('resumo-pedido');
    
    const resumoText = generateOrderSummary();
    resumoContent.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit;">${resumoText}</pre>`;
    
    modal.style.display = 'block';
}

function generateOrderSummary() {
    const nome = document.getElementById('cliente-nome').value.trim();
    const data = document.getElementById('data-retirada').value;
    const horario = document.getElementById('horario-retirada').value;
    
    // Função para capitalizar primeira letra de cada palavra
    function capitalizeWords(str) {
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
    
    // Função para formatar nome do combo no resumo
    function formatComboNameForSummary(comboName, quantity, config) {
        const comboNameFormatted = capitalizeWords(config.name);
        
        // Para combos sem refrigerante (apenas minis salgados)
        if (!config.hasRefri) {
            const totalMinis = quantity * config.units;
            return `${totalMinis} Minis Salgados`;
        }
        
        // Para combos com refrigerante
        const totalRefris = quantity * config.refriCount;
        let formattedName = comboNameFormatted;
        
        // Substituir padrões específicos para cada tipo de combo
        if (comboName === 'combo-25-com') {
            // "Combo a Dois com 2 Refri 200ml" → "X Combo a Dois Com Y Refri's 200ml"
            const refriText = totalRefris === 1 ? 'Refri' : "Refri's";
            formattedName = `${quantity} Combo a Dois Com ${totalRefris} ${refriText} 200ml`;
        } else if (comboName === 'combo-50-com') {
            // "Combo Grupinho com 1 Refri 1L" → "X Combo Grupinho Com Y Refri's 1L"
            const refriText = totalRefris === 1 ? 'Refri' : "Refri's";
            formattedName = `${quantity} Combo Grupinho Com ${totalRefris} ${refriText} 1L`;
        } else if (comboName === 'combo-100-com') {
            // "Combo Galera com 1 Refri 2L" → "X Combo Galera Com Y Refri's 2L"
            const refriText = totalRefris === 1 ? 'Refri' : "Refri's";
            formattedName = `${quantity} Combo Galera Com ${totalRefris} ${refriText} 2L`;
        }
        
        return formattedName;
    }
    
    // Formatar data
    const dataObj = new Date(data + 'T00:00:00');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    let dataText;
    if (dataObj.getTime() === hoje.getTime()) {
        dataText = `Para hoje às ${horario}`;
    } else {
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        dataText = `Para dia ${dataFormatada} às ${horario}`;
    }
    
    // Resumo com formatação correta
    let resumo = `👤 Resumo Do Pedido De: ${capitalizeWords(nome)}\n\n`;
    
    // Combos
    Object.entries(orderState.combos).forEach(([comboName, combo]) => {
        if (combo.quantity > 0) {
            const config = comboConfigs[comboName];
            const total = combo.quantity * combo.price;
            const comboNameFormatted = formatComboNameForSummary(comboName, combo.quantity, config);
            
            resumo += `🍱 ${comboNameFormatted} - R$${total.toFixed(2)}\n`;
            
            // Sabores
            Object.entries(combo.sabores).forEach(([saborName, qty]) => {
                if (qty > 0) {
                    const displayName = capitalizeWords(saborNames[saborName] || saborName);
                    resumo += `  • ${qty} ${displayName}\n`;
                }
            });
            
            // Refrigerantes
            if (config.hasRefri) {
                Object.entries(combo.refrigerantes).forEach(([refriName, qty]) => {
                    if (qty > 0) {
                        const displayName = capitalizeWords(refriNames[refriName] || refriName);
                        resumo += `  • ${qty} ${displayName}\n`;
                    }
                });
            }
            
            resumo += '\n';
        }
    });
    
    // Salgados avulsos
    const salgadosWithQty = Object.entries(orderState.salgados).filter(([_, item]) => item.quantity > 0);
    if (salgadosWithQty.length > 0) {
        resumo += '🍱 Salgados De R$1,00\n';
        salgadosWithQty.forEach(([name, item]) => {
            const displayName = capitalizeWords(saborNames[name] || name);
            const total = item.quantity * item.price;
            resumo += `  • ${item.quantity} ${displayName}\n`;
        });
        resumo += '\n';
    }
    
    // Bebidas avulsas
    const bebidasWithQty = Object.entries(orderState.bebidas).filter(([_, item]) => item.quantity > 0);
    if (bebidasWithQty.length > 0) {
        resumo += '🥤 Bebidas\n';
        bebidasWithQty.forEach(([name, item]) => {
            let displayName = formatBebidaName(name);
            const total = item.quantity * item.price;
            resumo += `  • ${item.quantity} ${displayName}\n`;
        });
        resumo += '\n';
    }
    
    resumo += `📅 _${dataText}_\n\n`;
    resumo += `💰 *VALOR TOTAL = R$${orderState.total.toFixed(2)}*\n\n`;
    
    // Informação da loja baseada na seleção
    if (orderState.cliente.loja === 'loja1') {
        resumo += '📌 *RETIRADA NA LOJA 01 AO LADO DO BUDEGÃO SUPERMERCADO*';
    } else if (orderState.cliente.loja === 'loja2') {
        resumo += '📌 *RETIRADA NA LOJA 02 PRÓXIMO AO MUNDO DE R$1,00*';
    }
    
    return resumo;
}

function sendToWhatsApp() {
    const resumoText = generateOrderSummary();
    const encodedText = encodeURIComponent(resumoText);
    
    // Número do WhatsApp baseado na loja selecionada
    let phoneNumber;
    if (orderState.cliente.loja === 'loja1') {
        phoneNumber = '5573981741968'; // Loja 1
    } else if (orderState.cliente.loja === 'loja2') {
        phoneNumber = '5573982425122'; // Loja 2
    } else {
        phoneNumber = '5573981741968'; // Padrão loja 1
    }
    
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    
    // Abrir WhatsApp
    window.open(whatsappURL, '_blank');
    
    // Fechar modal
    document.getElementById('resumo-modal').style.display = 'none';
    
    // Mostrar mensagem de sucesso
    showErrorMessage('Pedido enviado com sucesso! 🎉', 'success');
}

// Botão voltar ao topo
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
