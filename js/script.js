<script>
document.addEventListener('DOMContentLoaded', function() {
    // Ponto de entrada: Seleciona os elementos principais
    const loadingOverlay = document.getElementById('loading-overlay');
    const appContainer = document.getElementById('app-container');
    const mainContent = document.getElementById('main-content');

    // Os "bancos de dados" agora são arrays vazios que serão preenchidos com dados do servidor.
    let mockAlunosDB = [];
    let mockUsersDB = []; // Será usado principalmente na tela de admin
    let pagamentosDB = [];
    let servicosDB = {}; // Será carregado do servidor


    // --- SISTEMA DE NOTIFICAÇÃO E CONFIRMAÇÃO ---

    // Injeta o HTML do modal de confirmação uma única vez
    const confirmModalHTML = `
        <div id="confirm-modal" class="confirm-modal">
            <div class="confirm-modal-content">
                <h3 id="confirm-modal-title"></h3>
                <p id="confirm-modal-message"></p>
                <div id="confirm-modal-actions" class="confirm-modal-actions">
                    <!-- Botões serão injetados aqui -->
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', confirmModalHTML);

    const confirmModal = document.getElementById('confirm-modal');
    const confirmModalTitle = document.getElementById('confirm-modal-title');
    const confirmModalMessage = document.getElementById('confirm-modal-message');
    const confirmModalActions = document.getElementById('confirm-modal-actions');

    /**
     * Exibe um modal de confirmação.
     * @param {string} title - O título do modal.
     * @param {string} message - A mensagem a ser exibida.
     * @param {function} onConfirm - Callback a ser executado se o usuário confirmar.
     */
    function showConfirmation(title, message, onConfirm) {
        confirmModalTitle.textContent = title;
        confirmModalMessage.textContent = message;
        confirmModalActions.innerHTML = `
            <button id="confirm-btn-confirm" class="confirm-modal-btn confirm-btn-confirm">Confirmar</button>
            <button id="confirm-btn-cancel" class="confirm-modal-btn confirm-btn-cancel">Cancelar</button>
        `;
        confirmModal.classList.add('visible');

        document.getElementById('confirm-btn-confirm').onclick = () => {
            confirmModal.classList.remove('visible');
            onConfirm();
        };
        document.getElementById('confirm-btn-cancel').onclick = () => {
            confirmModal.classList.remove('visible');
        };
    }

    /**
     * Exibe uma notificação de sucesso (toast).
     * @param {string} message - A mensagem a ser exibida.
     */
    function showToast(message) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.textContent = message;
        toastContainer.appendChild(toast);

        // Animação de entrada
        setTimeout(() => toast.classList.add('visible'), 10);

        // Remove o toast após 3 segundos
        setTimeout(() => {
            toast.classList.remove('visible');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }

    // --- INICIALIZAÇÃO DIRETA DA APLICAÇÃO ---

    // Como removemos a tela de login, vamos simular um usuário admin logado
    // para ter acesso a todas as funcionalidades.
    const mockAdminUser = {
        id: 1,
        username: 'admin',
        name: 'Administrador',
        email: 'admin@example.com',
        permissions: ['cadastro', 'relatorio', 'financeiro', 'presenca', 'usuarios', 'configuracoes']
    };

    // Inicia a aplicação diretamente com o usuário admin
    initializeApp(mockAdminUser);

    loadingOverlay.classList.add('loading-hidden');
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

        // Mensagem de boas-vindas
        welcomeMessage.textContent = `Olá, ${loggedInUser.name}`;

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

        // Adiciona o botão de Configurações se for o admin
        if (loggedInUser.permissions.includes('configuracoes') && !document.getElementById('btn-configuracoes')) {
            const navMenu = document.querySelector('.nav-menu');
            const settingsButton = document.createElement('a');
            settingsButton.href = '#';
            settingsButton.id = 'btn-configuracoes';
            settingsButton.className = 'nav-button';
            settingsButton.textContent = 'Configurações';
            navMenu.appendChild(settingsButton);

            settingsButton.addEventListener('click', (e) => {
                e.preventDefault();
                carregarViewConfiguracoes();
            });
        }

        // --- LÓGICA DA SEÇÃO DE CADASTRO ---
        const btnCadastro = document.getElementById('btn-cadastro');
        const btnRelatorio = document.getElementById('btn-relatorio');
        const btnFinanceiro = document.getElementById('btn-financeiro');
        const btnPresenca = document.getElementById('btn-presenca');

        btnCadastro.addEventListener('click', function(event) {
            event.preventDefault(); // Previne o comportamento padrão do link (#)
            carregarViewCadastro();
        });

        btnRelatorio.addEventListener('click', function(event) {
            event.preventDefault();
            carregarViewRelatorio();
        });

        btnFinanceiro.addEventListener('click', function(event) {
            event.preventDefault();
            carregarViewFinanceiro();
        });

        btnPresenca.addEventListener('click', function(event) {
            event.preventDefault();
            carregarViewPresenca();
        });

    }

    function carregarViewRelatorio() {
        mainContent.innerHTML = `
            <h2>Relatórios</h2>
            <p>Esta seção está em desenvolvimento. Em breve, você poderá gerar relatórios detalhados por aqui.</p>
        `;
    }

    function carregarViewFinanceiro() {
         mainContent.innerHTML = `
             <div class="cadastro-header">
                 <h2>Controle Financeiro</h2>
                 <div class="form-group" style="max-width: 250px;">
                     <label for="mes-ano-financeiro">Selecione o Mês/Ano:</label>
                     <input type="month" id="mes-ano-financeiro" class="search-input">
                 </div>
             </div>
             <p>Selecione um mês e clique em um aluno para gerenciar os pagamentos e descontos.</p>
             <div id="financeiro-alunos-container"></div>
 
             <!-- Modal de Detalhes Financeiros do Aluno -->
             <div id="modal-financeiro-aluno" class="modal">
                 <div class="modal-content" style="max-width: 650px;">
                     <div class="modal-header">
                         <h3 id="financeiro-modal-title"></h3>
                         <span class="close-button">&times;</span>
                     </div>
                     <div class="modal-body">
                         <!-- Seção do Sistema Integral -->
                         <div class="financeiro-section" id="financeiro-section-integral">
                             <h4>Sistema Integral</h4>
                             <div id="financeiro-integral-servicos"></div>
                             <div class="financeiro-valores">
                                 <div class="form-group">
                                     <label>Subtotal:</label>
                                     <input type="text" id="financeiro-integral-subtotal" readonly>
                                 </div>
                                 <div class="form-group">
                                     <label for="financeiro-integral-desconto">Desconto (%):</label>
                                     <input type="number" id="financeiro-integral-desconto" step="0.01" placeholder="0">
                                 </div>
                                 <div class="form-group total-pagar">
                                     <label>Total a Pagar:</label>
                                     <input type="text" id="financeiro-integral-total" readonly>
                                 </div>
                             </div>
                             <div class="financeiro-status-action">
                                 <div class="financeiro-status" id="financeiro-integral-status"></div>
                                 <button id="btn-pagar-integral" class="btn-novo-cadastro">Marcar como Pago</button>
                             </div>
                         </div>
 
                         <!-- Seção de Atividades Extraclasse -->
                         <div class="financeiro-section" id="financeiro-section-extraclasse">
                             <h4>Atividades Extraclasse</h4>
                             <div id="financeiro-extraclasse-servicos"></div>
                              <div class="financeiro-valores">
                                 <div class="form-group">
                                     <label>Subtotal:</label>
                                     <input type="text" id="financeiro-extraclasse-subtotal" readonly>
                                 </div>
                                 <div class="form-group">
                                     <label for="financeiro-extraclasse-desconto">Desconto (%):</label>
                                     <input type="number" id="financeiro-extraclasse-desconto" step="0.01" placeholder="0">
                                 </div>
                                 <div class="form-group total-pagar">
                                     <label>Total a Pagar:</label>
                                     <input type="text" id="financeiro-extraclasse-total" readonly>
                                 </div>
                             </div>
                             <div class="financeiro-status-action">
                                 <div class="financeiro-status" id="financeiro-extraclasse-status"></div>
                                 <button id="btn-pagar-extraclasse" class="btn-novo-cadastro">Marcar como Pago</button>
                             </div>
                         </div>
 
                         <!-- Seção de Resumo Total -->
                         <div class="financeiro-total-geral">
                             <h4>Total Geral a Pagar (Integral + Extraclasse)</h4>
                             <strong id="financeiro-total-geral-valor">R$ 0,00</strong>
                         </div>
                     </div>
                 </div>
             </div>
         `;
 
         const mesAnoInput = document.getElementById('mes-ano-financeiro');
         const hoje = new Date();
         const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
         const ano = hoje.getFullYear();
         mesAnoInput.value = `${ano}-${mes}`;
 
         renderTabelaFinanceira(mesAnoInput.value);
 
         mesAnoInput.addEventListener('change', () => {
             renderTabelaFinanceira(mesAnoInput.value);
         });
 
         const modal = document.getElementById('modal-financeiro-aluno');
         modal.querySelector('.close-button').addEventListener('click', () => modal.classList.remove('visible'));
     }
 
     function renderTabelaFinanceira(mesAno) {
         const container = document.getElementById('financeiro-alunos-container');
 
         // Garante que todos os alunos tenham um registro de pagamento para o mês selecionado
         mockAlunosDB.forEach(aluno => {
             const pagamentoId = `${aluno.id}-${mesAno}`;
             if (!pagamentosDB.some(p => p.id === pagamentoId)) {
                 pagamentosDB.push({
                     id: pagamentoId,
                     alunoId: aluno.id,
                     mesAno: mesAno,
                     pagamentoIntegral: { status: 'pendente', desconto: 0 },
                     pagamentoExtraclasse: { status: 'pendente', desconto: 0 }
                 });
             }
         });
         savePagamentosToLocalStorage();
 
         const getStatusBadge = (status) => {
             if (status === 'pago') return `<span class="status-badge pago">Pago</span>`;
             if (status === 'pendente') return `<span class="status-badge pendente">Pendente</span>`;
             return `<span class="status-badge na">N/A</span>`;
         };
 
         const alunosTableHTML = `
             <table class="alunos-table">
                 <thead>
                     <tr>
                         <th>Nome do Aluno</th>
                         <th>Turma</th>
                         <th>Status Integral</th>
                         <th>Status Extraclasse</th>
                     </tr>
                 </thead>
                 <tbody>
                     ${mockAlunosDB.map(aluno => {
                         const servicos = aluno.servicosContratados || {};
                         const temIntegral = servicos.integral && servicos.integral.id;
                         const temExtraclasse = servicos.extraclasse && servicos.extraclasse.length > 0;
 
                         const pagamento = pagamentosDB.find(p => p.id === `${aluno.id}-${mesAno}`) || {};
                         const statusIntegral = temIntegral ? getStatusBadge(pagamento.pagamentoIntegral?.status || 'pendente') : getStatusBadge('na');
                         const statusExtraclasse = temExtraclasse ? getStatusBadge(pagamento.pagamentoExtraclasse?.status || 'pendente') : getStatusBadge('na');
 
                         return `
                             <tr data-aluno-id="${aluno.id}" data-mes-ano="${mesAno}" style="cursor: pointer;">
                                 <td>${aluno.nome}</td>
                                 <td>${aluno.turma}</td>
                                 <td>${statusIntegral}</td>
                                 <td>${statusExtraclasse}</td>
                             </tr>
                         `;
                     }).join('')}
                 </tbody>
             </table>
         `;
         container.innerHTML = alunosTableHTML;
 
         // Adiciona listeners para as linhas da tabela
         container.querySelectorAll('tr[data-aluno-id]').forEach(row => {
             row.addEventListener('click', (e) => {
                 const alunoId = e.currentTarget.dataset.alunoId;
                 const mesAno = e.currentTarget.dataset.mesAno;
                 abrirModalFinanceiroAluno(parseInt(alunoId, 10), mesAno);
             });
         });
     }

    // --- LÓGICA DA SEÇÃO DE LISTA DE PRESENÇA (CONTEÚDO TEMPORÁRIO) ---
    function carregarViewPresenca() {
        mainContent.innerHTML = `
            <h2>Lista de Presença</h2>
            <p>Esta seção está em desenvolvimento. Em breve, você poderá gerenciar a presença dos alunos por aqui.</p>
        `;
    }
    
    function abrirModalFinanceiroAluno(alunoId, mesAno) {
         const aluno = mockAlunosDB.find(a => a.id === alunoId);
         if (!aluno) return;
 
         const pagamentoId = `${aluno.id}-${mesAno}`;
         let pagamento = pagamentosDB.find(p => p.id === pagamentoId);
 
         const modal = document.getElementById('modal-financeiro-aluno');
         document.getElementById('financeiro-modal-title').textContent = `Financeiro: ${aluno.nome} (${new Date(mesAno + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})`;
 
         const servicosContratados = aluno.servicosContratados || {};
         const getStatusBadge = (status) => status === 'pago' ? `<span class="status-badge pago">Pago</span>` : `<span class="status-badge pendente">Pendente</span>`;
 
         let totalGeral = 0;
 
         // --- Lógica para a seção INTEGRAL ---
         const secaoIntegral = document.getElementById('financeiro-section-integral');
         const temIntegral = servicosContratados.integral && servicosContratados.integral.id;
         secaoIntegral.style.display = temIntegral ? 'block' : 'none';
 
         if (temIntegral) {
             const servicoInfo = servicosDB.integral.find(s => s.id === servicosContratados.integral.id);
             const subtotal = servicoInfo.valor;
             const descontoInput = document.getElementById('financeiro-integral-desconto');
             descontoInput.value = pagamento.pagamentoIntegral.desconto;
 
             document.getElementById('financeiro-integral-servicos').innerHTML = `<p><strong>Serviço:</strong> ${servicoInfo.titulo}</p>`;
             document.getElementById('financeiro-integral-subtotal').value = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
 
             const atualizarTotalIntegral = () => {
                 const descontoPercentual = parseFloat(descontoInput.value) || 0;
                 const valorDesconto = subtotal * (descontoPercentual / 100);
                 const total = subtotal - valorDesconto;
                 document.getElementById('financeiro-integral-total').value = `R$ ${total.toFixed(2).replace('.', ',')}`;
                 atualizarTotalGeral();
             };
 
             descontoInput.oninput = atualizarTotalIntegral;
 
             const statusEl = document.getElementById('financeiro-integral-status');
             const btnPagar = document.getElementById('btn-pagar-integral');
             statusEl.innerHTML = `Status: ${getStatusBadge(pagamento.pagamentoIntegral.status)}`;
             btnPagar.disabled = pagamento.pagamentoIntegral.status === 'pago';
             descontoInput.disabled = pagamento.pagamentoIntegral.status === 'pago';
 
             btnPagar.onclick = () => {
                 pagamento.pagamentoIntegral.status = 'pago';
                 pagamento.pagamentoIntegral.desconto = parseFloat(descontoInput.value) || 0;
                 savePagamentosToLocalStorage();
                 showToast('Pagamento do Integral registrado!');
                 modal.classList.remove('visible');
                 renderTabelaFinanceira(mesAno);
             };
         }
 
         // --- Lógica para a seção EXTRACLASSE ---
         const secaoExtraclasse = document.getElementById('financeiro-section-extraclasse');
         const temExtraclasse = servicosContratados.extraclasse && servicosContratados.extraclasse.length > 0;
         secaoExtraclasse.style.display = temExtraclasse ? 'block' : 'none';
 
         if (temExtraclasse) {
             let subtotalExtraclasse = 0;
             let servicosHtml = '<ul>';
             servicosContratados.extraclasse.forEach(id => {
                 const atividadeInfo = servicosDB.extraclasse.find(a => a.id === id);
                 if (atividadeInfo) {
                     const valor = atividadeInfo.dias_semana.length >= 2 ? atividadeInfo.valor_2x : atividadeInfo.valor_1x;
                     subtotalExtraclasse += valor;
                     servicosHtml += `<li>${atividadeInfo.nome} - R$ ${valor.toFixed(2).replace('.', ',')}</li>`;
                 }
             });
             servicosHtml += '</ul>';
 
             const descontoInput = document.getElementById('financeiro-extraclasse-desconto');
             descontoInput.value = pagamento.pagamentoExtraclasse.desconto;
 
             document.getElementById('financeiro-extraclasse-servicos').innerHTML = servicosHtml;
             document.getElementById('financeiro-extraclasse-subtotal').value = `R$ ${subtotalExtraclasse.toFixed(2).replace('.', ',')}`;
 
             const atualizarTotalExtraclasse = () => {
                 const descontoPercentual = parseFloat(descontoInput.value) || 0;
                 const valorDesconto = subtotalExtraclasse * (descontoPercentual / 100);
                 const total = subtotalExtraclasse - valorDesconto;
                 document.getElementById('financeiro-extraclasse-total').value = `R$ ${total.toFixed(2).replace('.', ',')}`;
                 atualizarTotalGeral();
             };
 
             descontoInput.oninput = atualizarTotalExtraclasse;
 
             const statusEl = document.getElementById('financeiro-extraclasse-status');
             const btnPagar = document.getElementById('btn-pagar-extraclasse');
             statusEl.innerHTML = `Status: ${getStatusBadge(pagamento.pagamentoExtraclasse.status)}`;
             btnPagar.disabled = pagamento.pagamentoExtraclasse.status === 'pago';
             descontoInput.disabled = pagamento.pagamentoExtraclasse.status === 'pago';
 
             btnPagar.onclick = () => {
                 pagamento.pagamentoExtraclasse.status = 'pago';
                 pagamento.pagamentoExtraclasse.desconto = parseFloat(descontoInput.value) || 0;
                 savePagamentosToLocalStorage();
                 showToast('Pagamento de Extraclasse registrado!');
                 modal.classList.remove('visible');
                 renderTabelaFinanceira(mesAno);
             };
         }
 
         // --- Lógica para o TOTAL GERAL ---
         function atualizarTotalGeral() {
             let totalFinal = 0;
             if (temIntegral) {
                const sub = servicosDB.integral.find(s => s.id === servicosContratados.integral.id).valor;
                const descPercent = parseFloat(document.getElementById('financeiro-integral-desconto').value) || 0;
                const valorDesconto = sub * (descPercent / 100);
                totalFinal += sub - valorDesconto;
             }
             if (temExtraclasse) {
                 let sub = 0;
                 servicosContratados.extraclasse.forEach(id => {
                     const atividadeInfo = servicosDB.extraclasse.find(a => a.id === id);
                     if (atividadeInfo) sub += atividadeInfo.dias_semana.length >= 2 ? atividadeInfo.valor_2x : atividadeInfo.valor_1x;
                 });
                 const descPercent = parseFloat(document.getElementById('financeiro-extraclasse-desconto').value) || 0;
                 const valorDesconto = sub * (descPercent / 100);
                 totalFinal += sub - valorDesconto;
             }
             document.getElementById('financeiro-total-geral-valor').textContent = `R$ ${totalFinal.toFixed(2).replace('.', ',')}`;
         }
 
         // Inicializa todos os totais
         if(temIntegral) document.getElementById('financeiro-integral-desconto').dispatchEvent(new Event('input'));
         if(temExtraclasse) document.getElementById('financeiro-extraclasse-desconto').dispatchEvent(new Event('input'));
         atualizarTotalGeral();
 
         modal.classList.add('visible');
     }

    // --- MODAL DE NOVO CADASTRO DE ALUNO ---
    // --- HTML DO MODAL DE NOVO CADASTRO (INJETADO UMA ÚNICA VEZ) ---
    const novoAlunoModalHTML = `
        <div id="modal-cadastro" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="novo-aluno-modal-title">Novo Cadastro de Aluno</h3>
                    <span class="close-button">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="form-novo-aluno">
                        <div class="tab-container">
                            <button type="button" class="tab-button active" data-tab="dados-aluno">Dados do Aluno</button>
                            <button type="button" class="tab-button" data-tab="servico-integral">Sistema Integral</button>
                            <button type="button" class="tab-button" data-tab="servico-extraclasse">Extraclasse</button>
                        </div>

                        <!-- Aba de Dados do Aluno -->
                        <div id="tab-dados-aluno" class="tab-content active">
                            <div class="form-group"><label for="nome">Nome do Aluno:</label><input type="text" id="nome" required></div>
                            <div class="form-group"><label for="turma">Turma:</label><select id="turma" name="turma" required><option value="" disabled selected>Selecione a turma</option><option value="Infantil I">Infantil I</option><option value="Infantil II">Infantil II</option><option value="Infantil III">Infantil III</option><option value="1º Ano">1º Ano</option><option value="2º Ano">2º Ano</option><option value="3º Ano">3º Ano</option><option value="4º Ano">4º Ano</option><option value="5º Ano">5º Ano</option><option value="6º Ano">6º Ano</option><option value="7º Ano">7º Ano</option><option value="8º Ano">8º Ano</option><option value="9º Ano">9º Ano</option><option value="1ª Série E.M.">1ª Série E.M.</option><option value="2ª Série E.M.">2ª Série E.M.</option><option value="3ª Série E.M.">3ª Série E.M.</option></select></div>
                            <div class="form-group"><label for="responsavel">Nome do Responsável:</label><input type="text" id="responsavel" required></div>
                            <div class="form-group"><label for="email">E-mail do Responsável:</label><input type="email" id="email" required></div>
                            <div class="form-group" style="display: grid; grid-template-columns: 80px 1fr; gap: 10px;">
                                <div><label for="telefone_ddd">DDD:</label><input type="tel" id="telefone_ddd" placeholder="XX" required></div>
                                <div><label for="telefone_numero">Número:</label><input type="tel" id="telefone_numero" placeholder="XXXXX-XXXX" required></div>
                            </div>
                        </div>

                        <!-- Aba de Sistema Integral -->
                        <div id="tab-servico-integral" class="tab-content">
                            <p>Selecione uma modalidade do Sistema Integral.</p>
                            <div id="integral-options-container" class="service-options-grid">
                                <!-- As opções serão injetadas aqui pelo JS -->
                            </div>
                            <div id="integral-dias-semana-container" class="hidden" style="margin-top: 20px;">
                                <label>Selecione os dias da semana (máx. <span id="max-dias-label"></span>):</label>
                                <div class="dias-semana-checkboxes">
                                    <label><input type="checkbox" name="integral_dia" value="Segunda-feira"> Segunda-feira</label>
                                    <label><input type="checkbox" name="integral_dia" value="Terça-feira"> Terça-feira</label>
                                    <label><input type="checkbox" name="integral_dia" value="Quarta-feira"> Quarta-feira</label>
                                    <label><input type="checkbox" name="integral_dia" value="Quinta-feira"> Quinta-feira</label>
                                    <label><input type="checkbox" name="integral_dia" value="Sexta-feira"> Sexta-feira</label>
                                </div>
                            </div>
                        </div>

                        <!-- Aba de Atividades Extraclasse -->
                        <div id="tab-servico-extraclasse" class="tab-content">
                            <p>Selecione as atividades extraclasse desejadas. Utilize a busca para filtrar.</p>
                            <input type="text" id="search-extraclasse" class="search-input" placeholder="Buscar atividade..." style="margin-bottom: 15px; width: 100%;">
                            <div id="extraclasse-options-container">
                                <!-- As opções serão injetadas aqui pelo JS -->
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="submit" form="form-novo-aluno" class="btn-novo-cadastro">Salvar Cadastro</button>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', novoAlunoModalHTML);

    // O modal de edição de aluno foi unificado com o de cadastro. Este HTML não é mais necessário.

    // --- MODAL DE CADASTRO/EDIÇÃO DE ATIVIDADE EXTRACLASSE ---
    const extraclasseModalHTML = `
        <div id="modal-extraclasse" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="extraclasse-modal-title">Nova Atividade Extraclasse</h3>
                    <span class="close-button">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="form-extraclasse">
                        <input type="hidden" id="extraclasse-id">
                        <div class="form-group">
                            <label for="extraclasse-nome">Nome da Atividade:</label>
                            <input type="text" id="extraclasse-nome" required>
                        </div>
                        <div class="form-group">
                            <label for="extraclasse-horario">Horário:</label>
                            <input type="text" id="extraclasse-horario" placeholder="Ex: 17:30 às 18:20" required>
                        </div>
                        <div class="form-group">
                            <label>Dias da Semana:</label>
                            <div class="dias-semana-checkboxes">
                                <label><input type="checkbox" name="extraclasse_dia" value="Segunda-feira"> Segunda-feira</label>
                                <label><input type="checkbox" name="extraclasse_dia" value="Terça-feira"> Terça-feira</label>
                                <label><input type="checkbox" name="extraclasse_dia" value="Quarta-feira"> Quarta-feira</label>
                                <label><input type="checkbox" name="extraclasse_dia" value="Quinta-feira"> Quinta-feira</label>
                                <label><input type="checkbox" name="extraclasse_dia" value="Sexta-feira"> Sexta-feira</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="extraclasse-valor-1x">Valor (1 dia/semana - R$):</label>
                            <input type="number" step="0.01" id="extraclasse-valor-1x" required>
                        </div>
                        <div class="form-group">
                            <label for="extraclasse-valor-2x">Valor (2 dias/semana - R$):</label>
                            <input type="number" step="0.01" id="extraclasse-valor-2x" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="submit" form="form-extraclasse" class="btn-novo-cadastro">Salvar Atividade</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', extraclasseModalHTML);

    // Pega as referências do modal de extraclasse e anexa os listeners UMA ÚNICA VEZ
    const modalExtraclasse = document.getElementById('modal-extraclasse');
    const formExtraclasse = document.getElementById('form-extraclasse');
    const extraclasseModalTitle = document.getElementById('extraclasse-modal-title');

    modalExtraclasse.querySelector('.close-button').addEventListener('click', () => modalExtraclasse.classList.remove('visible'));
    modalExtraclasse.addEventListener('click', (e) => { // Fecha ao clicar fora
        if (e.target === modalExtraclasse) {
            modalExtraclasse.classList.remove('visible');
        }
    });

    formExtraclasse.addEventListener('submit', (e) => {
        e.preventDefault();
        salvarExtraclasse();
    });

    // --- FIM DOS MODAIS INJETADOS ---




    // Função para renderizar (desenhar) a tabela de alunos
    function renderAlunosTable(alunos) {
        // Ordena o array de alunos por nome em ordem alfabética
        alunos.sort((a, b) => a.nome.localeCompare(b.nome));

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

        // Adiciona listeners para os botões de Ação da tabela de alunos
        // Adiciona listeners para os botões de Ação da tabela de alunos
        document.querySelectorAll('#alunos-container .btn-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const alunoId = parseInt(e.target.dataset.id, 10);
                showConfirmation('Confirmar Exclusão', 'Tem certeza que deseja excluir este aluno?', () => {
                    mockAlunosDB = mockAlunosDB.filter(aluno => aluno.id !== alunoId);
                    saveAlunosToLocalStorage();
                    renderAlunosTable(mockAlunosDB);
                    showToast('Aluno excluído com sucesso.');
                });
            });
        });

        document.querySelectorAll('#alunos-container .btn-edit').forEach(button => {
            button.addEventListener('click', (e) => {
                const alunoId = parseInt(e.target.dataset.id, 10);
                const alunoToEdit = mockAlunosDB.find(aluno => aluno.id === alunoId);
                if (alunoToEdit) {
                    abrirModalCadastro(alunoToEdit); // Chama a função unificada para abrir e preencher o modal
                }
            });
        });
    }

    // Função para carregar a visualização de cadastro
    function carregarViewCadastro() {
        loadingOverlay.classList.remove('loading-hidden');
        mainContent.innerHTML = `
            <h2>Alunos Cadastrados</h2>
            <div class="cadastro-header">
                <input type="text" id="search-aluno" class="search-input" placeholder="Buscar por nome, turma, responsável...">
                <button id="btn-abrir-novo-cadastro" class="btn-novo-cadastro">Novo Cadastro</button>
            </div>

            <div id="alunos-container"></div>
            <!-- O modal de Novo Cadastro de Aluno e o modal de Edição de Aluno foram movidos para serem injetados uma única vez -->
        `; // Fim do mainContent.innerHTML

        // Agora, busca os alunos do servidor
        google.script.run
            .withSuccessHandler(alunos => {
                mockAlunosDB = alunos; // Atualiza nosso "banco de dados" local
                renderAlunosTable(mockAlunosDB); // Renderiza a tabela com os dados recebidos

                // Anexa os listeners DEPOIS que o HTML foi criado e os dados carregados
                document.getElementById('search-aluno').addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const alunosFiltrados = mockAlunosDB.filter(aluno => 
                        (aluno.nome && aluno.nome.toLowerCase().includes(searchTerm)) ||
                        (aluno.turma && aluno.turma.toLowerCase().includes(searchTerm)) ||
                        (aluno.responsavel && aluno.responsavel.toLowerCase().includes(searchTerm))
                    );
                    renderAlunosTable(alunosFiltrados);
                });

                document.getElementById('btn-abrir-novo-cadastro').addEventListener('click', () => abrirModalCadastro());
                loadingOverlay.classList.add('loading-hidden');
            })
            .withFailureHandler(error => {
                mainContent.innerHTML = `<p style="color: red;">Erro ao carregar alunos: ${error.message}</p>`;
                loadingOverlay.classList.add('loading-hidden');
            })
            .servidorGetAlunos();
    }

    // --- LÓGICA DO MODAL UNIFICADO DE CADASTRO/EDIÇÃO DE ALUNO ---
    const modalCadastro = document.getElementById('modal-cadastro');
    const formNovoAluno = document.getElementById('form-novo-aluno');

    // Função unificada para abrir o modal de cadastro (novo ou edição)
    function abrirModalCadastro(aluno = null) {
        formNovoAluno.reset(); // Limpa o formulário

        // Reseta as abas para a primeira
        const tabButtons = modalCadastro.querySelectorAll('.tab-button');
        const tabContents = modalCadastro.querySelectorAll('.tab-content');
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        tabButtons[0].classList.add('active');
        tabContents[0].classList.add('active');

        // Carrega as opções de serviço dinamicamente
        carregarOpcoesDeServico(modalCadastro);

        if (aluno) {
            // MODO EDIÇÃO
            modalCadastro.querySelector('#novo-aluno-modal-title').textContent = 'Editar Cadastro de Aluno';
            modalCadastro.querySelector('.btn-novo-cadastro').textContent = 'Salvar Alterações';

            // Adiciona um campo oculto com o ID do aluno
            if (!modalCadastro.querySelector('#aluno-id')) {
                formNovoAluno.insertAdjacentHTML('afterbegin', '<input type="hidden" id="aluno-id">');
            }
            modalCadastro.querySelector('#aluno-id').value = aluno.id;

            // Preenche os dados do aluno
            modalCadastro.querySelector('#nome').value = aluno.nome;
            modalCadastro.querySelector('#turma').value = aluno.turma;
            modalCadastro.querySelector('#responsavel').value = aluno.responsavel;
            modalCadastro.querySelector('#email').value = aluno.email;
            
            // Preenche os campos de telefone (DDD e Número)
            const telefoneCompleto = aluno.telefone || '';
            const match = telefoneCompleto.match(/\((\d{2})\)\s*(\d{4,5}-\d{4})/);
            if (match) {
                modalCadastro.querySelector('#telefone_ddd').value = match[1];
                modalCadastro.querySelector('#telefone_numero').value = match[2];
            }

            // Preenche os serviços contratados
            preencherServicosDoAluno(aluno, modalCadastro);

        } else {
            // MODO NOVO CADASTRO
            modalCadastro.querySelector('#novo-aluno-modal-title').textContent = 'Novo Cadastro de Aluno';
            modalCadastro.querySelector('.btn-novo-cadastro').textContent = 'Salvar Cadastro';

            // Remove o campo de ID se existir
            const idField = modalCadastro.querySelector('#aluno-id');
            if (idField) idField.remove();
        }

        modalCadastro.classList.add('visible');
    }

    // Lógica de salvamento (criação ou atualização)
    formNovoAluno.addEventListener('submit', (e) => {
        e.preventDefault();

        const idField = modalCadastro.querySelector('#aluno-id');
        const alunoId = idField ? parseInt(idField.value, 10) : null;

        // Coleta os dados do formulário
        const nome = modalCadastro.querySelector('#nome').value;
        const turma = modalCadastro.querySelector('#turma').value;
        const responsavel = modalCadastro.querySelector('#responsavel').value;
        const email = modalCadastro.querySelector('#email').value;
        
        // Combina DDD e Número para formar o telefone completo
        const ddd = modalCadastro.querySelector('#telefone_ddd').value;
        const numero = modalCadastro.querySelector('#telefone_numero').value;
        const telefone = `(${ddd}) ${numero}`;

        // Coleta os dados dos serviços contratados
        const servicoIntegralSelecionado = modalCadastro.querySelector('input[name="servico_integral"]:checked');
        const diasIntegralSelecionados = Array.from(modalCadastro.querySelectorAll('input[name="integral_dia"]:checked')).map(cb => cb.value);
        const servicosExtraclasseSelecionados = Array.from(modalCadastro.querySelectorAll('input[name="servico_extraclasse"]:checked')).map(cb => parseInt(cb.value, 10));

        const dadosServicos = {
            integral: servicoIntegralSelecionado && servicoIntegralSelecionado.value !== 'nenhum' ? {
                id: servicoIntegralSelecionado.value,
                dias: diasIntegralSelecionados
            } : null,
            extraclasse: servicosExtraclasseSelecionados
        };

        if (alunoId) {
            // ATUALIZA ALUNO EXISTENTE
            const alunoIndex = mockAlunosDB.findIndex(a => a.id === alunoId);
            const alunoAntesDaEdicao = mockAlunosDB[alunoIndex]; // Pega o estado anterior
            const servicosAntigos = alunoAntesDaEdicao.servicosContratados || {};

            if (alunoIndex !== -1) {
                mockAlunosDB[alunoIndex] = {
                    ...mockAlunosDB[alunoIndex],
                    nome, turma, responsavel, email, telefone,
                    servicosContratados: dadosServicos
                };
                showToast('Aluno atualizado com sucesso!');
            }

        } else {
            // CRIA NOVO ALUNO
            // Cria um novo objeto de aluno
            const novoAluno = {
                id: Date.now(), // Gera um ID único baseado no tempo atual
                nome: nome,
                turma: turma,
                responsavel: responsavel,
                email: email,
                telefone: telefone,
                servicosContratados: dadosServicos
            };
            mockAlunosDB.push(novoAluno);
            showToast('Aluno cadastrado com sucesso!');

        }

        // Ações a serem executadas tanto para criar quanto para atualizar
        // saveAlunosToLocalStorage(); // REMOVIDO - Agora chamaremos uma função do servidor
        renderAlunosTable(mockAlunosDB); // Atualiza a tabela na tela principal
        modalCadastro.classList.remove('visible'); // Fecha a janela de cadastro
    });

    // Função para carregar as opções de serviço (Sistema Integral e Extraclasse)
    function carregarOpcoesDeServico(modal) {
        // --- LÓGICA DA ABA SISTEMA INTEGRAL ---
        const integralContainer = modal.querySelector('#integral-options-container');
        integralContainer.innerHTML = servicosDB.integral.map(servico => `
            <label class="service-radio-label">
                <input type="radio" name="servico_integral" value="${servico.id}" data-max-dias="${servico.dias}">
                <span>${servico.titulo}</span>
                <small>R$ ${servico.valor.toFixed(2).replace('.', ',')}</small>
            </label>
        `).join('') + `<label class="service-radio-label"><input type="radio" name="servico_integral" value="nenhum" checked><span>Nenhum</span></label>`;

        const diasSemanaContainer = modal.querySelector('#integral-dias-semana-container');
        const maxDiasLabel = modal.querySelector('#max-dias-label');
        const diasCheckboxes = diasSemanaContainer.querySelectorAll('input[name="integral_dia"]');

        modal.querySelectorAll('input[name="servico_integral"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                // Reseta o estado dos checkboxes de dias da semana
                diasSemanaContainer.classList.add('hidden');
                diasCheckboxes.forEach(cb => {
                    cb.checked = false;
                    cb.disabled = false; // Habilita por padrão
                });

                if (e.target.value === 'nenhum') {
                    return; // Se for 'Nenhum', apenas esconde e sai
                }

                // Pega o número máximo de dias do serviço selecionado
                const maxDias = parseInt(e.target.dataset.maxDias, 10);

                if (maxDias === 5) {
                    // Se for 5 dias, marca todos e desabilita a edição
                    diasCheckboxes.forEach(cb => {
                        cb.checked = true;
                        cb.disabled = true;
                    });
                } else if (maxDias === 3) {
                    // Se for 3 dias, mostra as opções para o usuário escolher
                    maxDiasLabel.textContent = maxDias;
                    diasSemanaContainer.classList.remove('hidden');

                    // Adiciona a lógica para limitar a seleção de dias
                    diasCheckboxes.forEach(checkbox => {
                        checkbox.onchange = () => {
                            const checkedCount = Array.from(diasCheckboxes).filter(i => i.checked).length;
                            if (checkedCount > maxDias) {
                                showToast(`Você pode selecionar no máximo ${maxDias} dias.`);
                                checkbox.checked = false;
                            }
                        };
                    });
                }
            });
        });

        // --- LÓGICA DA ABA EXTRACLASSE ---
        const extraclasseContainer = modal.querySelector('#extraclasse-options-container');
        extraclasseContainer.innerHTML = servicosDB.extraclasse.map(atividade => `
            <div class="service-card-option extraclasse-option">
                <div class="service-card-header">
                    <input type="checkbox" name="servico_extraclasse" value="${atividade.id}" id="extraclasse-${atividade.id}">
                    <label for="extraclasse-${atividade.id}">${atividade.nome}</label>
                </div>
                <div class="service-card-body">
                    <p><strong>Horário:</strong> ${atividade.horario}</p>
                    <p><strong>Dias:</strong> ${atividade.dias_semana.join(', ')}</p>
                    <p><strong>Valores:</strong> R$ ${atividade.valor_1x.toFixed(2).replace('.', ',')} (1x) / R$ ${atividade.valor_2x.toFixed(2).replace('.', ',')} (2x)</p>
                </div>
            </div>
        `).join('');

        // Lógica da busca na aba Extraclasse
        modal.querySelector('#search-extraclasse').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const atividades = modal.querySelectorAll('.extraclasse-option');
            atividades.forEach(atividadeEl => {
                const nomeAtividade = atividadeEl.querySelector('label').textContent.toLowerCase();
                if (nomeAtividade.includes(searchTerm)) {
                    atividadeEl.style.display = 'block';
                } else {
                    atividadeEl.style.display = 'none';
                }
            });
        });
    }

    // Função para preencher os serviços de um aluno existente no modal
    function preencherServicosDoAluno(aluno, modal) {
        const servicos = aluno.servicosContratados || {};

        // Preenche Sistema Integral
        if (servicos.integral && servicos.integral.id) {
            const radioIntegral = modal.querySelector(`input[name="servico_integral"][value="${servicos.integral.id}"]`);
            if (radioIntegral) {
                radioIntegral.checked = true;
                // Dispara o evento 'change' para mostrar os checkboxes de dias
                radioIntegral.dispatchEvent(new Event('change'));

                // Marca os dias da semana selecionados
                if (servicos.integral.dias && servicos.integral.dias.length > 0) {
                    servicos.integral.dias.forEach(dia => {
                        const diaCheckbox = modal.querySelector(`input[name="integral_dia"][value="${dia}"]`);
                        if (diaCheckbox) diaCheckbox.checked = true;
                    });
                }
            }
        } else {
            modal.querySelector('input[name="servico_integral"][value="nenhum"]').checked = true;
        }

        // Preenche Atividades Extraclasse
        if (servicos.extraclasse && servicos.extraclasse.length > 0) {
            servicos.extraclasse.forEach(idAtividade => { // O ID já é um número
                const checkboxExtraclasse = modal.querySelector(`input[name="servico_extraclasse"][value="${idAtividade}"]`);
                if (checkboxExtraclasse) checkboxExtraclasse.checked = true;
            });
        }
    }

    // --- CONFIGURAÇÃO DE EVENTOS GLOBAIS DO MODAL DE CADASTRO (EXECUTADO UMA VEZ) ---

    // Lógica de fechamento
    modalCadastro.querySelector('.close-button').addEventListener('click', () => modalCadastro.classList.remove('visible'));
    // modalCadastro.addEventListener('click', (e) => {
    //     if (e.target === modalCadastro) modalCadastro.classList.remove('visible');
    // });

    // Lógica das abas
    const tabButtons = modalCadastro.querySelectorAll('.tab-button');
    const tabContents = modalCadastro.querySelectorAll('.tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));
            modalCadastro.querySelector(`#tab-${button.dataset.tab}`).classList.add('active');
        });
    });

    // Lógica de formatação de campos
    modalCadastro.querySelector('#telefone_ddd').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        e.target.value = value.substring(0, 2);
    });
    modalCadastro.querySelector('#telefone_numero').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.substring(0, 9); // Limita a 9 dígitos
        if (value.length > 5) {
            value = value.replace(/^(\d{5})(\d{1,4}).*/, '$1-$2');
        } else {
            value = value.replace(/^(\d{4})(\d{1,4}).*/, '$1-$2');
        }
        e.target.value = value;
    });
    modalCadastro.querySelector('#nome').addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase(); });
    modalCadastro.querySelector('#responsavel').addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase(); });
    modalCadastro.querySelector('#email').addEventListener('input', (e) => { e.target.value = e.target.value.toLowerCase(); });

    // --- FUNÇÕES DE GERAÇÃO DE COBRANÇA ---
    function gerarCobrancasFuturas(aluno) {
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth(); // 0-11

        for (let mes = mesAtual; mes <= 11; mes++) {
            const mesAno = `${anoAtual}-${(mes + 1).toString().padStart(2, '0')}`;
            const cobrancaId = `${aluno.id}-${mesAno}`;

            // Se já existe uma cobrança para este aluno neste mês, pula para o próximo
            if (cobrancasDB.some(c => c.id === cobrancaId)) {
                continue;
            }

            const servicosContratados = aluno.servicosContratados || {};
            let valorIntegral = 0;
            let descIntegral = 'N/A';
            let valorExtraclasse = 0;
            let descExtraclasse = 'N/A';

            // Calcula valor do Sistema Integral
            if (servicosContratados.integral && servicosContratados.integral.id) {
                const servicoInfo = servicosDB.integral.find(s => s.id === servicosContratados.integral.id);
                if (servicoInfo) {
                    valorIntegral = servicoInfo.valor;
                    descIntegral = servicoInfo.titulo;
                }
            }

            // Calcula valor das Atividades Extraclasse
            if (servicosContratados.extraclasse && servicosContratados.extraclasse.length > 0) {
                let descricoes = [];
                servicosContratados.extraclasse.forEach(id => {
                    const atividadeInfo = servicosDB.extraclasse.find(a => a.id === id);
                    if (atividadeInfo) {
                        const valor = atividadeInfo.dias_semana.length >= 2 ? atividadeInfo.valor_2x : atividadeInfo.valor_1x;
                        valorExtraclasse += valor;
                        descricoes.push(atividadeInfo.nome);
                    }
                });
                descExtraclasse = descricoes.join('\n');
            }

            const novaCobranca = {
                id: cobrancaId,
                alunoId: aluno.id,
                mesAno: mesAno,
                servicos: {
                    integral: { descricao: descIntegral, valorBruto: valorIntegral },
                    extraclasse: { descricao: descExtraclasse, valorBruto: valorExtraclasse }
                },
                pagamentos: {
                    integral: { status: 'pendente', desconto: 0, dataPagamento: null },
                    extraclasse: { status: 'pendente', desconto: 0, dataPagamento: null }
                }
            };
            cobrancasDB.push(novaCobranca);
        }
        saveCobrancasToLocalStorage();
    }

    // --- LÓGICA DA SEÇÃO DE GERENCIAMENTO DE USUÁRIOS ---

    // Função para renderizar a tabela de usuários
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
        document.querySelectorAll('#users-container .btn-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = parseInt(e.target.dataset.id, 10);
                showConfirmation('Confirmar Exclusão', 'Tem certeza que deseja excluir este usuário?', () => {
                    mockUsersDB = mockUsersDB.filter(user => user.id !== userId);
                    saveUsersToLocalStorage(); // Salva no localStorage
                    renderUsersTable();
                    showToast('Usuário excluído com sucesso.');
                });
            });
        });

        // Adiciona listeners para os botões de editar
        document.querySelectorAll('#users-container .btn-edit').forEach(button => {
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
                                    <label><input type="checkbox" name="new_permission" value="configuracoes"> Configurações</label>
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
                                <label><input type="checkbox" name="permission" value="configuracoes"> Configurações</label>
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

        // Renderiza a tabela de usuários
        renderUsersTable();

        // --- LÓGICA DO MODAL DE EDIÇÃO DE USUÁRIO (ANEXADA UMA ÚNICA VEZ) ---
        const modalEdit = document.getElementById('modal-edit-usuario');

        // Lógica de fechamento
        modalEdit.querySelector('.close-button').addEventListener('click', () => {
            modalEdit.classList.remove('visible');
        });

        // Lógica das Abas
        const tabButtons = modalEdit.querySelectorAll('.tab-button');
        const tabContents = modalEdit.querySelectorAll('.tab-content');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                tabContents.forEach(content => content.classList.remove('active'));
                modalEdit.querySelector(`#tab-${button.dataset.tab}`).classList.add('active');
            });
        });

        // Lógica para o botão único de salvar
        document.getElementById('btn-save-user-changes').addEventListener('click', () => {
            const userId = parseInt(modalEdit.querySelector('#edit-user-id-hidden').value, 10);
            const userToUpdate = mockUsersDB.find(u => u.id === userId);

            if (!userToUpdate) {
                alert('Erro: Usuário não encontrado para atualização.');
                return;
            }

            // Coleta e salva os dados do usuário da aba "Dados do Usuário"
            userToUpdate.name = modalEdit.querySelector('#edit-name').value;
            userToUpdate.username = modalEdit.querySelector('#edit-username-input').value;
            userToUpdate.email = modalEdit.querySelector('#edit-email').value;

            // Coleta e salva as permissões da aba "Permissões"
            const newPermissions = Array.from(modalEdit.querySelectorAll('#tab-edit-user-permissions input[name="permission"]:checked'))
                                        .map(cb => cb.value);
            userToUpdate.permissions = newPermissions;

            // Salva a nova senha, se preenchida
            const newPass = modalEdit.querySelector('#new-pass').value;
            const confirmPass = modalEdit.querySelector('#confirm-pass').value;

            if (newPass || confirmPass) {
                if (newPass !== confirmPass) {
                    showToast('As senhas não coincidem. Tente novamente.');
                    return;
                }
                userToUpdate.password = newPass;
                showToast('Dados e senha alterados com sucesso!');
            } else {
                showToast('Dados alterados com sucesso!');
            }

            saveUsersToLocalStorage();
            modalEdit.classList.remove('visible');
            renderUsersTable();
        });

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


        // Lógica para o modal de Novo Usuário (modal-cadastro)

        // Lógica do Modal de Novo Usuário
        const modal = document.getElementById('modal-usuario');
        const form = document.getElementById('form-novo-usuario');

        document.getElementById('btn-novo-usuario').addEventListener('click', () => {
            form.reset(); // Limpa o formulário antes de exibir
            form.reset();
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
                showToast('As senhas não coincidem. Tente novamente.');
                return;
            }

            const newPermissions = Array.from(document.querySelectorAll('input[name="new_permission"]:checked'))
                                        .map(cb => cb.value);
            const newName = document.getElementById('new-name').value;
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
            showToast('Novo usuário criado com sucesso!');
            form.reset();
        });
    }

    // Função para abrir o modal de edição de usuário
    function abrirModalEdicaoUsuario(user) {
        const modal = document.getElementById('modal-edit-usuario');
        modal.querySelector('#edit-user-id-hidden').value = user.id;

        // Preenche os campos de dados do usuário
        modal.querySelector('#edit-name').value = user.name;
        modal.querySelector('#edit-username-input').value = user.username;
        modal.querySelector('#edit-email').value = user.email;

        // Limpa os campos de senha
        modal.querySelector('#new-pass').value = '';
        modal.querySelector('#confirm-pass').value = '';

        // Marca as checkboxes de permissão conforme o usuário
        const permissionCheckboxes = modal.querySelectorAll('#edit-permissions-container input[name="permission"]');
        permissionCheckboxes.forEach(checkbox => {
            checkbox.checked = user.permissions.includes(checkbox.value);
            // Desabilita a edição de permissões para o admin
            if (user.username === 'admin') {
                checkbox.disabled = true;
            } else {
                checkbox.disabled = false;
            }
        });

        // Reseta para a primeira aba ao abrir
        const tabButtons = modal.querySelectorAll('.tab-button');
        if (tabButtons.length > 0) {
            tabButtons[0].click();
        }
        modal.classList.add('visible');
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
                showToast('A senha atual está incorreta.');
                return;
            }

            // 2. Valida se a nova senha e a confirmação coincidem
            if (newPassword !== confirmPassword) {
                showToast('A nova senha e a confirmação não coincidem.');
                return;
            }

            // 3. Atualiza a senha no "banco de dados"
            const userInDB = mockUsersDB.find(dbUser => dbUser.id === user.id);
            userInDB.password = newPassword;
            showToast('Senha alterada com sucesso!');
            saveUsersToLocalStorage(); // Salva no localStorage
            modal.classList.remove('visible');
        };
    }

    // --- LÓGICA DA SEÇÃO DE CONFIGURAÇÕES ---

    // Simulação de um "banco de dados" para os serviços
    let servicosDB = JSON.parse(localStorage.getItem('servicosDB')) || {
        integral: [
            {
                id: 'integral-3-dias',
                titulo: 'Integral 3 dias',
                dias: 3,
                horario: '07:00 às 13:00',
                atividades: '07:00 às 08:00 Momento Social\n08:00 às 09:45 Acompanhamento escolar\n09:45 às 10:00 Lanche Manhã\n10:00 às 12:00 Oficinas Imersão Inglês\n12:00 às 13:00 Almoço',
                valor: 1200.00
            },
            {
                id: 'integral-5-dias',
                titulo: 'Integral 5 dias',
                dias: 5,
                horario: '07:00 às 13:00',
                atividades: '07:00 às 08:00 Momento Social\n08:00 às 09:45 Acompanhamento escolar\n09:45 às 10:00 Lanche Manhã\n10:00 às 12:00 Oficinas Imersão Inglês\n12:00 às 13:00 Almoço',
                valor: 1800.00 // Valor de exemplo, já que não foi fornecido
            },
            {
                id: 'semi-integral-3-dias',
                titulo: 'Semi-Integral 3 dias',
                dias: 3,
                horario: '10:00 às 13:00',
                atividades: '10:00 às 12:00 Oficinas Imersão Inglês\n12:00 às 13:00 Almoço',
                valor: 700.00
            },
            {
                id: 'semi-integral-5-dias',
                titulo: 'Semi-Integral 5 dias',
                dias: 5,
                horario: '10:00 às 13:00',
                atividades: '10:00 às 12:00 Oficinas Imersão Inglês\n12:00 às 13:00 Almoço',
                valor: 1075.00
            }
        ],
        extraclasse: [
            // Dados de exemplo que serão usados futuramente
            { id: 1, nome: 'Vôlei EFAI', valor_1x: 110.00, valor_2x: 150.00, horario: '17:30 às 18:20', dias_semana: ['Quarta-feira', 'Quinta-feira'] },
            { id: 2, nome: 'Teatro EFAI', valor_1x: 110.00, valor_2x: 150.00, horario: '17:30 às 18:20', dias_semana: ['Terça-feira', 'Quinta-feira'] }
        ]
    };

    function saveServicosToLocalStorage() {
        localStorage.setItem('servicosDB', JSON.stringify(servicosDB));
    }

    // Salva os serviços iniciais se o localStorage estiver vazio
    if (!localStorage.getItem('servicosDB')) {
        saveServicosToLocalStorage();
    }

    function carregarViewConfiguracoes() {
        mainContent.innerHTML = `
            <h2>Configurações de Serviços</h2>
            <div class="settings-section">
                <h3>Sistema Integral</h3>
                <p>Edite os detalhes das modalidades do sistema integral. Os valores devem usar ponto como separador decimal (ex: 1200.50).</p>
                <div id="integral-services-container">
                    <!-- Os cards de serviço serão renderizados aqui -->
                </div>
            </div>

            <div class="settings-section">
                <h3>Atividades Extraclasse</h3>
                <p>Gerencie as atividades esportivas e culturais oferecidas. Os valores devem usar ponto como separador decimal (ex: 110.00).</p>
                <button id="btn-nova-extraclasse" class="btn-novo-cadastro" style="margin-bottom: 20px;">Adicionar Nova Atividade</button>
                <div id="extraclasse-services-container"></div>
            </div>

            <div class="settings-section">
                <h3>Gerenciamento de Dados</h3>
                <p>Crie um backup completo de todos os dados do sistema (alunos, usuários, pagamentos, etc.). O arquivo será salvo no formato JSON.</p>
                <button id="btn-exportar-backup" class="btn-action btn-view">Exportar Backup Completo (.json)</button>
            </div>
        `;

        renderServicosIntegral();
    }

    function renderServicosIntegral() {
        const container = document.getElementById('integral-services-container');
        container.innerHTML = servicosDB.integral.map(servico => `
            <div class="service-card">
                <h4>${servico.titulo}</h4>
                <form id="form-${servico.id}">
                    <div class="form-group">
                        <label for="horario-${servico.id}">Horário:</label>
                        <input type="text" id="horario-${servico.id}" value="${servico.horario}">
                    </div>
                    <div class="form-group">
                        <label for="atividades-${servico.id}">Atividades (uma por linha):</label>
                        <textarea id="atividades-${servico.id}" rows="5">${servico.atividades}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="valor-${servico.id}">Valor (R$):</label>
                        <input type="number" step="0.01" id="valor-${servico.id}" value="${servico.valor.toFixed(2)}">
                    </div>
                    <button type="submit" class="btn-action btn-edit">Salvar</button>
                </form>
            </div>
        `).join('');

        // Adiciona os event listeners para salvar cada formulário
        servicosDB.integral.forEach(servico => {
            const form = document.getElementById(`form-${servico.id}`);
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const servicoToUpdate = servicosDB.integral.find(s => s.id === servico.id);
                servicoToUpdate.horario = document.getElementById(`horario-${servico.id}`).value;
                servicoToUpdate.atividades = document.getElementById(`atividades-${servico.id}`).value;
                servicoToUpdate.valor = parseFloat(document.getElementById(`valor-${servico.id}`).value);

                saveServicosToLocalStorage();
                showToast(`Serviço "${servicoToUpdate.titulo}" atualizado com sucesso!`);
            });
        });

        // Renderiza e adiciona listeners para Extraclasse
        renderServicosExtraclasse();
        document.getElementById('btn-nova-extraclasse').addEventListener('click', () => abrirModalExtraclasse());

        // Adiciona listener para o botão de exportar backup
        document.getElementById('btn-exportar-backup').addEventListener('click', exportarBackupCompleto);
    }

    function renderServicosExtraclasse() {
        const container = document.getElementById('extraclasse-services-container');
        if (!container) return; // Garante que o container exista
        container.innerHTML = servicosDB.extraclasse.map(atividade => `
            <div class="service-card">
                <h4>${atividade.nome}</h4>
                <p><strong>Horário:</strong> ${atividade.horario}</p>
                <p><strong>Dias:</strong> ${atividade.dias_semana.join(', ')}</p>
                <p><strong>Valor (1 dia):</strong> R$ ${atividade.valor_1x.toFixed(2).replace('.', ',')}</p>
                <p><strong>Valor (2 dias):</strong> R$ ${atividade.valor_2x.toFixed(2).replace('.', ',')}</p>
                <div class="card-actions">
                    <button class="btn-action btn-edit" data-id="${atividade.id}">Editar</button>
                    <button class="btn-action btn-delete" data-id="${atividade.id}">Excluir</button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('#extraclasse-services-container .btn-edit').forEach(button => {
            button.addEventListener('click', (e) => {
                const atividadeId = parseInt(e.target.dataset.id, 10);
                const atividadeToEdit = servicosDB.extraclasse.find(a => a.id === atividadeId);
                if (atividadeToEdit) {
                    abrirModalExtraclasse(atividadeToEdit);
                }
            });
        });

        document.querySelectorAll('#extraclasse-services-container .btn-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const atividadeId = parseInt(e.target.dataset.id, 10);
                showConfirmation('Confirmar Exclusão', 'Tem certeza que deseja excluir esta atividade extraclasse?', () => {
                    servicosDB.extraclasse = servicosDB.extraclasse.filter(a => a.id !== atividadeId);
                    saveServicosToLocalStorage();
                    renderServicosExtraclasse();
                    showToast('Atividade excluída com sucesso!');
                });
            });
        });
    }

    function abrirModalExtraclasse(atividade = null) {
        formExtraclasse.reset();
        const diasCheckboxes = formExtraclasse.querySelectorAll('input[name="extraclasse_dia"]');
        diasCheckboxes.forEach(cb => cb.checked = false); // Limpa todos os checkboxes

        if (atividade) {
            extraclasseModalTitle.textContent = 'Editar Atividade Extraclasse';
            document.getElementById('extraclasse-id').value = atividade.id;
            document.getElementById('extraclasse-nome').value = atividade.nome;
            document.getElementById('extraclasse-horario').value = atividade.horario;
            document.getElementById('extraclasse-valor-1x').value = atividade.valor_1x.toFixed(2);
            document.getElementById('extraclasse-valor-2x').value = atividade.valor_2x.toFixed(2);
            atividade.dias_semana.forEach(dia => {
                const checkbox = formExtraclasse.querySelector(`input[name="extraclasse_dia"][value="${dia}"]`);
                if (checkbox) checkbox.checked = true;
            });
        } else {
            extraclasseModalTitle.textContent = 'Nova Atividade Extraclasse';
            document.getElementById('extraclasse-id').value = ''; // Limpa o ID para nova atividade
        }
        modalExtraclasse.classList.add('visible');
    }

    function salvarExtraclasse() {
        const id = document.getElementById('extraclasse-id').value;
        const nome = document.getElementById('extraclasse-nome').value;
        const horario = document.getElementById('extraclasse-horario').value;
        const valor_1x = parseFloat(document.getElementById('extraclasse-valor-1x').value);
        const valor_2x = parseFloat(document.getElementById('extraclasse-valor-2x').value);
        const dias_semana = Array.from(formExtraclasse.querySelectorAll('input[name="extraclasse_dia"]:checked')).map(cb => cb.value);

        if (dias_semana.length === 0) {
            showToast('Por favor, selecione pelo menos um dia da semana.');
            return;
        }

        if (id) {
            // Edição
            const index = servicosDB.extraclasse.findIndex(a => a.id === parseInt(id, 10));
            if (index !== -1) {
                servicosDB.extraclasse[index] = { ...servicosDB.extraclasse[index], nome, horario, valor_1x, valor_2x, dias_semana };
            }
            showToast('Atividade extraclasse atualizada com sucesso!');
        } else {
            // Nova atividade - Gera um ID sequencial seguro
            const newId = servicosDB.extraclasse.length > 0 ? Math.max(...servicosDB.extraclasse.map(a => a.id)) + 1 : 1;
            servicosDB.extraclasse.push({ id: newId, nome, horario, valor_1x, valor_2x, dias_semana });
            showToast('Nova atividade extraclasse adicionada com sucesso!');
        }
        saveServicosToLocalStorage();
        renderServicosExtraclasse();
        modalExtraclasse.classList.remove('visible');
    }

    // --- FUNÇÃO DE BACKUP ---
    function exportarBackupCompleto() {
        // 1. Coleta todos os "bancos de dados" em um único objeto.
        const backupData = {
            usuarios: mockUsersDB,
            alunos: mockAlunosDB,
            pagamentos: pagamentosDB,
            servicos: servicosDB,
            dataExportacao: new Date().toISOString() // Adiciona um carimbo de data/hora
        };

        // 2. Converte o objeto para uma string JSON formatada.
        const jsonString = JSON.stringify(backupData, null, 2);

        // 3. Cria um Blob (Binary Large Object) para o arquivo.
        const blob = new Blob([jsonString], { type: 'application/json' });

        // 4. Cria um link temporário para iniciar o download.
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const dataFormatada = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD
        a.download = `backup_sistema_integral_${dataFormatada}.json`; // Nome do arquivo

        // 5. Simula o clique no link e depois o remove.
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Libera a memória
        showToast('Backup gerado com sucesso!');
    }
});
</script>
