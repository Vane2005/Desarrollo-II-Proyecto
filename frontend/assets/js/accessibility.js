/**
 * ======================================================
 * SISTEMA DE ACCESIBILIDAD Y NAVEGACIÓN POR TECLADO
 * ======================================================
 */

class AccesibilidadManager {
    constructor() {
        this.sidebarElement = null;
        this.navItems = [];
        this.currentFocusIndex = 0;
        this.shortcuts = new Map();
        this.isInitialized = false;
    }

    /**
     * Inicializa el sistema de accesibilidad
     */
    init() {
        if (this.isInitialized) return;

        console.log('🎯 Inicializando sistema de accesibilidad...');

        // Configurar elementos
        this.setupElements();
        
        // Configurar tabindex
        this.setupTabIndex();
        
        // Configurar estilos de foco
        this.setupFocusStyles();
        
        // Configurar atajos de teclado
        this.setupKeyboardShortcuts();
        
        // Configurar navegación con flechas
        this.setupArrowNavigation();
        
        // Configurar anuncios de accesibilidad
        this.setupAriaAnnouncer();

        this.isInitialized = true;
        console.log('✅ Sistema de accesibilidad activado');
        this.announceToScreenReader('Sistema de accesibilidad activado. Presiona Ctrl+H para ver los atajos disponibles.');
    }

    /**
     * Configura los elementos del DOM
     */
    setupElements() {
        this.sidebarElement = document.getElementById('sidebar');
        this.navItems = Array.from(document.querySelectorAll('.nav-item'));
        this.logoutBtn = document.querySelector('.btn-logout');
        this.toggleSidebarBtn = document.getElementById('toggleSidebar');
    }

    /**
     * Configura los índices de tabulación
     */
    setupTabIndex() {
        // Sidebar toggle button
        if (this.toggleSidebarBtn) {
            this.toggleSidebarBtn.setAttribute('tabindex', '1');
            this.toggleSidebarBtn.setAttribute('aria-label', 'Alternar panel lateral');
        }

        // Elementos de navegación
        this.navItems.forEach((item, index) => {
            item.setAttribute('tabindex', index + 2);
            const sectionName = item.getAttribute('data-section');
            item.setAttribute('aria-label', `Navegar a ${this.getSectionTitle(sectionName)}`);
            item.setAttribute('role', 'button');
        });

        // Botón de logout
        if (this.logoutBtn) {
            this.logoutBtn.setAttribute('tabindex', this.navItems.length + 2);
            this.logoutBtn.setAttribute('aria-label', 'Cerrar sesión');
        }

        // Inputs y botones en las secciones
        this.setupSectionTabIndex();
    }

    /**
     * Configura tabindex para elementos dentro de las secciones
     */
    setupSectionTabIndex() {
        const sections = document.querySelectorAll('.content-section');
        let tabIndexCounter = 100;

        sections.forEach(section => {
            const inputs = section.querySelectorAll('input, textarea, select');
            const buttons = section.querySelectorAll('button');
            
            inputs.forEach(input => {
                if (!input.hasAttribute('tabindex')) {
                    input.setAttribute('tabindex', tabIndexCounter++);
                }
            });

            buttons.forEach(button => {
                if (!button.hasAttribute('tabindex')) {
                    button.setAttribute('tabindex', tabIndexCounter++);
                }
            });
        });
    }

    /**
     * Configura los estilos visuales de foco
     */
    setupFocusStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Estilos de foco para accesibilidad */
            *:focus-visible {
                outline: 3px solid #667eea !important;
                outline-offset: 2px !important;
                border-radius: 4px;
            }

            .nav-item:focus-visible {
                outline: 3px solid #ffffff !important;
                outline-offset: -3px !important;
                background-color: rgba(255, 255, 255, 0.2);
            }

            button:focus-visible {
                outline: 3px solid #667eea !important;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
            }

            input:focus-visible,
            textarea:focus-visible,
            select:focus-visible {
                outline: 2px solid #667eea !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
            }

            .sidebar.collapsed .nav-item:focus-visible {
                outline: 2px solid #ffffff !important;
            }

