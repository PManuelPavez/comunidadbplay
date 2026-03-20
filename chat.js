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
    // PROVINCIAS
    // ======================

    pba: {
      message: `
💳 <b>PROVINCIA DE BUENOS AIRES</b>

CBU: <span class="cbu">0000061100000000014997</span>
Alias: PBA.BPLAY.TC

Razón social: BOLDT SA-SG DIGITAL UK HOLDINGS LIMITED UT
CUIT: 30-71760639-2
      `,
      options: [
        { label: "📋 Copiar CBU", next: "copy_pba" },
        { label: "📩 Ya transferí", next: "comprobante" },
        { label: "⬅️ Volver", next: "depositos" }
      ]
    },

    cordoba: {
      message: `
💳 <b>PROVINCIA DE CÓRDOBA</b>

CBU: <span class="cbu">0000061100000000025021</span>
Alias: cordoba.bplay.tc

Razón social: BOLDT SA-SG DIGITAL - UT
CUIT: 30-71766501-1
      `,
      options: [
        { label: "📋 Copiar CBU", next: "copy_cba" },
        { label: "📩 Ya transferí", next: "comprobante" },
        { label: "⬅️ Volver", next: "depositos" }
      ]
    },

    mendoza: {
      message: `
💳 <b>MENDOZA</b>

CBU: <span class="cbu">0000061100000000049650</span>
Alias: mendoza.bplay.tc

Razón social: Boldt SA-Fuente Mayor SA UT
CUIT: 30-71806689-8
      `,
      options: [
        { label: "📋 Copiar CBU", next: "copy_mza" },
        { label: "📩 Ya transferí", next: "comprobante" },
        { label: "⬅️ Volver", next: "depositos" }
      ]
    },

    santafe: {
      message: `
💳 <b>SANTA FE</b>

CBU: <span class="cbu">0000061100000000008387</span>
Alias: SANTAFE.BPLAY.TC

Razón social: CASINO PUERTO SANTA FE SA
CUIT: 30-70975366-1
      `,
      options: [
        { label: "📋 Copiar CBU", next: "copy_sf" },
        { label: "📩 Ya transferí", next: "comprobante" },
        { label: "⬅️ Volver", next: "depositos" }
      ]
    },

    caba: {
      message: `
💳 <b>CABA</b>

CBU: <span class="cbu">0000061100000000008059</span>
Alias: CABA.BPLAY.TC

Razón social: BOLDT SA-B-GAMING SA
CUIT: 33-71708423-9
      `,
      options: [
        { label: "📋 Copiar CBU", next: "copy_caba" },
        { label: "📩 Ya transferí", next: "comprobante" },
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

    retiros: {
      message: "💸 Los retiros se hacen desde la plataforma.\n⏱ Hasta 24hs",
      options: [
        { label: "💬 Ir a WhatsApp", next: "whatsapp" },
        { label: "⬅️ Volver", next: "start" }
      ]
    },

    promos: {
      message: "🎁 Tenemos promos todos los días 🔥",
      options: [
        { label: "💬 Ver promo", next: "whatsapp" },
        { label: "⬅️ Volver", next: "start" }
      ]
    },

    problemas: {
      message: "⚠️ Escribinos por WhatsApp y te ayudamos",
      options: [
        { label: "💬 Ir a WhatsApp", next: "whatsapp" },
        { label: "⬅️ Volver", next: "start" }
      ]
    }
  };

  const messagesDiv = document.getElementById("messages");
  const optionsDiv = document.getElementById("options");

  function copiarCBU(valor) {
    navigator.clipboard.writeText(valor);
    alert("CBU copiado ✔️");
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

        // 🔥 COPIAR CBU
        if (opt.next.startsWith("copy_")) {
          const mapa = {
            copy_pba: "0000061100000000014997",
            copy_cba: "0000061100000000025021",
            copy_mza: "0000061100000000049650",
            copy_sf: "0000061100000000008387",
            copy_caba: "0000061100000000008059"
          };

          copiarCBU(mapa[opt.next]);
          return;
        }

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