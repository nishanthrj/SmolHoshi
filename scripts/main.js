const sidebar = document.querySelector(".sidebar-container");
const toggleBtn = document.querySelector(".sidebar__toggle");


toggleBtn.addEventListener("click", () => {
	sidebar.classList.toggle("mini");
});

