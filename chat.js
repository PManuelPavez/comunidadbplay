document.addEventListener("DOMContentLoaded", () => {

  const flow = {

    // ======================
    // INICIO
    // ======================
    start: {
      message: "👋 Hola! Bienvenido a BPLAY SOPORTE 💚\n\nSeleccioná una opción 👇",
      options: [
        { label: "💰 Depositar dinero", next: "depositos" },
        { label: "💸 Retiros", next: "retiros" },
        { label: "🎁 Promociones", next: "promos" },
        { label: "⚠️ Problemas", next: "problemas" }
      ]
    },

    // ======================
    // DEPÓSITOS
    // ======================
    depositos: {
      message: `
💰 <b>DEPÓSITOS</b>

Seleccioná tu provincia 👇
      `,
      options: [
        { label: "Buenos Aires", next: "pba" },
        { label: "Córdoba", next: "cordoba" },
        { label: "Mendoza", next: "mendoza" },
        { label: "Santa Fe", next: "santafe" },
        { label: "CABA", next: "caba" },
        { label: "⬅️ Volver", next: "start" }
      ]
    },

    // ======================
    // PROVINCIAS (OPTIMIZADAS)
    // ======================

    pba: provinciaTemplate(
      "PROVINCIA DE BUENOS AIRES",
      "0000061100000000014997",
      "PBA.BPLAY.TC",
      "30-71760639-2"
    ),

    cordoba: provinciaTemplate(
      "PROVINCIA DE CÓRDOBA",
      "0000061100000000025021",
      "cordoba.bplay.tc",
      "30-71766501-1"
    ),

    mendoza: provinciaTemplate(
      "PROVINCIA DE MENDOZA",
      "0000061100000000049650",
      "mendoza.bplay.tc",
      "30-71806689-8"
    ),

    santafe: provinciaTemplate(
      "PROVINCIA DE SANTA FE",
      "0000061100000000008387",
      "SANTAFE.BPLAY.TC",
      "30-70975366-1"
    ),

    caba: provinciaTemplate(
      "CABA",
      "0000061100000000008059",
      "CABA.BPLAY.TC",
      "33-71708423-9"
    ),

    // ======================
    // POST DEPÓSITO (CLAVE)
    // ======================
    post_deposito: {
      message: `
⏳ <b>Perfecto 👍</b>

Si transferiste correctamente, la acreditación es <b>automática</b>.

⚡ Suele acreditarse en minutos  
🏦 Puede variar según el banco  

❗ <b>No hace falta enviar comprobante</b>

👉 Solo escribinos si pasan más de 15 minutos
      `,
      options: [
        { label: "💬 Necesito ayuda", next: "whatsapp" },
        { label: "⬅️ Inicio", next: "start" }
      ]
    },

    // ======================
    // RETIROS
    // ======================
    retiros: {
      message: `
💸 <b>RETIROS</b>

Los retiros se hacen desde la plataforma (no por WhatsApp) 👇

📌 <b>Necesitás:</b>
✅ Saldo en efectivo  
✅ Cuenta validada  
✅ CBU cargado  

⏱ <b>Pueden tardar hasta 24hs</b>

👉 No es inmediato  
👉 No depende de soporte
      `,
      options: [
        { label: "🔐 Ayuda con validación", next: "whatsapp" },
        { label: "⬅️ Volver", next: "start" }
      ]
    },

    // ======================
    // PROMOS
    // ======================
    promos: {
      message: `
🎁 <b>PROMOCIONES</b>

Tenemos promos todos los días 🔥

👉 Te activamos la mejor disponible ahora mismo
      `,
      options: [
        { label: "💬 Ver promo", next: "whatsapp" },
        { label: "⬅️ Volver", next: "start" }
      ]
    },

    // ======================
    // PROBLEMAS (FILTRADO)
    // ======================
    problemas: {
      message: `
⚠️ Antes de escribirnos:

• Revisá usuario y contraseña  
• Intentá nuevamente  

Si sigue el problema 👇
      `,
      options: [
        { label: "💬 Hablar con soporte", next: "whatsapp" },
        { label: "⬅️ Volver", next: "start" }
      ]
    }

  };

  // ======================
  // TEMPLATE PROVINCIA (REUTILIZABLE)
  // ======================
  function provinciaTemplate(nombre, cbu, alias, cuit) {
    return {
      message: `
⚡ <b>La acreditación es automática</b>

No necesitás avisar ni enviar comprobante.

<div class="cbu-card">
  <div class="cbu-title">💳 ${nombre}</div>

  <div class="cbu-number">${cbu}</div>

  <div class="cbu-data">
    Alias: ${alias}<br>
    CUIT: ${cuit}
  </div>

  <button class="copy-btn" onclick="copiarCBU('${cbu}', this)">
    📋 Copiar CBU
  </button>

  <div class="copy-success"></div>
</div>
      `,
      options: [
        { label: "✅ Ya hice la transferencia", next: "post_deposito" },
        { label: "⬅️ Volver", next: "depositos" }
      ]
    };
  }

  // ======================
  // UI
  // ======================
  const messagesDiv = document.getElementById("messages");
  const optionsDiv = document.getElementById("options");

  function copiarCBU(valor, btn) {
    navigator.clipboard.writeText(valor);

    const feedback = btn.nextElementSibling;
    feedback.innerText = "✔ Copiado";

    setTimeout(() => {
      feedback.innerText = "";
    }, 1500);
  }

  function addMessage(text, sender) {
    const div = document.createElement("div");
    div.className = "msg " + sender;
    div.innerHTML = text;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function renderOptions(options) {
    optionsDiv.innerHTML = "";

    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.innerText = opt.label;

      btn.onclick = () => {
        addMessage(opt.label, "user");

        if (opt.next === "whatsapp") {
          window.open("https://wa.me/5491171845577", "_blank");
          return;
        }

        goToStep(opt.next);
      };

      optionsDiv.appendChild(btn);
    });
  }

  function goToStep(step) {
    const chat = document.getElementById("chat");

    if (step === "start") {
      messagesDiv.innerHTML = "";
      chat.classList.add("start-mode");
    } else {
      chat.classList.remove("start-mode");
    }

    const data = flow[step];

    setTimeout(() => {
      addMessage(data.message, "bot");
      renderOptions(data.options);
    }, 300);
  }

  goToStep("start");

});