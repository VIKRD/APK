import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

/*
  ============================================================
  GROCERY MISSION
  Offline-first Grocery List (Fixed Version)
  ============================================================
*/

const LIST_INDEX_KEY = "@grocery/list_ids";
const SETTINGS_KEY = "@grocery/settings";

const DEFAULT_SETTINGS = {
  theme: "spy",
  language: "en",
};

const CATEGORIES = [
  "Vegetables",
  "Fruits",
  "Bakery",
  "Dairy",
  "Meat",
  "Beverages",
  "Household",
  "Pantry",
  "Snacks",
  "Frozen",
];

const CATEGORY_TRANSLATIONS = {
  Vegetables: "Овощи",
  Fruits: "Фрукты",
  Bakery: "Выпечка",
  Dairy: "Молочные продукты",
  Meat: "Мясо",
  Beverages: "Напитки",
  Household: "Бытовое",
  Pantry: "Бакалея",
  Snacks: "Снеки",
  Frozen: "Замороженное",
};

const DEFAULT_ITEMS = [
  { name: "Avocado", category: "Vegetables", unit: "pcs", icon: "leaf-outline" },
  { name: "Broccoli", category: "Vegetables", unit: "g", icon: "nutrition-outline" },
  { name: "Carrot", category: "Vegetables", unit: "g", icon: "ellipse-outline" },
  { name: "Cucumber", category: "Vegetables", unit: "g", icon: "remove-outline" },
  { name: "Garlic", category: "Vegetables", unit: "g", icon: "ellipse-outline" },
  { name: "Lettuce", category: "Vegetables", unit: "g", icon: "leaf-outline" },
  { name: "Onion", category: "Vegetables", unit: "g", icon: "ellipse-outline" },
  { name: "Potato", category: "Vegetables", unit: "g", icon: "ellipse-outline" },
  { name: "Tomato", category: "Vegetables", unit: "g", icon: "ellipse-outline" },
  { name: "Apple", category: "Fruits", unit: "pcs", icon: "nutrition-outline" },
  { name: "Banana", category: "Fruits", unit: "pcs", icon: "remove-outline" },
  { name: "Grapes", category: "Fruits", unit: "g", icon: "ellipsis-horizontal-outline" },
  { name: "Lemon", category: "Fruits", unit: "pcs", icon: "ellipse-outline" },
  { name: "Orange", category: "Fruits", unit: "pcs", icon: "ellipse-outline" },
  { name: "Strawberries", category: "Fruits", unit: "g", icon: "heart-outline" },
  { name: "Bread", category: "Bakery", unit: "pcs", icon: "restaurant-outline" },
  { name: "Baguette", category: "Bakery", unit: "pcs", icon: "restaurant-outline" },
  { name: "Croissant", category: "Bakery", unit: "pcs", icon: "restaurant-outline" },
  { name: "Butter", category: "Dairy", unit: "g", icon: "cube-outline" },
  { name: "Cheese", category: "Dairy", unit: "g", icon: "cube-outline" },
  { name: "Milk", category: "Dairy", unit: "g", icon: "water-outline" },
  { name: "Yogurt", category: "Dairy", unit: "pcs", icon: "nutrition-outline" },
  { name: "Chicken Breast", category: "Meat", unit: "g", icon: "restaurant-outline" },
  { name: "Chicken Thighs", category: "Meat", unit: "g", icon: "restaurant-outline" },
  { name: "Pork", category: "Meat", unit: "g", icon: "restaurant-outline" },
  { name: "Sausages", category: "Meat", unit: "g", icon: "restaurant-outline" },
  { name: "Coffee", category: "Beverages", unit: "g", icon: "cafe-outline" },
  { name: "Juice", category: "Beverages", unit: "pcs", icon: "wine-outline" },
  { name: "Tea", category: "Beverages", unit: "g", icon: "cafe-outline" },
  { name: "Water", category: "Beverages", unit: "pcs", icon: "water-outline" },
  { name: "Dish Soap", category: "Household", unit: "pcs", icon: "water-outline" },
  { name: "Paper Towels", category: "Household", unit: "pcs", icon: "layers-outline" },
  { name: "Toilet Paper", category: "Household", unit: "pcs", icon: "layers-outline" },
  { name: "Trash Bags", category: "Household", unit: "pcs", icon: "trash-outline" },
  { name: "Basmati Rice", category: "Pantry", unit: "g", icon: "grid-outline" },
  { name: "Pasta", category: "Pantry", unit: "g", icon: "restaurant-outline" },
  { name: "Flour", category: "Pantry", unit: "g", icon: "ellipse-outline" },
  { name: "Sugar", category: "Pantry", unit: "g", icon: "cube-outline" },
  { name: "Salt", category: "Pantry", unit: "g", icon: "snow-outline" },
  { name: "Olive Oil", category: "Pantry", unit: "pcs", icon: "water-outline" },
  { name: "Chocolate", category: "Snacks", unit: "pcs", icon: "cube-outline" },
  { name: "Chips", category: "Snacks", unit: "pcs", icon: "fast-food-outline" },
  { name: "Cookies", category: "Snacks", unit: "g", icon: "ellipse-outline" },
  { name: "Frozen Vegetables", category: "Frozen", unit: "g", icon: "snow-outline" },
  { name: "Frozen Berries", category: "Frozen", unit: "g", icon: "snow-outline" },
];

