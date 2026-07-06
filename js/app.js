/**
 * Chương trình điều khiển giao diện chính (SOP Portal App Controller)
 */

class SopApp {
  constructor() {
    this.processes = [];
    this.categories = [];
    this.announcements = [];
    this.accounts = [];
    this.currentView = "announcements"; // "processes" hoặc "announcements"
    this.selectedCategory = "all";
    this.selectedTag = null;
    this.selectedAnnStatus = "all"; // "all", "upcoming", "active", "stopped"
    this.searchQuery = "";
    this.activeProcessId = null;
    this.activeAnnouncementId = null;
    this.isAutoUpdatingStatus = false;
    this.selectedLoginAccountId = null; // ID tài khoản đang chọn ở màn hình đăng nhập

    this.initDOMRefs();
    this.initEventListeners();
    this.initTheme();
    
    // Đăng ký nhận cập nhật dữ liệu từ Storage Manager
    window.storageManager.subscribe((processes, categories, announcements, accounts) => {
      this.processes = processes || [];
      this.categories = categories || [];
      this.announcements = announcements || [];
      this.accounts = accounts || [];
      
      // Tự động kiểm tra và cập nhật trạng thái thông báo theo ngày bắt đầu/kết thúc
      const hasChanged = this.autoUpdateAnnouncementsStatusByDate();
      if (!hasChanged) {
        this.renderAll();
      }

      // Đảm bảo cập nhật lại màn hình Đăng nhập và Bảng quản lý User khi nhận data đồng bộ
      this.checkLoginSession();
      this.renderLoginOverlay();
      this.renderAccountsTable();
    });
  }

  // --- THIẾT LẬP THAM CHIẾU DOM ---
  initDOMRefs() {
    // Thanh bên
    this.menuProcesses = document.getElementById("menu-processes");
    this.menuAnnouncements = document.getElementById("menu-announcements");
    this.countAllSops = document.getElementById("count-all-sops");
    this.countAllAnns = document.getElementById("count-all-anns");
    
    this.processesFiltersGroup = document.getElementById("processes-filters-group");
    this.announcementsFiltersGroup = document.getElementById("announcements-filters-group");

    // Bộ lọc thông báo
    this.countAnnAll = document.getElementById("count-ann-all");
    this.countAnnUpcoming = document.getElementById("count-ann-upcoming");
    this.countAnnActive = document.getElementById("count-ann-active");
    this.countAnnStopped = document.getElementById("count-ann-stopped");

    this.categoriesFilterList = document.getElementById("categories-filter-list");
    this.tagsFilterCloud = document.getElementById("tags-filter-cloud");
    this.syncIndicator = document.getElementById("sync-indicator");
    this.syncDescText = document.getElementById("sync-desc-text");
    this.btnOpenSync = document.getElementById("btn-open-sync");

    // Header & Bộ lọc chính
    this.searchInput = document.getElementById("search-input");
    this.btnThemeToggle = document.getElementById("btn-theme-toggle");
    this.themeIcon = document.getElementById("theme-icon");
    this.btnExportBackup = document.getElementById("btn-export-backup");
    this.btnTriggerImport = document.getElementById("btn-trigger-import");
    this.fileImportInput = document.getElementById("file-import-input");
    this.btnCreateProcess = document.getElementById("btn-create-process");

    // Khu vực hiển thị quy trình
    this.dashboardSection = document.getElementById("dashboard-section");
    this.processGrid = document.getElementById("process-grid");
    this.emptyState = document.getElementById("empty-state");
    this.gridHeaderTitle = document.getElementById("grid-header-title");
    this.resultsCountText = document.getElementById("results-count-text");

    // Các thống kê
    this.statTotalSops = document.getElementById("stat-total-sops");
    this.statHighSops = document.getElementById("stat-high-sops");
    this.statTotalTags = document.getElementById("stat-total-tags");
    this.statTotalCategories = document.getElementById("stat-total-categories");

    // Panel xem chi tiết
    this.detailsPanel = document.getElementById("details-panel");
    this.detailsTitle = document.getElementById("details-title");
    this.detailsCategory = document.getElementById("details-category");
    this.detailsPriority = document.getElementById("details-priority");
    this.detailsDescription = document.getElementById("details-description");
    this.detailsStepsList = document.getElementById("details-steps-list");
    this.stepsProgressText = document.getElementById("steps-progress-text");
    this.detailsAuthor = document.getElementById("details-author");
    this.detailsCreated = document.getElementById("details-created");
    this.detailsUpdated = document.getElementById("details-updated");
    this.btnCloseDetails = document.getElementById("btn-close-details");
    this.btnPrintProcess = document.getElementById("btn-print-process");
    this.btnEditProcess = document.getElementById("btn-edit-process");
    this.btnDeleteProcess = document.getElementById("btn-delete-process");
    this.detailsStepsGroup = document.getElementById("details-steps-group");

    // Modal Editor
    this.editorModal = document.getElementById("editor-modal");
    this.btnCloseEditorModal = document.getElementById("btn-close-editor-modal");
    this.processForm = document.getElementById("process-form");
    this.formProcessId = document.getElementById("form-process-id");
    this.formTitle = document.getElementById("form-title");
    this.formCategory = document.getElementById("form-category");
    this.formPriority = document.getElementById("form-priority");
    this.formTags = document.getElementById("form-tags");
    this.formAuthor = document.getElementById("form-author");
    this.formDescription = document.getElementById("form-description");
    this.formStepsList = document.getElementById("form-steps-list");
    this.btnFormAddStep = document.getElementById("btn-form-add-step");
    this.btnCancelEditor = document.getElementById("btn-cancel-editor");

    // Modal Categories
    this.categoriesModal = document.getElementById("categories-modal");
    this.btnManageCategories = document.getElementById("btn-manage-categories");
    this.btnCloseCatModal = document.getElementById("btn-close-cat-modal");
    this.btnCloseCatManagerFooter = document.getElementById("btn-close-cat-manager-footer");
    this.catManagerList = document.getElementById("cat-manager-list");
    this.formNewCatName = document.getElementById("form-new-cat-name");
    this.btnAddCatSubmit = document.getElementById("btn-add-cat-submit");

    // Modal Firebase Sync
    this.syncModal = document.getElementById("sync-modal");
    this.btnCloseSyncModal = document.getElementById("btn-close-sync-modal");
    this.btnCloseSyncFooter = document.getElementById("btn-close-sync-footer");
    this.btnConnectSync = document.getElementById("btn-connect-sync");
    this.btnDisconnectSync = document.getElementById("btn-disconnect-sync");
    this.formFirebaseConfig = document.getElementById("form-firebase-config");

    // Modal Announcement Editor
    this.announcementModal = document.getElementById("announcement-modal");
    this.announcementForm = document.getElementById("announcement-form");
    this.formAnnId = document.getElementById("form-ann-id");
    this.annFormTitle = document.getElementById("ann-form-title");
    this.annFormCategory = document.getElementById("ann-form-category");
    this.annFormStatus = document.getElementById("ann-form-status");
    this.annFormStartDate = document.getElementById("ann-form-start-date");
    this.annFormEndDate = document.getElementById("ann-form-end-date");
    this.annFormAuthor = document.getElementById("ann-form-author");
    this.annFormContent = document.getElementById("ann-form-content");
    this.btnCloseAnnModal = document.getElementById("btn-close-ann-modal");
    this.btnCancelAnnEditor = document.getElementById("btn-cancel-ann-editor");

    // Toast
    this.toastNotif = document.getElementById("toast-notif");

    // Quy trình đã ngừng / hết hạn
    this.formStatus = document.getElementById("form-status");
    this.stoppedProcessesContainer = document.getElementById("stopped-processes-container");
    this.stoppedProcessGrid = document.getElementById("stopped-process-grid");
    this.stoppedSopsCount = document.getElementById("stopped-sops-count");
    this.btnToggleStoppedSops = document.getElementById("btn-toggle-stopped-sops");
    this.stoppedChevron = document.getElementById("stopped-chevron");

    // Lightbox Modal
    this.lightboxModal = document.getElementById("lightbox-modal");
    this.btnCloseLightbox = document.getElementById("btn-close-lightbox");
    this.lightboxImg = document.getElementById("lightbox-img");
    this.btnCopyLightboxImg = document.getElementById("btn-copy-lightbox-img");
    this.btnDownloadLightboxImg = document.getElementById("btn-download-lightbox-img");

    // Profile Widget & Modal
    this.userProfileWidget = document.getElementById("user-profile-widget");
    this.userProfileName = document.getElementById("user-profile-name");
    this.userProfileRole = document.getElementById("user-profile-role");
    this.userAvatarLbl = document.getElementById("user-avatar-lbl");

    this.profileModal = document.getElementById("profile-modal");
    this.btnCloseProfileModal = document.getElementById("btn-close-profile-modal");
    this.profileForm = document.getElementById("profile-form");
    this.profileNameInput = document.getElementById("profile-name-input");
    this.profileRoleSelect = document.getElementById("profile-role-select");
    this.profilePasscodeInput = document.getElementById("profile-passcode-input");

    // Login Overlay selectors
    this.loginOverlay = document.getElementById("login-overlay");
    this.loginAccountList = document.getElementById("login-account-list");
    this.loginPasscodePanel = document.getElementById("login-passcode-panel");
    this.selectedLoginName = document.getElementById("selected-login-name");
    this.loginPasscodeInput = document.getElementById("login-passcode-input");
    this.btnCancelPasscode = document.getElementById("btn-cancel-passcode");
    this.btnSubmitPasscode = document.getElementById("btn-submit-passcode");

    // Account Management Modal selectors
    this.btnManageAccountsTrigger = document.getElementById("btn-manage-accounts-trigger");
    this.btnLogout = document.getElementById("btn-logout");
    this.accountsModal = document.getElementById("accounts-modal");
    this.btnCloseAccountsModal = document.getElementById("btn-close-accounts-modal");
    this.btnShowAddAccountForm = document.getElementById("btn-show-add-account-form");
    this.accountEditorForm = document.getElementById("account-editor-form");
    this.editorAccountId = document.getElementById("editor-account-id");
    this.editorAccountName = document.getElementById("editor-account-name");
    this.editorAccountRole = document.getElementById("editor-account-role");
    this.editorAccountPasscode = document.getElementById("editor-account-passcode");
    this.editorAccountStatus = document.getElementById("editor-account-status");
    this.btnCancelAccountEditor = document.getElementById("btn-cancel-account-editor");
    this.accountsTableBody = document.getElementById("accounts-table-body");

    // Đính kèm thanh công cụ định dạng chữ cho các textarea tĩnh
    this.attachFormattingToolbar(this.formDescription);
    this.attachFormattingToolbar(this.annFormContent);
  }

