const isDark =
  window.localStorage.theme === "dark" ||
  (!("theme" in window.localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches);

if (isDark) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}
