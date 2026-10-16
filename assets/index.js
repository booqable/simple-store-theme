let previewBarTimeout;
let tryCount = 0;

const handleOnSelectChange = (event) => {
  const value = event.target.value;
  const url = new URL(window.location.href);

  if (url.searchParams.get("sort_by")) {
    url.searchParams.set("sort_by", value);
    window.location.href = url.href;
    return;
  }

  window.location.href += `?sort_by=${value}`;
};

const initSortingSelect = () => {
  const select = document.querySelector("#sorting");
  if (!select) return;

  select.addEventListener("change", handleOnSelectChange);
};

const initSearch = () => {
  const searchForm = document.querySelector("#search");
  const url = new URL(window.location.href);
  const input = searchForm.querySelector("input");

  if (!!url.searchParams.get("q")) {
    input.value = url.searchParams.get("q");
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const value = input.value;
    const route = search.getAttribute("action");

    url.href = url.origin + route;
    url.searchParams.set("q", value);

    window.location.href = url.href;
  };

  searchForm.addEventListener("submit", handleSearchSubmit);
};

const initSearchToggle = () => {
  const container = document.querySelector(".header-search");
  if (!container) return;

  const header = container.closest(".header");
  const wrapper = container.querySelector(".header-search__wrapper");
  const triggers = container.querySelectorAll(".header-search__trigger");
  const [openTrigger] = triggers;
  const input = container.querySelector(".header-search__input");
  const overlayQuery = window.matchMedia("(max-width: 991px)");

  // Header elements hidden underneath the open search overlay
  const covered = [];
  for (let el = wrapper; el !== header; el = el.parentElement) {
    covered.push(...[...el.parentElement.children].filter((sibling) => sibling !== el));
  }

  const isOpen = () => container.classList.contains("header-search--open");

  const setOpen = (open, { restoreFocus = true } = {}) => {
    container.classList.toggle("header-search--open", open);
    triggers.forEach((trigger) => trigger.setAttribute("aria-expanded", open));
    covered.forEach((el) => (el.inert = open));

    if (open) {
      input.focus();
    } else if (restoreFocus) {
      openTrigger.focus();
    }
  };

  triggers.forEach((trigger) =>
    trigger.addEventListener("click", () => setOpen(!isOpen()))
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      setOpen(false, { restoreFocus: container.contains(document.activeElement) });
    }
  });

  // The overlay only exists below the desktop breakpoint
  overlayQuery.addEventListener("change", (e) => {
    if (!e.matches && isOpen()) setOpen(false, { restoreFocus: false });
  });
};

const handleSetMobileMenuHeight = () => {
  const menu = document.querySelector(".header-floating-menu__wrapper");

  if (window.innerWidth > 762 || !menu) return;

  let totalHeight = 0;

  const previewBar = document.querySelector(".preview-bar__container");

  if (!previewBar && tryCount < 5) {
    tryCount += 1;

    if (previewBarTimeout) clearTimeout(previewBarTimeout);

    previewBarTimeout = setTimeout(() => {
      handleSetMobileMenuHeight();
    }, 100);

    return;
  }

  const header = document.querySelector(".header__wrapper");

  totalHeight =
    header.getBoundingClientRect().height +
    (previewBar?.getBoundingClientRect().height ?? 0);

  menu.style.height = `calc(100vh - ${totalHeight}px)`;
};

const handleScroll = () => {
  const previewBar = document.querySelector(".preview-bar__container");

  const header = document.querySelector("header");
  const contentContainer = document.querySelector("#main");

  let headerHeight = header.getBoundingClientRect().height;

  if (window.scrollY > 0) {
    if (previewBar) {
      headerHeight += previewBar.getBoundingClientRect().height;
    }

    header.classList.add("fixed");
    contentContainer.style.marginTop = `${headerHeight}px`;
  }

  if (window.scrollY === 0) {
    header.classList.remove("fixed");
    contentContainer.style.marginTop = 0;
  }
};

const handleOpenCollectionMenu = () => {
  const sidebar = document.querySelector(".sidebar-navigation--mobile");

  if (!sidebar) return;

  sidebar.classList.toggle("sidebar-navigation--open");
}

document.addEventListener("DOMContentLoaded", () => {
  // Initializers
  initSearch();
  initSearchToggle();
  initSortingSelect();
  handleSetMobileMenuHeight();
});

window.addEventListener("resize", () => {
  handleSetMobileMenuHeight();
});

window.addEventListener("scroll", handleScroll);
