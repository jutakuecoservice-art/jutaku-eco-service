(() => {
  "use strict";
  const config = window.SITE_CONFIG || {};
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }));
  }

  document.querySelector("#year").textContent = new Date().getFullYear();

  const companyFields = {
    address: config.address,
    phone: config.phone,
    hours: config.hours,
    licenses: config.licenses
  };
  document.querySelectorAll("[data-company]").forEach(el => {
    const key = el.dataset.company;
    const value = companyFields[key];
    if (value && value.trim()) el.textContent = value;
  });

  const phoneLinks = document.querySelectorAll('[data-contact="phone"]');
  phoneLinks.forEach(link => {
    const phone = (config.phone || "").replace(/[^\d+]/g, "");
    if (phone) {
      link.href = `tel:${phone}`;
      link.querySelector('[data-label="phone"]').textContent = config.phone;
    } else {
      link.href = "#contact-form";
      link.querySelector('[data-label="phone"]').textContent = "電話番号の設定が必要です";
    }
  });

  const lineLinks = document.querySelectorAll('[data-contact="line"]');
  lineLinks.forEach(link => {
    const url = config.lineUrl || "";
    if (url.startsWith("https://")) {
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.querySelector('[data-label="line"]').textContent = "LINE公式アカウントを開く";
    } else {
      link.href = "#contact-form";
      link.querySelector('[data-label="line"]').textContent = "LINE公式アカウントの設定が必要です";
    }
  });

  const form = document.querySelector("#inquiry-form");
  const status = document.querySelector("#form-status");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.className = "form-status";
    if (!form.reportValidity()) return;

    const email = (config.contactEmail || "").trim();
    if (!email || email.includes("example.com")) {
      status.classList.add("error");
      status.textContent = "送信先メールアドレスが未設定です。config.js の contactEmail を設定してください。";
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "送信しています…";
    status.textContent = "送信処理中です。";

    try {
      const data = new FormData(form);
      data.append("_subject", "【住宅エコサービス】ホームページからのお問い合わせ");
      data.append("_template", "table");
      data.append("_captcha", "true");
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: data
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === "false" || result.success === false) {
        throw new Error("送信サービスからエラーが返されました。");
      }
      form.reset();
      status.classList.add("success");
      status.textContent = "送信処理が完了しました。初回利用時は、送信先メールに届く認証メールを確認してください。";
    } catch (error) {
      status.classList.add("error");
      status.textContent = "送信できませんでした。時間をおいて再度お試しいただくか、電話・LINEでご連絡ください。";
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  });
})();
