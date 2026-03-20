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
        { label: "Buenos Aires", next: "ba" },
        { label: "Córdoba", next: "cba" },
        { label: "Volver", next: "start" }
      ]
    },

    ba: {
      message: "💳 Alias: bplay.ba\n\n📩 Enviá comprobante por WhatsApp",
      options: [
        { label: "Ir a WhatsApp", next: "whatsapp" },
        { label: "Volver", next: "depositos" }
      ]
    },

    cba: {
      message: "💳 Alias: bplay.cba\n\n📩 Enviá comprobante por WhatsApp",
      options: [
        { label: "Ir a WhatsApp", next: "whatsapp" },
        { label: "Volver", next: "depositos" }
      ]
    },

    retiros: {
      message: "💸 Los retiros se hacen desde la plataforma.\n⏱ Hasta 24hs",
      options: [
        { label: "Ir a WhatsApp", next: "whatsapp" },
        { label: "Volver", next: "start" }
      ]
    },

    promos: {
      message: "🎁 Tenemos promos todos los días 🔥",
      options: [
        { label: "Ver promo", next: "whatsapp" },
        { label: "Volver", next: "start" }
      ]
    },

    problemas: {
      message: "⚠️ Escribinos por WhatsApp y te ayudamos",
      options: [
        { label: "Ir a WhatsApp", next: "whatsapp" },
        { label: "Volver", next: "start" }
      ]
    }
  };

  const messagesDiv = document.getElementById("messages");
  const optionsDiv = document.getElementById("options");

  function addMessage(text, sender) {
    const div = document.createElement("div");
    div.className = "msg " + sender;
    div.innerHTML = text;
    messagesDiv.appendChild(div);
  }

  function renderOptions(options) {
    optionsDiv.innerHTML = "";

    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.innerText = opt.label;

      btn.onclick = () => {
        addMessage(opt.label, "user");

        if (opt.next === "whatsapp") {
          window.open("https://wa.me/5491171913526", "_blank");
          return;
        }

        goToStep(opt.next);
      };

      optionsDiv.appendChild(btn);
    });
  }

  function goToStep(step) {
    const chat = document.getElementById("chat");

// activar modo inicio
if (step === "start") {
    if (step === "start") {
  messagesDiv.innerHTML = "";
}
  chat.classList.add("start-mode");
} else {
  chat.classList.remove("start-mode");
}
    const data = flow[step];

    addMessage(data.message, "bot");
    renderOptions(data.options);
  }

  goToStep("start");

});