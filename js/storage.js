/**
 * Module quản lý lưu trữ (LocalStorage & Firebase Sync)
 */

class StorageManager {
  constructor() {
    this.localProcessesKey = "sop_processes";
    this.localCategoriesKey = "sop_categories";
    this.localAnnouncementsKey = "sop_announcements";
    this.localAccountsKey = "sop_accounts";
    this.firebaseConfigKey = "sop_firebase_config";
    this.db = null;
    this.isFirebaseActive = false;
    this.onDataChangeCallback = null;
    
    // Firestore Unsubscribe handlers
    this.firebaseUnsubscribeProcesses = null;
    this.firebaseUnsubscribeCategories = null;
    this.firebaseUnsubscribeAnnouncements = null;
    this.firebaseUnsubscribeAccounts = null;

    // Thử khởi tạo Firebase nếu cấu hình đã có sẵn
    const savedConfig = this.getFirebaseConfig();
    if (savedConfig) {
      this.initFirebase(savedConfig);
    }
  }

  // Khởi tạo Firebase với cấu hình cung cấp
  initFirebase(config) {
    try {
      if (!window.firebase) {
        console.warn("Thư viện Firebase chưa được tải.");
        this.isFirebaseActive = false;
        return false;
      }
      
      // Kiểm tra xem đã khởi tạo app chưa
      if (window.firebase.apps.length === 0) {
        window.firebase.initializeApp(config);
      }
      
      this.db = window.firebase.firestore();
      
      // Bật chế độ offline persistence của Firebase để chạy mượt mà ngay cả khi mất mạng
      this.db.enablePersistence().catch((err) => {
        if (err.code == 'failed-precondition') {
          console.warn("Chỉ hỗ trợ offline persistence ở một tab tại một thời điểm.");
        } else if (err.code == 'unimplemented') {
          console.warn("Trình duyệt không hỗ trợ offline persistence.");
        }
      });

      this.isFirebaseActive = true;
      console.log("Đã kết nối cơ sở dữ liệu đám mây Firebase thành công.");
      return true;
    } catch (error) {
      console.error("Lỗi khi kết nối Firebase:", error);
      this.isFirebaseActive = false;
      return false;
    }
  }

  // Lấy cấu hình Firebase đã lưu
  getFirebaseConfig() {
    const configStr = localStorage.getItem(this.firebaseConfigKey);
    return configStr ? JSON.parse(configStr) : null;
  }

  // Lưu cấu hình Firebase và kết nối
  saveFirebaseConfig(config) {
    localStorage.setItem(this.firebaseConfigKey, JSON.stringify(config));
    const success = this.initFirebase(config);
    if (success) {
      // Khi kết nối thành công, đồng bộ dữ liệu local lên cloud (nếu cloud trống)
      this.syncLocalToCloud();
    }
    return success;
  }

  // Hủy kết nối Firebase và chuyển về chế độ offline
  clearFirebaseConfig() {
    localStorage.removeItem(this.firebaseConfigKey);
    this.isFirebaseActive = false;
    this.db = null;
    
    // Hủy đăng ký lắng nghe Firestore
    if (this.firebaseUnsubscribeProcesses) this.firebaseUnsubscribeProcesses();
    if (this.firebaseUnsubscribeCategories) this.firebaseUnsubscribeCategories();
    if (this.firebaseUnsubscribeAnnouncements) this.firebaseUnsubscribeAnnouncements();
    if (this.firebaseUnsubscribeAccounts) this.firebaseUnsubscribeAccounts();
    
    console.log("Đã chuyển về chế độ lưu trữ Local.");
    if (this.onDataChangeCallback) {
      this.onDataChangeCallback(
        this.getLocalProcesses(), 
        this.getLocalCategories(), 
        this.getLocalAnnouncements(),
        this.getLocalAccounts()
      );
    }
  }

