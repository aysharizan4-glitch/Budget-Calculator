// ===================== ELEMENTS =====================
const expensesList = document.getElementById("expensesList");
const addExpense = document.getElementById("addExpense");
const totalAmount = document.getElementById("totalAmount");
const saveBudget = document.getElementById("saveBudget");
const viewSaved = document.getElementById("viewSaved");
const clearAll = document.getElementById("clearAll");

let budgets = JSON.parse(localStorage.getItem("budgets")) || [];

// ===================== ADD EXPENSE =====================
addExpense.addEventListener("click", () => {
  const div = document.createElement("div");
  div.classList.add("expense-item");
  div.innerHTML = `
    <input type="text" placeholder="List" class="expenseName" />
    <input type="number" placeholder="Amount" class="expenseAmount" />
  `;
  expensesList.appendChild(div);
});

// ===================== AUTO TOTAL =====================
expensesList.addEventListener("input", () => {
  let total = 0;
  document.querySelectorAll(".expenseAmount").forEach((input) => {
    total += Number(input.value) || 0;
  });
  totalAmount.textContent = total.toFixed(2);
});

// ===================== SAVE BUDGET =====================
saveBudget.addEventListener("click", () => {
  const title = document.getElementById("budgetTitle").value.trim();
  const date = document.getElementById("budgetDate").value;

  if (!title || !date) {
    alert("⚠️ Please enter both title and date!");
    return;
  }

  const expenses = [...document.querySelectorAll(".expenseName")].map(
    (e, i) => ({
      name: e.value || "Unnamed",
      amount:
        Number(document.querySelectorAll(".expenseAmount")[i].value) || 0,
    })
  );

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  budgets.push({ title, date, expenses, total });
  localStorage.setItem("budgets", JSON.stringify(budgets));

  alert("✅ Budget saved successfully!");

  // Reset fields
  document.getElementById("budgetTitle").value = "";
  document.getElementById("budgetDate").value = "";
  expensesList.innerHTML = `
    <div class="expense-item">
      <input type="text" placeholder="List" class="expenseName" />
      <input type="number" placeholder="Amount" class="expenseAmount" />
    </div>
  `;
  totalAmount.textContent = "0.00";
});

// ===================== VIEW SAVED =====================
viewSaved.addEventListener("click", () => {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed; inset: 0; background: #fff; z-index: 999;
    padding: 20px; overflow-y: auto;
  `;

  const backBtn = document.createElement("button");
  backBtn.textContent = "⬅ Back";
  backBtn.onclick = () => overlay.remove();
  overlay.appendChild(backBtn);

  if (budgets.length === 0) {
    const msg = document.createElement("p");
    msg.textContent = "No saved budgets yet!";
    msg.style.textAlign = "center";
    msg.style.marginTop = "20px";
    overlay.appendChild(msg);
  }

  budgets.forEach((b, i) => {
    const box = document.createElement("div");
    box.style.cssText = `
      border:1px solid #ccc; border-radius:8px; margin:10px 0; padding:10px;
      background:#f9f9f9;
    `;
    box.innerHTML = `
      <h3 style="text-align:center;color:#b45309;">${b.title}</h3>
      <p style="text-align:center;">${b.date}</p>
      <div style="display:flex;justify-content:space-between;">
        <ol>${b.expenses.map((e) => `<li>${e.name}</li>`).join("")}</ol>
        <ul style="list-style:none;text-align:right;">
          ${b.expenses.map((e) => `<li>${e.amount.toFixed(2)}</li>`).join("")}
        </ul>
      </div>
      <p style="text-align:right;font-weight:bold;">Total: ${b.total.toFixed(2)}</p>
      <div style="text-align:center;margin-top:10px;">
        <button class="view" data-i="${i}">View</button>
        <button class="del" data-i="${i}">Delete</button>
      </div>
    `;
    overlay.appendChild(box);
  });

  document.body.appendChild(overlay);

  // View specific budget
  overlay.querySelectorAll(".view").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      overlay.remove();
      openBudgetDetails(e.target.dataset.i);
    });
  });

  // Delete specific budget
  overlay.querySelectorAll(".del").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const i = e.target.dataset.i;
      budgets.splice(i, 1);
      localStorage.setItem("budgets", JSON.stringify(budgets));
      overlay.remove();
      viewSaved.click();
    });
  });
});

// ===================== OPEN BUDGET DETAILS =====================
function openBudgetDetails(i) {
  const b = budgets[i];
  const detail = document.createElement("div");
  detail.style.cssText = `
    position: fixed; inset: 0; background: white; z-index: 1000;
    padding: 20px; overflow-y: auto;
  `;

  detail.innerHTML = `
    <div style="margin:25px 15px;padding:20px;border:1px solid #ccc;border-radius:12px;">
      <h2 style="text-align:center;color:#92400e;">${b.title}</h2>
      <p style="text-align:center;">${b.date}</p>
      <div style="display:flex;justify-content:space-between;">
        <ol>${b.expenses.map((e) => `<li>${e.name}</li>`).join("")}</ol>
        <ul style="list-style:none;text-align:right;">
          ${b.expenses.map((e) => `<li>${e.amount.toFixed(2)}</li>`).join("")}
        </ul>
      </div>
      <p style="text-align:right;font-size:1.4em;font-weight:bold;">Total: ${b.total.toFixed(2)}</p>
    </div>
    <div style="text-align:center;margin-top:20px;">
      <button id="closeDetail">Close</button>
      <button id="shareText">Share</button>
    </div>
  `;

  document.body.appendChild(detail);

  document.getElementById("closeDetail").onclick = () => detail.remove();

  // ===================== SHARE ON WHATSAPP =====================
  document.getElementById("shareText").onclick = () => {
    let text = `📘 Budget: ${b.title}\n📅 Date: ${b.date}\n\n`;
    b.expenses.forEach(e => {
      text += `${e.name}: ${e.amount.toFixed(2)}\n`;
    });
    text += `\n💰 Total: ${b.total.toFixed(2)}\n— Shared via AYSHLYN Budget Calculator`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;

    // Open WhatsApp in a new tab or app
    window.open(whatsappUrl, "_blank");
  };
}

// ===================== CLEAR ALL =====================
clearAll.addEventListener("click", () => {
  document.getElementById("budgetTitle").value = "";
  document.getElementById("budgetDate").value = "";
  expensesList.innerHTML = `
    <div class="expense-item">
      <input type="text" placeholder="List" class="expenseName" />
      <input type="number" placeholder="Amount" class="expenseAmount" />
    </div>
  `;
  totalAmount.textContent = "0.00";
});
