const sidebar = document.querySelector(".sidebar-container");
const toggleBtn = document.querySelector(".sidebar__toggle");
const sidebarSpace = document.querySelector(".sidebar-space");

toggleBtn.addEventListener("click", () => {
	sidebar.classList.toggle("mini");
	sidebarSpace.classList.toggle("mini");
});
