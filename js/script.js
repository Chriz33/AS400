// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Variables del sistema
    let currentUser = 'A';
    let currentSystem = 'ISERIES';
    let messages = [];
    
    // Referencias a elementos
    const commandInput = document.getElementById('command-input');
    const sndmsgWindow = document.getElementById('sndmsg-window');
    const dspmsgWindow = document.getElementById('dspmsg-window');
    
    // Configurar comandos iniciales
    setupCommandInput();
    loadSampleMessages();
    setupMenuInteractions();
    
    // Manejar entrada de comandos
    function setupCommandInput() {
        commandInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                processCommand(this.value.trim());
                this.value = '';
            }
        });
        
        commandInput.addEventListener('keydown', function(e) {
            // Simular teclas de función
            if (e.key === 'F3' || e.key === 'Escape') {
                e.preventDefault();
                alert('Comando: Salir del sistema');
            } else if (e.key === 'F4') {
                e.preventDefault();
                openSNDMSG();
            } else if (e.key === 'F9') {
                e.preventDefault();
                commandInput.value = 'urkusrprf_';
            } else if (e.key === 'F12') {
                e.preventDefault();
                commandInput.value = '';
            }
        });
        
        // Mantener foco en el input
        commandInput.focus();
    }
    
    // Procesar comandos del sistema
    function processCommand(command) {
        const cmd = command.toUpperCase();
        
        if (cmd === 'SNDMSG') {
            openSNDMSG();
        } 
        else if (cmd === 'DSPMSG') {
            openDSPMSG();
        }
        else if (cmd === 'WRKMSG') {
            alert('Pantalla: Trabajar con mensajes (WRKMSG)\n\nSeleccione mensajes y presione una opción:\n1=Ver  2=Cambiar  3=Copiar  4=Suprimir  5=Responder');
        }
        else if (cmd === 'SIGNOFF') {
            if (confirm('¿Finalizar sesión en el sistema?')) {
                document.body.innerHTML = '<div class="signoff-screen">Sesión finalizada<br>Desconectado del sistema ISERIES</div>';
            }
        }
        else if (cmd === 'HELP') {
            showHelp();
        }
        else if (cmd === 'URKUSRPRF') {
            alert('Pantalla: Trabajar con perfiles de usuario\n\nPerfil actual: QSECOFR\nTipo: *USER\nEstado: *ENABLED');
        }
        else if (cmd.startsWith('SNDMSG ')) {
            // Parsear comando SNDMSG con parámetros
            parseSNDMSGCommand(cmd);
        }
        else {
            alert(`Comando "${command}" no reconocido.\n\nComandos válidos: SNDMSG, DSPMSG, WRKMSG, SIGNOFF, HELP`);
        }
    }
    
    // Abrir ventana SNDMSG
    function openSNDMSG() {
        sndmsgWindow.style.display = 'block';
        document.getElementById('sndmsg-text').focus();
    }
    
    function closeSNDMSG() {
        sndmsgWindow.style.display = 'none';
        commandInput.focus();
    }
    
    // Abrir ventana DSPMSG
    function openDSPMSG() {
        displayMessages();
        dspmsgWindow.style.display = 'block';
    }
    
    function closeDSPMSG() {
        dspmsgWindow.style.display = 'none';
        commandInput.focus();
    }
    
    // Enviar mensaje desde SNDMSG
    function sendMessage() {
        const msgText = document.getElementById('sndmsg-text').value;
        const toUser = document.getElementById('sndmsg-to').value;
        const msgType = document.getElementById('sndmsg-type').value;
        
        if (!msgText.trim()) {
            alert('Error: El mensaje no puede estar vacío.');
            return;
        }
        
        const newMessage = {
            id: Date.now(),
            from: `USR${currentUser}`,
            to: toUser,
            text: msgText,
            type: msgType,
            timestamp: new Date().toLocaleString('es-ES'),
            read: false
        };
        
        messages.unshift(newMessage);
        saveMessages();
        
        // Mostrar confirmación en estilo AS/400
        showSystemMessage(`Mensaje enviado a ${toUser}`, 'CPF9897');
        
        // Limpiar formulario
        document.getElementById('sndmsg-text').value = '';
        document.getElementById('sndmsg-to').value = '*ALL';
        
        // Cerrar ventana
        closeSNDMSG();
    }
    
    // Mostrar mensajes en DSPMSG
    function displayMessages() {
        const messagesList = document.getElementById('messages-list');
        
        if (messages.length === 0) {
            messagesList.innerHTML = '<div class="message-row"><span colspan="4">No hay mensajes en la cola</span></div>';
            return;
        }
        
        let html = '';
        
        messages.forEach(msg => {
            html += `
                <div class="message-row">
                    <span class="msg-from">${msg.from}</span>
                    <span class="msg-to">${msg.to}</span>
                    <span class="msg-time">${msg.timestamp}</span>
                    <span class="msg-text">${msg.text}</span>
                </div>
            `;
        });
        
        messagesList.innerHTML = html;
    }
    
    // Parsear comando SNDMSG desde línea de comandos
    function parseSNDMSGCommand(command) {
        // Ejemplo: SNDMSG MSG('Hola mundo') TOUSR(*ALL)
        const msgMatch = command.match(/MSG\('([^']+)'\)/);
        const toMatch = command.match(/TO(?:USR|MSGQ)\('([^']+)'\)/);
        
        if (!msgMatch) {
            alert('Error: Formato incorrecto. Use: SNDMSG MSG(\'texto\') TOUSR(usuario)');
            return;
        }
        
        const msgText = msgMatch[1];
        const toUser = toMatch ? toMatch[1] : '*ALL';
        
        const newMessage = {
            id: Date.now(),
            from: `USR${currentUser}`,
            to: toUser,
            text: msgText,
            type: '*INFO',
            timestamp: new Date().toLocaleString('es-ES'),
            read: false
        };
        
        messages.unshift(newMessage);
        saveMessages();
        
        showSystemMessage(`Mensaje enviado a ${toUser}`, 'CPF9897');
    }
    
    // Mostrar mensaje del sistema
    function showSystemMessage(text, code = 'CPI4322') {
        // Agregar al área de mensajes del sistema
        const systemMessages = document.querySelector('.system-messages');
        const messageRow = document.createElement('div');
        messageRow.className = 'message-row';
        messageRow.innerHTML = `
            <span class="msg-id">${code}</span>
            <span>${text}</span>
        `;
        
        systemMessages.appendChild(messageRow);
        
        // Mantener solo los últimos 5 mensajes
        const allMessages = systemMessages.querySelectorAll('.message-row');
        if (allMessages.length > 5) {
            systemMessages.removeChild(allMessages[0]);
        }
    }
    
    // Cargar mensajes de ejemplo
    function loadSampleMessages() {
        const saved = localStorage.getItem('as400_messages');
        
        if (saved) {
            messages = JSON.parse(saved);
        } else {
            // Mensajes de ejemplo
            messages = [
                {
                    id: 1,
                    from: 'QSYSOPR',
                    to: '*ALL',
                    text: 'Mantenimiento programado para el domingo 03:00-06:00',
                    type: '*INFO',
                    timestamp: '20/01/24 14:30:00',
                    read: true
                },
                {
                    id: 2,
                    from: 'SYSTEM',
                    to: 'USRA',
                    text: 'Backup completado exitosamente',
                    type: '*NOTIFY',
                    timestamp: '20/01/24 12:15:00',
                    read: false
                },
                {
                    id: 3,
                    from: 'ADMIN',
                    to: '*ALL',
                    text: 'Recordatorio: Cambio de contraseñas mensual',
                    type: '*INFO',
                    timestamp: '19/01/24 09:00:00',
                    read: true
                }
            ];
            saveMessages();
        }
    }
    
    // Guardar mensajes en localStorage
    function saveMessages() {
        localStorage.setItem('as400_messages', JSON.stringify(messages));
    }
    
    // Configurar interacciones del menú
    function setupMenuInteractions() {
        const menuItems = document.querySelectorAll('.menu-text');
        
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                const menuNumber = this.previousElementSibling.textContent.replace('.', '');
                
                switch(menuNumber) {
                    case '1':
                        alert('Pantalla: Tareas de usuario\n\n1. Trabajar con trabajos\n2. Trabajar con mensajes\n3. Trabajar con salidas');
                        break;
                    case '2':
                        alert('Pantalla: Tareas de oficina\n\n1. Procesador de texto\n2. Hojas de cálculo\n3. Base de datos');
                        break;
                    case '5':
                        alert('Pantalla: Programación\n\n1. PDM - Desarrollador de programas\n2. SEU - Editor de secuencias\n3. RDI - Desarrollo en Rational');
                        break;
                    case '90':
                        if (confirm('¿Finalizar sesión en el sistema?')) {
                            document.body.innerHTML = '<div class="signoff-screen">Sesión finalizada<br>Desconectado del sistema ISERIES</div>';
                        }
                        break;
                    default:
                        alert(`Opción ${menuNumber} seleccionada\n\n(Función en desarrollo)`);
                }
            });
        });
    }
    
    // Mostrar ayuda
    function showHelp() {
        const helpText = `
COMANDOS DEL SISTEMA IBM i:

SNDMSG - Enviar mensaje
  Formato: SNDMSG MSG('texto') TOUSR(usuario)
  Ejemplo: SNDMSG MSG('Hola') TOUSR(*ALL)

DSPMSG - Mostrar mensajes
  Muestra la cola de mensajes del sistema

WRKMSG - Trabajar con mensajes
  Permite gestionar mensajes (responder, eliminar, etc.)

SIGNOFF - Finalizar sesión
  Cierra la sesión actual

URKUSRPRF - Trabajar con perfiles de usuario
  Gestiona usuarios del sistema

Presione F4 para abrir el asistente de SNDMSG
        `;
        
        alert(helpText);
    }
    
    // Simular actualización de fecha/hora
    function updateDateTime() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-ES');
        const timeStr = now.toLocaleTimeString('es-ES', {hour12: false});
        
        document.getElementById('current-date').textContent = dateStr;
        document.getElementById('current-time').textContent = timeStr.replace(/:/g, '.');
    }
    
    // Actualizar hora cada segundo
    setInterval(updateDateTime, 1000);
    updateDateTime();
    
    // Permitir cerrar ventanas con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSNDMSG();
            closeDSPMSG();
        }
    });
    
    // Mostrar información inicial
    showSystemMessage('Sesión iniciada para USR' + currentUser, 'CPI4322');
    showSystemMessage('Sistema ISERIES listo', 'CPA0700');
});