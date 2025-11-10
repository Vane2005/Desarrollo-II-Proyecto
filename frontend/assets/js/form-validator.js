/**
 * ======================================================
 * SISTEMA DE VALIDACIÓN DE FORMULARIOS
 * ======================================================
 */

class FormValidator {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        if (!this.form) {
            console.error(`Formulario con ID "${formId}" no encontrado`);
            return;
        }

        this.options = {
            validateOnBlur: true,
            validateOnInput: true,
            showSuccessState: true,
            scrollToError: true,
            ...options
        };

        this.validators = new Map();
        this.errorMessages = new Map();
        
        this.init();
    }

    init() {
        this.setupValidators();
        this.attachEventListeners();
        this.injectStyles();
        console.log(`✅ Validador inicializado para formulario: ${this.form.id}`);
    }

    /**
     * Configura los validadores por tipo de campo
     */
    setupValidators() {
        // Validador de email
        this.validators.set('email', {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Ingrese un correo electrónico válido (ejemplo: usuario@dominio.com)',
            validate: (value) => this.validators.get('email').pattern.test(value)
        });

        // Validador de cédula (solo números, 6-20 dígitos)
        this.validators.set('cedula', {
            pattern: /^[0-9]{6,20}$/,
            message: 'La cédula debe contener entre 6 y 20 dígitos numéricos',
            validate: (value) => this.validators.get('cedula').pattern.test(value)
        });

        // Validador de teléfono (7-15 dígitos)
        this.validators.set('telefono', {
            pattern: /^[0-9]{7,15}$/,
            message: 'El teléfono debe contener entre 7 y 15 dígitos',
            validate: (value) => this.validators.get('telefono').pattern.test(value)
        });

        // Validador de nombre (mínimo 2 caracteres, solo letras y espacios)
        this.validators.set('nombre', {
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/,
            message: 'El nombre debe tener al menos 2 caracteres y solo letras',
            validate: (value) => this.validators.get('nombre').pattern.test(value)
        });

        // Validador de contraseña
        this.validators.set('password', {
            pattern: /^.{8,72}$/,
            message: 'La contraseña debe tener entre 8 y 72 caracteres',
            validate: (value) => value.length >= 8 && value.length <= 72
        });

        // Validador de contraseña fuerte
        this.validators.set('password-strong', {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/,
            message: 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números',
            validate: (value) => this.validators.get('password-strong').pattern.test(value)
        });
    }

    /**
     * Adjunta event listeners a los campos del formulario
     */
    attachEventListeners() {
        const inputs = this.form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Marcar campos requeridos
            if (input.hasAttribute('required')) {
                this.markAsRequired(input);
            }

            // Validación en tiempo real (blur)
            if (this.options.validateOnBlur) {
                input.addEventListener('blur', () => this.validateField(input));
            }

            // Validación mientras escribe (input)
            if (this.options.validateOnInput) {
                input.addEventListener('input', () => {
                    if (input.classList.contains('error') || input.value.length > 0) {
                        this.validateField(input);
                    }
                });
            }

            // Limpiar error al enfocar
            input.addEventListener('focus', () => {
                this.clearFieldError(input);
            });
        });

        // Validación al enviar el formulario
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validateForm();
        });

        // Validación de confirmación de contraseña
        this.setupPasswordConfirmation();
    }

    /**
     * Marca visualmente los campos requeridos
     */
    markAsRequired(input) {
        const label = this.getLabelForInput(input);
        if (label && !label.querySelector('.required-indicator')) {
            const indicator = document.createElement('span');
            indicator.className = 'required-indicator';
            indicator.textContent = ' *';
            indicator.setAttribute('aria-label', 'campo obligatorio');
            label.appendChild(indicator);
        }

        // ARIA
        input.setAttribute('aria-required', 'true');
    }

    /**
     * Valida un campo individual
     */
    validateField(input) {
        const value = input.value.trim();
        const fieldName = this.getFieldName(input);

        // Limpiar error previo
        this.clearFieldError(input);

        // Campo vacío y requerido
        if (input.hasAttribute('required') && !value) {
            this.showFieldError(input, `${fieldName} es obligatorio`);
            return false;
        }

        // Campo vacío pero no requerido
        if (!value) {
            return true;
        }

        // Validación por tipo
        const validatorType = this.getValidatorType(input);
        if (validatorType && this.validators.has(validatorType)) {
            const validator = this.validators.get(validatorType);
            if (!validator.validate(value)) {
                this.showFieldError(input, validator.message);
                return false;
            }
        }

        // Validación de longitud mínima
        if (input.hasAttribute('minlength')) {
            const minLength = parseInt(input.getAttribute('minlength'));
            if (value.length < minLength) {
                this.showFieldError(input, `${fieldName} debe tener al menos ${minLength} caracteres`);
                return false;
            }
        }

        // Validación de longitud máxima
        if (input.hasAttribute('maxlength')) {
            const maxLength = parseInt(input.getAttribute('maxlength'));
            if (value.length > maxLength) {
                this.showFieldError(input, `${fieldName} no puede exceder ${maxLength} caracteres`);
                return false;
            }
        }

        // Validación exitosa
        if (this.options.showSuccessState) {
            this.showFieldSuccess(input);
        }

        return true;
    }

    /**
     * Valida todo el formulario
     */
    validateForm() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        let isValid = true;
        let firstErrorField = null;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
                if (!firstErrorField) {
                    firstErrorField = input;
                }
            }
        });

        if (!isValid && firstErrorField) {
            if (this.options.scrollToError) {
                this.scrollToField(firstErrorField);
            }
            firstErrorField.focus();

            // Anunciar error total
            this.announceToScreenReader('Formulario con errores. Por favor, corrija los campos marcados.');
        } else if (isValid) {
            this.announceToScreenReader('Formulario validado correctamente');
            
            // Disparar evento personalizado
            const event = new CustomEvent('formValidated', { detail: this.getFormData() });
            this.form.dispatchEvent(event);
        }

        return isValid;
    }

    /**
     * Muestra error en un campo
     */
    showFieldError(input, message) {
        input.classList.add('error');
        input.classList.remove('success');
        input.setAttribute('aria-invalid', 'true');

        // Crear o actualizar mensaje de error
        let errorElement = this.getErrorElement(input);
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error-message';
            errorElement.setAttribute('role', 'alert');
            
            const errorId = `error-${input.id || input.name}`;
            errorElement.id = errorId;
            input.setAttribute('aria-describedby', errorId);

            input.parentNode.appendChild(errorElement);
        }

        errorElement.innerHTML = `
            <span class="error-icon" aria-hidden="true">⚠️</span>
            <span class="error-text">${message}</span>
        `;

        // Anunciar a screen readers
        this.announceToScreenReader(message);
    }

    /**
     * Muestra estado de éxito en un campo
     */
    showFieldSuccess(input) {
        input.classList.add('success');
        input.classList.remove('error');
        input.setAttribute('aria-invalid', 'false');

        // Crear indicador de éxito
        let successElement = input.parentNode.querySelector('.field-success-indicator');
        if (!successElement) {
            successElement = document.createElement('span');
            successElement.className = 'field-success-indicator';
            successElement.innerHTML = '✓';
            successElement.setAttribute('aria-label', 'Campo válido');
            input.parentNode.appendChild(successElement);
        }
    }

    /**
     * Limpia el error de un campo
     */
    clearFieldError(input) {
        input.classList.remove('error', 'success');
        input.removeAttribute('aria-invalid');

        const errorElement = this.getErrorElement(input);
        if (errorElement) {
            errorElement.remove();
        }

        const successElement = input.parentNode.querySelector('.field-success-indicator');
        if (successElement) {
            successElement.remove();
        }
    }

    /**
     * Configura validación de confirmación de contraseña
     */
    setupPasswordConfirmation() {
        const passwordInputs = this.form.querySelectorAll('input[type="password"]');
        if (passwordInputs.length === 2) {
            const [password, confirmPassword] = passwordInputs;

            confirmPassword.addEventListener('input', () => {
                if (confirmPassword.value && password.value !== confirmPassword.value) {
                    this.showFieldError(confirmPassword, 'Las contraseñas no coinciden');
                } else if (confirmPassword.value === password.value) {
                    this.clearFieldError(confirmPassword);
                    if (this.options.showSuccessState) {
                        this.showFieldSuccess(confirmPassword);
                    }
                }
            });
        }
    }

    /**
     * Obtiene el elemento de error asociado a un input
     */
    getErrorElement(input) {
        return input.parentNode.querySelector('.field-error-message');
    }

    /**
     * Obtiene el label asociado a un input
     */
    getLabelForInput(input) {
        if (input.id) {
            return this.form.querySelector(`label[for="${input.id}"]`);
        }
        return input.parentNode.querySelector('label');
    }

    /**
     * Obtiene el nombre legible del campo
     */
    getFieldName(input) {
        const label = this.getLabelForInput(input);
        if (label) {
            return label.textContent.replace('*', '').trim();
        }
        return input.getAttribute('placeholder') || input.name || 'Este campo';
    }

    /**
     * Determina el tipo de validador según el input
     */
    getValidatorType(input) {
        // Por tipo de input
        if (input.type === 'email') return 'email';
        if (input.type === 'password') {
            return input.dataset.strongPassword === 'true' ? 'password-strong' : 'password';
        }

        // Por nombre o ID
        const identifier = (input.id || input.name || '').toLowerCase();
        if (identifier.includes('cedula') || identifier.includes('documento')) return 'cedula';
        if (identifier.includes('telefono') || identifier.includes('phone')) return 'telefono';
        if (identifier.includes('nombre') || identifier.includes('name')) return 'nombre';
        if (identifier.includes('email') || identifier.includes('correo')) return 'email';

        return null;
    }

    /**
     * Desplaza la página al campo con error
     */
    scrollToField(field) {
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Anuncia mensajes a screen readers
     */
    announceToScreenReader(message) {
        let announcer = document.getElementById('form-aria-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'form-aria-announcer';
            announcer.setAttribute('role', 'status');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
            document.body.appendChild(announcer);
        }

        announcer.textContent = '';
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
    }

    /**
     * Obtiene los datos del formulario
     */
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        return data;
    }

    /**
     * Inyecta estilos CSS para la validación
     */
    injectStyles() {
        if (document.getElementById('form-validator-styles')) return;

        const style = document.createElement('style');
        style.id = 'form-validator-styles';
        style.textContent = `
            /* Estilos de validación de formularios */
            .required-indicator {
                color: #e74c3c;
                font-weight: bold;
                margin-left: 2px;
            }

            input.error,
            textarea.error,
            select.error {
                border-color: #e74c3c !important;
                background-color: #fff5f5 !important;
                box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;
            }

            input.success,
            textarea.success,
            select.success {
                border-color: #27ae60 !important;
                background-color: #f0fdf4 !important;
            }

            .field-error-message {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 6px;
                padding: 8px 12px;
                background-color: #fff5f5;
                border-left: 3px solid #e74c3c;
                border-radius: 4px;
                font-size: 14px;
                color: #c0392b;
                animation: slideDown 0.3s ease;
            }

            .field-error-message .error-icon {
                font-size: 16px;
            }

            .field-error-message .error-text {
                flex: 1;
            }

            .field-success-indicator {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #27ae60;
                font-size: 18px;
                font-weight: bold;
                pointer-events: none;
            }

            /* Animación de deslizamiento */
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Contenedor de campo con posición relativa para el indicador de éxito */
            .form-group,
            .info-item {
                position: relative;
            }

            /* Ajuste para modales */
            .modal-form .form-group {
                position: relative;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Método público para validar manualmente
     */
    validate() {
        return this.validateForm();
    }

    /**
     * Método público para resetear el formulario
     */
    reset() {
        this.form.reset();
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => this.clearFieldError(input));
    }
}

// ====== INICIALIZACIÓN AUTOMÁTICA ======

document.addEventListener('DOMContentLoaded', () => {
    // Detectar formularios automáticamente y aplicar validación
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        if (form.id && !form.hasAttribute('data-no-validate')) {
            new FormValidator(form.id);
        }
    });

    console.log(`✅ Sistema de validación inicializado en ${forms.length} formularios`);
});

// Exportar para uso global
window.FormValidator = FormValidator;