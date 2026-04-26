const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

// Fetch and render tasks on load
async function loadTasks() {
  const res = await fetch("/api/tasks");
  const tasks = await res.json();
  taskList.innerHTML = "";
  tasks.forEach(renderTask);
}

// Render a single task to the DOM
function renderTask(task) {
  const li = document.createElement("li");
  li.className = `list-group-item d-flex justify-content-between align-items-center task-item ${task.completed ? "task-completed" : ""}`;
  li.dataset.id = task.id;

  li.innerHTML = `
        <div class="d-flex align-items-center gap-3">
            <input class="form-check-input mt-0 toggle-btn" type="checkbox" ${task.completed ? "checked" : ""}>
            <span class="task-text">${task.title}</span>
            ${task.completed ? '<span class="badge bg-success rounded-pill ms-2">Completed</span>' : ""}
        </div>
        <button class="btn btn-sm btn-danger delete-btn">Delete</button>
    `;

  // Event Listeners for buttons
  li.querySelector(".toggle-btn").addEventListener("change", () =>
    toggleTask(task.id, li),
  );
  li.querySelector(".delete-btn").addEventListener("click", () =>
    deleteTask(task.id, li),
  );

  taskList.appendChild(li);
}

// Add new task
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  if (res.ok) {
    const newTask = await res.json();
    renderTask(newTask);
    taskInput.value = "";
  }
});

// Toggle task status
async function toggleTask(id, element) {
  const res = await fetch(`/api/tasks/${id}/toggle`, { method: "PUT" });
  if (res.ok) {
    const data = await res.json();
    if (data.completed) {
      element.classList.add("task-completed");
      element.querySelector(".form-check-input").checked = true;
      if (!element.querySelector(".badge")) {
        element
          .querySelector(".d-flex")
          .insertAdjacentHTML(
            "beforeend",
            '<span class="badge bg-success rounded-pill ms-2">Completed</span>',
          );
      }
    } else {
      element.classList.remove("task-completed");
      element.querySelector(".form-check-input").checked = false;
      const badge = element.querySelector(".badge");
      if (badge) badge.remove();
    }
  }
}

// Delete task
async function deleteTask(id, element) {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (res.ok) {
    element.remove();
  }
}

// Initialize
loadTasks();
