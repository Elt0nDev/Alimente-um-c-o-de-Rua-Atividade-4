/* script.js - interatividade básica: menu, ano, gráfico, formulário e temas (client-side) */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Lógica de Alternância de Tema (Claro/Escuro/Alto Contraste)
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  const htmlEl = document.documentElement; // <html> element
  const themes = ['light', 'dark', 'high-contrast'];
  let currentThemeIndex = 0;

  function updateTheme() {
    const currentTheme = themes[currentThemeIndex];
    htmlEl.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme); // Persiste a preferência

    let label = '';
    switch(currentTheme) {
      case 'light':
        label = 'Claro ☀️';
        break;
      case 'dark':
        label = 'Escuro 🌙';
        break;
      case 'high-contrast':
        label = 'Alto Contraste ⚫';
        break;
    }
    
    // Atualiza o texto e o aria-label do botão (A11y)
    if (themeToggleBtn) {
        themeToggleBtn.textContent = `Tema: ${label}`;
        themeToggleBtn.setAttribute('aria-label', `Alternar tema, atual: ${label}`);
    }
    
    // Redesenha o gráfico para refletir as cores do tema
    if (typeof drawChart === 'function') {
        drawChart(); 
    }
  }

  // Inicialização do Tema
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme && themes.includes(savedTheme)) {
    currentThemeIndex = themes.indexOf(savedTheme);
  } else {
    // Tenta detectar a preferência do sistema, se nenhuma for salva
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        currentThemeIndex = themes.indexOf('dark');
    }
  }
  updateTheme(); // Aplica o tema inicial

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      updateTheme();
    });
  }


  // 2. Menu Toggle (funciona para todos os 3 cabeçalhos)
  const menuButtons = document.querySelectorAll('.menu-button');
  menuButtons.forEach(btn => {
    const navId = btn.getAttribute('aria-controls');
    const nav = document.getElementById(navId);

    if (!nav) return;

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const newExpanded = !expanded;
      
      btn.setAttribute('aria-expanded', String(newExpanded));
      nav.classList.toggle('show', newExpanded); 
      
      // A11y: Se expandido, move o foco para o primeiro item
      if (newExpanded) {
        window.requestAnimationFrame(() => {
            nav.querySelector('a')?.focus();
        });
      }
    });
    
    // A11y: Fechar menu com ESC
    document.addEventListener('keydown', (e) => {
        // Verifica se o foco está dentro da navegação ou no botão do menu
        const isFocusInNav = nav.contains(document.activeElement);
        const isMenuButton = document.activeElement === btn;
        
        if (e.key === 'Escape' && (nav.classList.contains('show') || isFocusInNav || isMenuButton)) {
            btn.setAttribute('aria-expanded', 'false');
            nav.classList.remove('show');
            btn.focus(); // Retorna o foco para o botão de menu
        }
    });
  });

  // 3. Atualizar os anos do rodapé dinamicamente
  const ano = new Date().getFullYear();
  document.querySelectorAll('#ano, #ano-2, #ano-3').forEach(el => { el.textContent = ano; });

  // 4. Formulário (validação front-end e feedback)
  const form = document.getElementById('signupForm');
  if (form) {
    const msg = document.getElementById('formMessage');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      
      // Validações
      const nome = form.nome.value.trim();
      const telefone = form.telefone.value.trim();
      const email = form.email.value.trim();

      if (!nome || !telefone || !email) {
        msg.textContent = 'Por favor, preencha os campos obrigatórios (*).';
        msg.style.display = 'block';
        
        // Cores de alerta
        msg.style.background = '#FFD54F'; 
        msg.style.color = '#222';
        
        msg.focus(); // A11y: Mover o foco para a mensagem de erro (tabindex="-1" no HTML)
        return;
      }

      // Simulação de envio
      setTimeout(() => {
        msg.textContent = 'Obrigado pelo seu interesse! Seu cadastro foi enviado com sucesso. Entraremos em contato em breve.';
        msg.style.display = 'block';
        
        // Cores de sucesso
        msg.style.background = '#4CAF50';
        msg.style.color = 'white';
        
        form.reset();
        msg.focus(); // A11y: Mover o foco para a mensagem de sucesso
      }, 500);
    });
  }

  // 5. Gráfico de Doações (Canvas)
  const chartEl = document.getElementById('donationChart');

  if (chartEl) {
    // Dados de exemplo
    const donationData = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      values: [1500, 2200, 3100, 1800, 2900, 3500],
      colors: ['#2E7D32', '#1B5E20', '#4CAF50', '#81C784', '#66BB6A', '#388E3C']
    };

    // Função global para ser chamada pelo updateTheme
    window.drawChart = function drawChart() {
      const ctx = chartEl.getContext('2d');
      const w = chartEl.width;
      const h = chartEl.height;
      
      const padding = 20;
      const chartW = w - 2 * padding;
      const chartH = h - 2 * padding - 20;
      const maxVal = Math.max(...donationData.values);
      const barCount = donationData.values.length;
      const barWidth = chartW / (barCount * 1.5);
      const gap = barWidth / 2;
      
      const currentTheme = htmlEl.getAttribute('data-theme');
      
      // Determina a cor de fundo e label do canvas com base no tema
      let bgColor = '#ffffff';
      let labelColor = '#777';
      if (currentTheme === 'dark') {
          bgColor = '#222222';
          labelColor = '#CCCCCC';
      } else if (currentTheme === 'high-contrast') {
          bgColor = '#FFFFFF';
          labelColor = '#000000';
      }
      
      // Limpar a área do gráfico
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
      
      // Barras
      donationData.values.forEach((value, i) => {
        const barH = (value / maxVal) * chartH;
        const x = padding + i * (barWidth + gap);
        const y = padding + chartH - barH;
        
        ctx.fillStyle = donationData.colors[i];
        roundRect(ctx, x, y, barWidth, barH, 5, true, false);
      });
      
      // Labels
      ctx.fillStyle = labelColor;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      donationData.labels.forEach((label, i) => {
        const x = padding + i * (barWidth + gap);
        ctx.fillText(donationData.labels[i], x + barWidth/2, padding + chartH + 16);
      });

      // Total
      const total = donationData.values.reduce((a,b) => a+b, 0);
      const totalEl = document.getElementById('total-raised');
      if (totalEl) totalEl.textContent = 'R$ ' + numberFormat(total);

      // Função auxiliar para desenhar retângulos arredondados
      function roundRect(ctx, x, y, w, h, r, fill, stroke) {
        if (typeof r === 'undefined') r = 5;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
      }
    }

    // Helpers
    function numberFormat(n){
      return n.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'}).replace('R$','R$ ');
    }
  }
});