const TEXT = {
  en: {
    lists: "My Lists",
    settings: "Settings",
    noMissions: "No active missions.",
    createMission: "Tap + to create a new grocery list.",
    newMission: "New Mission",
    missionName: "Mission name",
    missionNamePlaceholder: "e.g. Weekly Supply",
    cancel: "Cancel",
    create: "Create",
    editList: "Edit List",
    deleteList: "Delete List",
    deleteConfirm: "Delete this mission permanently?",
    delete: "Delete",
    search: "Search groceries...",
    addCustom: "Add Custom Option",
    next: "Next",
    quantity: "Quantity",
    save: "Save List",
    activeMission: "Active Mission",
    addItems: "Add Items",
    collected: "collected",
    items: "items",
    noSelected: "No items selected.",
    customName: "Item name",
    unit: "Unit",
    category: "Category",
    grams: "Grams",
    kilograms: "Kilograms",
    pieces: "Pieces",
    add: "Add",
    language: "Language",
    theme: "Theme",
    darkAgent: "Agent / Spy",
    slate: "Slate / Grey",
    light: "Light",
    english: "English",
    russian: "Russian",
    close: "Close",
    editMission: "Edit Mission",
    date: "Created",
    itemsCollected: "items collected",
    noResults: "No matches found.",
    addMore: "Add More Items",
    missionUpdated: "Mission updated.",
  },
  ru: {
    lists: "Мои списки",
    settings: "Настройки",
    noMissions: "Активных заданий нет.",
    createMission: "Нажмите +, чтобы создать новый список покупок.",
    newMission: "Новое задание",
    missionName: "Название задания",
    missionNamePlaceholder: "например, Покупки на неделю",
    cancel: "Отмена",
    create: "Создать",
    editList: "Изменить список",
    deleteList: "Удалить список",
    deleteConfirm: "Удалить это задание навсегда?",
    delete: "Удалить",
    search: "Поиск продуктов...",
    addCustom: "Добавить свой вариант",
    next: "Дальше",
    quantity: "Количество",
    save: "Сохранить список",
    activeMission: "Активное задание",
    addItems: "Добавить",
    collected: "собрано",
    items: "товаров",
    noSelected: "Нет выбранных товаров.",
    customName: "Название товара",
    unit: "Единица",
    category: "Категория",
    grams: "Граммы",
    kilograms: "Килограммы",
    pieces: "Штуки",
    add: "Добавить",
    language: "Язык",
    theme: "Тема",
    darkAgent: "Агент / Шпион",
    slate: "Сланец / Серый",
    light: "Светлая",
    english: "English",
    russian: "Русский",
    close: "Закрыть",
    editMission: "Изменить задание",
    date: "Создано",
    itemsCollected: "товаров собрано",
    noResults: "Ничего не найдено.",
    addMore: "Добавить товары",
    missionUpdated: "Задание обновлено.",
  },
};

function uuid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function unitStep(unit) {
  return unit === "pcs" ? 1 : unit === "kg" ? 0.1 : 100;
}

function unitLabel(unit, language) {
  const labels = {
    en: { g: "g", kg: "kg", pcs: "pcs" },
    ru: { g: "г", kg: "кг", pcs: "шт" },
  };
  return labels[language]?.[unit] || unit;
}

function categoryLabel(category, language) {
  return language === "ru"
    ? CATEGORY_TRANSLATIONS[category] || category
    : category;
}

function getInitialQuantity(unit) {
  return unit === "kg" ? 0.1 : unit === "pcs" ? 1 : 100;
}

function inferIcon(name) {
  const n = name.toLowerCase();
  if (n.includes("water") || n.includes("milk") || n.includes("juice") || n.includes("вода") || n.includes("молоко")) return "water-outline";
  if (n.includes("coffee") || n.includes("tea") || n.includes("коф") || n.includes("чай")) return "cafe-outline";
  if (n.includes("bread") || n.includes("хлеб") || n.includes("pasta") || n.includes("макарон")) return "restaurant-outline";
  if (n.includes("soap") || n.includes("мыло") || n.includes("paper") || n.includes("бумаг")) return "layers-outline";
  if (n.includes("fruit") || n.includes("apple") || n.includes("banana") || n.includes("orange") || n.includes("яблок") || n.includes("банан")) return "nutrition-outline";
  return "cube-outline";
}