            /* Indicador visual de modo de navegación por teclado */
            body.keyboard-navigation *:focus {
                outline: 3px solid #667eea !important;
            }
        `;
        document.head.appendChild(style);

        // Detectar modo de navegación por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    /**
     * Configura los atajos de teclado
     */
    setupKeyboardShortcuts() {
        // Definir atajos
        this.shortcuts.set('KeyQ', {
            ctrl: true,
            action: () => this.toggleSidebar(),
            description: 'Alternar panel lateral'
        });

        this.shortcuts.set('KeyY', {
            ctrl: true,
            action: () => this.navigateToSection('informacion-personal'),
            description: 'Ir a Información Personal'
        });

        this.shortcuts.set('KeyI', {
            ctrl: true,
            action: () => this.navigateToSection('asignar-ejercicios'),
            description: 'Ir a Asignar Ejercicios'
        });

        this.shortcuts.set('KeyL', {
            ctrl: true,
            action: () => this.navigateToSection('avance-paciente'),
            description: 'Ir a Avance Paciente'
        });

        this.shortcuts.set('KeyÑ', {
            ctrl: true,
            action: () => this.logout(),
            description: 'Cerrar sesión'
        });

        this.shortcuts.set('KeyB', {
            ctrl: true,
            action: () => this.focusSearchField(),
            description: 'Enfocar campo de búsqueda'
        });

        this.shortcuts.set('KeyM', {
            ctrl: true,
            action: () => this.openAccessibilityMenu(),
            description: 'Abrir menú de accesibilidad'
        });

        this.shortcuts.set('KeyH', {
            ctrl: true,
            action: () => this.showShortcutsHelp(),
            description: 'Mostrar ayuda de atajos'
        });

        // Escuchar eventos de teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        console.log('⌨️ Atajos de teclado configurados:', this.shortcuts.size);
    }

    /**
     * Maneja las pulsaciones de teclas
     */
    handleKeyPress(e) {
        const shortcut = this.shortcuts.get(e.code);

        if (shortcut) {
            const modifierMatch = 
                (shortcut.ctrl === undefined || shortcut.ctrl === e.ctrlKey) &&
                (shortcut.alt === undefined || shortcut.alt === e.altKey) &&
                (shortcut.shift === undefined || shortcut.shift === e.shiftKey);

            if (modifierMatch) {
                e.preventDefault();
                shortcut.action();
                this.announceToScreenReader(shortcut.description);
            }
        }
    }

    /**
     * Configura navegación con flechas en el sidebar
     */
    setupArrowNavigation() {
        this.navItems.forEach((item, index) => {
            item.addEventListener('keydown', (e) => {
                switch(e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        this.focusNextNavItem(index);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.focusPrevNavItem(index);
                        break;
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        item.click();
                        break;
                }
            });
        });
    }

    /**
     * Enfoca el siguiente elemento de navegación
     */
    focusNextNavItem(currentIndex) {
        const nextIndex = (currentIndex + 1) % this.navItems.length;
        this.navItems[nextIndex].focus();
        this.announceToScreenReader(`${this.getSectionTitle(this.navItems[nextIndex].getAttribute('data-section'))}`);
    }

    /**
     * Enfoca el elemento de navegación anterior
     */
    focusPrevNavItem(currentIndex) {
        const prevIndex = currentIndex === 0 ? this.navItems.length - 1 : currentIndex - 1;
        this.navItems[prevIndex].focus();
        this.announceToScreenReader(`${this.getSectionTitle(this.navItems[prevIndex].getAttribute('data-section'))}`);
    }

    /**
     * Configura el anunciador para screen readers
     */
    setupAriaAnnouncer() {
        const announcer = document.createElement('div');
        announcer.id = 'aria-announcer';
        announcer.setAttribute('role', 'status');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(announcer);
    }

    /**
     * Anuncia mensajes a screen readers
     */
    announceToScreenReader(message) {
        const announcer = document.getElementById('aria-announcer');
        if (announcer) {
            announcer.textContent = '';
            setTimeout(() => {
                announcer.textContent = message;
            }, 100);
        }
    }

    // ====== ACCIONES DE ATAJOS ======

    toggleSidebar() {
        if (this.sidebarElement) {
            this.sidebarElement.classList.toggle('collapsed');
            const isCollapsed = this.sidebarElement.classList.contains('collapsed');
            this.announceToScreenReader(isCollapsed ? 'Panel lateral contraído' : 'Panel lateral expandido');
        }
    }

    navigateToSection(sectionId) {
        const navItem = this.navItems.find(item => 
            item.getAttribute('data-section') === sectionId
        );
        
        if (navItem) {
            navItem.click();
            navItem.focus();
        }
    }

    logout() {
        if (confirm('¿Desea cerrar sesión?')) {
            const logoutBtn = document.querySelector('.btn-logout');
            if (logoutBtn) logoutBtn.click();
        }
    }

    focusSearchField() {
        const searchInput = document.querySelector('#cedulaInput, #cedulaAvanceInput, input[type="search"]');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    openAccessibilityMenu() {
        this.showShortcutsHelp();
    }

    showShortcutsHelp() {
        let helpText = '⌨️ ATAJOS DE TECLADO DISPONIBLES:\n\n';
        
        this.shortcuts.forEach((shortcut, key) => {
            const keyName = key.replace('Key', '');
            const modifier = shortcut.ctrl ? 'Ctrl + ' : '';
            helpText += `${modifier}${keyName}: ${shortcut.description}\n`;
        });

        helpText += '\nTambién puedes usar:\n';
        helpText += '• Tab: Navegar entre elementos\n';
        helpText += '• Shift + Tab: Navegar hacia atrás\n';
        helpText += '• Flechas ↑↓: Navegar en el panel lateral\n';
        helpText += '• Enter/Espacio: Activar elemento enfocado\n';
        helpText += '• Esc: Cerrar modales\n';

        alert(helpText);
    }

    getSectionTitle(sectionId) {
        const titles = {
            'informacion-personal': 'Información Personal',
            'asignar-ejercicios': 'Asignar Ejercicios',
            'avance-paciente': 'Avance Paciente',
            'ejercicios-asignados': 'Ejercicios Asignados',
            'ejercicios-realizados': 'Ejercicios Realizados'
        };
        return titles[sectionId] || sectionId;
    }
}

// ====== INICIALIZACIÓN AUTOMÁTICA ======

const accesibilidad = new AccesibilidadManager();

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => accesibilidad.init());
} else {
    accesibilidad.init();
}

// Exportar para uso global
window.accesibilidadManager = accesibilidad;

console.log('✅ Sistema de accesibilidad cargado correctamente');