  // Đồng bộ dữ liệu local hiện tại lên Cloud Firestore (chỉ chạy một lần khi cấu hình mới)
  async syncLocalToCloud() {
    if (!this.isFirebaseActive || !this.db) return;

    try {
      const localProcesses = this.getLocalProcesses();
      const localCategories = this.getLocalCategories();
      const localAnnouncements = this.getLocalAnnouncements();
      const localAccounts = this.getLocalAccounts();

      // 1. Đồng bộ Processes
      const procSnap = await this.db.collection("processes").limit(1).get();
      if (procSnap.empty && localProcesses.length > 0) {
        console.log("Đang đồng bộ quy trình từ Local lên Firebase...");
        const batch = this.db.batch();
        localProcesses.forEach(proc => {
          const docRef = this.db.collection("processes").doc(proc.id);
          batch.set(docRef, proc);
        });
        await batch.commit();
      }

      // 2. Đồng bộ Categories
      const catSnap = await this.db.collection("categories").doc("list").get();
      if (!catSnap.exists && localCategories.length > 0) {
        console.log("Đang đồng bộ danh mục từ Local lên Firebase...");
        await this.db.collection("categories").doc("list").set({ names: localCategories });
      }

      // 3. Đồng bộ Announcements
      const annSnap = await this.db.collection("announcements").limit(1).get();
      if (annSnap.empty && localAnnouncements.length > 0) {
        console.log("Đang đồng bộ thông báo từ Local lên Firebase...");
        const batch = this.db.batch();
        localAnnouncements.forEach(ann => {
          const docRef = this.db.collection("announcements").doc(ann.id);
          batch.set(docRef, ann);
        });
        await batch.commit();
      }

      // 4. Đồng bộ Accounts
      const accSnap = await this.db.collection("accounts").limit(1).get();
      if (accSnap.empty && localAccounts.length > 0) {
        console.log("Đang đồng bộ tài khoản từ Local lên Firebase...");
        const batch = this.db.batch();
        localAccounts.forEach(acc => {
          const docRef = this.db.collection("accounts").doc(acc.id);
          batch.set(docRef, acc);
        });
        await batch.commit();
      }

      console.log("Đồng bộ hoàn tất.");
    } catch (e) {
      console.error("Lỗi khi đồng bộ dữ liệu lên Firebase:", e);
    }
  }

  // Thiết lập hàm callback khi dữ liệu thay đổi
  subscribe(callback) {
    this.onDataChangeCallback = callback;
    this.listenToData();
  }

  // Bắt đầu lắng nghe thay đổi dữ liệu (từ Local hoặc Firebase)
  listenToData() {
    if (this.isFirebaseActive && this.db) {
      // Hủy lắng nghe cũ nếu có
      if (this.firebaseUnsubscribeProcesses) this.firebaseUnsubscribeProcesses();
      if (this.firebaseUnsubscribeCategories) this.firebaseUnsubscribeCategories();
      if (this.firebaseUnsubscribeAnnouncements) this.firebaseUnsubscribeAnnouncements();
      if (this.firebaseUnsubscribeAccounts) this.firebaseUnsubscribeAccounts();

      // Lắng nghe Processes từ Firebase
      this.firebaseUnsubscribeProcesses = this.db.collection("processes")
        .onSnapshot((snapshot) => {
          const processes = [];
          snapshot.forEach((doc) => {
            processes.push(doc.data());
          });
          localStorage.setItem(this.localProcessesKey, JSON.stringify(processes));
          if (this.onDataChangeCallback) {
            this.onDataChangeCallback(processes, this.getCategoriesSync(), this.getAnnouncementsSync(), this.getAccountsSync());
          }
        }, (error) => {
          console.error("Lỗi lắng nghe Processes từ Firebase:", error);
          this.fallbackToLocal();
        });

      // Lắng nghe Categories từ Firebase
      this.firebaseUnsubscribeCategories = this.db.collection("categories").doc("list")
        .onSnapshot((doc) => {
          let categories = [];
          if (doc.exists && doc.data().names) {
            categories = doc.data().names;
          } else {
            categories = window.defaultCategories || [];
          }
          localStorage.setItem(this.localCategoriesKey, JSON.stringify(categories));
          if (this.onDataChangeCallback) {
            this.onDataChangeCallback(this.getProcessesSync(), categories, this.getAnnouncementsSync(), this.getAccountsSync());
          }
        }, (error) => {
          console.error("Lỗi lắng nghe Categories từ Firebase:", error);
        });

      // Lắng nghe Announcements từ Firebase
      this.firebaseUnsubscribeAnnouncements = this.db.collection("announcements")
        .onSnapshot((snapshot) => {
          const announcements = [];
          snapshot.forEach((doc) => {
            announcements.push(doc.data());
          });
          localStorage.setItem(this.localAnnouncementsKey, JSON.stringify(announcements));
          if (this.onDataChangeCallback) {
            this.onDataChangeCallback(this.getProcessesSync(), this.getCategoriesSync(), announcements, this.getAccountsSync());
          }
        }, (error) => {
          console.error("Lỗi lắng nghe Announcements từ Firebase:", error);
        });

      // Lắng nghe Accounts từ Firebase
      this.firebaseUnsubscribeAccounts = this.db.collection("accounts")
        .onSnapshot((snapshot) => {
          const accounts = [];
          snapshot.forEach((doc) => {
            accounts.push(doc.data());
          });
          
          // Tự động khôi phục nếu Cloud trống nhằm tránh race-condition lockout
          if (accounts.length === 0) {
            console.warn("Nhận snapshot accounts rỗng từ Firebase. Kích hoạt đồng bộ ngược từ Local.");
            this.syncLocalToCloud();
            return;
          }
          
          localStorage.setItem(this.localAccountsKey, JSON.stringify(accounts));
          if (this.onDataChangeCallback) {
            this.onDataChangeCallback(this.getProcessesSync(), this.getCategoriesSync(), this.getAnnouncementsSync(), accounts);
          }
        }, (error) => {
          console.error("Lỗi lắng nghe Accounts từ Firebase:", error);
        });

    } else {
      // Chế độ Local
      console.log("Đang lắng nghe dữ liệu từ LocalStorage.");
      if (this.onDataChangeCallback) {
        this.onDataChangeCallback(
          this.getLocalProcesses(), 
          this.getLocalCategories(), 
          this.getLocalAnnouncements(),
          this.getLocalAccounts()
        );
      }
    }
  }