  // --- KHỞI TẠO EVENT LISTENERS ---
  initEventListeners() {
    // Đổi theme
    this.btnThemeToggle.addEventListener("click", () => this.toggleTheme());

    // Tìm kiếm
    this.searchInput.addEventListener("input", (e) => {
      this.searchQuery = e.target.value;
      this.renderGrid();
    });

    // Chuyển đổi Phân hệ
    if (this.menuProcesses) {
      this.menuProcesses.addEventListener("click", () => this.switchView("processes"));
    }
    if (this.menuAnnouncements) {
      this.menuAnnouncements.addEventListener("click", () => this.switchView("announcements"));
    }

    // Lọc trạng thái thông báo
    const annFilters = ["all", "upcoming", "active", "stopped"];
    annFilters.forEach(status => {
      const el = document.getElementById(`ann-filter-${status}`);
      if (el) {
        el.addEventListener("click", () => this.setAnnouncementFilter(status));
      }
    });

    // Lọc "Tất cả quy trình" (vẫn giữ để tránh lỗi hoặc hỗ trợ dự phòng)
    const btnAllSops = document.getElementById("btn-filter-all");
    if (btnAllSops) {
      btnAllSops.addEventListener("click", (e) => {
        this.setActiveCategory("all");
      });
    }

    // Nút Thêm mới (Quy trình hoặc Thông báo tùy theo phân hệ đang mở)
    this.btnCreateProcess.addEventListener("click", () => {
      if (this.currentView === "processes") {
        this.openEditorModal();
      } else {
        this.openAnnEditorModal();
      }
    });
    this.btnCloseEditorModal.addEventListener("click", () => this.closeEditorModal());
    this.btnCancelEditor.addEventListener("click", () => this.closeEditorModal());
    
    // Đăng ký bước mới trong form biên tập quy trình
    this.btnFormAddStep.addEventListener("click", () => this.addFormStepInput(""));
    
    // Submit form lưu quy trình
    this.processForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveProcessSubmit();
    });

    // Toggle quy trình đã ngừng
    if (this.btnToggleStoppedSops) {
      this.btnToggleStoppedSops.addEventListener("click", () => this.toggleStoppedSopsSection());
    }

    // Sự kiện trong Form Thông báo
    if (this.announcementForm) {
      this.btnCloseAnnModal.addEventListener("click", () => this.closeAnnEditorModal());
      this.btnCancelAnnEditor.addEventListener("click", () => this.closeAnnEditorModal());
      this.annFormStartDate.addEventListener("change", () => this.autoCalculateStatus());
      this.annFormEndDate.addEventListener("change", () => this.autoCalculateStatus());
      this.announcementForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveAnnouncementSubmit();
      });
    }

    // Quản lý danh mục
    this.btnManageCategories.addEventListener("click", () => this.openCategoriesModal());
    this.btnCloseCatModal.addEventListener("click", () => this.closeCategoriesModal());
    this.btnCloseCatManagerFooter.addEventListener("click", () => this.closeCategoriesModal());
    this.btnAddCatSubmit.addEventListener("click", () => this.addNewCategory());

    // Quản lý Firebase Sync
    this.btnOpenSync.addEventListener("click", () => this.openSyncModal());
    this.btnCloseSyncModal.addEventListener("click", () => this.closeSyncModal());
    this.btnCloseSyncFooter.addEventListener("click", () => this.closeSyncModal());
    this.btnConnectSync.addEventListener("click", () => this.saveFirebaseConfigSubmit());
    this.btnDisconnectSync.addEventListener("click", () => this.disconnectFirebaseSync());

    // Panel Xem chi tiết (sử dụng chung cho cả Quy trình và Thông báo)
    this.btnCloseDetails.addEventListener("click", () => this.closeDetailsPanel());
    this.btnEditProcess.addEventListener("click", () => {
      if (this.activeProcessId) {
        this.editActiveProcess();
      } else if (this.activeAnnouncementId) {
        this.editActiveAnnouncement();
      }
    });
    this.btnDeleteProcess.addEventListener("click", () => {
      if (this.activeProcessId) {
        this.deleteActiveProcess();
      } else if (this.activeAnnouncementId) {
        this.deleteActiveAnnouncement();
      }
    });
    this.btnPrintProcess.addEventListener("click", () => window.print());

    // Phóng to ảnh (Lightbox)
    if (this.lightboxModal) {
      this.btnCloseLightbox.addEventListener("click", () => this.closeLightbox());
      this.lightboxModal.addEventListener("click", (e) => {
        if (e.target === this.lightboxModal) this.closeLightbox();
      });
      if (this.btnCopyLightboxImg) {
        this.btnCopyLightboxImg.addEventListener("click", () => this.copyLightboxImageToClipboard());
      }
    }

    // Sao lưu (Export)
    this.btnExportBackup.addEventListener("click", () => this.handleExportBackup());

    // Nhập dữ liệu (Import)
    this.btnTriggerImport.addEventListener("click", () => this.fileImportInput.click());
    this.fileImportInput.addEventListener("change", (e) => this.handleImportBackup(e));

    // Tài khoản và Phân quyền (Profile & Accounts)
    if (this.userProfileWidget) {
      this.userProfileWidget.addEventListener("click", () => this.openProfileModal(false));
      this.btnCloseProfileModal.addEventListener("click", () => this.closeProfileModal());
      this.profileForm.addEventListener("submit", (e) => this.saveProfileSubmit(e));
      this.profileModal.addEventListener("click", (e) => {
        if (e.target === this.profileModal && this.btnCloseProfileModal.style.display !== "none") {
          this.closeProfileModal();
        }
      });
      
      if (this.btnLogout) {
        this.btnLogout.addEventListener("click", () => this.logoutUser());
      }
      
      if (this.btnManageAccountsTrigger) {
        this.btnManageAccountsTrigger.addEventListener("click", () => {
          this.closeProfileModal();
          this.openAccountsModal();
        });
      }
    }

    // Modal quản lý danh sách tài khoản
    if (this.accountsModal) {
      this.btnCloseAccountsModal.addEventListener("click", () => this.closeAccountsModal());
      this.btnShowAddAccountForm.addEventListener("click", () => this.showAccountEditorForm());
      this.btnCancelAccountEditor.addEventListener("click", () => this.hideAccountEditorForm());
      this.accountEditorForm.addEventListener("submit", (e) => this.saveAccountSubmit(e));
      this.accountsModal.addEventListener("click", (e) => {
        if (e.target === this.accountsModal) this.closeAccountsModal();
      });
    }

    // Các sự kiện màn hình Đăng nhập (Login Overlay)
    if (this.btnCancelPasscode) {
      this.btnCancelPasscode.addEventListener("click", () => this.cancelPasscodePanel());
      this.btnSubmitPasscode.addEventListener("click", () => this.submitPasscode());
      this.loginPasscodeInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.submitPasscode();
      });
    }
  }

  // --- QUẢN LÝ GIAO DIỆN SÁNG/TỐI (THEME) ---
  initTheme() {
    const savedTheme = localStorage.getItem("sop_theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      document.body.classList.add("dark-theme");
      this.themeIcon.setAttribute("data-lucide", "moon");
    } else {
      document.body.classList.remove("dark-theme");
      this.themeIcon.setAttribute("data-lucide", "sun");
    }
    lucide.createIcons();
  }

  toggleTheme() {
    const isDark = document.body.classList.toggle("dark-theme");
    localStorage.setItem("sop_theme", isDark ? "dark" : "light");
    this.themeIcon.setAttribute("data-lucide", isDark ? "moon" : "sun");
    lucide.createIcons();
  }

  // --- HIỂN THỊ TOAST THÔNG BÁO ---
  showToast(message) {
    this.toastNotif.textContent = message;
    this.toastNotif.classList.add("active");
    setTimeout(() => {
      this.toastNotif.classList.remove("active");
    }, 3000);
  }

  // --- BẬT/TẮT XEM PHÓNG TO ẢNH (LIGHTBOX) ---
  openLightbox(src) {
    if (!this.lightboxModal || !this.lightboxImg) return;
    this.lightboxImg.src = src;
    
    // Cập nhật liên kết tải về trực tiếp bằng dữ liệu Base64
    if (this.btnDownloadLightboxImg) {
      this.btnDownloadLightboxImg.href = src;
    }
    
    this.lightboxModal.classList.add("active");
  }

  closeLightbox() {
    if (!this.lightboxModal || !this.lightboxImg) return;
    this.lightboxModal.classList.remove("active");
    setTimeout(() => {
      this.lightboxImg.src = "";
      if (this.btnDownloadLightboxImg) {
        this.btnDownloadLightboxImg.href = "#";
      }
    }, 300);
  }

  // --- SAO CHÉP ẢNH TỪ LIGHTBOX VÀO CLIPBOARD ---
  async copyLightboxImageToClipboard() {
    if (!this.lightboxImg || !this.lightboxImg.src) return;
    try {
      const response = await fetch(this.lightboxImg.src);
      const blob = await response.blob();
      
      if (typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        this.showToast("Đã sao chép hình ảnh vào clipboard thành công.");
      } else {
        throw new Error("Trình duyệt của bạn không hỗ trợ sao chép tệp nhị phân trực tiếp.");
      }
    } catch (err) {
      console.error("Lỗi khi sao chép ảnh:", err);
      alert("Không thể sao chép hình ảnh: " + err.message);
    }
  }

  // --- NÉN HÌNH ẢNH CLIENT-SIDE (CANVAS) ---
  compressImage(file, maxWidth = 800, maxHeight = 600) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7)); // Nén JPEG chất lượng 70%
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  }

  // --- CHUYỂN ĐỔI DANH MỤC LỌC ---
  setActiveCategory(category) {
    this.selectedCategory = category;
    this.selectedTag = null; // Reset bộ lọc tag khi đổi danh mục
    
    // Cập nhật trạng thái active sidebar
    const buttons = this.categoriesFilterList.querySelectorAll(".filter-item-btn");
    buttons.forEach(btn => {
      if (btn.dataset.category === category) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    const btnAll = document.getElementById("btn-filter-all");
    if (category === "all") {
      btnAll.classList.add("active");
    } else {
      btnAll.classList.remove("active");
    }

    this.renderGrid();
  }

  // --- CHUYỂN ĐỔI THẺ LỌC ---
  toggleTagFilter(tag) {
    if (this.selectedTag === tag) {
      this.selectedTag = null; // Unselect
    } else {
      this.selectedTag = tag;
      this.selectedCategory = "all"; // Reset category filter
      
      // Hủy active các danh mục bên trên
      document.getElementById("btn-filter-all").classList.remove("active");
      const buttons = this.categoriesFilterList.querySelectorAll(".filter-item-btn");
      buttons.forEach(btn => btn.classList.remove("active"));
    }
    this.renderGrid();
  }

  // --- CHUẨN HÓA TIẾNG VIỆT ĐỂ TÌM KIẾM ---
  removeVietnameseAccents(str) {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  }

  // --- RENDER DỮ LIỆU ĐỘNG ---
  renderAll() {
    this.renderSidebar();
    this.renderStats();
    this.renderGrid();
    this.renderActiveProcessDetail();
    this.updateSyncIndicator();
    lucide.createIcons();
  }

  // Cập nhật tình trạng đồng bộ trong sidebar
  updateSyncIndicator() {
    const isFb = window.storageManager.isFirebaseActive;
    if (isFb) {
      this.syncIndicator.className = "sync-dot online";
      this.syncDescText.innerHTML = `<span style="color:var(--priority-low); font-weight:600">Đang đồng bộ</span> trực tiếp với máy chủ Google Cloud.`;
      this.btnOpenSync.innerHTML = `<i data-lucide="settings" style="width:14px; height:14px;"></i> Quản lý Online`;
    } else {
      this.syncIndicator.className = "sync-dot";
      this.syncDescText.textContent = "Đang chạy offline trên máy này.";
      this.btnOpenSync.innerHTML = `<i data-lucide="cloud-lightning" style="width:14px; height:14px;"></i> Thiết lập Online`;
    }
  }

  // --- CHUYỂN PHÂN HỆ XEM (SOP VS THÔNG BÁO) ---
  switchView(view) {
    this.currentView = view;
    
    // Reset bộ lọc
    this.selectedCategory = "all";
    this.selectedTag = null;
    this.selectedAnnStatus = "all";
    this.searchQuery = "";
    if (this.searchInput) this.searchInput.value = "";
    
    // Đổi trạng thái active sidebar
    if (view === "processes") {
      this.menuProcesses.classList.add("active");
      this.menuAnnouncements.classList.remove("active");
      this.processesFiltersGroup.style.display = "block";
      this.announcementsFiltersGroup.style.display = "none";
      this.btnCreateProcess.innerHTML = `<i data-lucide="plus" style="width:18px; height:18px;"></i> Thêm quy trình`;
    } else {
      this.menuProcesses.classList.remove("active");
      this.menuAnnouncements.classList.add("active");
      this.processesFiltersGroup.style.display = "none";
      this.announcementsFiltersGroup.style.display = "block";
      this.btnCreateProcess.innerHTML = `<i data-lucide="plus" style="width:18px; height:18px;"></i> Thêm thông báo`;
    }

    this.closeDetailsPanel();
    this.renderAll();
  }

  setAnnouncementFilter(status) {
    this.selectedAnnStatus = status;
    
    const statuses = ["all", "upcoming", "active", "stopped"];
    statuses.forEach(s => {
      const el = document.getElementById(`ann-filter-${s}`);
      if (el) {
        if (s === status) el.classList.add("active");
        else el.classList.remove("active");
      }
    });

    this.renderGrid();
  }

  // Ghim/Bỏ ghim Quy trình
  async togglePinProcess(id) {
    const proc = this.processes.find(p => p.id === id);
    if (!proc) return;

    proc.pinned = !proc.pinned;
    await window.storageManager.saveProcess(proc);
    this.showToast(proc.pinned ? `Đã ghim quy trình "${proc.title}" lên đầu.` : `Đã bỏ ghim quy trình "${proc.title}".`);
  }

  // Render sidebar (danh mục & tags)
  renderSidebar() {
    // 1. Cập nhật số lượng đếm chính
    if (this.countAllSops) this.countAllSops.textContent = this.processes.length;
    if (this.countAllAnns) this.countAllAnns.textContent = this.announcements.length;
    
    // Cập nhật số lượng đếm trạng thái thông báo
    if (this.countAnnAll) this.countAnnAll.textContent = this.announcements.length;
    if (this.countAnnUpcoming) this.countAnnUpcoming.textContent = this.announcements.filter(a => a.status === "upcoming").length;
    if (this.countAnnActive) this.countAnnActive.textContent = this.announcements.filter(a => a.status === "active").length;
    if (this.countAnnStopped) this.countAnnStopped.textContent = this.announcements.filter(a => a.status === "stopped").length;

    // 2. Render danh mục (chỉ hiển thị nếu là phân hệ quy trình)
    if (this.currentView === "processes") {
      this.categoriesFilterList.innerHTML = "";
      this.categories.forEach(cat => {
        const count = this.processes.filter(p => p.category === cat).length;
        
        const li = document.createElement("li");
        const isActive = this.selectedCategory === cat ? "active" : "";
        
        li.innerHTML = `
          <button class="filter-item-btn ${isActive}" data-category="${cat}">
            <span style="display:flex; align-items:center; gap:8px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;">
              <i data-lucide="folder" style="width:16px; height:16px; flex-shrink:0;"></i> ${cat}
            </span>
            <span class="item-count">${count}</span>
          </button>
        `;

        li.querySelector("button").addEventListener("click", () => {
          this.setActiveCategory(cat);
        });
        this.categoriesFilterList.appendChild(li);
      });

      // 3. Thu thập thẻ tags từ quy trình
      const tagCounts = {};
      this.processes.forEach(proc => {
        if (proc.tags && Array.isArray(proc.tags)) {
          proc.tags.forEach(tag => {
            const trimmedTag = tag.trim().toLowerCase();
            if (trimmedTag) {
              tagCounts[trimmedTag] = (tagCounts[trimmedTag] || 0) + 1;
            }
          });
        }
      });

      // Render thẻ tags cloud
      this.tagsFilterCloud.innerHTML = "";
      const sortedTags = Object.keys(tagCounts).sort();
      
      if (sortedTags.length === 0) {
        this.tagsFilterCloud.innerHTML = `<span style="font-size:12px; color:var(--text-muted);">Chưa có thẻ nào</span>`;
      } else {
        sortedTags.forEach(tag => {
          const span = document.createElement("span");
          const isActive = this.selectedTag === tag ? "active" : "";
          span.className = `tag-badge ${isActive}`;
          span.innerHTML = `#${tag} <span style="font-size:10px; opacity:0.7">(${tagCounts[tag]})</span>`;
          span.addEventListener("click", () => this.toggleTagFilter(tag));
          this.tagsFilterCloud.appendChild(span);
        });
      }
    }
  }

  // Render thẻ thống kê (Dashboard Widgets)
  renderStats() {
    const icons = this.dashboardSection.querySelectorAll(".widget-icon");
    const labels = this.dashboardSection.querySelectorAll(".widget-lbl");
    const values = [
      this.statTotalSops, 
      this.statHighSops, 
      this.statTotalTags, 
      this.statTotalCategories
    ];

    if (this.currentView === "processes") {
      // Thống kê SOP
      icons[0].innerHTML = `<i data-lucide="file-text" style="width:24px; height:24px;"></i>`;
      icons[0].style.backgroundColor = "var(--primary-light)";
      icons[0].style.color = "var(--primary)";
      labels[0].textContent = "Quy trình chạy";
      values[0].textContent = this.processes.filter(p => p.status !== "stopped").length;

      icons[1].innerHTML = `<i data-lucide="alert-triangle" style="width:24px; height:24px;"></i>`;
      icons[1].style.backgroundColor = "var(--priority-high-bg)";
      icons[1].style.color = "var(--priority-high)";
      labels[1].textContent = "Khẩn cấp (Chạy)";
      values[1].textContent = this.processes.filter(p => p.priority === "high" && p.status !== "stopped").length;

      icons[2].innerHTML = `<i data-lucide="tags" style="width:24px; height:24px;"></i>`;
      icons[2].style.backgroundColor = "rgba(16, 185, 129, 0.15)";
      icons[2].style.color = "var(--priority-low)";
      labels[2].textContent = "Thẻ Tra Cứu";
      const uniqueTags = new Set();
      this.processes.forEach(p => {
        if (p.tags) p.tags.forEach(t => uniqueTags.add(t.trim().toLowerCase()));
      });
      values[2].textContent = uniqueTags.size;

      icons[3].innerHTML = `<i data-lucide="folder-open" style="width:24px; height:24px;"></i>`;
      icons[3].style.backgroundColor = "rgba(245, 158, 11, 0.15)";
      icons[3].style.color = "var(--priority-medium)";
      labels[3].textContent = "Số Danh Mục";
      values[3].textContent = this.categories.length;
    } else {
      // Thống kê Announcements
      icons[0].innerHTML = `<i data-lucide="megaphone" style="width:24px; height:24px;"></i>`;
      icons[0].style.backgroundColor = "var(--primary-light)";
      icons[0].style.color = "var(--primary)";
      labels[0].textContent = "Tổng Cập nhật";
      values[0].textContent = this.announcements.length;

      icons[1].innerHTML = `<i data-lucide="clock" style="width:24px; height:24px;"></i>`;
      icons[1].style.backgroundColor = "var(--priority-medium-bg)";
      icons[1].style.color = "var(--priority-medium)";
      labels[1].textContent = "Sắp chạy";
      values[1].textContent = this.announcements.filter(a => a.status === "upcoming").length;

      icons[2].innerHTML = `<i data-lucide="play-circle" style="width:24px; height:24px;"></i>`;
      icons[2].style.backgroundColor = "rgba(16, 185, 129, 0.15)";
      icons[2].style.color = "var(--priority-low)";
      labels[2].textContent = "Đang chạy";
      values[2].textContent = this.announcements.filter(a => a.status === "active").length;

      icons[3].innerHTML = `<i data-lucide="stop-circle" style="width:24px; height:24px;"></i>`;
      icons[3].style.backgroundColor = "var(--priority-high-bg)";
      icons[3].style.color = "var(--priority-high)";
      labels[3].textContent = "Đã ngừng";
      values[3].textContent = this.announcements.filter(a => a.status === "stopped").length;
    }
  }

  toggleStoppedSopsSection() {
    if (!this.stoppedProcessGrid || !this.stoppedChevron) return;
    const isHidden = this.stoppedProcessGrid.style.display === "none";
    if (isHidden) {
      this.stoppedProcessGrid.style.display = "grid";
      this.stoppedChevron.style.transform = "rotate(90deg)";
    } else {
      this.stoppedProcessGrid.style.display = "none";
      this.stoppedChevron.style.transform = "rotate(0deg)";
    }
  }

  // Lọc và render Grid
  renderGrid() {
    this.processGrid.innerHTML = "";
    if (this.stoppedProcessGrid) this.stoppedProcessGrid.innerHTML = "";
    
    if (this.currentView === "processes") {
      // 1. RENDER QUY TRÌNH (SOP)
      let filtered = this.processes;

      if (this.selectedCategory !== "all") {
        filtered = filtered.filter(p => p.category === this.selectedCategory);
        this.gridHeaderTitle.textContent = `Danh mục: ${this.selectedCategory}`;
      } else if (this.selectedTag) {
        filtered = filtered.filter(p => p.tags && p.tags.some(t => t.trim().toLowerCase() === this.selectedTag));
        this.gridHeaderTitle.textContent = `Thẻ tìm kiếm: #${this.selectedTag}`;
      } else {
        this.gridHeaderTitle.textContent = "Tất cả quy trình công việc";
      }

      if (this.searchQuery.trim() !== "") {
        const searchNorm = this.removeVietnameseAccents(this.searchQuery.trim());
        filtered = filtered.filter(p => {
          const titleNorm = this.removeVietnameseAccents(p.title);
          const descNorm = this.removeVietnameseAccents(p.description || "");
          const categoryNorm = this.removeVietnameseAccents(p.category);
          const authorNorm = this.removeVietnameseAccents(p.author || "");
          const tagsStringNorm = this.removeVietnameseAccents(p.tags ? p.tags.join(" ") : "");
          const stepsNorm = p.steps ? p.steps.map(s => this.removeVietnameseAccents(s.text)).join(" ") : "";
          
          return titleNorm.includes(searchNorm) || 
                 descNorm.includes(searchNorm) || 
                 categoryNorm.includes(searchNorm) || 
                 authorNorm.includes(searchNorm) || 
                 tagsStringNorm.includes(searchNorm) ||
                 stepsNorm.includes(searchNorm);
        });
      }

      // Phân tách Quy trình Đang chạy (Active) và Đã ngừng (Stopped)
      const activeSops = filtered.filter(p => p.status !== "stopped");
      const stoppedSops = filtered.filter(p => p.status === "stopped");

      // Sắp xếp thuật toán: Đã ghim -> Khẩn cấp -> Mới cập nhật
      const sortSops = (list) => {
        return list.sort((a, b) => {
          const aPinned = a.pinned ? 1 : 0;
          const bPinned = b.pinned ? 1 : 0;
          if (aPinned !== bPinned) return bPinned - aPinned;

          const priorityWeight = { high: 3, medium: 2, low: 1 };
          const aWeight = priorityWeight[a.priority || "medium"];
          const bWeight = priorityWeight[b.priority || "medium"];
          if (aWeight !== bWeight) return bWeight - aWeight;

          const aTime = new Date(a.updatedAt || a.createdAt).getTime();
          const bTime = new Date(b.updatedAt || b.createdAt).getTime();
          return bTime - aTime;
        });
      };

      sortSops(activeSops);
      sortSops(stoppedSops);

      this.resultsCountText.textContent = `Hiển thị ${activeSops.length} đang chạy / ${stoppedSops.length} đã ngừng`;

      // Cập nhật giao diện Container Quy trình Đã ngừng
      if (this.stoppedProcessesContainer) {
        if (stoppedSops.length > 0) {
          this.stoppedProcessesContainer.style.display = "block";
          this.stoppedSopsCount.textContent = stoppedSops.length;
        } else {
          this.stoppedProcessesContainer.style.display = "none";
          this.stoppedProcessGrid.style.display = "none";
          this.stoppedChevron.style.transform = "rotate(0deg)";
        }
      }

      if (activeSops.length === 0 && stoppedSops.length === 0) {
        this.processGrid.style.display = "none";
        this.emptyState.style.display = "flex";
        this.emptyState.querySelector("p").textContent = "Không tìm thấy quy trình nào. Vui lòng tạo mới quy trình đầu tiên của bạn.";
      } else {
        this.emptyState.style.display = "none";
        
        // Render Quy trình đang hoạt động
        if (activeSops.length > 0) {
          this.processGrid.style.display = "grid";
          activeSops.forEach(proc => {
            this.renderSopCardIntoGrid(proc, this.processGrid, false);
          });
        } else {
          this.processGrid.style.display = "none";
        }

        // Render Quy trình đã ngừng
        if (stoppedSops.length > 0 && this.stoppedProcessGrid) {
          stoppedSops.forEach(proc => {
            this.renderSopCardIntoGrid(proc, this.stoppedProcessGrid, true);
          });
        }
      }
    } else {
      // Ẩn phần quy trình đã ngừng khi ở Tab Thông báo
      if (this.stoppedProcessesContainer) {
        this.stoppedProcessesContainer.style.display = "none";
      }

      // 2. RENDER THÔNG TIN VẬN HÀNH (ANNOUNCEMENTS)
      let filtered = this.announcements;

      if (this.selectedAnnStatus !== "all") {
        filtered = filtered.filter(a => a.status === this.selectedAnnStatus);
        const statusNames = { upcoming: "Sắp chạy", active: "Đang chạy", stopped: "Đã ngừng" };
        this.gridHeaderTitle.textContent = `Thông báo: ${statusNames[this.selectedAnnStatus]}`;
      } else {
        this.gridHeaderTitle.textContent = "Thông tin vận hành mới";
      }

      if (this.searchQuery.trim() !== "") {
        const searchNorm = this.removeVietnameseAccents(this.searchQuery.trim());
        filtered = filtered.filter(a => {
          const titleNorm = this.removeVietnameseAccents(a.title);
          const contentNorm = this.removeVietnameseAccents(a.content || "");
          const categoryNorm = this.removeVietnameseAccents(a.category);
          const authorNorm = this.removeVietnameseAccents(a.author || "");
          return titleNorm.includes(searchNorm) || contentNorm.includes(searchNorm) || categoryNorm.includes(searchNorm) || authorNorm.includes(searchNorm);
        });
      }

      // Sắp xếp: Mới nhất lên đầu
      filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

      this.resultsCountText.textContent = `Hiển thị ${filtered.length} thông báo`;

      if (filtered.length === 0) {
        this.processGrid.style.display = "none";
        this.emptyState.style.display = "flex";
        this.emptyState.querySelector("p").textContent = "Không tìm thấy thông báo nào. Vui lòng tạo mới thông báo đầu tiên.";
      } else {
        this.processGrid.style.display = "grid";
        this.emptyState.style.display = "none";

        filtered.forEach(ann => {
          const card = document.createElement("div");
          card.className = "process-card";
          card.dataset.id = ann.id;

          let statusLbl = "Đang chạy";
          let statusClass = "status-active";
          if (ann.status === "upcoming") {
            statusLbl = "Sắp chạy";
            statusClass = "status-upcoming";
          } else if (ann.status === "stopped") {
            statusLbl = "Đã ngừng";
            statusClass = "status-stopped";
          }

          const dateObj = new Date(ann.updatedAt || ann.createdAt);
          const updateDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

          // Định dạng ngày bắt đầu/kết thúc
          const formatDateDMY = (isoDateStr) => {
            if (!isoDateStr) return "";
            const [year, month, day] = isoDateStr.split("-");
            return `${day}/${month}/${year}`;
          };
          const dateIntervalHTML = (ann.startDate || ann.endDate) ? `
            <div style="font-size:11px; color:var(--text-muted); margin-top:6px; display:flex; align-items:center; gap:4px;">
              <i data-lucide="calendar" style="width:12px; height:12px;"></i>
              ${ann.startDate ? `Bắt đầu: ${formatDateDMY(ann.startDate)}` : ""}
              ${ann.endDate ? ` - Kết thúc: ${formatDateDMY(ann.endDate)}` : ""}
            </div>
          ` : "";

          card.innerHTML = `
            <div class="card-top">
              <span class="category-tag" style="background-color:rgba(124, 58, 237, 0.1); color:var(--primary);">${ann.category}</span>
              <span class="status-badge ${statusClass}">● ${statusLbl}</span>
            </div>
            <h3 class="card-title" style="display:flex; align-items:center; gap:6px;">
              <i data-lucide="megaphone" style="width:16px; height:16px; color:var(--primary); flex-shrink:0;"></i> ${ann.title}
            </h3>
            <p class="card-desc">${this.formatRichText(ann.content)}</p>
            ${dateIntervalHTML}
            <div class="card-footer" style="margin-top:auto;">
              <span>Người đăng: ${ann.author || "Admin"}</span>
              <span>Cập nhật: ${updateDate}</span>
            </div>
          `;

          card.addEventListener("click", () => this.openAnnDetailsPanel(ann.id));
          this.processGrid.appendChild(card);
        });
      }
    }
    lucide.createIcons();
  }

  // Helper render SOP card vào grid cụ thể
  renderSopCardIntoGrid(proc, gridEl, isStopped = false) {
    const card = document.createElement("div");
    const isPinnedActive = proc.pinned ? "pinned-active" : "";
    const stoppedClass = isStopped ? "stopped-sop" : "";
    
    card.className = `process-card ${isPinnedActive} ${stoppedClass}`;
    card.dataset.id = proc.id;
    
    let priorityLbl = "Thấp";
    let priorityClass = "priority-low";
    if (proc.priority === "high") {
      priorityLbl = "Khẩn cấp";
      priorityClass = "priority-high";
    } else if (proc.priority === "medium") {
      priorityLbl = "Trung bình";
      priorityClass = "priority-medium";
    }

    const totalSteps = proc.steps ? proc.steps.length : 0;
    const completedSteps = proc.steps ? proc.steps.filter(s => s.completed).length : 0;
    const tagsHTML = proc.tags ? proc.tags.map(t => `<span style="color:var(--text-muted); font-size:11px; margin-right:4px;">#${t}</span>`).join("") : "";
    const dateObj = new Date(proc.updatedAt || proc.createdAt);
    const updateDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

    // Kiểm tra xem quy trình có mới không (< 48 giờ)
    const isNew = (new Date() - new Date(proc.createdAt)) < 48 * 60 * 60 * 1000;
    const badgeNewHTML = (isNew && !isStopped) ? `<span class="badge-new-glow">Mới</span>` : "";

    card.innerHTML = `
      <div class="card-top">
        <span class="category-tag">${proc.category}</span>
        <div style="display:flex; align-items:center;">
          <span class="priority-dot-badge ${priorityClass}">● ${isStopped ? "Đã ngừng" : priorityLbl}</span>
          ${(!isStopped && (this.getCurrentUser().role !== "viewer")) ? `
            <button class="pin-btn ${proc.pinned ? "active" : ""}" title="${proc.pinned ? "Bỏ ghim quy trình" : "Ghim quy trình"}">
              <i data-lucide="pin" style="width:14px; height:14px; transform:rotate(${proc.pinned ? "0deg" : "45deg"});"></i>
            </button>
          ` : ""}
        </div>
      </div>
      <h3 class="card-title">${proc.title} ${badgeNewHTML}</h3>
      <p class="card-desc">${this.formatRichText(proc.description || "Chưa có mô tả chi tiết.")}</p>
      <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px;">
        ${tagsHTML}
      </div>
      <div class="card-footer">
        <span class="step-summary">
          <i data-lucide="check-square" style="width:14px; height:14px;"></i> ${completedSteps}/${totalSteps} bước
        </span>
        <span>Cập nhật: ${updateDate}</span>
      </div>
    `;

    // Tải sự kiện Ghim
    const pinBtn = card.querySelector(".pin-btn");
    if (pinBtn) {
      pinBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.togglePinProcess(proc.id);
      });
    }

    card.addEventListener("click", () => this.openDetailsPanel(proc.id));
    gridEl.appendChild(card);
  }

  // Render chi tiết quy trình vào panel xem chi tiết (nếu panel đang mở)
  renderActiveProcessDetail() {
    if (!this.activeProcessId) return;

    const proc = this.processes.find(p => p.id === this.activeProcessId);
    if (!proc) {
      this.closeDetailsPanel();
      return;
    }

    if (this.detailsStepsGroup) this.detailsStepsGroup.style.display = "block";

    // Tiêu đề, danh mục, mô tả
    this.detailsTitle.textContent = proc.title;
    this.detailsCategory.textContent = proc.category;
    this.detailsDescription.innerHTML = this.formatRichText(proc.description || "Quy trình này không có mô tả tổng quan.");
    this.detailsAuthor.textContent = proc.author || "Thành viên nội bộ";

    // Format ngày tạo & cập nhật
    const createdDate = new Date(proc.createdAt);
    const updatedDate = new Date(proc.updatedAt);
    this.detailsCreated.textContent = `${createdDate.toLocaleDateString("vi-VN")} ${createdDate.toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}`;
    this.detailsUpdated.textContent = `${updatedDate.toLocaleDateString("vi-VN")} ${updatedDate.toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}`;

    // Độ ưu tiên & Trạng thái hoạt động
    let priorityLbl = "Thấp";
    let priorityClass = "priority-low";
    if (proc.priority === "high") {
      priorityLbl = "Khẩn cấp";
      priorityClass = "priority-high";
    } else if (proc.priority === "medium") {
      priorityLbl = "Trung bình";
      priorityClass = "priority-medium";
    }
    
    if (proc.status === "stopped") {
      this.detailsPriority.className = `priority-dot-badge priority-high`;
      this.detailsPriority.textContent = `● Đã ngừng hoạt động`;
    } else {
      this.detailsPriority.className = `priority-dot-badge ${priorityClass}`;
      this.detailsPriority.textContent = `● Ưu tiên: ${priorityLbl}`;
    }

    // Render danh sách checklist bước thực hiện
    this.detailsStepsList.innerHTML = "";
    const totalSteps = proc.steps ? proc.steps.length : 0;
    const completedSteps = proc.steps ? proc.steps.filter(s => s.completed).length : 0;
    
    this.stepsProgressText.textContent = `${completedSteps}/${totalSteps} hoàn thành`;

    if (proc.steps && proc.steps.length > 0) {
      proc.steps.forEach((step, idx) => {
        const stepDiv = document.createElement("div");
        stepDiv.className = `step-item ${step.completed ? "completed" : ""}`;
        
        const isCheckedClass = step.completed ? "checked" : "";
        const linkHTML = step.linkUrl ? `
          <a href="${step.linkUrl}" target="_blank" class="step-link-pill">
            <i data-lucide="external-link" style="width:12px; height:12px;"></i> ${step.linkName || "Xem tài liệu"}
          </a>
        ` : "";
        
        stepDiv.innerHTML = `
          <div class="step-checkbox ${isCheckedClass}" data-step-id="${step.id}"></div>
          <div style="flex-grow: 1; display: flex; flex-direction: column;">
            <div class="step-text">
              <strong style="margin-right:4px;">Bước ${idx + 1}:</strong> ${this.formatRichText(step.text)}
            </div>
            ${linkHTML}
            ${step.image ? `
              <img class="step-item-img" src="${step.image}" alt="Hình ảnh minh họa bước ${idx + 1}">
            ` : ""}
          </div>
        `;

        // Sự kiện click tích hoàn thành bước
        stepDiv.querySelector(".step-checkbox").addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleStepCompletion(proc.id, step.id);
        });

        // Sự kiện click phóng to ảnh
        const stepImg = stepDiv.querySelector(".step-item-img");
        if (stepImg) {
          stepImg.addEventListener("click", (e) => {
            e.stopPropagation();
            this.openLightbox(step.image);
          });
        }

        this.detailsStepsList.appendChild(stepDiv);
      });
    } else {
      this.detailsStepsList.innerHTML = `<p style="font-size:14px; color:var(--text-muted); text-align:center;">Quy trình này chưa được tạo các bước hướng dẫn cụ thể.</p>`;
    }
  }

  // --- THAY ĐỔI TRẠNG THÁI HOÀN THÀNH TỪNG BƯỚC (REAL-TIME SYNC) ---
  toggleStepCompletion(processId, stepId) {
    const proc = this.processes.find(p => p.id === processId);
    if (!proc) return;

    const step = proc.steps.find(s => s.id === stepId);
    if (!step) return;

    step.completed = !step.completed;
    
    // Lưu thẳng vào storage (nếu Firebase sẽ gửi lên Firestore, cập nhật cho toàn bộ team)
    window.storageManager.saveProcess(proc);
  }

  // --- PANEL CHI TIẾT ---
  openDetailsPanel(processId) {
    this.activeProcessId = processId;
    this.renderActiveProcessDetail();
    this.detailsPanel.classList.add("active");
  }

  closeDetailsPanel() {
    this.activeProcessId = null;
    this.detailsPanel.classList.remove("active");
  }

  editActiveProcess() {
    if (!this.activeProcessId) return;
    this.openEditorModal(this.activeProcessId);
  }

  async deleteActiveProcess() {
    if (!this.activeProcessId) return;
    const proc = this.processes.find(p => p.id === this.activeProcessId);
    if (!proc) return;

    if (confirm(`Bạn có chắc chắn muốn xóa quy trình "${proc.title}" không? Hành động này không thể hoàn tác.`)) {
      const title = proc.title;
      this.closeDetailsPanel();
      await window.storageManager.deleteProcess(proc.id);
      this.showToast(`Đã xóa quy trình "${title}" thành công.`);
    }
  }

  // --- FORM BIÊN TẬP QUY TRÌNH (EDITOR) ---
  openEditorModal(processId = null) {
    // 1. Tạo danh sách các tùy chọn danh mục trong Select
    this.formCategory.innerHTML = "";
    this.categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      this.formCategory.appendChild(option);
    });

    this.formStepsList.innerHTML = "";

    if (processId) {
      // Chế độ Sửa
      const proc = this.processes.find(p => p.id === processId);
      if (!proc) return;

      this.formProcessId.value = proc.id;
      this.formTitle.value = proc.title;
      this.formCategory.value = proc.category;
      this.formPriority.value = proc.priority || "medium";
      this.formStatus.value = proc.status || "active";
      this.formTags.value = proc.tags ? proc.tags.join(", ") : "";
      this.formAuthor.value = proc.author || "";
      this.formDescription.value = proc.description || "";

      // Load các bước hiện tại
      if (proc.steps && proc.steps.length > 0) {
        proc.steps.forEach(s => this.addFormStepInput(s.text, s.image, s.linkUrl, s.linkName));
      } else {
        this.addFormStepInput("");
      }
      document.getElementById("editor-modal-title").textContent = "Sửa đổi Quy trình Hướng dẫn";
    } else {
      // Chế độ Thêm mới
      this.formProcessId.value = "";
      this.formTitle.value = "";
      this.formPriority.value = "medium";
      this.formStatus.value = "active";
      this.formTags.value = "";
      this.formAuthor.value = this.getCurrentUser().name;
      this.formDescription.value = "";
      
      // Khởi tạo sẵn 3 ô nhập bước trống
      this.addFormStepInput("");
      this.addFormStepInput("");
      this.addFormStepInput("");
      document.getElementById("editor-modal-title").textContent = "Thêm Quy trình Hướng dẫn Mới";
    }

    this.editorModal.classList.add("active");
    lucide.createIcons();
  }

  closeEditorModal() {
    this.editorModal.classList.remove("active");
  }

  // Thêm một hàng ô nhập văn bản của một bước trong Editor
  addFormStepInput(text = "", image = null, linkUrl = "", linkName = "") {
    const stepCount = this.formStepsList.children.length;
    const row = document.createElement("div");
    row.className = "step-edit-item";
    
    // Lưu trữ base64 trong dataset
    row.dataset.image = image || "";

    row.innerHTML = `
      <span class="step-drag-num">${stepCount + 1}</span>
      <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 6px;">
        <textarea class="form-control form-step-input-text" rows="2" style="resize:vertical;" placeholder="Nhập mô tả hành động bước ${stepCount + 1}..." required>${text}</textarea>
        <div class="step-link-row" style="display:flex; gap:6px;">
          <input type="url" class="form-control form-step-link-url" placeholder="Đường dẫn liên kết (URL)..." value="${linkUrl || ""}">
          <input type="text" class="form-control form-step-link-name" placeholder="Tên Link..." value="${linkName || ""}">
        </div>
      </div>
      
      <!-- Preview Ảnh -->
      <div class="step-img-preview-container ${image ? "has-img" : ""}">
        <img class="step-img-preview-thumb" src="${image || ""}">
        <button type="button" class="btn-step-remove-img" title="Xóa ảnh">&times;</button>
      </div>

      <!-- Nút chọn ảnh -->
      <button type="button" class="btn btn-icon btn-step-upload-trigger" title="Đính kèm hình ảnh">
        <i data-lucide="image" style="width:16px; height:16px;"></i>
      </button>
      <input type="file" class="step-image-file-input" accept="image/*">

      <!-- Nút xóa bước -->
      <button type="button" class="btn btn-icon btn-step-delete" style="flex-shrink:0; border-color:transparent; background-color:var(--priority-high-bg); color:var(--priority-high); width:38px; height:38px;" title="Xóa bước này">
        <i data-lucide="trash-2" style="width:16px; height:16px;"></i>
      </button>
    `;

    // Sự kiện Click chọn ảnh
    const uploadTrigger = row.querySelector(".btn-step-upload-trigger");
    const fileInput = row.querySelector(".step-image-file-input");
    const previewContainer = row.querySelector(".step-img-preview-container");
    const previewThumb = row.querySelector(".step-img-preview-thumb");
    const removeImgBtn = row.querySelector(".btn-step-remove-img");

    uploadTrigger.addEventListener("click", () => fileInput.click());

    // Sự kiện Dán (Paste) ảnh trực tiếp từ Clipboard
    const textInput = row.querySelector(".form-step-input-text");
    textInput.addEventListener("paste", async (e) => {
      const items = (e.clipboardData || window.clipboardData).items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") === 0) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault(); // Ngăn hành vi dán text nếu là dán ảnh
            try {
              const compressedBase64 = await this.compressImage(file);
              row.dataset.image = compressedBase64;
              previewThumb.src = compressedBase64;
              previewContainer.classList.add("has-img");
              this.showToast("Đã dán (paste) và tự động nén ảnh từ Clipboard.");
            } catch (err) {
              console.error("Lỗi khi xử lý ảnh dán từ Clipboard:", err);
              alert("Lỗi khi xử lý hình ảnh dán.");
            }
          }
          break;
        }
      }
    });

    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const compressedBase64 = await this.compressImage(file);
        row.dataset.image = compressedBase64;
        previewThumb.src = compressedBase64;
        previewContainer.classList.add("has-img");
        this.showToast("Đã tải lên và nén ảnh minh họa.");
      } catch (err) {
        console.error("Lỗi xử lý ảnh:", err);
        alert("Lỗi khi xử lý hình ảnh.");
      }
    });

    // Sự kiện Xóa ảnh đính kèm
    removeImgBtn.addEventListener("click", () => {
      row.dataset.image = "";
      previewThumb.src = "";
      previewContainer.classList.remove("has-img");
      fileInput.value = "";
    });

    // Sự kiện xóa hàng bước này
    row.querySelector(".btn-step-delete").addEventListener("click", () => {
      row.remove();
      this.reorderFormStepNumbers();
    });

    const stepTextarea = row.querySelector(".form-step-input-text");
    this.attachFormattingToolbar(stepTextarea);

    this.formStepsList.appendChild(row);
    lucide.createIcons();
    this.reorderFormStepNumbers();
  }

  // Sắp xếp lại số thứ tự hiển thị của các bước trong Form khi xóa bước
  reorderFormStepNumbers() {
    const rows = this.formStepsList.querySelectorAll(".step-edit-item");
    rows.forEach((row, index) => {
      const numSpan = row.querySelector(".step-drag-num");
      const input = row.querySelector(".form-step-input-text");
      numSpan.textContent = index + 1;
      input.placeholder = `Nhập mô tả hành động bước ${index + 1}...`;
    });
  }

  // Lưu thông tin quy trình từ Form
  async saveProcessSubmit() {
    const id = this.formProcessId.value || `proc-${Date.now()}`;
    const isNew = !this.formProcessId.value;

    const title = this.formTitle.value.trim();
    const category = this.formCategory.value;
    const priority = this.formPriority.value;
    const status = this.formStatus.value;
    const author = this.formAuthor.value.trim();
    const description = this.formDescription.value.trim();

    // Lấy thẻ tags, lọc bỏ khoảng trống
    const tagsRaw = this.formTags.value.split(",");
    const tags = tagsRaw.map(t => t.trim().toLowerCase()).filter(t => t !== "");

    // Thu thập các bước chi tiết
    const stepRows = this.formStepsList.querySelectorAll(".step-edit-item");
    const steps = [];

    // Nếu sửa quy trình cũ, chúng ta giữ trạng thái hoàn thành (completed) của các bước nếu text không thay đổi nhiều
    let oldSteps = [];
    if (!isNew) {
      const oldProc = this.processes.find(p => p.id === id);
      if (oldProc && oldProc.steps) oldSteps = oldProc.steps;
    }

    let hasValidationError = false;
    stepRows.forEach((row, index) => {
      if (hasValidationError) return;

      const input = row.querySelector(".form-step-input-text");
      const stepText = input.value.trim();
      const stepImg = row.dataset.image || null;

      const linkUrlInput = row.querySelector(".form-step-link-url");
      const linkNameInput = row.querySelector(".form-step-link-name");
      const linkUrl = linkUrlInput ? linkUrlInput.value.trim() : "";
      const linkName = linkNameInput ? linkNameInput.value.trim() : "";

      // Ràng buộc bắt buộc nhập tên link nếu đã nhập url
      if (linkUrl && !linkName) {
        alert(`Ở bước ${index + 1}: Bạn đã nhập liên kết nhưng thiếu Tên liên kết/Tên File. Vui lòng bổ sung.`);
        hasValidationError = true;
        return;
      }

      if (stepText) {
        // Tìm xem bước này trước đó đã có chưa để giữ trạng thái checkbox
        const oldStep = oldSteps[index];
        const completed = (oldStep && oldStep.text === stepText) ? oldStep.completed : false;
        
        steps.push({
          id: oldStep ? oldStep.id : `step-${id}-${index + 1}`,
          text: stepText,
          completed: completed,
          image: stepImg,
          linkUrl: linkUrl,
          linkName: linkName
        });
      }
    });

    if (hasValidationError) return;

    if (steps.length === 0) {
      alert("Quy trình phải chứa ít nhất 1 bước thực hiện.");
      return;
    }

    // Tạo đối tượng quy trình mới
    const processData = {
      id,
      title,
      category,
      priority,
      status: status || "active",
      tags,
      author: author || "Thành viên nội bộ",
      description,
      steps,
      createdAt: isNew ? new Date().toISOString() : (this.processes.find(p => p.id === id)?.createdAt || new Date().toISOString()),
      updatedAt: new Date().toISOString(),
      pinned: !isNew ? (this.processes.find(p => p.id === id)?.pinned || false) : false
    };

    await window.storageManager.saveProcess(processData);
    
    this.closeEditorModal();
    this.showToast(isNew ? `Đã thêm quy trình "${title}" thành công.` : `Đã cập nhật quy trình "${title}" thành công.`);
    
    // Nếu đang sửa quy trình hiện tại, tải lại chi tiết
    if (this.activeProcessId === id) {
      this.renderActiveProcessDetail();
    }
  }

  // --- MODAL QUẢN LÝ DANH MỤC ---
  openCategoriesModal() {
    this.renderCategoryManagerList();
    this.categoriesModal.classList.add("active");
  }

  closeCategoriesModal() {
    this.categoriesModal.classList.remove("active");
  }

  renderCategoryManagerList() {
    this.catManagerList.innerHTML = "";
    this.categories.forEach(cat => {
      const li = document.createElement("li");
      li.className = "category-manager-item";
      
      // Đếm xem danh mục này có đang chứa quy trình nào không
      const count = this.processes.filter(p => p.category === cat).length;
      const isDeletable = count === 0;

      li.innerHTML = `
        <span style="font-weight:600; font-size:14px;">${cat} <span style="font-weight:400; color:var(--text-muted);">(${count} bài)</span></span>
        ${isDeletable ? `
          <button type="button" class="btn-icon" style="width:32px; height:32px; border-color:transparent; background-color:var(--priority-high-bg); color:var(--priority-high);" title="Xóa danh mục">
            <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
          </button>
        ` : `
          <span style="font-size:11px; color:var(--text-muted);">Đang dùng</span>
        `}
      `;

      if (isDeletable) {
        li.querySelector("button").addEventListener("click", () => this.deleteCategory(cat));
      }

      this.catManagerList.appendChild(li);
    });
    lucide.createIcons();
  }

  async addNewCategory() {
    const name = this.formNewCatName.value.trim();
    if (!name) return;

    if (this.categories.includes(name)) {
      alert("Danh mục này đã tồn tại.");
      return;
    }

    this.categories.push(name);
    await window.storageManager.saveCategories(this.categories);
    this.formNewCatName.value = "";
    this.renderCategoryManagerList();
    this.showToast(`Đã thêm danh mục "${name}".`);
  }

  async deleteCategory(catName) {
    if (confirm(`Bạn chắc chắn muốn xóa danh mục "${catName}"?`)) {
      this.categories = this.categories.filter(c => c !== catName);
      await window.storageManager.saveCategories(this.categories);
      this.renderCategoryManagerList();
      this.showToast(`Đã xóa danh mục "${catName}".`);
    }
  }

  // --- MODAL CẤU HÌNH ĐỒNG BỘ ĐÁM MÂY (FIREBASE) ---
  openSyncModal() {
    const config = window.storageManager.getFirebaseConfig();
    if (config) {
      this.formFirebaseConfig.value = JSON.stringify(config, null, 2);
      this.btnDisconnectSync.style.display = "block";
    } else {
      this.formFirebaseConfig.value = "";
      this.btnDisconnectSync.style.display = "none";
    }
    this.syncModal.classList.add("active");
  }

  closeSyncModal() {
    this.syncModal.classList.remove("active");
  }

  saveFirebaseConfigSubmit() {
    const val = this.formFirebaseConfig.value.trim();
    if (!val) {
      alert("Vui lòng nhập mã cấu hình JSON Firebase.");
      return;
    }

    try {
      const config = JSON.parse(val);
      if (!config.apiKey || !config.projectId || !config.appId) {
        throw new Error("Cấu hình JSON thiếu các trường quan trọng (apiKey, projectId, appId).");
      }

      const success = window.storageManager.saveFirebaseConfig(config);
      if (success) {
        this.closeSyncModal();
        this.showToast("Kết nối cơ sở dữ liệu Firebase trực tuyến thành công!");
      } else {
        alert("Kết nối thất bại. Vui lòng kiểm tra lại tính chính xác của các khóa cấu hình.");
      }
    } catch (e) {
      alert("Định dạng cấu hình JSON không hợp lệ: " + e.message);
    }
  }

  disconnectFirebaseSync() {
    if (confirm("Bạn có chắc chắn muốn ngắt kết nối đám mây và đưa ứng dụng về chế độ offline? Dữ liệu trên đám mây sẽ không bị xóa, và bạn sẽ sử dụng dữ liệu cục bộ.")) {
      window.storageManager.clearFirebaseConfig();
      this.closeSyncModal();
      this.showToast("Đã ngắt kết nối Cloud. Đang chạy chế độ Local.");
    }
  }

  // --- SAO LƯU & KHÔI PHỤC FILE ---
  handleExportBackup() {
    try {
      const dataStr = window.storageManager.exportData();
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `sop_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showToast("Đã xuất file sao lưu JSON thành công.");
    } catch (e) {
      alert("Không thể xuất sao lưu: " + e.message);
    }
  }

  handleImportBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      const res = await window.storageManager.importData(content);
      if (res.success) {
        this.showToast("Đã khôi phục dữ liệu từ file backup thành công.");
        this.fileImportInput.value = ""; // Reset
      } else {
        alert("Lỗi khi nhập dữ liệu: " + res.error);
      }
    };
    reader.readAsText(file);
  }

  // --- THAO TÁC VỚI ANNOUNCEMENTS (THÔNG TIN VẬN HÀNH) ---
  openAnnDetailsPanel(annId) {
    this.activeAnnouncementId = annId;
    this.activeProcessId = null; // Xóa ID quy trình đang active

    const ann = this.announcements.find(a => a.id === annId);
    if (!ann) {
      this.closeDetailsPanel();
      return;
    }

    // Ẩn checklist các bước đối với thông báo vận hành
    if (this.detailsStepsGroup) this.detailsStepsGroup.style.display = "none";

    // Điền thông tin vào panel
    this.detailsTitle.textContent = ann.title;
    this.detailsCategory.textContent = ann.category;
    
    // Formatting ngày bắt đầu / ngày kết thúc
    const formatDateDMY = (isoDateStr) => {
      if (!isoDateStr) return "";
      const [year, month, day] = isoDateStr.split("-");
      return `${day}/${month}/${year}`;
    };

    let dateMetaHTML = "";
    if (ann.startDate || ann.endDate) {
      dateMetaHTML = `
        <div style="margin-bottom: 14px; padding: 10px 14px; background-color: var(--primary-light); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); font-size: 13px; color: var(--text-secondary); display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
          <i data-lucide="calendar" style="width:16px; height:16px; color:var(--primary);"></i>
          ${ann.startDate ? `<span><strong>Bắt đầu:</strong> ${formatDateDMY(ann.startDate)}</span>` : ""}
          ${ann.endDate ? `<span><strong>Kết thúc:</strong> ${formatDateDMY(ann.endDate)}</span>` : ""}
        </div>
      `;
    }

    this.detailsDescription.innerHTML = `
      ${dateMetaHTML}
      <div class="announcement-card-content">${this.formatRichText(ann.content)}</div>
    `;
    this.detailsAuthor.textContent = ann.author || "Admin";

    const createdDate = new Date(ann.createdAt);
    const updatedDate = new Date(ann.updatedAt || ann.createdAt);
    this.detailsCreated.textContent = `${createdDate.toLocaleDateString("vi-VN")} ${createdDate.toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}`;
    this.detailsUpdated.textContent = `${updatedDate.toLocaleDateString("vi-VN")} ${updatedDate.toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}`;

    // Đổi màu mác trạng thái thông báo
    let statusLbl = "Đang chạy";
    let statusClass = "status-active";
    if (ann.status === "upcoming") {
      statusClass = "status-upcoming";
      statusLbl = "Sắp chạy";
    } else if (ann.status === "stopped") {
      statusClass = "status-stopped";
      statusLbl = "Đã ngừng";
    }
    this.detailsPriority.className = `status-badge ${statusClass}`;
    this.detailsPriority.textContent = `● ${statusLbl}`;

    this.detailsPanel.classList.add("active");
    lucide.createIcons();
  }

  editActiveAnnouncement() {
    if (!this.activeAnnouncementId) return;
    this.openAnnEditorModal(this.activeAnnouncementId);
  }

  async deleteActiveAnnouncement() {
    if (!this.activeAnnouncementId) return;
    const ann = this.announcements.find(a => a.id === this.activeAnnouncementId);
    if (!ann) return;

    if (confirm(`Bạn có chắc chắn muốn xóa thông báo "${ann.title}" không? Hành động này không thể hoàn tác.`)) {
      const title = ann.title;
      this.closeDetailsPanel();
      await window.storageManager.deleteAnnouncement(ann.id);
      this.showToast(`Đã xóa thông báo "${title}" thành công.`);
    }
  }

  openAnnEditorModal(annId = null) {
    if (annId) {
      // Chế độ Sửa
      const ann = this.announcements.find(a => a.id === annId);
      if (!ann) return;

      this.formAnnId.value = ann.id;
      this.annFormTitle.value = ann.title;
      this.annFormCategory.value = ann.category;
      this.annFormStatus.value = ann.status || "active";
      this.annFormStartDate.value = ann.startDate || "";
      this.annFormEndDate.value = ann.endDate || "";
      this.annFormAuthor.value = ann.author || "";
      this.annFormContent.value = ann.content || "";

      document.getElementById("ann-modal-title").textContent = "Chỉnh sửa Thông báo Vận hành";
    } else {
      // Chế độ Thêm mới
      this.formAnnId.value = "";
      this.annFormTitle.value = "";
      this.annFormCategory.value = "";
      this.annFormStatus.value = "active";
      this.annFormStartDate.value = "";
      this.annFormEndDate.value = "";
      this.annFormAuthor.value = this.getCurrentUser().name;
      this.annFormContent.value = "";

      document.getElementById("ann-modal-title").textContent = "Thêm Thông báo Vận hành Mới";
    }

    this.announcementModal.classList.add("active");
    lucide.createIcons();
  }

  closeAnnEditorModal() {
    this.announcementModal.classList.remove("active");
  }

  // Tự động chọn trạng thái theo ngày nhập trong Form
  autoCalculateStatus() {
    const startVal = this.annFormStartDate.value;
    const endVal = this.annFormEndDate.value;
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    if (startVal && todayStr < startVal) {
      this.annFormStatus.value = "upcoming";
    } else if (endVal && todayStr > endVal) {
      this.annFormStatus.value = "stopped";
    } else if (startVal || endVal) {
      this.annFormStatus.value = "active";
    }
  }

  // Tự động kiểm tra và chuyển trạng thái thông báo theo ngày hiện hành (chạy background khi load/sync)
  autoUpdateAnnouncementsStatusByDate() {
    if (this.isAutoUpdatingStatus) return false;
    this.isAutoUpdatingStatus = true;

    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    let hasChanged = false;
    const toSave = [];

    this.announcements.forEach(ann => {
      let computedStatus = ann.status;

      if (ann.startDate && todayStr < ann.startDate) {
        // Chưa đến ngày bắt đầu -> Chuyển thành Sắp chạy
        computedStatus = "upcoming";
      } else if (ann.endDate && todayStr > ann.endDate) {
        // Đã qua ngày kết thúc -> Chuyển thành Đã ngừng
        computedStatus = "stopped";
      } else if (ann.startDate || ann.endDate) {
        // Đang trong thời hạn hiệu lực -> Nếu đang là Sắp chạy thì tự chuyển thành Đang chạy
        if (ann.status === "upcoming") {
          computedStatus = "active";
        }
      }

      if (computedStatus !== ann.status) {
        ann.status = computedStatus;
        toSave.push(ann);
        hasChanged = true;
      }
    });

    if (hasChanged) {
      // Lưu tất cả các thay đổi đồng bộ để tránh đè lấp vòng lặp
      toSave.forEach(ann => {
        window.storageManager.saveAnnouncement(ann);
      });
    }

    this.isAutoUpdatingStatus = false;
    return hasChanged;
  }

  async saveAnnouncementSubmit() {
    const id = this.formAnnId.value || `ann-${Date.now()}`;
    const isNew = !this.formAnnId.value;

    const title = this.annFormTitle.value.trim();
    const category = this.annFormCategory.value.trim();
    const status = this.annFormStatus.value;
    const startDate = this.annFormStartDate.value;
    const endDate = this.annFormEndDate.value;
    const author = this.annFormAuthor.value.trim();
    const content = this.annFormContent.value.trim();

    if (!title || !category || !content) {
      alert("Vui lòng nhập đầy đủ Tiêu đề, Bộ phận và Nội dung thông báo.");
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }

    const oldAnn = !isNew ? this.announcements.find(a => a.id === id) : null;

    const annData = {
      id,
      title,
      category,
      status,
      startDate: startDate || null,
      endDate: endDate || null,
      author: author || "Admin",
      content,
      createdAt: isNew ? new Date().toISOString() : (oldAnn?.createdAt || new Date().toISOString()),
      updatedAt: new Date().toISOString()
    };

    await window.storageManager.saveAnnouncement(annData);

    this.closeAnnEditorModal();
    this.showToast(isNew ? `Đã đăng thông báo "${title}" thành công.` : `Đã cập nhật thông báo "${title}" thành công.`);

    if (this.activeAnnouncementId === id) {
      this.openAnnDetailsPanel(id);
    }
  }

  // --- QUẢN LÝ THÀNH VIÊN VÀ PHÂN QUYỀN TRUY CẬP (LOGIN SESSION & ACCOUNT ROLES) ---

  getCurrentUser() {
    const userId = localStorage.getItem("sop_current_user_id");
    if (!userId) {
      return { name: "Khách", role: "viewer" };
    }
    const user = this.accounts.find(a => a.id === userId);
    return user || { name: "Khách", role: "viewer" };
  }

  checkLoginSession() {
    const userId = localStorage.getItem("sop_current_user_id");
    if (!userId) {
      if (this.loginOverlay) this.loginOverlay.style.display = "flex";
      return;
    }

    const user = this.accounts.find(a => a.id === userId);
    if (!user || user.status === "locked") {
      this.logoutUser();
      return;
    }

    if (this.loginOverlay) this.loginOverlay.style.display = "none";
    this.applyRolePermissions();
  }

  logoutUser() {
    localStorage.removeItem("sop_current_user_id");
    this.selectedLoginAccountId = null;
    if (this.loginPasscodeInput) this.loginPasscodeInput.value = "";
    if (this.loginPasscodePanel) this.loginPasscodePanel.style.display = "none";
    
    this.closeProfileModal();
    this.closeAccountsModal();
    
    if (this.loginOverlay) this.loginOverlay.style.display = "flex";
    this.renderLoginOverlay();
  }

  // Render danh sách tài khoản ở màn hình Đăng nhập (Login Overlay)
  renderLoginOverlay() {
    if (!this.loginAccountList) return;
    this.loginAccountList.innerHTML = "";

    // Lọc ra các tài khoản đang hoạt động (active)
    const activeAccounts = this.accounts.filter(a => a.status === "active");

    if (activeAccounts.length === 0) {
      this.loginAccountList.innerHTML = `
        <p style="font-size:13px; color:var(--priority-high); text-align:center; padding:10px;">
          Chưa có tài khoản nào hoạt động. Vui lòng liên hệ Admin.
        </p>
      `;
      return;
    }

    activeAccounts.forEach(acc => {
      const btn = document.createElement("button");
      btn.style.cssText = "display:flex; align-items:center; gap:12px; padding:12px 16px; border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-primary); border-radius:var(--border-radius); cursor:pointer; width:100%; transition:all 0.2s ease; text-align:left;";
      
      const roleNames = { admin: "Admin", editor: "Editor", viewer: "Viewer" };
      const roleName = roleNames[acc.role] || "Viewer";
      const parts = acc.name.split(" ");
      const initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]) : acc.name.slice(0, 2);

      btn.innerHTML = `
        <div style="width:32px; height:32px; background:var(--primary); color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; flex-shrink:0;">
          ${initials.toUpperCase()}
        </div>
        <div style="display:flex; flex-direction:column; overflow:hidden; flex-grow:1;">
          <span style="font-weight:600; font-size:13px;">${acc.name}</span>
          <span style="font-size:11px; color:var(--text-muted);">${roleName} ${acc.passcode ? "• (Yêu cầu PIN)" : ""}</span>
        </div>
        <i data-lucide="log-in" style="width:16px; height:16px; color:var(--text-muted); flex-shrink:0;"></i>
      `;

      // Hover effect
      btn.addEventListener("mouseover", () => {
        btn.style.borderColor = "var(--primary)";
        btn.style.backgroundColor = "var(--primary-light)";
      });
      btn.addEventListener("mouseout", () => {
        btn.style.borderColor = "var(--border-color)";
        btn.style.backgroundColor = "var(--bg-card)";
      });

      btn.addEventListener("click", () => this.selectLoginAccount(acc.id));
      this.loginAccountList.appendChild(btn);
    });

    lucide.createIcons();
  }

  selectLoginAccount(accountId) {
    const acc = this.accounts.find(a => a.id === accountId);
    if (!acc) return;

    this.selectedLoginAccountId = accountId;

    if (acc.passcode) {
      // Yêu cầu nhập Passcode PIN
      if (this.selectedLoginName) this.selectedLoginName.textContent = acc.name;
      if (this.loginPasscodeInput) this.loginPasscodeInput.value = "";
      if (this.loginPasscodePanel) this.loginPasscodePanel.style.display = "flex";
      if (this.loginPasscodeInput) this.loginPasscodeInput.focus();
    } else {
      // Không cần mật mã -> Vào trực tiếp
      this.loginSuccess(accountId);
    }
  }

  cancelPasscodePanel() {
    this.selectedLoginAccountId = null;
    if (this.loginPasscodePanel) this.loginPasscodePanel.style.display = "none";
    if (this.loginPasscodeInput) this.loginPasscodeInput.value = "";
  }

  submitPasscode() {
    if (!this.selectedLoginAccountId) return;
    const acc = this.accounts.find(a => a.id === this.selectedLoginAccountId);
    if (!acc) return;

    const entered = this.loginPasscodeInput.value;
    if (entered === acc.passcode) {
      this.loginSuccess(this.selectedLoginAccountId);
    } else {
      alert("Mật mã PIN nhập vào không chính xác. Vui lòng thử lại!");
      if (this.loginPasscodeInput) {
        this.loginPasscodeInput.value = "";
        this.loginPasscodeInput.focus();
      }
    }
  }

  loginSuccess(accountId) {
    localStorage.setItem("sop_current_user_id", accountId);
    if (this.loginOverlay) this.loginOverlay.style.display = "none";
    if (this.loginPasscodePanel) this.loginPasscodePanel.style.display = "none";
    if (this.loginPasscodeInput) this.loginPasscodeInput.value = "";
    this.selectedLoginAccountId = null;

    const user = this.getCurrentUser();
    this.showToast(`Chào mừng "${user.name}" đăng nhập thành công.`);
    
    this.applyRolePermissions();
    this.renderAll();
  }

  // --- HÀM ĐỊNH DẠNG CHỮ GIÀU (BOLD/ITALIC/UNDERLINE/STRIKETHROUGH) ---
  formatRichText(text) {
    if (!text) return "";
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // In đậm: **text**
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Gạch chân: __text__
    escaped = escaped.replace(/__(.*?)__/g, "<u>$1</u>");

    // In nghiêng: *text* hoặc _text_
    escaped = escaped.replace(/\*(.*?)\*/g, "<em>$1</em>");
    escaped = escaped.replace(/_(.*?)_/g, "<em>$1</em>");

    // Gạch ngang: ~~text~~
    escaped = escaped.replace(/~~(.*?)~~/g, "<s>$1</s>");

    return escaped;
  }

  // --- THANH CÔNG CỤ SOẠN THẢO VĂN BẢN (TEXT FORMATTING UTILS) ---
  formatTextareaSelection(textarea, type) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    let prefix = "";
    let suffix = "";
    let placeholder = "";
    
    switch (type) {
      case "bold":
        prefix = "**";
        suffix = "**";
        placeholder = "Chữ in đậm";
        break;
      case "italic":
        prefix = "*";
        suffix = "*";
        placeholder = "Chữ in nghiêng";
        break;
      case "underline":
        prefix = "__";
        suffix = "__";
        placeholder = "Chữ gạch chân";
        break;
      case "strikethrough":
        prefix = "~~";
        suffix = "~~";
        placeholder = "Chữ gạch ngang";
        break;
    }
    
    const replacement = selectedText ? (prefix + selectedText + suffix) : (prefix + placeholder + suffix);
    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    
    textarea.focus();
    if (selectedText) {
      textarea.setSelectionRange(start, start + replacement.length);
    } else {
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + placeholder.length);
    }
    
    textarea.dispatchEvent(new Event("input"));
  }

  attachFormattingToolbar(textarea) {
    if (!textarea || textarea.previousElementSibling?.classList.contains("formatting-toolbar")) return;
    
    const toolbar = document.createElement("div");
    toolbar.className = "formatting-toolbar";
    
    const buttons = [
      { label: "B", type: "bold", style: "font-weight: bold;", title: "In đậm (Bold)" },
      { label: "I", type: "italic", style: "font-style: italic; font-family: Georgia, serif;", title: "In nghiêng (Italic)" },
      { label: "U", type: "underline", style: "text-decoration: underline;", title: "Gạch chân (Underline)" },
      { label: "S", type: "strikethrough", style: "text-decoration: line-through;", title: "Gạch ngang (Strikethrough)" }
    ];
    
    buttons.forEach(btnInfo => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "formatting-btn";
      btn.style.cssText = btnInfo.style;
      btn.textContent = btnInfo.label;
      btn.title = btnInfo.title;
      
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.formatTextareaSelection(textarea, btnInfo.type);
      });
      
      toolbar.appendChild(btn);
    });
    
    textarea.classList.add("textarea-with-toolbar");
    textarea.parentNode.insertBefore(toolbar, textarea);
  }

  // --- POPUP ĐỔI TÊN HỒ SƠ CỦA BẠN (PROFILE DETAILS MODAL) ---
  openProfileModal(mandatory = false) {
    if (!this.profileModal) return;
    
    const user = this.getCurrentUser();
    this.profileNameInput.value = user.name;
    this.profileRoleSelect.value = user.role;
    this.profilePasscodeInput.value = user.passcode || "";
    
    // Khóa trường Role trong modal này vì chỉ có Admin mới có quyền đổi quyền của user
    this.profileRoleSelect.disabled = true;

    if (mandatory) {
      this.btnCloseProfileModal.style.display = "none";
      document.getElementById("profile-modal-title").textContent = "Chào mừng đến với CX Droppii Portal";
    } else {
      this.btnCloseProfileModal.style.display = "inline-flex";
      document.getElementById("profile-modal-title").textContent = "Thông tin Tài khoản CX";
    }

    this.profileModal.classList.add("active");
  }

  closeProfileModal() {
    if (this.profileModal) {
      this.profileModal.classList.remove("active");
    }
  }

  async saveProfileSubmit(e) {
    e.preventDefault();
    const name = this.profileNameInput.value.trim();
    const passcode = this.profilePasscodeInput.value.trim();
    if (!name) {
      alert("Vui lòng nhập Họ và Tên của bạn.");
      return;
    }

    const currentUser = this.getCurrentUser();

    // Ràng buộc bảo mật: Tất cả các tài khoản bắt buộc phải có mật khẩu
    if (!passcode) {
      alert("Vì mục đích bảo mật, tất cả các tài khoản bắt buộc phải có mật khẩu.");
      return;
    }

    currentUser.name = name;
    currentUser.passcode = passcode;

    await window.storageManager.saveAccount(currentUser);
    this.closeProfileModal();
    this.applyRolePermissions();
    this.showToast(`Đã cập nhật thông tin tài khoản thành công.`);
    
    this.renderAll();
  }

  applyRolePermissions() {
    const user = this.getCurrentUser();

    // 1. Cập nhật Widget hiển thị ở Sidebar
    if (this.userProfileName) this.userProfileName.textContent = user.name;
    if (this.userProfileRole) {
      const roleNames = { admin: "Quản trị viên", editor: "Biên tập viên", viewer: "Thành viên" };
      this.userProfileRole.textContent = `Vai trò: ${roleNames[user.role] || "Thành viên"}`;
    }
    if (this.userAvatarLbl) {
      const parts = user.name.split(" ");
      const initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]) : user.name.slice(0, 2);
      this.userAvatarLbl.textContent = initials.toUpperCase();
    }

    // 2. Cấu hình hiển thị nút thao tác theo vai trò tài khoản
    const isAdmin = user.role === "admin";
    const isEditor = user.role === "editor";
    const isViewer = user.role === "viewer";

    // Nút Thêm mới quy trình / thông báo
    if (this.btnCreateProcess) {
      this.btnCreateProcess.style.display = isViewer ? "none" : "inline-flex";
    }

    // Nút Sửa danh mục (settings)
    if (this.btnManageCategories) {
      this.btnManageCategories.style.display = isAdmin ? "inline-flex" : "none";
    }

    // Nút Sửa/Xóa trong panel xem chi tiết quy trình/thông báo
    if (this.btnEditProcess) {
      this.btnEditProcess.style.display = isViewer ? "none" : "inline-flex";
    }
    if (this.btnDeleteProcess) {
      this.btnDeleteProcess.style.display = isAdmin ? "inline-flex" : "none";
    }

    // Nút chuyển tới popup quản lý User trong Profile (Chỉ Admin)
    if (this.btnManageAccountsTrigger) {
      this.btnManageAccountsTrigger.style.display = isAdmin ? "inline-flex" : "none";
    }

    // Các tính năng quản trị cao cấp (Sao lưu, Nhập, Đồng bộ Firebase)
    const btnExportBackup = document.getElementById("btn-export-backup");
    const btnTriggerImport = document.getElementById("btn-trigger-import");
    const btnOpenSync = document.getElementById("btn-open-sync");

    if (btnExportBackup) btnExportBackup.style.display = isAdmin ? "inline-flex" : "none";
    if (btnTriggerImport) btnTriggerImport.style.display = isAdmin ? "inline-flex" : "none";
    if (btnOpenSync) btnOpenSync.style.display = isAdmin ? "inline-flex" : "none";
  }

  // --- QUẢN LÝ TÀI KHOẢN DÀNH CHO ADMIN (ACCOUNTS MANAGEMENT MODAL) ---

  openAccountsModal() {
    if (!this.accountsModal) return;
    this.hideAccountEditorForm();
    this.renderAccountsTable();
    this.accountsModal.classList.add("active");
  }

  closeAccountsModal() {
    if (this.accountsModal) {
      this.accountsModal.classList.remove("active");
    }
  }

  // Render bảng danh sách tài khoản
  renderAccountsTable() {
    if (!this.accountsTableBody) return;
    this.accountsTableBody.innerHTML = "";

    const currentUser = this.getCurrentUser();

    this.accounts.forEach(acc => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid var(--border-color)";
      
      const roleNames = { admin: "Admin", editor: "Editor", viewer: "Viewer" };
      const roleName = roleNames[acc.role] || "Viewer";
      
      const statusLbl = acc.status === "active" ? "Hoạt động" : "Bị khóa";
      const statusClass = acc.status === "active" ? "status-active" : "status-stopped";

      tr.innerHTML = `
        <td style="padding:10px 12px; font-weight:600; color:var(--text-primary);">${acc.name} ${acc.id === currentUser.id ? " <span style='font-weight:normal; font-size:11px; color:var(--primary);'>(Bạn)</span>" : ""}</td>
        <td style="padding:10px 12px;">${roleName}</td>
        <td style="padding:10px 12px; font-family:monospace; font-weight:bold;">${acc.passcode || "<i style='font-weight:normal;color:var(--text-muted);'>Trống</i>"}</td>
        <td style="padding:10px 12px;"><span class="status-badge ${statusClass}">● ${statusLbl}</span></td>
        <td style="padding:10px 12px; text-align:right; display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn btn-secondary btn-edit-acc" style="padding:4px 8px; font-size:12px;" data-id="${acc.id}">Sửa</button>
          ${acc.id !== currentUser.id ? `
            <button class="btn btn-secondary btn-lock-acc" style="padding:4px 8px; font-size:12px; background-color:${acc.status === "active" ? "var(--priority-high-bg)" : "var(--priority-low-bg)"}; color:${acc.status === "active" ? "var(--priority-high)" : "var(--priority-low)"}; border-color:transparent;" data-id="${acc.id}">
              ${acc.status === "active" ? "Khóa" : "Mở khóa"}
            </button>
            <button class="btn btn-secondary btn-delete-acc" style="padding:4px 8px; font-size:12px; background-color:var(--priority-high); color:#fff; border-color:transparent;" data-id="${acc.id}">Xóa</button>
          ` : ""}
        </td>
      `;

      // Event bindings
      tr.querySelector(".btn-edit-acc").addEventListener("click", () => this.showAccountEditorForm(acc.id));
      
      const lockBtn = tr.querySelector(".btn-lock-acc");
      if (lockBtn) {
        lockBtn.addEventListener("click", () => this.toggleAccountStatus(acc.id));
      }

      const deleteBtn = tr.querySelector(".btn-delete-acc");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => this.deleteAccount(acc.id));
      }

      this.accountsTableBody.appendChild(tr);
    });

    lucide.createIcons();
  }

  showAccountEditorForm(accountId = null) {
    if (!this.accountEditorForm) return;

    if (accountId) {
      // Chỉnh sửa tài khoản hiện có
      const acc = this.accounts.find(a => a.id === accountId);
      if (!acc) return;

      this.editorAccountId.value = acc.id;
      this.editorAccountName.value = acc.name;
      this.editorAccountRole.value = acc.role;
      this.editorAccountPasscode.value = acc.passcode || "";
      this.editorAccountStatus.value = acc.status;

      // Không cho phép tự đổi vai trò/trạng thái của chính mình
      const isSelf = acc.id === this.getCurrentUser().id;
      this.editorAccountRole.disabled = isSelf;
      this.editorAccountStatus.disabled = isSelf;
    } else {
      // Thêm mới tài khoản
      this.editorAccountId.value = "";
      this.editorAccountName.value = "";
      this.editorAccountRole.value = "viewer";
      this.editorAccountPasscode.value = "";
      this.editorAccountStatus.value = "active";
      
      this.editorAccountRole.disabled = false;
      this.editorAccountStatus.disabled = false;
    }

    this.accountEditorForm.style.display = "flex";
  }

  hideAccountEditorForm() {
    if (this.accountEditorForm) {
      this.accountEditorForm.style.display = "none";
      this.accountEditorForm.reset();
    }
  }

  async saveAccountSubmit(e) {
    e.preventDefault();
    
    const id = this.editorAccountId.value || `acc-${Date.now()}`;
    const isNew = !this.editorAccountId.value;
    const name = this.editorAccountName.value.trim();
    const role = this.editorAccountRole.value;
    const passcode = this.editorAccountPasscode.value.trim();
    const status = this.editorAccountStatus.value;

    if (!name) {
      alert("Vui lòng nhập Họ và Tên.");
      return;
    }

    // Ràng buộc bảo mật: Tất cả các tài khoản bắt buộc phải có mật khẩu
    if (!passcode) {
      alert("Vì mục đích bảo mật, tất cả các tài khoản bắt buộc phải có mật khẩu.");
      return;
    }

    const oldAcc = !isNew ? this.accounts.find(a => a.id === id) : null;
    const accData = {
      id,
      name,
      role,
      passcode,
      status,
      createdAt: isNew ? new Date().toISOString() : (oldAcc?.createdAt || new Date().toISOString()),
      updatedAt: new Date().toISOString()
    };

    await window.storageManager.saveAccount(accData);
    this.hideAccountEditorForm();
    this.showToast(isNew ? `Đã tạo tài khoản "${name}" thành công.` : `Đã cập nhật tài khoản "${name}".`);
    this.renderAccountsTable();
  }

  async toggleAccountStatus(accountId) {
    const acc = this.accounts.find(a => a.id === accountId);
    if (!acc) return;

    acc.status = acc.status === "active" ? "locked" : "active";
    await window.storageManager.saveAccount(acc);
    this.showToast(`Đã ${acc.status === "active" ? "mở khóa" : "khóa"} tài khoản "${acc.name}".`);
    this.renderAccountsTable();
  }

  async deleteAccount(accountId) {
    const acc = this.accounts.find(a => a.id === accountId);
    if (!acc) return;

    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${acc.name}" không? Hành động này không thể hoàn tác.`)) {
      const name = acc.name;
      await window.storageManager.deleteAccount(accountId);
      this.showToast(`Đã xóa tài khoản "${name}" thành công.`);
      this.renderAccountsTable();
    }
  }
}

// Khởi chạy ứng dụng khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  window.sopApp = new SopApp();
});

