const toggles = document.querySelectorAll("#theme-toggle");

for (const toggle of toggles) {
  toggle.addEventListener("click", function () {
    const isDark = document.documentElement.classList.contains("dark");

    if (isDark) {
      window.localStorage.setItem("theme", "");
      document.documentElement.classList.remove("dark");
    } else {
      window.localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    }
  });
}