  // Lấy dữ liệu đồng bộ
  getProcessesSync() {
    return this.getLocalProcesses();
  }

  getCategoriesSync() {
    return this.getLocalCategories();
  }

  getAnnouncementsSync() {
    return this.getLocalAnnouncements();
  }

  getAccountsSync() {
    return this.getLocalAccounts();
  }

  // Fallback về dữ liệu local khi có lỗi mạng kéo dài
  fallbackToLocal() {
    console.warn("Hệ thống tự động sử dụng dữ liệu Local offline.");
    if (this.onDataChangeCallback) {
      this.onDataChangeCallback(
        this.getLocalProcesses(), 
        this.getLocalCategories(), 
        this.getLocalAnnouncements(),
        this.getLocalAccounts()
      );
    }
  }

  // --- CRUD CHO PROCESSES (QUY TRÌNH) ---

  getLocalProcesses() {
    const data = localStorage.getItem(this.localProcessesKey);
    if (!data) {
      const defaults = window.defaultProcesses || [];
      localStorage.setItem(this.localProcessesKey, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(data);
  }

  async saveProcess(process) {
    process.updatedAt = new Date().toISOString();
    
    if (this.isFirebaseActive && this.db) {
      try {
        await this.db.collection("processes").doc(process.id).set(process);
        console.log("Đã lưu quy trình lên đám mây:", process.title);
      } catch (e) {
        console.error("Lỗi khi lưu lên Firebase, lưu tạm ở Local:", e);
        this.saveProcessLocal(process);
      }
    } else {
      this.saveProcessLocal(process);
    }
  }

  saveProcessLocal(process) {
    const list = this.getLocalProcesses();
    const index = list.findIndex(p => p.id === process.id);
    if (index > -1) {
      list[index] = process;
    } else {
      list.push(process);
    }
    localStorage.setItem(this.localProcessesKey, JSON.stringify(list));
    console.log("Đã lưu quy trình vào Local:", process.title);
    
    if (this.onDataChangeCallback) {
      this.onDataChangeCallback(list, this.getLocalCategories(), this.getLocalAnnouncements(), this.getLocalAccounts());
    }
  }

  async deleteProcess(id) {
    if (this.isFirebaseActive && this.db) {
      try {
        await this.db.collection("processes").doc(id).delete();
        console.log("Đã xóa quy trình trên đám mây:", id);
      } catch (e) {
        console.error("Lỗi khi xóa trên Firebase, xóa ở Local:", e);
        this.deleteProcessLocal(id);
      }
    } else {
      this.deleteProcessLocal(id);
    }
  }

  deleteProcessLocal(id) {
    let list = this.getLocalProcesses();
    list = list.filter(p => p.id !== id);
    localStorage.setItem(this.localProcessesKey, JSON.stringify(list));
    console.log("Đã xóa quy trình ở Local:", id);

    if (this.onDataChangeCallback) {
      this.onDataChangeCallback(list, this.getLocalCategories(), this.getLocalAnnouncements(), this.getLocalAccounts());
    }
  }

  // --- CRUD CHO ANNOUNCEMENTS (THÔNG TIN VẬN HÀNH) ---

  getLocalAnnouncements() {
    const data = localStorage.getItem(this.localAnnouncementsKey);
    if (!data) {
      const defaults = window.defaultAnnouncements || [];
      localStorage.setItem(this.localAnnouncementsKey, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(data);
  }

  async saveAnnouncement(announcement) {
    announcement.updatedAt = new Date().toISOString();

    if (this.isFirebaseActive && this.db) {
      try {
        await this.db.collection("announcements").doc(announcement.id).set(announcement);
        console.log("Đã lưu thông báo lên đám mây:", announcement.title);
      } catch (e) {
        console.error("Lỗi khi lưu thông báo lên Firebase:", e);
        this.saveAnnouncementLocal(announcement);
      }
    } else {
      this.saveAnnouncementLocal(announcement);
    }
  }

  saveAnnouncementLocal(announcement) {
    const list = this.getLocalAnnouncements();
    const index = list.findIndex(a => a.id === announcement.id);
    if (index > -1) {
      list[index] = announcement;
    } else {
      list.push(announcement);
    }
    localStorage.setItem(this.localAnnouncementsKey, JSON.stringify(list));
    console.log("Đã lưu thông báo vào Local:", announcement.title);

    if (this.onDataChangeCallback) {
      this.onDataChangeCallback(this.getLocalProcesses(), this.getLocalCategories(), list, this.getLocalAccounts());
    }
  }

  async deleteAnnouncement(id) {
    if (this.isFirebaseActive && this.db) {
      try {
        await this.db.collection("announcements").doc(id).delete();
        console.log("Đã xóa thông báo trên đám mây:", id);
      } catch (e) {
        console.error("Lỗi khi xóa thông báo trên Firebase:", e);
        this.deleteAnnouncementLocal(id);
      }
    } else {
      this.deleteAnnouncementLocal(id);
    }
  }

  deleteAnnouncementLocal(id) {
    let list = this.getLocalAnnouncements();
    list = list.filter(a => a.id !== id);
    localStorage.setItem(this.localAnnouncementsKey, JSON.stringify(list));
    console.log("Đã xóa thông báo ở Local:", id);

    if (this.onDataChangeCallback) {
      this.onDataChangeCallback(this.getLocalProcesses(), this.getLocalCategories(), list, this.getLocalAccounts());
    }
  }

  // --- CRUD CHO CATEGORIES (DANH MỤC) ---

  getLocalCategories() {
    const data = localStorage.getItem(this.localCategoriesKey);
    if (!data) {
      const defaults = window.defaultCategories || [];
      localStorage.setItem(this.localCategoriesKey, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(data);
  }

  async saveCategories(categories) {
    if (this.isFirebaseActive && this.db) {
      try {
        await this.db.collection("categories").doc("list").set({ names: categories });
        console.log("Đã lưu danh sách danh mục lên đám mây.");
      } catch (e) {
        console.error("Lỗi khi lưu danh mục lên Firebase, lưu ở Local:", e);
        this.saveCategoriesLocal(categories);
      }
    } else {
      this.saveCategoriesLocal(categories);
    }
  }

  saveCategoriesLocal(categories) {
    localStorage.setItem(this.localCategoriesKey, JSON.stringify(categories));
    console.log("Đã lưu danh mục vào Local.");

    if (this.onDataChangeCallback) {
      this.onDataChangeCallback(this.getLocalProcesses(), categories, this.getLocalAnnouncements(), this.getLocalAccounts());
    }
  }

  // --- IMPORT & EXPORT FILE JSON ---

  exportData() {
    const data = {
      version: "1.1",
      exportDate: new Date().toISOString(),
      categories: this.getLocalCategories(),
      processes: this.getLocalProcesses(),
      announcements: this.getLocalAnnouncements(),
      accounts: this.getLocalAccounts()
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.categories || !parsed.processes) {
        throw new Error("Định dạng file sao lưu không hợp lệ. Phải chứa danh mục và quy trình.");
      }

      const announcements = parsed.announcements || [];
      const accounts = parsed.accounts || [];

      // Lưu đè dữ liệu local
      localStorage.setItem(this.localCategoriesKey, JSON.stringify(parsed.categories));
      localStorage.setItem(this.localProcessesKey, JSON.stringify(parsed.processes));
      localStorage.setItem(this.localAnnouncementsKey, JSON.stringify(announcements));
      localStorage.setItem(this.localAccountsKey, JSON.stringify(accounts));

      console.log("Đã nhập dữ liệu thành công từ file backup.");

      // Nếu đang kết nối Firebase, đẩy thẳng tất cả lên Firebase
      if (this.isFirebaseActive && this.db) {
        console.log("Đang tải dữ liệu import lên đám mây...");
        
        // Cập nhật danh mục
        await this.db.collection("categories").doc("list").set({ names: parsed.categories });
        
        // Cập nhật từng quy trình
        let batch = this.db.batch();
        parsed.processes.forEach(proc => {
          const docRef = this.db.collection("processes").doc(proc.id);
          batch.set(docRef, proc);
        });
        await batch.commit();

        // Cập nhật từng thông báo
        if (announcements.length > 0) {
          batch = this.db.batch();
          announcements.forEach(ann => {
            const docRef = this.db.collection("announcements").doc(ann.id);
            batch.set(docRef, ann);
          });
          await batch.commit();
        }

        // Cập nhật từng tài khoản
        if (accounts.length > 0) {
          batch = this.db.batch();
          accounts.forEach(acc => {
            const docRef = this.db.collection("accounts").doc(acc.id);
            batch.set(docRef, acc);
          });
          await batch.commit();
        }
        
        console.log("Đã đồng bộ dữ liệu import lên Firebase.");
      } else {
        // Tự kích hoạt cập nhật nếu ở chế độ local
        if (this.onDataChangeCallback) {
          this.onDataChangeCallback(parsed.processes, parsed.categories, announcements, accounts);
        }
      }
      return { success: true };
    } catch (e) {
      console.error("Lỗi khi import dữ liệu:", e);
      return { success: false, error: e.message };
    }
  }

  // --- CRUD CHO ACCOUNTS (TÀI KHOẢN & PHÂN QUYỀN) ---

  getLocalAccounts() {
    const data = localStorage.getItem(this.localAccountsKey);
    if (!data) {
      const defaults = window.defaultAccounts || [];
      localStorage.setItem(this.localAccountsKey, JSON.stringify(defaults));
      return defaults;
    }
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const defaults = window.defaultAccounts || [];
        localStorage.setItem(this.localAccountsKey, JSON.stringify(defaults));
        return defaults;
      }
      return parsed;
    } catch (e) {
      const defaults = window.defaultAccounts || [];
      localStorage.setItem(this.localAccountsKey, JSON.stringify(defaults));
      return defaults;
    }
  }

  async saveAccount(account) {
    account.updatedAt = new Date().toISOString();

    if (this.isFirebaseActive && this.db) {
      try {
        await this.db.collection("accounts").doc(account.id).set(account);
        console.log("Đã lưu tài khoản lên đám mây:", account.name);
      } catch (e) {
        console.error("Lỗi khi lưu tài khoản lên Firebase:", e);
        this.saveAccountLocal(account);
      }
    } else {
      this.saveAccountLocal(account);
    }
  }

  saveAccountLocal(account) {
    const list = this.getLocalAccounts();
    const index = list.findIndex(a => a.id === account.id);
    if (index > -1) {
      list[index] = account;
    } else {
      list.push(account);
    }
    localStorage.setItem(this.localAccountsKey, JSON.stringify(list));
    console.log("Đã lưu tài khoản vào Local:", account.name);

    if (this.onDataChangeCallback) {
      this.onDataChangeCallback(
        this.getLocalProcesses(), 
        this.getLocalCategories(), 
        this.getLocalAnnouncements(),
        list
      );
    }
  }

  async deleteAccount(id) {
    if (this.isFirebaseActive && this.db) {
      try {
        await this.db.collection("accounts").doc(id).delete();
        console.log("Đã xóa tài khoản trên đám mây:", id);
      } catch (e) {
        console.error("Lỗi khi xóa tài khoản trên Firebase:", e);
        this.deleteAccountLocal(id);
      }
    } else {
      this.deleteAccountLocal(id);
    }
  }

  deleteAccountLocal(id) {
    let list = this.getLocalAccounts();
    list = list.filter(a => a.id !== id);
    localStorage.setItem(this.localAccountsKey, JSON.stringify(list));
    console.log("Đã xóa tài khoản ở Local:", id);

    if (this.onDataChangeCallback) {
      this.onDataChangeCallback(
        this.getLocalProcesses(), 
        this.getLocalCategories(), 
        this.getLocalAnnouncements(),
        list
      );
    }
  }
}

// Khởi tạo đối tượng toàn cục
window.storageManager = new StorageManager();
