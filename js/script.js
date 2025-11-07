document.addEventListener('DOMContentLoaded', function() {
    // Ponto de entrada: Seleciona os elementos principais
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const mainContent = document.getElementById('main-content');

    let inactivityTimer;

    // Simulação de um banco de dados de usuários
    // Tenta carregar do localStorage, se não existir, usa os dados iniciais
    let mockUsersDB = JSON.parse(localStorage.getItem('mockUsersDB')) || [
        { id: 1, username: 'admin', password: 'admin', name: 'Administrador', email: 'admin@example.com', permissions: ['cadastro', 'relatorio', 'financeiro', 'presenca', 'usuarios'] },
        { id: 2, username: 'professor', password: '123', name: 'Professor Silva', email: 'professor@example.com', permissions: ['cadastro', 'presenca'] }
    ];


    // Função para salvar usuários no localStorage
    function saveUsersToLocalStorage() {
        localStorage.setItem('mockUsersDB', JSON.stringify(mockUsersDB));
    }

    // Salva os usuários iniciais se o localStorage estiver vazio
    if (!localStorage.getItem('mockUsersDB')) {
        saveUsersToLocalStorage();
    }


    // Garante que a aplicação comece com a tela de login visível
    appContainer.classList.add('hidden');
    loginScreen.classList.remove('hidden');

    // --- LÓGICA DE LOGIN E TIMEOUT ---

    function logout() {
        appContainer.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        clearTimeout(inactivityTimer);
    }

    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(logout, 60 * 1000); // 1 minuto (60 segundos * 1000 ms)
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const username = usernameInput.value;
        const password = passwordInput.value;

        // Verifica as credenciais no mockUsersDB
        const foundUser = mockUsersDB.find(user => user.username === username && user.password === password);

        if (foundUser) {
            loginScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
            loginError.textContent = '';
            usernameInput.value = '';
            passwordInput.value = '';

            // Inicia a aplicação e o timer de inatividade
            initializeApp(foundUser);
            resetInactivityTimer();
        } else {
            loginError.textContent = 'Usuário ou senha inválidos.';
        }
    });

    // Reseta o timer em qualquer interação do usuário
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keypress', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);


    // --- LÓGICA PRINCIPAL DA APLICAÇÃO ---
    // Esta função só é chamada após o login bem-sucedido
    function initializeApp(loggedInUser) {

        // --- LÓGICA DO MENU HAMBURGUER ---
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');

        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // --- LÓGICA DOS BOTÕES DE USUÁRIO NO CABEÇALHO ---
        const welcomeMessage = document.getElementById('welcome-message');
        const btnLogout = document.getElementById('btn-logout');
        const btnChangeOwnPassword = document.getElementById('btn-change-own-password');

        // Mensagem de boas-vindas

        welcomeMessage.textContent = `Olá, ${loggedInUser.name}`;

        // Botão Sair
        btnLogout.addEventListener('click', logout);

        // Botão Alterar Senha
        btnChangeOwnPassword.addEventListener('click', () => abrirModalAlterarPropriaSenha(loggedInUser));

        // --- CONTROLE DE VISIBILIDADE DO MENU POR PERMISSÃO ---
        const menuPermissions = {
            'btn-cadastro': 'cadastro',
            'btn-relatorio': 'relatorio',
            'btn-financeiro': 'financeiro',
            'btn-presenca': 'presenca'
        };

        for (const [buttonId, permission] of Object.entries(menuPermissions)) {
            const button = document.getElementById(buttonId);
            if (button) {
                button.style.display = loggedInUser.permissions.includes(permission) ? 'inline-block' : 'none';
            }
        }

        // Adiciona o botão de Gerenciar Usuários se for o admin
        if (loggedInUser.permissions.includes('usuarios') && !document.getElementById('btn-gerenciar-usuarios')) {
            const navMenu = document.querySelector('.nav-menu');
            const manageUsersButton = document.createElement('a');
            manageUsersButton.href = '#';
            manageUsersButton.id = 'btn-gerenciar-usuarios';
            manageUsersButton.className = 'nav-button';
            manageUsersButton.textContent = 'Gerenciar Usuários';
            navMenu.appendChild(manageUsersButton);

            manageUsersButton.addEventListener('click', (e) => {
                e.preventDefault();
                carregarViewUsuarios();
            });
        }

        // --- LÓGICA DA SEÇÃO DE CADASTRO ---
        const btnCadastro = document.getElementById('btn-cadastro');

        btnCadastro.addEventListener('click', function(event) {
            event.preventDefault(); // Previne o comportamento padrão do link (#)
            carregarViewCadastro();
        });

    }

    // --- LÓGICA DA SEÇÃO DE CADASTRO ---

    // Seleciona os elementos principais
    // Tenta carregar do localStorage, se não existir, usa os dados iniciais
    let mockAlunosDB = JSON.parse(localStorage.getItem('mockAlunosDB')) || [
        { id: 1, nome: 'Ana Silva', turma: '5º Ano A', responsavel: 'Marcos Silva', email: 'marcos.silva@email.com', telefone: '(11) 98765-4321' },

        { id: 2, nome: 'Bruno Costa', turma: '6º Ano B', responsavel: 'Juliana Costa', email: 'juliana.c@email.com', telefone: '(21) 91234-5678' },
        { id: 3, nome: 'Carla Dias', turma: '5º Ano A', responsavel: 'Roberto Dias', email: 'roberto.dias@email.com', telefone: '(31) 95555-8888' }
    ];

    // Função para salvar alunos no localStorage
    function saveAlunosToLocalStorage() {
        localStorage.setItem('mockAlunosDB', JSON.stringify(mockAlunosDB));
    }

    // Salva os alunos iniciais se o localStorage estiver vazio
    if (!localStorage.getItem('mockAlunosDB')) {
        saveAlunosToLocalStorage();
    }

    // Função para renderizar (desenhar) a tabela de alunos
    function renderAlunosTable(alunos) {
        const tableHTML = `
            <table class="alunos-table">
                <thead>
                    <tr>
                        <th>Nome do Aluno</th>

                        <th>Turma</th>
                        <th>Responsável</th>
                        <th>E-mail</th>
                        <th>Telefone</th>
                        <th class="actions-cell">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${alunos.map(aluno => `
                        <tr>
                            <td>${aluno.nome}</td>
                            <td>${aluno.turma}</td>
                            <td>${aluno.responsavel}</td>
                            <td>${aluno.email}</td>
                            <td>${aluno.telefone}</td>
                            <td class="actions-cell">
                                <button class="btn-action btn-edit" data-id="${aluno.id}">Editar</button>
                                <button class="btn-action btn-delete" data-id="${aluno.id}">Excluir</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        // Insere a tabela no container apropriado
        document.getElementById('alunos-container').innerHTML = tableHTML;

    }

    // Função para carregar a visualização de cadastro
    function carregarViewCadastro() {
        mainContent.innerHTML = `
            <h2>Alunos Cadastrados</h2>
            <div class="cadastro-header">
                <input type="text" id="search-aluno" class="search-input" placeholder="Buscar por nome, turma, responsável...">
                <button id="btn-novo" class="btn-novo-cadastro">Novo Cadastro</button>
            </div>

            <div id="alunos-container"></div>
            
            <!-- Modal para Novo Cadastro -->
            <div id="modal-cadastro" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Novo Cadastro de Aluno</h3>
                        <span class="close-button">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="form-novo-aluno">
                            <div class="form-group">

                                <label for="nome">Nome do Aluno:</label>
                                <input type="text" id="nome" required>
                            </div>
                            <div class="form-group">
                                <label for="turma">Turma:</label>
                                <select id="turma" name="turma" required>
                                    <option value="" disabled selected>Selecione a Turma</option>
                                    <option value="Infantil I">Infantil I</option>
                                    <option value="Infantil II">Infantil II</option>
                                    <option value="Infantil III">Infantil III</option>
                                    <option value="1º Ano">1º Ano</option>
                                    <option value="2º Ano">2º Ano</option>
                                    <option value="3º Ano">3º Ano</option>
                                    <option value="4º Ano">4º Ano</option>
                                    <option value="5º Ano">5º Ano</option>
                                    <option value="6º Ano">6º Ano</option>
                                    <option value="7º Ano">7º Ano</option>
                                    <option value="8º Ano">8º Ano</option>
                                    <option value="9º Ano">9º Ano</option>
                                    <option value="1ª Série E.M.">1ª Série E.M.</option>
                                    <option value="2ª Série E.M.">2ª Série E.M.</option>
                                    <option value="3ª Série E.M.">3ª Série E.M.</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="responsavel">Nome do Responsável:</label>
                                <input type="text" id="responsavel" required>
                            </div>
                            <div class="form-group">
                                <label for="email">E-mail do Responsável:</label>
                                <input type="email" id="email" required>
                            </div>
                            <div class="form-group">
                                <label for="telefone">Telefone do Responsável:</label>
                                <input type="tel" id="telefone" name="telefone" pattern="^\(\d{2}\)\s\d{4,5}-\d{4}$" placeholder="(XX) XXXXX-XXXX" maxlength="15">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" form="form-novo-aluno" class="btn-novo-cadastro">Salvar</button>
                    </div>
                </div>
            </div>
        `;

        renderAlunosTable(mockAlunosDB); // Renderiza a tabela inicial

        // Adiciona os event listeners para os novos elementos

        document.getElementById('search-aluno').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const alunosFiltrados = mockAlunosDB.filter(aluno => 
                aluno.nome.toLowerCase().includes(searchTerm) ||
                aluno.turma.toLowerCase().includes(searchTerm) ||
                aluno.responsavel.toLowerCase().includes(searchTerm)
            );
            renderAlunosTable(alunosFiltrados);
        });

        // Lógica do Modal
        const modal = document.getElementById('modal-cadastro');

        const form = document.getElementById('form-novo-aluno');
        const btnClose = document.querySelector('.close-button');

        function fecharModal() {
            modal.classList.remove('visible');
            form.reset(); // Limpa o formulário ao fechar
        }
        document.getElementById('btn-novo').addEventListener('click', () => modal.classList.add('visible')); 
        btnClose.addEventListener('click', fecharModal);
        window.addEventListener('click', (e) => { if (e.target == modal) { fecharModal(); } });

        // Lógica para formatar o campo de telefone em tempo real
        const telefoneInput = document.getElementById('telefone');
        telefoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
            if (value.length > 10) {
                // Formato (XX) XXXXX-XXXX para celulares com 9 dígitos
                value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
            } else {
                // Formato (XX) XXXX-XXXX para telefones fixos
                value = value.replace(/^(\d{2})(\d{4})(\d{1,4}).*/, '($1) $2-$3');
            }
            e.target.value = value;
        });

        // Lógica para transformar campos em maiúsculas e e-mail em minúsculas
        const nomeInput = document.getElementById('nome');
        const responsavelInput = document.getElementById('responsavel');
        const emailInput = document.getElementById('email');

        nomeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
        responsavelInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
        emailInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toLowerCase();
        });

        // Lógica para salvar o novo aluno
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Previne o recarregamento da página

            // Coleta os dados do formulário
            const nome = document.getElementById('nome').value;
            const turma = document.getElementById('turma').value;
            const responsavel = document.getElementById('responsavel').value;
            const email = document.getElementById('email').value;
            const telefone = document.getElementById('telefone').value;

            // Cria um novo objeto de aluno
            const novoAluno = {
                id: Date.now(), // Gera um ID único baseado no tempo atual
                nome: nome,
                turma: turma,
                responsavel: responsavel,
                email: email,
                telefone: telefone
            };

            // Adiciona o novo aluno ao "banco de dados"
            mockAlunosDB.push(novoAluno);

            saveAlunosToLocalStorage(); // Salva no localStorage

            // Atualiza a tabela e fecha o modal
            renderAlunosTable(mockAlunosDB);
            fecharModal();
        });
    }


    // --- LÓGICA DA SEÇÃO DE GERENCIAMENTO DE USUÁRIOS ---

    function renderUsersTable() {
        const container = document.getElementById('users-container');
        if (!container) return;

        const tableHTML = `
            <table class="alunos-table">
                <thead>
                    <tr>
                        <th>Nome Completo</th>
                        <th>Nome de Usuário</th>
                        <th class="actions-cell">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${mockUsersDB.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.username}</td>
                            <td class="actions-cell">
                                <button class="btn-action btn-edit" data-id="${user.id}">Editar</button>
                                ${user.username !== 'admin' ? `<button class="btn-action btn-delete" data-id="${user.id}">Excluir</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        container.innerHTML = tableHTML;

        // Adiciona listeners para os botões de deletar
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = parseInt(e.target.dataset.id, 10);
                if (confirm('Tem certeza que deseja excluir este usuário?')) {
                    mockUsersDB = mockUsersDB.filter(user => user.id !== userId);
                    saveUsersToLocalStorage(); // Salva no localStorage
                    renderUsersTable();
                }
            });
        });

        // Adiciona listeners para os botões de editar
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = parseInt(e.target.dataset.id, 10);
                const userToEdit = mockUsersDB.find(user => user.id === userId);
                if (userToEdit) {
                    abrirModalEdicaoUsuario(userToEdit);
                }
            });
        });
    }

    function carregarViewUsuarios() {
        mainContent.innerHTML = `
            <h2>Gerenciamento de Usuários</h2>
            <div class="cadastro-header">
                <span></span> <!-- Apenas para manter o alinhamento -->
                <button id="btn-novo-usuario" class="btn-novo-cadastro">Novo Usuário</button>
            </div>
            <div id="users-container"></div>

            <!-- MODAL DE NOVO USUÁRIO -->

            <!-- Modal para Novo Usuário -->
            <div id="modal-usuario" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Novo Usuário</h3>
                        <span class="close-button">&times;</span>
                    </div>
                    <div class="modal-body" style="padding-top: 10px;">
                        <form id="form-novo-usuario">
                            <div class="tab-container">
                                <button type="button" class="tab-button active" data-tab="new-user-data">Dados do Usuário</button>
                                <button type="button" class="tab-button" data-tab="new-user-permissions">Permissões</button>
                            </div>

                            <!-- Aba de Dados do Novo Usuário -->
                            <div id="tab-new-user-data" class="tab-content active">
                                <div class="form-group">
                                    <label for="new-name">Nome Completo:</label>
                                    <input type="text" id="new-name" required>
                                </div>
                                <div class="form-group">
                                    <label for="new-username">Nome de Usuário:</label>
                                    <input type="text" id="new-username" required>
                                </div>
                                <div class="form-group">
                                    <label for="new-email">E-mail:</label>
                                    <input type="email" id="new-email" required>
                                </div>
                                <div class="form-group">
                                    <label for="new-password">Senha:</label>
                                    <input type="password" id="new-password" required>
                                </div>
                                <div class="form-group">
                                    <label for="new-confirm-password">Confirmar Senha:</label>
                                    <input type="password" id="new-confirm-password" required>
                                </div>
                            </div>

                            <!-- Aba de Permissões do Novo Usuário -->
                            <div id="tab-new-user-permissions" class="tab-content">
                                <div class="permissions-grid">
                                    <label><input type="checkbox" name="new_permission" value="cadastro"> Cadastro</label>
                                    <label><input type="checkbox" name="new_permission" value="relatorio"> Relatório</label>
                                    <label><input type="checkbox" name="new_permission" value="financeiro"> Controle Financeiro</label>
                                    <label><input type="checkbox" name="new_permission" value="presenca"> Lista de Presença</label>
                                    <label><input type="checkbox" name="new_permission" value="usuarios"> Gerenciar Usuários</label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" form="form-novo-usuario" class="btn-novo-cadastro">Salvar</button>
                    </div>
                </div>
            </div>
        `;

        // Injeta o HTML do Modal de Edição dinamicamente
        const editModalHTML = `
            <div id="modal-edit-usuario" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Editar Usuário</h3>
                        <span class="close-button">&times;</span>
                    </div>
                    <div class="modal-body" style="padding-top: 10px;">
                        <input type="hidden" id="edit-user-id-hidden"> <!-- Adicionado o campo hidden para o ID -->
                        <div class="tab-container">
                            <button type="button" class="tab-button active" data-tab="edit-user-data">Dados do Usuário</button>
                            <button type="button" class="tab-button" data-tab="edit-user-permissions">Permissões</button>
                            <button type="button" class="tab-button" data-tab="edit-user-password">Alterar Senha</button>
                        </div>

                        <!-- Aba de Dados do Usuário -->
                        <div id="tab-edit-user-data" class="tab-content active">
                            <div class="form-group">
                                <label for="edit-name">Nome Completo:</label>
                                <input type="text" id="edit-name" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-username-input">Nome de Usuário:</label>
                                <input type="text" id="edit-username-input" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-email">E-mail:</label>
                                <input type="email" id="edit-email" required>
                            </div>
                        </div>

                        <!-- Aba de Permissões -->
                        <div id="tab-edit-user-permissions" class="tab-content">
                            <div id="edit-permissions-container" class="permissions-grid">
                                <label><input type="checkbox" name="permission" value="cadastro"> Cadastro</label>
                                <label><input type="checkbox" name="permission" value="relatorio"> Relatório</label>
                                <label><input type="checkbox" name="permission" value="financeiro"> Controle Financeiro</label>
                                <label><input type="checkbox" name="permission" value="presenca"> Lista de Presença</label>
                                <label><input type="checkbox" name="permission" value="usuarios"> Gerenciar Usuários</label>
                            </div>
                        </div>

                        <!-- Aba de Alterar Senha -->
                        <div id="tab-edit-user-password" class="tab-content">
                                <div class="form-group">
                                    <label for="new-pass">Nova Senha:</label>
                                    <input type="password" id="new-pass">
                                </div>
                                <div class="form-group">
                                    <label for="confirm-pass">Confirmar Nova Senha:</label>
                                    <input type="password" id="confirm-pass">
                                </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="btn-save-user-changes" class="btn-novo-cadastro">Salvar Alterações</button>
                    </div>
                </div>
            </div>
        `;
        mainContent.insertAdjacentHTML('beforeend', editModalHTML);

        renderUsersTable();

        // --- MODAL PARA O PRÓPRIO USUÁRIO ALTERAR A SENHA ---
        const ownPasswordModalHTML = `
            <div id="modal-change-own-password" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Alterar Minha Senha</h3>
                        <span class="close-button">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="form-change-own-password">
                            <div class="form-group">
                                <label for="current-password">Senha Atual:</label>
                                <input type="password" id="current-password" required>
                            </div>
                            <div class="form-group">
                                <label for="own-new-pass">Nova Senha:</label>
                                <input type="password" id="own-new-pass" required>
                            </div>
                            <div class="form-group">
                                <label for="own-confirm-pass">Confirmar Nova Senha:</label>
                                <input type="password" id="own-confirm-pass" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" form="form-change-own-password" class="btn-novo-cadastro">Confirmar Alteração</button>
                    </div>
                </div>
            </div>
        `;
        // Adiciona o modal ao corpo do documento para que esteja sempre disponível
        if (!document.getElementById('modal-change-own-password')) {
            document.body.insertAdjacentHTML('beforeend', ownPasswordModalHTML);

            // Adiciona lógica de fechamento
            const ownPasswordModal = document.getElementById('modal-change-own-password');
            ownPasswordModal.querySelector('.close-button').addEventListener('click', () => {
                ownPasswordModal.classList.remove('visible');
            });
            window.addEventListener('click', (e) => {
                if (e.target == ownPasswordModal) {
                    ownPasswordModal.classList.remove('visible');
                }
            });
        }



        // Lógica do Modal de Novo Usuário
        const modal = document.getElementById('modal-usuario');
        const form = document.getElementById('form-novo-usuario');

        document.getElementById('btn-novo-usuario').addEventListener('click', () => {
            form.reset(); // Limpa o formulário antes de exibir
            // Lógica das abas do modal de novo usuário
            const tabButtons = modal.querySelectorAll('.tab-button');
            const tabContents = modal.querySelectorAll('.tab-content');
            tabButtons.forEach(button => {
                button.onclick = () => {
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    tabContents.forEach(content => content.classList.remove('active'));
                    modal.querySelector(`#tab-${button.dataset.tab}`).classList.add('active');
                };
            });
            tabButtons[0].click(); // Garante que a primeira aba esteja ativa
            modal.classList.add('visible');
        });
        modal.querySelector('.close-button').addEventListener('click', () => modal.classList.remove('visible'));

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUsername = document.getElementById('new-username').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('new-confirm-password').value;
            
            if (newPassword !== confirmPassword) {
                alert('As senhas não coincidem. Tente novamente.');
                return;
            }

            const newPermissions = Array.from(document.querySelectorAll('input[name="new_permission"]:checked'))
                                        .map(cb => cb.value);
            const newName = document.getElementById('new-name').value; // Movido para cá
            const newEmail = document.getElementById('new-email').value; // Movido para cá

            const newUser = {
                id: Date.now(),
                username: newUsername,
                password: newPassword,
                permissions: newPermissions, // <-- VÍRGULA ADICIONADA AQUI
                name: newName,
                email: newEmail
            };

            mockUsersDB.push(newUser);
            saveUsersToLocalStorage(); // Salva no localStorage
            renderUsersTable();
            modal.classList.remove('visible');
            form.reset();
        });
    }

    function abrirModalEdicaoUsuario(user) {
        const modal = document.getElementById('modal-edit-usuario');
        modal.querySelector('#edit-user-id-hidden').value = user.id;

        // Marca as checkboxes de permissão conforme o usuário
        const permissionCheckboxes = modal.querySelectorAll('input[name="permission"]');
        permissionCheckboxes.forEach(checkbox => {
            checkbox.checked = user.permissions.includes(checkbox.value);
            // Desabilita a edição de permissões para o admin
            if (user.username === 'admin') {
                checkbox.disabled = true;
            } else {
                checkbox.disabled = false;
            }
        });

        modal.classList.add('visible');

        // Lógica para fechar o modal de edição
        modal.querySelector('.close-button').addEventListener('click', () => modal.classList.remove('visible'));

        // Lógica das Abas
        const tabButtons = modal.querySelectorAll('.tab-button');
        const tabContents = modal.querySelectorAll('.tab-content');
        tabButtons.forEach(button => {
            button.onclick = () => {

                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                tabContents.forEach(content => content.classList.remove('active'));
                modal.querySelector(`#tab-${button.dataset.tab}`).classList.add('active');
            };
        });
        // Reseta para a primeira aba ao abrir
        tabButtons[0].click();

        // Lógica para o botão único de salvar
        document.getElementById('btn-save-user-changes').onclick = () => {
            const userId = parseInt(modal.querySelector('#edit-user-id-hidden').value, 10);
            const userToUpdate = mockUsersDB.find(u => u.id === userId);

            // Salva as permissões
            const newPermissions = Array.from(permissionCheckboxes)
                                        .filter(cb => cb.checked)
                                        .map(cb => cb.value);
            userToUpdate.permissions = newPermissions;

            // Salva a nova senha, se preenchida
            const newPass = modal.querySelector('#new-pass').value;
            const confirmPass = modal.querySelector('#confirm-pass').value;

            if (newPass || confirmPass) { // Se o usuário tentou alterar a senha
                if (newPass !== confirmPass) {
                    alert('As senhas não coincidem. Tente novamente.');
                    return; // Não fecha o modal
                }
                if (!newPass) {
                    alert('O campo de senha não pode estar em branco.');
                    return; // Não fecha o modal
                }
                userToUpdate.password = newPass;
                alert('Permissões e senha alteradas com sucesso!');
            } else {
                alert('Permissões alteradas com sucesso!');
            }
            saveUsersToLocalStorage(); // Salva no localStorage

            // Limpa os campos de senha e fecha o modal
            modal.querySelector('#new-pass').value = '';
            modal.querySelector('#confirm-pass').value = '';
            modal.classList.remove('visible');
            renderUsersTable();
        };
    }

    function abrirModalAlterarPropriaSenha(user) {
        const modal = document.getElementById('modal-change-own-password');
        const form = document.getElementById('form-change-own-password');
        form.reset();
        modal.classList.add('visible');

        form.onsubmit = (e) => {
            e.preventDefault();

            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('own-new-pass').value;
            const confirmPassword = document.getElementById('own-confirm-pass').value;

            // 1. Valida a senha atual
            if (currentPassword !== user.password) {
                alert('A senha atual está incorreta.');
                return;
            }

            // 2. Valida se a nova senha e a confirmação coincidem
            if (newPassword !== confirmPassword) {
                alert('A nova senha e a confirmação não coincidem.');
                return;
            }

            // 3. Atualiza a senha no "banco de dados"
            const userInDB = mockUsersDB.find(dbUser => dbUser.id === user.id);
            userInDB.password = newPassword;

            alert('Senha alterada com sucesso!');
            saveUsersToLocalStorage(); // Salva no localStorage
            modal.classList.remove('visible');
        };
    }


});
