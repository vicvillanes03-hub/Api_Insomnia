document.addEventListener("DOMContentLoaded", () => {
    const API = 'http://localhost:3000/jogos';
    let jogos = [];

    document.body.innerHTML = `
        <div class="container">
            ${document.querySelector('h2').outerHTML}
         
            <div class="stats-container">
                <div class="stat-card"><span class="stat-number" id="s-tot">0</span><span class="stat-label">Cadastrados</span></div>
                <div class="stat-card"><span class="stat-number blue" id="s-jog">0</span><span class="stat-label">Jogando</span></div>
                <div class="stat-card"><span class="stat-number green" id="s-fin">0</span><span class="stat-label">Finalizados</span></div>
                <div class="stat-card"><span class="stat-number purple" id="s-con">0</span><span class="stat-label">Concluídos</span></div>
                <div class="stat-card"><span class="stat-number orange" id="s-que">0</span><span class="stat-label">Quero Jogar</span></div>
                <div class="stat-card"><span class="stat-number red" id="s-aba">0</span><span class="stat-label">Abandonados</span></div>
            </div>

            <div class="form-card">
                <h3>Adicionar Novo Jogo</h3>
                <form id="form-adicionar">
                    <div class="form-grid">
                        <input type="text" id="add-titulo" placeholder="Título do Jogo" required>
                        <input type="text" id="add-genero" placeholder="Gênero" required>
                        <input type="text" id="add-plataforma" placeholder="Plataforma" required>
                        <input type="number" id="add-nota" placeholder="Nota (0-10)" min="0" max="10" required>
                        <select id="add-status" required>
                            <option value="" disabled selected>Selecione o Status</option>
                            <option value="Jogando">Jogando</option>
                            <option value="Finalizado">Finalizado</option>
                            <option value="Concluído">Concluído</option>
                            <option value="Quero jogar">Quero jogar</option>
                            <option value="Abandonado">Abandonado</option>
                        </select>
                        <button type="submit" class="btn-adicionar">Cadastrar Jogo</button>
                    </div>
                </form>
            </div>

            <div class="filter-bar">
                <input type="text" id="filtro-titulo" placeholder="Pesquisar jogo...">
                <select id="filtro-status">
                    <option value="">Todos os status</option>
                    <option value="Jogando">Jogando</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Quero jogar">Quero jogar</option>
                    <option value="Abandonado">Abandonado</option>
                </select>
            </div>

            <ul id="lista"></ul>

            <div id="modal-editar" class="modal" style="display: none;">
                <div class="modal-content">
                    <h3>Editar Jogo</h3>
                    <form id="form-editar">
                        <input type="hidden" id="edit-id">
                        <label>Título:</label><input type="text" id="edit-titulo" required>
                        <label>Gênero:</label><input type="text" id="edit-genero" required>
                        <label>Plataforma:</label><input type="text" id="edit-plataforma" required>
                        <label>Nota:</label><input type="number" id="edit-nota" min="0" max="10" required>
                        <label>Status:</label>
                        <select id="edit-status">
                            <option value="Jogando">Jogando</option>
                            <option value="Finalizado">Finalizado</option>
                            <option value="Concluído">Concluído</option>
                            <option value="Quero jogar">Quero jogar</option>
                            <option value="Abandonado">Abandonado</option>
                        </select>
                        <div class="modal-buttons">
                            <button type="submit" class="btn-salvar">Salvar</button>
                            <button type="button" id="btn-cancelar" class="btn-cancelar">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    const ul = document.getElementById("lista");

    const carregar = () => fetch(API).then(res => res.json()).then(data => {
        jogos = data;
        atualizarDashboard();
        filtrar();
    });

    const atualizarDashboard = () => {
        document.getElementById('s-tot').textContent = jogos.length;
        document.getElementById('s-jog').textContent = jogos.filter(g => g.status.toLowerCase() === 'jogando').length;
        document.getElementById('s-fin').textContent = jogos.filter(g => g.status.toLowerCase() === 'finalizado').length;
        document.getElementById('s-con').textContent = jogos.filter(g => g.status.toLowerCase().includes('concluído')).length;
        document.getElementById('s-que').textContent = jogos.filter(g => g.status.toLowerCase().includes('quero')).length;
        document.getElementById('s-aba').textContent = jogos.filter(g => g.status.toLowerCase().includes('abandonado')).length;
    };

    const filtrar = () => {
        const t = document.getElementById('filtro-titulo').value.toLowerCase();
        const s = document.getElementById('filtro-status').value.toLowerCase();
        
        const listaFiltrada = jogos.filter(g => 
            g.titulo.toLowerCase().includes(t) && (s === "" || g.status.toLowerCase().includes(s))
        );

        ul.innerHTML = listaFiltrada.length ? "" : "<p style='color:#64748b;text-align:center;padding:20px;'>Nenhum jogo encontrado.</p>";

        listaFiltrada.forEach(g => {
            const li = document.createElement("li");
            li.className = "game-card";
            const st = g.status.toLowerCase();
            
            let cls = 'blue';
            if (st === 'finalizado') cls = 'green';
            else if (st.includes('concluído')) cls = 'purple';
            else if (st.includes('quero')) cls = 'orange';
            else if (st.includes('abandonado')) cls = 'red';

            li.innerHTML = `
                <div class="game-info">
                    <strong>${g.titulo}</strong>
                    <span class="game-details">${g.genero} • ${g.plataforma}</span>
                    <span class="game-score">Nota ${g.nota}</span>
                </div>
                <div class="game-actions">
                    <span class="status-btn ${cls}">${g.status}</span>
                    <button class="btn-edit" onclick="abrirEdicao('${g.id}')">EDITAR</button>
                    <button class="btn-delete" onclick="excluir('${g.id}')">EXCLUIR</button>
                </div>
            `;
            ul.appendChild(li);
        });
    };

    document.getElementById('form-adicionar').onsubmit = (e) => {
        e.preventDefault();
        const novoJogo = {
            titulo: document.getElementById('add-titulo').value,
            genero: document.getElementById('add-genero').value,
            plataforma: document.getElementById('add-plataforma').value,
            nota: Number(document.getElementById('add-nota').value),
            status: document.getElementById('add-status').value
        };

        fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoJogo)
        }).then(() => {
            document.getElementById('form-adicionar').reset();
            carregar();
        });
    };

    document.getElementById('filtro-titulo').addEventListener('input', filtrar);
    document.getElementById('filtro-status').addEventListener('change', filtrar);

    window.excluir = (id) => {
        if (confirm("Excluir este jogo?")) fetch(`${API}/${id}`, { method: 'DELETE' }).then(carregar);
    };

    window.abrirEdicao = (id) => {
        const g = jogos.find(x => x.id == id);
        if (!g) return;
        ['id', 'titulo', 'genero', 'plataforma', 'nota', 'status'].forEach(k => {
            document.getElementById(`edit-${k}`).value = g[k === 'id' ? 'id' : k];
        });
        document.getElementById('modal-editar').style.display = 'flex';
    };

    document.getElementById('btn-cancelar').onclick = () => document.getElementById('modal-editar').style.display = 'none';

    document.getElementById('form-editar').onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        const dados = {
            titulo: document.getElementById('edit-titulo').value,
            genero: document.getElementById('edit-genero').value,
            plataforma: document.getElementById('edit-plataforma').value,
            nota: Number(document.getElementById('edit-nota').value),
            status: document.getElementById('edit-status').value
        };

        fetch(`${API}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        }).then(() => {
            document.getElementById('modal-editar').style.display = 'none';
            carregar();
        });
    };

    carregar();
});