/* STORAGE */
async function readListIds() {
  try {
    const raw = await AsyncStorage.getItem(LIST_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveListIds(ids) {
  await AsyncStorage.setItem(LIST_INDEX_KEY, JSON.stringify(ids));
}

async function readList(id) {
  try {
    const raw = await AsyncStorage.getItem(`@grocery/list/${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function saveList(list) {
  await AsyncStorage.setItem(`@grocery/list/${list.id}`, JSON.stringify(list));
}

async function deleteListStorage(id) {
  await AsyncStorage.removeItem(`@grocery/list/${id}`);
  const ids = await readListIds();
  await saveListIds(ids.filter((x) => x !== id));
}

async function loadAllLists() {
  const ids = await readListIds();
  const results = await Promise.all(ids.map((id) => readList(id)));
  return results
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

/* ROOT APP */
export default function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [lists, setLists] = useState([]);
  const [screen, setScreen] = useState("home");
  const [activeList, setActiveList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    try {
      const rawSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (rawSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) });
      }
      const storedLists = await loadAllLists();
      setLists(storedLists);
    } catch (error) {
      console.log("Bootstrap error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateSettings(next) {
    const merged = { ...settings, ...next };
    setSettings(merged);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  }

  const persistList = useCallback(async (list) => {
    const updated = { ...list, updatedAt: new Date().toISOString() };
    await saveList(updated);
    setActiveList(updated);
    setLists((prev) => {
      const exists = prev.some((x) => x.id === updated.id);
      if (!exists) return [updated, ...prev];
      return prev
        .map((x) => (x.id === updated.id ? updated : x))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
    return updated;
  }, []);

  async function createList(name) {
    const now = new Date().toISOString();
    const list = {
      id: uuid(),
      name: name.trim() || "Shopping Mission",
      createdAt: now,
      updatedAt: now,
      items: [],
    };
    await saveList(list);
    const ids = await readListIds();
    await saveListIds([list.id, ...ids]);
    setLists((prev) => [list, ...prev]);
    setActiveList(list);
    setScreen("select");
  }

  async function removeList(list) {
    await deleteListStorage(list.id);
    setLists((prev) => prev.filter((x) => x.id !== list.id));
    if (activeList?.id === list.id) {
      setActiveList(null);
      setScreen("home");
    }
  }

  function openList(list) {
    setActiveList(list);
    setScreen("shopping");
  }

  function editList(list) {
    setActiveList(list);
    setScreen("select");
  }

  function goHome() {
    setScreen("home");
    setActiveList(null);
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, themeStyles(settings.theme).container]}>
        <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />
        <View style={styles.loading}>
          <Ionicons name="radio-outline" size={42} color="#4da3ff" />
          <ActivityIndicator size="small" color="#4da3ff" style={{ marginTop: 18 }} />
          <Text style={styles.loadingText}>INITIALIZING...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const common = {
    settings,
    text: TEXT[settings.language] || TEXT.en,
    onSettings: () => setScreen("settings"),
    goHome,
    persistList,
    setActiveList,
    setScreen,
  };

  return (
    <SafeAreaView style={[styles.safeArea, themeStyles(settings.theme).container]}>
      <StatusBar barStyle={settings.theme === "light" ? "dark-content" : "light-content"} />

      {screen === "home" && (
        <HomeScreen
          {...common}
          lists={lists}
          onCreate={createList}
          onDelete={removeList}
          onEdit={editList}
          onOpen={openList}
        />
      )}

      {screen === "settings" && (
        <SettingsScreen {...common} updateSettings={updateSettings} />
      )}

      {screen === "select" && activeList && (
        <SelectionScreen
          {...common}
          list={activeList}
          onSave={(list) => {
            setActiveList(list);
            setScreen("quantity");
          }}
        />
      )}

      {screen === "quantity" && activeList && (
        <QuantityScreen
          {...common}
          list={activeList}
          onSaved={(list) => {
            setActiveList(list);
            setScreen("shopping");
          }}
        />
      )}

      {screen === "shopping" && activeList && (
        <ShoppingScreen
          {...common}
          list={activeList}
          onAddItems={() => setScreen("select")}
          onToggle={async (itemId) => {
            const next = {
              ...activeList,
              items: activeList.items.map((item) =>
                item.id === itemId ? { ...item, collected: !item.collected } : item
              ),
            };
            await persistList(next);
          }}
        />
      )}
    </SafeAreaView>
  );
}

/* HOME */
function HomeScreen({ settings, text, onSettings, lists, onCreate, onDelete, onEdit, onOpen }) {
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const theme = themeStyles(settings.theme);

  async function submit() {
    await onCreate(name);
    setName("");
    setModal(false);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onSettings} style={({ pressed }) => [styles.iconButton, theme.button, pressed && styles.pressed]}>
          <Ionicons name="settings-outline" size={22} color={theme.primaryText} />
        </Pressable>

        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={[styles.eyebrow, theme.mutedText]}>CLASSIFIED / OFFLINE</Text>
          <Text style={[styles.title, theme.primaryText]}>{text.lists}</Text>
        </View>

        <View style={[styles.statusDot, { backgroundColor: "#42d98b" }]} />
      </View>

      {lists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyCard, theme.card]}>
            <View style={[styles.bigIcon, theme.iconContainer]}>
              <Ionicons name="cart-outline" size={42} color={theme.accent} />
            </View>
            <Text style={[styles.emptyTitle, theme.primaryText]}>{text.noMissions}</Text>
            <Text style={[styles.emptyText, theme.mutedText]}>{text.createMission}</Text>
            <Pressable onPress={() => setModal(true)} style={({ pressed }) => [styles.primaryButton, theme.primaryButton, pressed && styles.pressed]}>
              <Ionicons name="add" size={21} color="#fff" />
              <Text style={styles.primaryButtonText}>{text.newMission}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 110 }}
          renderItem={({ item }) => {
            const collected = item.items.filter((x) => x.collected).length;
            const total = item.items.length;
            return (
              <ListCard
                list={item}
                collected={collected}
                total={total}
                settings={settings}
                text={text}
                onOpen={() => onOpen(item)}
                onEdit={() => onEdit(item)}
                onDelete={() => {
                  Alert.alert(text.deleteList, text.deleteConfirm, [
                    { text: text.cancel, style: "cancel" },
                    { text: text.delete, style: "destructive", onPress: () => onDelete(item) },
                  ]);
                }}
              />
            );
          }}
        />
      )}

      <Pressable onPress={() => setModal(true)} style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
        <Ionicons name="add" size={32} color="#fff" />
      </Pressable>

      <Modal transparent visible={modal} animationType="fade">
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={[styles.modalCard, theme.modal]}>
              <Text style={[styles.modalTitle, theme.primaryText]}>{text.newMission}</Text>
              <Text style={[styles.inputLabel, theme.mutedText]}>{text.missionName}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={text.missionNamePlaceholder}
                placeholderTextColor={theme.placeholder}
                maxLength={50}
                autoFocus
                style={[styles.textInput, theme.input, { color: theme.primaryText }]}
              />
              <View style={styles.modalActions}>
                <Pressable onPress={() => { setModal(false); setName(""); }} style={[styles.secondaryButton, theme.button]}>
                  <Text style={[styles.secondaryButtonText, theme.primaryText]}>{text.cancel}</Text>
                </Pressable>
                <Pressable onPress={submit} style={[styles.secondaryButton, theme.primaryButton]}>
                  <Text style={styles.primaryButtonText}>{text.create}</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

function ListCard({ list, collected, total, settings, text, onOpen, onEdit, onDelete }) {
  const [menu, setMenu] = useState(false);
  const theme = themeStyles(settings.theme);
  const percentage = total === 0 ? 0 : Math.round((collected / total) * 100);
  const date = new Date(list.createdAt).toLocaleDateString(settings.language === "ru" ? "ru-RU" : "en-US");

  return (
    <Pressable onPress={onOpen} style={({ pressed }) => [styles.listCard, theme.card, pressed && styles.pressed]}>
      <View style={styles.listCardTop}>
        <View style={[styles.missionIcon, theme.iconContainer]}>
          <Ionicons name="briefcase-outline" size={24} color={theme.accent} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.listName, theme.primaryText]}>{list.name}</Text>
          <Text style={[styles.listDate, theme.mutedText]}>{text.date}: {date}</Text>
        </View>

        <Pressable onPress={(e) => { e.stopPropagation?.(); setMenu(!menu); }} style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={23} color={theme.primaryText} />
        </Pressable>
      </View>

      <View style={styles.progressRow}>
        <Text style={[styles.progressText, theme.primaryText]}>{collected}/{total} {text.itemsCollected}</Text>
        <Text style={[styles.progressPercentage, theme.accentText]}>{percentage}%</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: percentage === 100 ? "#42d98b" : theme.accent }]} />
      </View>

      {menu && (
        <View style={[styles.actionMenu, theme.menu]}>
          <Pressable onPress={() => { setMenu(false); onEdit(); }} style={styles.menuItem}>
            <Ionicons name="create-outline" size={18} color={theme.primaryText} />
            <Text style={[styles.menuText, theme.primaryText]}>{text.editList}</Text>
          </Pressable>
          <Pressable onPress={() => { setMenu(false); onDelete(); }} style={styles.menuItem}>
            <Ionicons name="trash-outline" size={18} color="#ff6666" />
            <Text style={[styles.menuText, { color: "#ff6666" }]}>{text.deleteList}</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

/* SETTINGS */
function SettingsScreen({ settings, text, goHome, updateSettings }) {
  const theme = themeStyles(settings.theme);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={goHome} style={[styles.iconButton, theme.button]}>
          <Ionicons name="arrow-back" size={22} color={theme.primaryText} />
        </Pressable>
        <Text style={[styles.title, theme.primaryText, { marginLeft: 14 }]}>{text.settings}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <SettingsSection title={text.theme} theme={theme}>
          <ThemeOption icon="eye-outline" label={text.darkAgent} selected={settings.theme === "spy"} theme={theme} onPress={() => updateSettings({ theme: "spy" })} />
          <ThemeOption icon="contrast-outline" label={text.slate} selected={settings.theme === "slate"} theme={theme} onPress={() => updateSettings({ theme: "slate" })} />
          <ThemeOption icon="sunny-outline" label={text.light} selected={settings.theme === "light"} theme={theme} onPress={() => updateSettings({ theme: "light" })} />
        </SettingsSection>

        <SettingsSection title={text.language} theme={theme}>
          <ThemeOption icon="language-outline" label={text.english} selected={settings.language === "en"} theme={theme} onPress={() => updateSettings({ language: "en" })} />
          <ThemeOption icon="language-outline" label={text.russian} selected={settings.language === "ru"} theme={theme} onPress={() => updateSettings({ language: "ru" })} />
        </SettingsSection>

        <View style={[styles.infoBox, theme.card]}>
          <Ionicons name="shield-checkmark-outline" size={24} color={theme.accent} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.infoTitle, theme.primaryText]}>OFFLINE STORAGE</Text>
            <Text style={[styles.infoText, theme.mutedText]}>Your missions are stored locally on this device using JSON-backed AsyncStorage.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingsSection({ title, children, theme }) {
  return (
    <View style={{ marginBottom: 26 }}>
      <Text style={[styles.sectionTitle, theme.mutedText]}>{title.toUpperCase()}</Text>
      <View style={[styles.settingsCard, theme.card]}>{children}</View>
    </View>
  );
}

function ThemeOption({ icon, label, selected, theme, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.themeOption, pressed && styles.pressed]}>
      <View style={[styles.optionIcon, theme.iconContainer]}>
        <Ionicons name={icon} size={20} color={selected ? theme.accent : theme.muted} />
      </View>
      <Text style={[styles.optionText, theme.primaryText]}>{label}</Text>
      <Ionicons name={selected ? "radio-button-on" : "radio-button-off"} size={22} color={selected ? theme.accent : theme.muted} />
    </Pressable>
  );
}

/* SELECTION SCREEN */
function SelectionScreen({ settings, text, list, goHome, onSave }) {
  const theme = themeStyles(settings.theme);
  const [selected, setSelected] = useState(new Set(list.items.map((item) => item.catalogId || item.id)));
  const [search, setSearch] = useState("");
  const [customModal, setCustomModal] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customUnit, setCustomUnit] = useState("pcs");
  const [customCategory, setCustomCategory] = useState("Pantry");
  const [currentItems, setCurrentItems] = useState(list.items);

  const catalog = useMemo(() => {
    const existingCustom = currentItems
      .filter((item) => item.custom)
      .map((item) => ({
        name: item.name,
        category: item.category,
        unit: item.unit,
        icon: item.icon,
        custom: true,
        id: item.catalogId || item.id,
      }));

    return [
      ...DEFAULT_ITEMS.map((item, index) => ({
        ...item,
        id: `default-${index}-${item.name}`,
      })),
      ...existingCustom,
    ];
  }, [currentItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (item) => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }, [catalog, search]);

  function toggle(item) {
    const key = item.id;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function addCustom() {
    if (!customName.trim()) return;

    const newCustomItem = {
      id: uuid(),
      catalogId: uuid(),
      name: customName.trim().slice(0, 25),
      category: customCategory,
      unit: customUnit,
      icon: inferIcon(customName),
      custom: true,
      quantity: getInitialQuantity(customUnit),
      collected: false,
    };

    setCurrentItems((prev) => [...prev, newCustomItem]);
    setSelected((prev) => new Set(prev).add(newCustomItem.catalogId));

    setCustomName("");
    setCustomUnit("pcs");
    setCustomCategory("Pantry");
    setCustomModal(false);
  }

  function next() {
    const selectedItems = catalog
      .filter((item) => selected.has(item.id))
      .map((item) => {
        const existing = currentItems.find((x) => x.catalogId === item.id || x.name === item.name);
        return {
          id: existing?.id || uuid(),
          catalogId: item.id,
          name: item.name,
          category: item.category,
          icon: item.icon,
          unit: existing?.unit || item.unit,
          quantity: existing?.quantity || getInitialQuantity(item.unit),
          collected: existing?.collected || false,
          custom: item.custom || false,
        };
      });

    onSave({ ...list, items: selectedItems });
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={goHome} style={[styles.iconButton, theme.button]}>
          <Ionicons name="arrow-back" size={22} color={theme.primaryText} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={[styles.eyebrow, theme.mutedText]}>{list.name.toUpperCase()}</Text>
          <Text style={[styles.title, theme.primaryText]}>{text.editMission}</Text>
        </View>
      </View>

      <View style={[styles.searchBox, theme.input]}>
        <Ionicons name="search-outline" size={20} color={theme.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={text.search}
          placeholderTextColor={theme.placeholder}
          style={[styles.searchInput, { color: theme.primaryText }]}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={<Text style={[styles.noResults, theme.mutedText]}>{text.noResults}</Text>}
        renderItem={({ item, index }) => {
          const checked = selected.has(item.id);
          const previous = filtered[index - 1];
          const categoryChanged = !previous || previous.category !== item.category;

          return (
            <View>
              {categoryChanged && (
                <Text style={[styles.categoryHeader, theme.mutedText]}>
                  {categoryLabel(item.category, settings.language)}
                </Text>
              )}
              <Pressable onPress={() => toggle(item)} style={({ pressed }) => [styles.itemRow, theme.row, pressed && styles.pressed]}>
                <View style={[styles.itemIcon, theme.iconContainer]}>
                  <Ionicons name={item.icon} size={21} color={checked ? theme.accent : theme.primaryText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, theme.primaryText]}>{item.name}</Text>
                  <Text style={[styles.itemUnit, theme.mutedText]}>{unitLabel(item.unit, settings.language)}</Text>
                </View>
                <View style={[styles.checkbox, checked && { backgroundColor: theme.accent, borderColor: theme.accent }]}>
                  {checked && <Ionicons name="checkmark" size={18} color="#fff" />}
                </View>
              </Pressable>
            </View>
          );
        }}
        ListFooterComponent={
          <Pressable onPress={() => setCustomModal(true)} style={({ pressed }) => [styles.itemRow, theme.row, { marginTop: 10 }, pressed && styles.pressed]}>
            <View style={[styles.itemIcon, theme.iconContainer]}>
              <Ionicons name="add" size={22} color={theme.accent} />
            </View>
            <Text style={[styles.itemName, theme.accentText]}>{text.addCustom}</Text>
          </Pressable>
        }
      />

      <Pressable onPress={next} style={({ pressed }) => [styles.nextButton, theme.primaryButton, pressed && styles.pressed]}>
        <Text style={styles.primaryButtonText}>{text.next}</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </Pressable>

      <CustomItemModal
        visible={customModal}
        settings={settings}
        text={text}
        name={customName}
        setName={setCustomName}
        unit={customUnit}
        setUnit={setCustomUnit}
        category={customCategory}
        setCategory={setCustomCategory}
        onCancel={() => setCustomModal(false)}
        onAdd={addCustom}
      />
    </View>
  );
}

/* CUSTOM ITEM MODAL */
function CustomItemModal({ visible, settings, text, name, setName, unit, setUnit, category, setCategory, onCancel, onAdd }) {
  const theme = themeStyles(settings.theme);

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalBackdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={[styles.modalCard, theme.modal]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, theme.primaryText]}>{text.addCustom}</Text>
              <Pressable onPress={onCancel}>
                <Ionicons name="close" size={25} color={theme.primaryText} />
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, theme.mutedText]}>{text.customName}</Text>
            <TextInput
              value={name}
              onChangeText={(v) => setName(v.slice(0, 25))}
              maxLength={25}
              placeholder={text.customName}
              placeholderTextColor={theme.placeholder}
              style={[styles.textInput, theme.input, { color: theme.primaryText }]}
            />

            <Text style={[styles.inputLabel, theme.mutedText]}>{text.unit}</Text>
            <View style={styles.segmentRow}>
              {[["g", text.grams], ["kg", text.kilograms], ["pcs", text.pieces]].map(([value, label]) => (
                <Pressable
                  key={value}
                  onPress={() => setUnit(value)}
                  style={[styles.segment, theme.button, unit === value && { backgroundColor: theme.accent }]}
                >
                  <Text style={[styles.segmentText, { color: unit === value ? "#fff" : theme.primaryText }]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.inputLabel, theme.mutedText]}>{text.category}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CATEGORIES.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[styles.categoryChip, theme.button, category === item && { backgroundColor: theme.accent }]}
                >
                  <Text style={{ color: category === item ? "#fff" : theme.primaryText, fontSize: 13, fontWeight: "600" }}>
                    {categoryLabel(item, settings.language)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              onPress={onAdd}
              disabled={!name.trim()}
              style={[styles.primaryButton, theme.primaryButton, { marginTop: 22, opacity: name.trim() ? 1 : 0.45 }]}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>{text.add}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

/* QUANTITY SCREEN */
function QuantityScreen({ settings, text, list, onSaved }) {
  const theme = themeStyles(settings.theme);
  const [items, setItems] = useState(list.items);

  function adjust(itemId, direction) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const step = unitStep(item.unit);
        const current = Number(item.quantity) || 0;
        let next = current + step * direction;
        if (next < 0) next = 0;
        if (item.unit === "kg") next = Math.round(next * 10) / 10;
        return { ...item, quantity: next };
      })
    );
  }

  async function save() {
    const next = { ...list, items };
    await saveList(next);
    onSaved(next);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => onSaved({ ...list, items })} style={[styles.iconButton, theme.button]}>
          <Ionicons name="arrow-back" size={22} color={theme.primaryText} />
        </Pressable>

        <View style={{ marginLeft: 14 }}>
          <Text style={[styles.eyebrow, theme.mutedText]}>{text.quantity.toUpperCase()}</Text>
          <Text style={[styles.title, theme.primaryText]}>{list.name}</Text>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, theme.mutedText]}>{text.noSelected}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 110 }}
          renderItem={({ item }) => (
            <QuantityRow item={item} settings={settings} theme={theme} adjust={adjust} />
          )}
        />
      )}

      <Pressable onPress={save} style={({ pressed }) => [styles.saveButton, theme.primaryButton, pressed && styles.pressed]}>
        <Ionicons name="save-outline" size={21} color="#fff" />
        <Text style={styles.primaryButtonText}>{text.save}</Text>
      </Pressable>
    </View>
  );
}

function QuantityRow({ item, settings, theme, adjust }) {
  return (
    <View style={[styles.quantityRow, theme.row]}>
      <View style={[styles.itemIcon, theme.iconContainer]}>
        <Ionicons name={item.icon} size={22} color={theme.accent} />
      </View>

      <View style={{ flex: 1, marginRight: 8 }}>
        <Text style={[styles.itemName, theme.primaryText]}>{item.name}</Text>
        <Text style={[styles.itemUnit, theme.mutedText]}>{categoryLabel(item.category, settings.language)}</Text>
      </View>

      <Pressable onPress={() => adjust(item.id, -1)} style={[styles.stepperButton, theme.button]}>
        <Ionicons name="remove" size={20} color={theme.primaryText} />
      </Pressable>

      <View style={styles.quantityValue}>
        <Text style={[styles.quantityNumber, theme.primaryText]}>{item.quantity}</Text>
        <Text style={[styles.quantityUnit, theme.accentText]}>{unitLabel(item.unit, settings.language)}</Text>
      </View>

      <Pressable onPress={() => adjust(item.id, 1)} style={[styles.stepperButton, theme.button]}>
        <Ionicons name="add" size={20} color={theme.primaryText} />
      </Pressable>
    </View>
  );
}

/* SHOPPING SCREEN */
function ShoppingScreen({ settings, text, list, goHome, onAddItems, onToggle }) {
  const theme = themeStyles(settings.theme);
  const collected = list.items.filter((item) => item.collected).length;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={goHome} style={[styles.iconButton, theme.button]}>
          <Ionicons name="arrow-back" size={22} color={theme.primaryText} />
        </Pressable>

        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={[styles.eyebrow, theme.mutedText]}>{text.activeMission.toUpperCase()}</Text>
          <Text style={[styles.title, theme.primaryText]} numberOfLines={1}>{list.name}</Text>
        </View>

        <Pressable onPress={onAddItems} style={[styles.iconButton, theme.button]}>
          <Ionicons name="add" size={24} color={theme.primaryText} />
        </Pressable>
      </View>

      <View style={styles.missionStats}>
        <View>
          <Text style={[styles.statValue, theme.primaryText]}>{collected}/{list.items.length}</Text>
          <Text style={[styles.statLabel, theme.mutedText]}>{text.collected}</Text>
        </View>

        <View style={styles.statProgress}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: list.items.length > 0 ? `${(collected / list.items.length) * 100}%` : "0%",
                  backgroundColor: collected === list.items.length ? "#42d98b" : theme.accent,
                },
              ]}
            />
          </View>
        </View>
      </View>

      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingBottom: 30, gap: 12 }}
        renderItem={({ item }) => (
          <ShoppingCard item={item} settings={settings} theme={theme} onPress={() => onToggle(item.id)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, theme.mutedText]}>{text.noSelected}</Text>
          </View>
        }
      />
    </View>
  );
}

function ShoppingCard({ item, settings, theme, onPress }) {
  const collected = item.collected;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.shoppingCard,
        {
          backgroundColor: theme.tile,
          borderColor: collected ? "#42d98b" : "rgba(255, 72, 72, 0.75)",
          opacity: collected ? 0.58 : 1,
          shadowColor: collected ? "#42d98b" : "#ff4848",
          shadowOpacity: theme.shadowOpacity,
          shadowRadius: collected ? 8 : 10,
        },
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      <View style={styles.shoppingCardTop}>
        <View style={[styles.shoppingIcon, { backgroundColor: collected ? "rgba(66,217,139,0.12)" : "rgba(255,72,72,0.10)" }]}>
          <Ionicons name={item.icon} size={28} color={collected ? "#42d98b" : "#ff6464"} />
        </View>
        {collected && (
          <View style={styles.collectedBadge}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        )}
      </View>

      <Text style={[styles.shoppingName, theme.primaryText]} numberOfLines={2}>
        {item.name}
      </Text>

      <Text style={[styles.shoppingQuantity, theme.accentText]}>
        {item.quantity} {unitLabel(item.unit, settings.language)}
      </Text>
    </Pressable>
  );
}

/* THEMES */
function themeStyles(theme) {
  if (theme === "light") {
    return {
      container: { backgroundColor: "#f5f7fa" },
      card: { backgroundColor: "#ffffff", borderColor: "#e2e7ed" },
      modal: { backgroundColor: "#ffffff" },
      button: { backgroundColor: "#e9eef4", borderColor: "#dbe2ea" },
      row: { backgroundColor: "#ffffff", borderColor: "#e3e8ef" },
      input: { backgroundColor: "#ffffff", borderColor: "#dce3eb" },
      menu: { backgroundColor: "#ffffff", borderColor: "#dce3eb" },
      iconContainer: { backgroundColor: "#edf5ff" },
      primaryButton: { backgroundColor: "#398fe8" },
      primaryText: "#111827",
      mutedText: "#697586",
      muted: "#697586",
      accent: "#398fe8",
      accentText: "#398fe8",
      placeholder: "#9ba6b2",
      tile: "#ffffff",
      shadowOpacity: 0.12,
    };
  }

  if (theme === "slate") {
    return {
      container: { backgroundColor: "#777b82" },
      card: { backgroundColor: "#a4a8ae", borderColor: "#c0c3c7" },
      modal: { backgroundColor: "#aeb2b7" },
      button: { backgroundColor: "#aeb2b7", borderColor: "#c4c7ca" },
      row: { backgroundColor: "#999da3", borderColor: "#bfc2c6" },
      input: { backgroundColor: "#969ba1", borderColor: "#c5c8cb" },
      menu: { backgroundColor: "#aeb2b7", borderColor: "#d0d2d5" },
      iconContainer: { backgroundColor: "#c4c7ca" },
      primaryButton: { backgroundColor: "#b9bdc2" },
      primaryText: "#111111",
      mutedText: "#2f3135",
      muted: "#35383d",
      accent: "#1f2937",
      accentText: "#101318",
      placeholder: "#4d5156",
      tile: "#9da1a6",
      shadowOpacity: 0.16,
    };
  }

  return {
    container: { backgroundColor: "#080a0d" },
    card: { backgroundColor: "#101419", borderColor: "#202830" },
    modal: { backgroundColor: "#11161b" },
    button: { backgroundColor: "#171d23", borderColor: "#252e37" },
    row: { backgroundColor: "#10151a", borderColor: "#222b33" },
    input: { backgroundColor: "#0d1216", borderColor: "#27313a" },
    menu: { backgroundColor: "#12181e", borderColor: "#29333d" },
    iconContainer: { backgroundColor: "#172029" },
    primaryButton: { backgroundColor: "#3c91e6" },
    primaryText: "#f3f6f8",
    mutedText: "#7f8b96",
    muted: "#65717d",
    accent: "#4da3ff",
    accentText: "#55a9ff",
    placeholder: "#4f5b65",
    tile: "#10161c",
    shadowOpacity: 0.35,
  };
}

/* STYLES */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 11,
    letterSpacing: 3,
    color: "#68737e",
    fontWeight: "700",
  },
  header: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 2.4,
    fontWeight: "800",
    marginBottom: 3,
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },
  emptyCard: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
  },
  bigIcon: {
    width: 80,
    height: 80,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  emptyTitle: {
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 9,
    maxWidth: 290,
  },
  primaryButton: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 20,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#398fe8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#398fe8",
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 10,
  },
  pressed: {
    opacity: 0.75,
  },
  listCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 17,
    marginBottom: 12,
    overflow: "visible",
  },
  listCardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  missionIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  listName: {
    fontSize: 17,
    fontWeight: "800",
  },
  listDate: {
    fontSize: 11,
    marginTop: 4,
  },
  moreButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 17,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    height: 5,
    backgroundColor: "rgba(127,139,150,0.16)",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  actionMenu: {
    position: "absolute",
    top: 54,
    right: 13,
    zIndex: 100,
    width: 180,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 13,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.68)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: "800",
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 5,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 15,
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  searchBox: {
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  categoryHeader: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginTop: 14,
    marginBottom: 7,
    textTransform: "uppercase",
  },
  itemRow: {
    minHeight: 64,
    borderWidth: 1,
    borderRadius: 17,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
  },
  itemUnit: {
    fontSize: 10,
    marginTop: 3,
  },
  checkbox: {
    width: 27,
    height: 27,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#53606c",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    height: 55,
    borderRadius: 17,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    elevation: 10,
  },
  noResults: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 14,
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 15,
  },
  segment: {
    flex: 1,
    height: 43,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "800",
  },
  categoryChip: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    marginRight: 7,
  },
  quantityRow: {
    minHeight: 76,
    borderWidth: 1,
    borderRadius: 18,
    padding: 10,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
  },
  stepperButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityValue: {
    minWidth: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityNumber: {
    fontSize: 16,
    fontWeight: "900",
  },
  quantityUnit: {
    fontSize: 9,
    fontWeight: "800",
    marginTop: 1,
  },
  saveButton: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 15,
    height: 56,
    borderRadius: 17,
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  missionStats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  statProgress: {
    flex: 1,
    marginLeft: 18,
  },
  shoppingCard: {
    flex: 1,
    minHeight: 185,
    borderWidth: 1,
    borderRadius: 21,
    padding: 15,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  shoppingCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  shoppingIcon: {
    width: 56,
    height: 56,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  collectedBadge: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#42d98b",
    alignItems: "center",
    justifyContent: "center",
  },
  shoppingName: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 18,
    minHeight: 38,
  },
  shoppingQuantity: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 8,
  },
  settingsCard: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 9,
  },
  themeOption: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    gap: 12,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  infoBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    marginTop: 4,
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
});
