document.addEventListener("DOMContentLoaded", () => {

  const flow = {
    start: {
      message: "👋 Hola! Bienvenido a BPLAY SOPORTE 💚\n\nSeleccioná una opción 👇",
      options: [
        { label: "💰 Depósitos", next: "depositos" },
        { label: "💸 Retiros", next: "retiros" },
        { label: "🎁 Promos", next: "promos" },
        { label: "⚠️ Problemas", next: "problemas" }
      ]
    },

    // ======================
    // DEPÓSITOS
    // ======================
    depositos: {
      message: "💰 Seleccioná tu provincia 👇",
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
    // PROVINCIAS (CBU)
    // ======================

    pba: {
      message: `
<div class="cbu-card">
  <div class="cbu-title">💳 PROVINCIA DE BUENOS AIRES</div>
  <div class="cbu-number">0000061100000000014997</div>
  <div class="cbu-data">
    Alias: PBA.BPLAY.TC<br>
    CUIT: 30-71760639-2
  </div>
  <button class="copy-btn" onclick="copiarCBU('0000061100000000014997', this)">
    📋 Copiar CBU
  </button>
  <div class="copy-success"></div>
</div>
      `,
      options: [
        { label: "✅ Ya hice la transferencia", next: "comprobante" },
        { label: "⬅️ Volver", next: "depositos" }
      ]
    },

    cordoba: {
      message: `
<div class="cbu-card">
  <div class="cbu-title">💳 PROVINCIA DE CÓRDOBA</div>
  <div class="cbu-number">0000061100000000025021</div>
  <div class="cbu-data">
    Alias: cordoba.bplay.tc<br>
    CUIT: 30-71766501-1
  </div>
  <button class="copy-btn" onclick="copiarCBU('0000061100000000025021', this)">
    📋 Copiar CBU
  </button>
  <div class="copy-success"></div>
</div>
      `,
      options: [
        { label: "✅ Ya hice la transferencia", next: "comprobante" },
        { label: "⬅️ Volver", next: "depositos" }
      ]
    },

    mendoza: {
      message: `
<div class="cbu-card">
  <div class="cbu-title">💳 PROVINCIA DE MENDOZA</div>
  <div class="cbu-number">0000061100000000049650</div>
  <div class="cbu-data">
    Alias: mendoza.bplay.tc<br>
    CUIT: 30-71806689-8
  </div>
  <button class="copy-btn" onclick="copiarCBU('0000061100000000049650', this)">
    📋 Copiar CBU
  </button>
  <div class="copy-success"></div>
</div>
      `,
      options: [
        { label: "✅ Ya hice la transferencia", next: "comprobante" },
        { label: "⬅️ Volver", next: "depositos" }
      ]
    },

    santafe: {
      message: `
<div class="cbu-card">
  <div class="cbu-title">💳 PROVINCIA DE SANTA FE</div>
  <div class="cbu-number">0000061100000000008387</div>
  <div class="cbu-data">
    Alias: SANTAFE.BPLAY.TC<br>
    CUIT: 30-70975366-1
  </div>
  <button class="copy-btn" onclick="copiarCBU('0000061100000000008387', this)">
    📋 Copiar CBU
  </button>
  <div class="copy-success"></div>
</div>
      `,
      options: [
        { label: "✅ Ya hice la transferencia", next: "comprobante" },
        { label: "⬅️ Volver", next: "depositos" }
      ]
    },

    caba: {
      message: `
<div class="cbu-card">
  <div class="cbu-title">💳 CABA</div>
  <div class="cbu-number">0000061100000000008059</div>
  <div class="cbu-data">
    Alias: CABA.BPLAY.TC<br>
    CUIT: 33-71708423-9
  </div>
  <button class="copy-btn" onclick="copiarCBU('0000061100000000008059', this)">
    📋 Copiar CBU
  </button>
  <div class="copy-success"></div>
</div>
      `,
      options: [
        { label: "✅ Ya hice la transferencia", next: "comprobante" },
        { label: "⬅️ Volver", next: "depositos" }
      ]
    },

    comprobante: {
      message: "📩 Enviá el comprobante por WhatsApp para acreditar.",
      options: [
        { label: "💬 Enviar comprobante", next: "whatsapp" },
        { label: "⬅️ Inicio", next: "start" }
      ]
    },

    // ======================
    // RETIROS
    // ======================
    retiros: {
      message: `
💸 <b>RETIROS</b>

Los retiros se realizan directamente desde la plataforma, <b>no por WhatsApp</b> 👇

📌 <b>Para poder retirar necesitás:</b>
✅ Tener saldo en efectivo disponible  
✅ Validar tu identidad (DNI y datos personales)  
✅ Cargar tu CBU / cuenta bancaria  

Una vez completado eso, podés solicitar el retiro desde tu usuario 👍  

⏳ <i>Los tiempos de acreditación dependen del sistema y del banco.</i>
      `,
      options: [
        { label: "🔐 Necesito ayuda con validación", next: "whatsapp" },
        { label: "⬅️ Volver", next: "start" }
      ]
    },

    // ======================
    // PROMOS
    // ======================
    promos: {
      message: "🎁 Tenemos promos todos los días 🔥",
      options: [
        { label: "💬 Ver promo", next: "whatsapp" },
        { label: "⬅️ Volver", next: "start" }
      ]
    },

    // ======================
    // PROBLEMAS → WHATSAPP
    // ======================
    problemas: {
      message: "⚠️ Para ayudarte mejor, te derivamos con soporte 👇",
      options: [
        { label: "💬 Hablar con soporte", next: "whatsapp" },
        { label: "⬅️ Volver", next: "start" }
      ]
    }
  };

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