import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
  Share,
  Image,
  useWindowDimensions,
  Switch,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Расширенный дефолтный ассортимент по категориям
const DEFAULT_CATEGORIZED_PRESETS = [
  {
    category: 'Овощи и Зелень',
    items: [
      { id: 'p_c1', name: 'Огурцы', unit: 'кг' },
      { id: 'p_c2', name: 'Помидоры', unit: 'кг' },
      { id: 'p_c3', name: 'Лук', unit: 'кг' },
      { id: 'p_c4', name: 'Чеснок', unit: 'шт' },
      { id: 'p_c5', name: 'Буряк (Свекла)', unit: 'кг' },
      { id: 'p_c6', name: 'Морковка', unit: 'кг' },
      { id: 'p_c7', name: 'Картошка', unit: 'кг' },
      { id: 'p_c8', name: 'Капуста', unit: 'кг' },
      { id: 'p_c9', name: 'Авокадо', unit: 'шт' },
      { id: 'p_c10', name: 'Грибы (Шампиньоны)', unit: 'кг' },
      { id: 'p_c11', name: 'Вешенки (Глывы)', unit: 'кг' },
      { id: 'p_c12', name: 'Петрушка', unit: 'уп' },
      { id: 'p_c13', name: 'Салат', unit: 'уп' },
      { id: 'p_c14', name: 'Укроп', unit: 'уп' },
    ],
  },
  {
    category: 'Фрукты и Ягоды',
    items: [
      { id: 'p_f1', name: 'Бананы', unit: 'кг' },
      { id: 'p_f2', name: 'Яблоки', unit: 'кг' },
      { id: 'p_f3', name: 'Клубника', unit: 'кг' },
      { id: 'p_f4', name: 'Виноград', unit: 'кг' },
      { id: 'p_f5', name: 'Персики', unit: 'кг' },
      { id: 'p_f6', name: 'Абрикосы', unit: 'кг' },
      { id: 'p_f7', name: 'Нектарин', unit: 'кг' },
      { id: 'p_f8', name: 'Груши', unit: 'кг' },
      { id: 'p_f9', name: 'Манго', unit: 'шт' },
      { id: 'p_f10', name: 'Голубика (Лохина)', unit: 'кг' },
    ],
  },
  {
    category: 'Бакалея и Крупы',
    items: [
      { id: 'p_b1', name: 'Вермишель', unit: 'уп' },
      { id: 'p_b2', name: 'Рис', unit: 'уп' },
      { id: 'p_b3', name: 'Гречка', unit: 'уп' },
      { id: 'p_b4', name: 'Пшеничка', unit: 'уп' },
      { id: 'p_b5', name: 'Горох', unit: 'уп' },
      { id: 'p_b6', name: 'Фасоль', unit: 'уп' },
      { id: 'p_b7', name: 'Чечевица', unit: 'уп' },
      { id: 'p_b8', name: 'Спагетти', unit: 'уп' },
      { id: 'p_b9', name: 'Кофе', unit: 'уп' },
    ],
  },
  {
    category: 'Выпечка и Хлеб',
    items: [
      { id: 'p_h1', name: 'Хлеб (Украинский)', unit: 'шт' },
      { id: 'p_h2', name: 'Батон', unit: 'шт' },
      { id: 'p_h3', name: 'Багет', unit: 'шт' },
      { id: 'p_h4', name: 'Чиабатта', unit: 'шт' },
      { id: 'p_h5', name: 'Хлеб чёрный', unit: 'шт' },
    ],
  },
  {
    category: 'Молочные продукты',
    items: [
      { id: 'p_m1', name: 'Кефир', unit: 'л' },
      { id: 'p_m2', name: 'Йогурт', unit: 'шт' },
      { id: 'p_m3', name: 'Творог', unit: 'г' },
      { id: 'p_m4', name: 'Закваска', unit: 'л' },
      { id: 'p_m5', name: 'Молоко', unit: 'л' },
      { id: 'p_m6', name: 'Сыр', unit: 'г' },
    ],
  },
  {
    category: 'Мясо и Колбасы',
    items: [
      { id: 'p_mk1', name: 'Колбаса докторская', unit: 'кг' },
      { id: 'p_mk2', name: 'Колбаса сухая', unit: 'кг' },
      { id: 'p_mk3', name: 'Свинина', unit: 'кг' },
      { id: 'p_mk4', name: 'Сало', unit: 'кг' },
      { id: 'p_mk5', name: 'Курица', unit: 'кг' },
    ],
  },
  {
    category: 'Консервы',
    items: [
      { id: 'p_kn1', name: 'Килька', unit: 'банка' },
      { id: 'p_kn2', name: 'Бычки', unit: 'банка' },
      { id: 'p_kn3', name: 'Консервы свинина', unit: 'банка' },
      { id: 'p_kn4', name: 'Скумбрия', unit: 'банка' },
      { id: 'p_kn5', name: 'Консервы курятина', unit: 'банка' },
      { id: 'p_kn6', name: 'Консервы яловичина', unit: 'банка' },
    ],
  },
  {
    category: 'Бытовая химия',
    items: [
      { id: 'p_ch1', name: 'Средство для унитаза', unit: 'шт' },
      { id: 'p_ch2', name: 'Средство для ванной', unit: 'шт' },
      { id: 'p_ch3', name: 'Средство для плиты', unit: 'шт' },
      { id: 'p_ch4', name: 'Sif', unit: 'шт' },
      { id: 'p_ch5', name: 'Fairy', unit: 'шт' },
    ],
  },
  {
    category: 'Напитки',
    items: [
      { id: 'p_dr1', name: 'Живчик', unit: 'л' },
      { id: 'p_dr2', name: 'Вода', unit: 'л' },
    ],
  },
];

const TRANSLATIONS = {
  ru: {
    title: 'МОИ СПИСКИ',
    shareHeader: '🛒 СПИСОК ПОКУПОК:',
    addList: 'Создать список',
    addItem: 'Добавить товар',
    editItem: 'Изменить товар',
    enterListName: 'Название списка',
    enterItemName: 'Название товара',
    enterQty: 'Количество',
    photoUrl: 'URL-ссылка на фото',
    save: 'Сохранить',
    cancel: 'Отмена',
    settings: 'Настройки',
    language: 'Язык / Language',
    theme: 'Тема фона',
    textColor: 'Цвет текста',
    viewMode: 'Режим отображения',
    lockViewMode: 'Заблокировать смену вида в шапке',
    markStyle: 'Стиль отмеченных товаров',
    markColor: 'Цвет (Красный/Зелёный)',
    markCheck: 'Галочка',
    catalog: 'Библиотека товаров',
    defaultListName: 'Мой первый список',
  },
  en: {
    title: 'MY LISTS',
    shareHeader: '🛒 GROCERY LIST:',
    addList: 'Create List',
    addItem: 'Add Item',
    editItem: 'Edit Item',
    enterListName: 'List name',
    enterItemName: 'Item name',
    enterQty: 'Quantity',
    photoUrl: 'Photo URL',
    save: 'Save',
    cancel: 'Cancel',
    settings: 'Settings',
    language: 'Language',
    theme: 'Background Theme',
    textColor: 'Text Color',
    viewMode: 'View Mode',
    lockViewMode: 'Lock view switcher in header',
    markStyle: 'Marked items style',
    markColor: 'Color (Red/Green)',
    markCheck: 'Checkmark',
    catalog: 'Product Library',
    defaultListName: 'My First List',
  },
};

// Исправлены оттенки тем (темнее фон, светлее базовый текст)
const THEMES = {
  dark: { bg: '#0b0e14', cardBg: '#161b22', border: '#21262d', textDefault: '#e6edf3' },
  gray: { bg: '#181a1f', cardBg: '#22262e', border: '#2d3139', textDefault: '#d7dadc' },
  light: { bg: '#f0f2f5', cardBg: '#ffffff', border: '#d0d7de', textDefault: '#1f2328' },
};

const TEXT_COLORS = [
  { label: 'Светло-серый', value: '#e6edf3' },
  { label: 'Голубой', value: '#00f0ff' },
  { label: 'Синий', value: '#3b82f6' },
  { label: 'Жёлтый', value: '#ffd700' },
  { label: 'Мятный', value: '#2ecc71' },
];

export default function App() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [lang, setLang] = useState('ru');
  const [themeKey, setThemeKey] = useState('dark');
  const [textColor, setTextColor] = useState('#00f0ff');
  const [viewMode, setViewMode] = useState('grid');
  const [isViewLocked, setIsViewLocked] = useState(false);
  const [markStyle, setMarkStyle] = useState('color');

  const [lists, setLists] = useState([]);
  const [categorizedCatalog, setCategorizedCatalog] = useState([]);
  const [currentListId, setCurrentListId] = useState(null);

  // Состояние аккордеона библиотеки
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedCatalogItems, setSelectedCatalogItems] = useState({});

  // Добавление товара вручную в категорию
  const [targetCategoryForNewItem, setTargetCategoryForNewItem] = useState(null);

  const [listModalVisible, setListModalVisible] = useState(false);
  const [listNameInput, setListNameInput] = useState('');

  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCount, setItemCount] = useState('1');
  const [itemUnit, setItemUnit] = useState('шт');
  const [itemImage, setItemImage] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);

  const [catalogItemModalVisible, setCatalogItemModalVisible] = useState(false);
  const [editingCatalogProduct, setEditingCatalogProduct] = useState(null);
  const [catalogEditImage, setCatalogEditImage] = useState('');

  const [qtyModalVisible, setQtyModalVisible] = useState(false);
  const [selectedItemForQty, setSelectedItemForQty] = useState(null);
  const [directQtyText, setDirectQtyText] = useState('');

  const [catalogModalVisible, setCatalogModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const t = TRANSLATIONS[lang];
  const currentTheme = THEMES[themeKey];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('@app_lang');
      const savedTheme = await AsyncStorage.getItem('@app_theme_key');
      const savedColor = await AsyncStorage.getItem('@app_text_color');
      const savedView = await AsyncStorage.getItem('@app_view_mode');
      const savedLocked = await AsyncStorage.getItem('@app_view_locked');
      const savedMark = await AsyncStorage.getItem('@app_mark_style');
      const savedLists = await AsyncStorage.getItem('@app_grocery_lists_v2');
      const savedCatalog = await AsyncStorage.getItem('@app_categorized_catalog_v3');

      if (savedLang) setLang(JSON.parse(savedLang));
      if (savedTheme) setThemeKey(JSON.parse(savedTheme));
      if (savedColor) setTextColor(JSON.parse(savedColor));
      if (savedView) setViewMode(JSON.parse(savedView));
      if (savedLocked !== null) setIsViewLocked(JSON.parse(savedLocked));
      if (savedMark) setMarkStyle(JSON.parse(savedMark));

      let masterCat = DEFAULT_CATEGORIZED_PRESETS;
      if (savedCatalog) {
        const parsed = JSON.parse(savedCatalog);
        // Слияние для исключения дубликатов при обновлениях
        masterCat = mergeCatalogs(DEFAULT_CATEGORIZED_PRESETS, parsed);
      }
      setCategorizedCatalog(masterCat);
      await AsyncStorage.setItem('@app_categorized_catalog_v3', JSON.stringify(masterCat));

      if (savedLists) {
        setLists(JSON.parse(savedLists));
      } else {
        const initialLists = [
          {
            id: '1',
            name: TRANSLATIONS[savedLang ? JSON.parse(savedLang) : 'ru'].defaultListName,
            items: [],
          },
        ];
        setLists(initialLists);
        await AsyncStorage.setItem('@app_grocery_lists_v2', JSON.stringify(initialLists));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const mergeCatalogs = (defaults, saved) => {
    const result = [...saved];
    defaults.forEach((defCat) => {
      const catIndex = result.findIndex((c) => c.category === defCat.category);
      if (catIndex === -1) {
        result.push(defCat);
      } else {
        defCat.items.forEach((defItem) => {
          const exists = result[catIndex].items.some(
            (i) => i.name.toLowerCase() === defItem.name.toLowerCase()
          );
          if (!exists) {
            result[catIndex].items.push(defItem);
          }
        });
      }
    });
    return result;
  };

  const saveLists = async (newLists) => {
    setLists(newLists);
    await AsyncStorage.setItem('@app_grocery_lists_v2', JSON.stringify(newLists));
  };

  const saveCategorizedCatalog = async (newCatalog) => {
    setCategorizedCatalog(newCatalog);
    await AsyncStorage.setItem('@app_categorized_catalog_v3', JSON.stringify(newCatalog));
  };

  const saveSetting = async (key, value, setter) => {
    setter(value);
    await AsyncStorage.setItem(key, JSON.stringify(value));
  };

  const currentList = lists.find((l) => l.id === currentListId);

  // Выбор картинки из галереи
  const pickImageFromGallery = async (setImageCallback) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Ошибка', 'Нужно разрешение на доступ к фото');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageCallback(result.assets[0].uri);
    }
  };

  // Переключение состояния аккордеона
  const toggleCategory = (catName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  // Чекбокс выбора товара из библиотеки
  const toggleSelectCatalogItem = (item) => {
    setSelectedCatalogItems((prev) => ({
      ...prev,
      [item.id]: prev[item.id] ? null : item,
    }));
  };

  // Подтверждение массового добавления из библиотеки в список
  const applySelectedCatalogItems = () => {
    if (!currentListId) return;

    const itemsToAdd = Object.values(selectedCatalogItems).filter(Boolean);
    if (itemsToAdd.length === 0) {
      setCatalogModalVisible(false);
      return;
    }

    const currentItems = currentList ? [...currentList.items] : [];
    itemsToAdd.forEach((preset) => {
      const exists = currentItems.some(
        (i) => i.name.toLowerCase() === preset.name.toLowerCase()
      );
      if (!exists) {
        currentItems.push({
          id: Date.now().toString() + Math.random().toString().substr(2, 4),
          name: preset.name,
          count: 1,
          unit: preset.unit || 'шт',
          image: preset.image || '',
          bought: false,
        });
      }
    });

    const updatedLists = lists.map((l) =>
      l.id === currentListId ? { ...l, items: currentItems } : l
    );

    saveLists(updatedLists);
    setSelectedCatalogItems({});
    setCatalogModalVisible(false);
  };

  // Добавление пользовательского товара в выбранную категорию библиотеки
  const addItemToCategory = (categoryName) => {
    setTargetCategoryForNewItem(categoryName);
    closeItemModal();
    setItemModalVisible(true);
  };

  // Редактирование фото товара библиотеки
  const handleSaveCatalogImage = () => {
    if (!editingCatalogProduct) return;

    const updated = categorizedCatalog.map((cat) => ({
      ...cat,
      items: cat.items.map((p) =>
        p.id === editingCatalogProduct.id ? { ...p, image: catalogEditImage } : p
      ),
    }));

    saveCategorizedCatalog(updated);

    // Синхронизируем картинки во всех списках
    const updatedLists = lists.map((list) => ({
      ...list,
      items: list.items.map((item) =>
        item.name.toLowerCase() === editingCatalogProduct.name.toLowerCase()
          ? { ...item, image: catalogEditImage }
          : item
      ),
    }));
    saveLists(updatedLists);

    setCatalogItemModalVisible(false);
    setEditingCatalogProduct(null);
  };

  const deleteFromMasterCatalog = (id, name) => {
    Alert.alert('Удалить из библиотеки?', `Товар "${name}" будет полностью удален.`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          const updated = categorizedCatalog.map((cat) => ({
            ...cat,
            items: cat.items.filter((p) => p.id !== id),
          }));
          saveCategorizedCatalog(updated);
        },
      },
    ]);
  };

  const handleCreateList = () => {
    if (!listNameInput.trim()) return;
    const newList = { id: Date.now().toString(), name: listNameInput, items: [] };
    saveLists([...lists, newList]);
    setListNameInput('');
    setListModalVisible(false);
  };

  const deleteList = (id) => {
    Alert.alert('Удалить список?', 'Все товары в нём будут удалены.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          const updated = lists.filter((l) => l.id !== id);
          saveLists(updated);
          if (currentListId === id) setCurrentListId(null);
        },
      },
    ]);
  };

  const handleSaveItem = () => {
    if (!itemName.trim()) return;
    const trimmedName = itemName.trim();

    // Если добавляем товар через библиотеку в определенную категорию
    if (targetCategoryForNewItem) {
      const updatedCat = categorizedCatalog.map((cat) => {
        if (cat.category === targetCategoryForNewItem) {
          const exists = cat.items.some(
            (i) => i.name.toLowerCase() === trimmedName.toLowerCase()
          );
          if (!exists) {
            return {
              ...cat,
              items: [
                ...cat.items,
                {
                  id: Date.now().toString(),
                  name: trimmedName,
                  unit: itemUnit,
                  image: itemImage,
                },
              ],
            };
          }
        }
        return cat;
      });
      saveCategorizedCatalog(updatedCat);
      setTargetCategoryForNewItem(null);
      closeItemModal();
      return;
    }

    if (!currentListId) return;

    const updatedLists = lists.map((list) => {
      if (list.id === currentListId) {
        if (editingItemId) {
          const updatedItems = list.items.map((i) =>
            i.id === editingItemId
              ? {
                  ...i,
                  name: trimmedName,
                  count: parseFloat(itemCount) || 1,
                  unit: itemUnit,
                  image: itemImage,
                }
              : i
          );
          return { ...list, items: updatedItems };
        } else {
          const newItem = {
            id: Date.now().toString(),
            name: trimmedName,
            count: parseFloat(itemCount) || 1,
            unit: itemUnit,
            image: itemImage,
            bought: false,
          };
          return { ...list, items: [...list.items, newItem] };
        }
      }
      return list;
    });

    saveLists(updatedLists);
    closeItemModal();
  };

  const deleteItem = (itemId) => {
    const updatedLists = lists.map((list) => {
      if (list.id === currentListId) {
        return { ...list, items: list.items.filter((i) => i.id !== itemId) };
      }
      return list;
    });
    saveLists(updatedLists);
  };

  const toggleBought = (itemId) => {
    const updatedLists = lists.map((list) => {
      if (list.id === currentListId) {
        const updatedItems = list.items.map((i) =>
          i.id === itemId ? { ...i, bought: !i.bought } : i
        );
        return { ...list, items: updatedItems };
      }
      return list;
    });
    saveLists(updatedLists);
  };

  const changeCount = (itemId, delta) => {
    const updatedLists = lists.map((list) => {
      if (list.id === currentListId) {
        const updatedItems = list.items.map((i) => {
          if (i.id === itemId) {
            return { ...i, count: Math.max(1, i.count + delta) };
          }
          return i;
        });
        return { ...list, items: updatedItems };
      }
      return list;
    });
    saveLists(updatedLists);
  };

  const openEditItemModal = (item) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemCount(item.count.toString());
    setItemUnit(item.unit || 'шт');
    setItemImage(item.image || '');
    setItemModalVisible(true);
  };

  const closeItemModal = () => {
    setItemModalVisible(false);
    setEditingItemId(null);
    setItemName('');
    setItemCount('1');
    setItemUnit('шт');
    setItemImage('');
    setTargetCategoryForNewItem(null);
  };

  const saveDirectQty = () => {
    if (!selectedItemForQty || !currentListId) return;
    const val = parseFloat(directQtyText);
    if (!isNaN(val) && val > 0) {
      const updatedLists = lists.map((list) => {
        if (list.id === currentListId) {
          const updatedItems = list.items.map((i) =>
            i.id === selectedItemForQty.id ? { ...i, count: val } : i
          );
          return { ...list, items: updatedItems };
        }
        return list;
      });
      saveLists(updatedLists);
    }
    setQtyModalVisible(false);
  };

  const shareList = async () => {
    if (!currentList || currentList.items.length === 0) return;
    const unbought = currentList.items.filter((i) => !i.bought);
    const bought = currentList.items.filter((i) => i.bought);

    let text = `${t.shareHeader} ${currentList.name}\n\n`;
    if (unbought.length > 0) {
      text += unbought.map((i) => `• ${i.name} — ${i.count} ${i.unit}`).join('\n');
    }
    if (bought.length > 0) {
      text += `\n\nКуплено:\n` + bought.map((i) => `✓ ${i.name}`).join('\n');
    }

    try {
      await Share.share({ message: text });
    } catch (e) {
      console.error(e);
    }
  };

  const shareSingleProduct = async (item) => {
    let msg = `Купи, пожалуйста: ${item.name} (${item.count} ${item.unit})`;
    if (item.image) {
      msg += `\nСсылка на фото: ${item.image}`;
    }
    try {
      await Share.share({ message: msg });
    } catch (e) {
      console.error(e);
    }
  };

  const numColumns = viewMode === 'list' ? 1 : width > 900 ? 4 : isLandscape || width > 600 ? 3 : 2;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.bg }]}>
      <StatusBar barStyle={themeKey === 'light' ? 'dark-content' : 'light-content'} />

      {/* Шапка */}
      <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {currentListId && (
            <TouchableOpacity onPress={() => setCurrentListId(null)}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, { color: textColor }]}>
            {currentList ? currentList.name : t.title}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {currentListId && (
            <TouchableOpacity onPress={() => setCatalogModalVisible(true)}>
              <Ionicons name="book-outline" size={24} color={textColor} />
            </TouchableOpacity>
          )}

          {!isViewLocked && (
            <TouchableOpacity
              onPress={() =>
                saveSetting('@app_view_mode', viewMode === 'grid' ? 'list' : 'grid', setViewMode)
              }
            >
              <Ionicons name={viewMode === 'grid' ? 'list' : 'grid'} size={24} color={textColor} />
            </TouchableOpacity>
          )}

          {currentListId && (
            <TouchableOpacity onPress={shareList}>
              <Ionicons name="share-social-outline" size={24} color={textColor} />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => setSettingsVisible(true)}>
            <Ionicons name="settings-outline" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Списки */}
      {!currentListId ? (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.listFolderCard,
                { backgroundColor: currentTheme.cardBg, borderColor: currentTheme.border },
              ]}
              onPress={() => setCurrentListId(item.id)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="folder-open-outline" size={28} color={textColor} />
                <View>
                  <Text style={[styles.folderTitle, { color: textColor }]}>{item.name}</Text>
                  <Text style={{ color: currentTheme.textDefault, opacity: 0.6, fontSize: 13 }}>
                    Товаров: {item.items.length}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => deleteList(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#ff4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      ) : (
        /* Товары в списке */
        <FlatList
          key={`${viewMode}-${numColumns}`}
          data={currentList.items}
          numColumns={numColumns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => {
            const isColorStyle = markStyle === 'color';
            const cardBorderColor = isColorStyle
              ? item.bought
                ? '#2e7d32'
                : '#c62828'
              : currentTheme.border;

            if (viewMode === 'grid') {
              return (
                <View
                  style={[
                    styles.gridCard,
                    {
                      backgroundColor: currentTheme.cardBg,
                      borderColor: cardBorderColor,
                      borderWidth: isColorStyle ? 2 : 1,
                      flex: 1 / numColumns,
                    },
                    !isColorStyle && item.bought && styles.cardBought,
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => toggleBought(item.id)}
                    style={styles.gridImageArea}
                  >
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.gridImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.gridImagePlaceholder, { borderColor: currentTheme.border }]}>
                        <Ionicons name="basket-outline" size={30} color={textColor} />
                      </View>
                    )}

                    {!isColorStyle && item.bought && (
                      <View style={styles.checkOverlay}>
                        <Ionicons name="checkmark-circle" size={36} color={textColor} />
                      </View>
                    )}
                  </TouchableOpacity>

                  <Text numberOfLines={1} style={[styles.gridTitle, { color: textColor }]}>
                    {item.name}
                  </Text>

                  <View style={styles.gridControls}>
                    <TouchableOpacity
                      onPress={() => changeCount(item.id, -1)}
                      style={styles.qtyBtn}
                    >
                      <Text style={{ color: textColor, fontSize: 18, fontWeight: 'bold' }}>-</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedItemForQty(item);
                        setDirectQtyText(item.count.toString());
                        setQtyModalVisible(true);
                      }}
                    >
                      <Text style={[styles.qtyText, { color: textColor }]}>
                        {item.count} {item.unit}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => changeCount(item.id, 1)}
                      style={styles.qtyBtn}
                    >
                      <Text style={{ color: textColor, fontSize: 18, fontWeight: 'bold' }}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity onPress={() => shareSingleProduct(item)}>
                      <Ionicons name="share-outline" size={16} color={textColor} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openEditItemModal(item)}>
                      <Ionicons name="pencil" size={16} color="#888" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteItem(item.id)}>
                      <Ionicons name="trash-outline" size={16} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }

            return (
              <View
                style={[
                  styles.listCard,
                  {
                    backgroundColor: currentTheme.cardBg,
                    borderColor: cardBorderColor,
                    borderWidth: isColorStyle ? 2 : 1,
                  },
                  !isColorStyle && item.bought && styles.cardBought,
                ]}
              >
                <TouchableOpacity
                  onPress={() => toggleBought(item.id)}
                  style={styles.checkArea}
                >
                  {!isColorStyle && (
                    <Ionicons
                      name={item.bought ? 'checkbox' : 'square-outline'}
                      size={24}
                      color={textColor}
                    />
                  )}
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.listThumbImage} />
                  ) : null}
                  <Text style={[styles.listTitle, { color: currentTheme.textDefault }]}>{item.name}</Text>
                </TouchableOpacity>

                <View style={styles.gridControls}>
                  <TouchableOpacity onPress={() => changeCount(item.id, -1)}>
                    <Text style={{ color: textColor, fontSize: 18, fontWeight: 'bold' }}>-</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedItemForQty(item);
                      setDirectQtyText(item.count.toString());
                      setQtyModalVisible(true);
                    }}
                  >
                    <Text style={[styles.qtyText, { color: textColor }]}>
                      {item.count} {item.unit}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => changeCount(item.id, 1)}>
                    <Text style={{ color: textColor, fontSize: 18, fontWeight: 'bold' }}>+</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => shareSingleProduct(item)}
                    style={{ marginLeft: 6 }}
                  >
                    <Ionicons name="share-outline" size={18} color={textColor} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => openEditItemModal(item)}
                    style={{ marginLeft: 6 }}
                  >
                    <Ionicons name="pencil" size={18} color="#888" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteItem(item.id)} style={{ marginLeft: 6 }}>
                    <Ionicons name="trash-outline" size={18} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Кнопка плюс -> Открывает Библиотеку по умолчанию */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: textColor }]}
        onPress={() => {
          if (!currentListId) {
            setListModalVisible(true);
          } else {
            setCatalogModalVisible(true);
          }
        }}
      >
        <Ionicons name="add" size={32} color="#080a0d" />
      </TouchableOpacity>

      {/* Модалка создания списка */}
      <Modal
        visible={listModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setListModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setListModalVisible(false)}>
          <View style={styles.modalBg}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: currentTheme.cardBg }]}>
                <Text style={[styles.modalHeader, { color: textColor }]}>{t.addList}</Text>
                <TextInput
                  style={[styles.input, { color: currentTheme.textDefault }]}
                  placeholder={t.enterListName}
                  placeholderTextColor="#888"
                  value={listNameInput}
                  onChangeText={setListNameInput}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setListModalVisible(false)}
                    style={styles.btnCancel}
                  >
                    <Text style={{ color: '#ff4444' }}>{t.cancel}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCreateList}
                    style={[styles.btnSave, { backgroundColor: textColor }]}
                  >
                    <Text style={{ color: '#080a0d', fontWeight: 'bold' }}>{t.save}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Модалка добавления товара вручную */}
      <Modal
        visible={itemModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeItemModal}
      >
        <TouchableWithoutFeedback onPress={closeItemModal}>
          <View style={styles.modalBg}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: currentTheme.cardBg }]}>
                <Text style={[styles.modalHeader, { color: textColor }]}>
                  {editingItemId
                    ? t.editItem
                    : targetCategoryForNewItem
                    ? `Добавить в "${targetCategoryForNewItem}"`
                    : t.addItem}
                </Text>

                <TextInput
                  style={[styles.input, { color: currentTheme.textDefault }]}
                  placeholder={t.enterItemName}
                  placeholderTextColor="#888"
                  value={itemName}
                  onChangeText={setItemName}
                />

                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0, color: currentTheme.textDefault }]}
                    placeholder={t.photoUrl}
                    placeholderTextColor="#888"
                    value={itemImage}
                    onChangeText={setItemImage}
                  />
                  <TouchableOpacity
                    style={[styles.btnSave, { backgroundColor: textColor, justifyContent: 'center' }]}
                    onPress={() => pickImageFromGallery(setItemImage)}
                  >
                    <Ionicons name="image-outline" size={20} color="#080a0d" />
                  </TouchableOpacity>
                </View>

                <View style={styles.unitContainer}>
                  {['г', 'кг', 'шт', 'л', 'мл', 'уп', 'банка'].map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[
                        styles.unitBadge,
                        itemUnit === u && { backgroundColor: textColor },
                      ]}
                      onPress={() => setItemUnit(u)}
                    >
                      <Text
                        style={{
                          color: itemUnit === u ? '#080a0d' : currentTheme.textDefault,
                          fontWeight: 'bold',
                        }}
                      >
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={closeItemModal} style={styles.btnCancel}>
                    <Text style={{ color: '#ff4444' }}>{t.cancel}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveItem}
                    style={[styles.btnSave, { backgroundColor: textColor }]}
                  >
                    <Text style={{ color: '#080a0d', fontWeight: 'bold' }}>{t.save}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Модалка Категориальной Библиотеки (Аккордеон) */}
      <Modal
        visible={catalogModalVisible}
        animationType="slide"
        transparent
        onRequestClose={applySelectedCatalogItems}
      >
        <TouchableWithoutFeedback onPress={applySelectedCatalogItems}>
          <View style={styles.modalBg}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { height: '85%', backgroundColor: currentTheme.cardBg }]}>
                <Text style={[styles.modalHeader, { color: textColor }]}>{t.catalog}</Text>
                
                <ScrollView style={{ flex: 1, marginVertical: 10 }}>
                  {categorizedCatalog.map((catGroup) => {
                    const isExpanded = !!expandedCategories[catGroup.category];
                    return (
                      <View key={catGroup.category} style={styles.categoryAccordion}>
                        <TouchableOpacity
                          style={[styles.categoryHeader, { borderBottomColor: currentTheme.border }]}
                          onPress={() => toggleCategory(catGroup.category)}
                        >
                          <Text style={[styles.categoryTitle, { color: textColor }]}>
                            {catGroup.category}
                          </Text>
                          <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={textColor}
                          />
                        </TouchableOpacity>

                        {isExpanded && (
                          <View style={styles.categoryBody}>
                            {catGroup.items.map((p) => {
                              const isChecked = !!selectedCatalogItems[p.id];
                              return (
                                <View key={p.id} style={styles.catalogCard}>
                                  <TouchableOpacity
                                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                                    onPress={() => toggleSelectCatalogItem(p)}
                                  >
                                    <Ionicons
                                      name={isChecked ? 'checkbox' : 'square-outline'}
                                      size={22}
                                      color={textColor}
                                      style={{ marginRight: 10 }}
                                    />
                                    {p.image ? (
                                      <Image source={{ uri: p.image }} style={styles.catalogThumbImage} />
                                    ) : (
                                      <View style={styles.catalogThumbPlaceholder}>
                                        <Ionicons name="basket-outline" size={16} color="#888" />
                                      </View>
                                    )}
                                    <Text style={[styles.catalogTitle, { color: currentTheme.textDefault }]}>
                                      {p.name}
                                    </Text>
                                  </TouchableOpacity>

                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <TouchableOpacity
                                      onPress={() => {
                                        setEditingCatalogProduct(p);
                                        setCatalogEditImage(p.image || '');
                                        setCatalogItemModalVisible(true);
                                      }}
                                    >
                                      <Ionicons name="pencil" size={16} color="#888" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => deleteFromMasterCatalog(p.id, p.name)}>
                                      <Ionicons name="trash-outline" size={16} color="#ff4444" />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              );
                            })}

                            <TouchableOpacity
                              style={[styles.addCategoryItemBtn, { borderColor: textColor }]}
                              onPress={() => addItemToCategory(catGroup.category)}
                            >
                              <Ionicons name="add-circle-outline" size={18} color={textColor} />
                              <Text style={{ color: textColor, fontWeight: 'bold' }}>
                                Добавить товар в категорию
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </ScrollView>

                <TouchableOpacity
                  onPress={applySelectedCatalogItems}
                  style={[styles.btnSave, { backgroundColor: textColor, alignSelf: 'center', width: '100%' }]}
                >
                  <Text style={{ color: '#080a0d', fontWeight: 'bold', textAlign: 'center' }}>
                    ОК
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Модалка изменения фото товара в Библиотеке */}
      <Modal
        visible={catalogItemModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setCatalogItemModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setCatalogItemModalVisible(false)}>
          <View style={styles.modalBg}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { width: '85%', backgroundColor: currentTheme.cardBg }]}>
                <Text style={[styles.modalHeader, { color: textColor }]}>Изменить фото товара</Text>
                <Text style={{ color: currentTheme.textDefault, marginBottom: 12 }}>
                  {editingCatalogProduct?.name}
                </Text>

                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0, color: currentTheme.textDefault }]}
                    placeholder={t.photoUrl}
                    placeholderTextColor="#888"
                    value={catalogEditImage}
                    onChangeText={setCatalogEditImage}
                  />
                  <TouchableOpacity
                    style={[styles.btnSave, { backgroundColor: textColor, justifyContent: 'center' }]}
                    onPress={() => pickImageFromGallery(setCatalogEditImage)}
                  >
                    <Ionicons name="image-outline" size={20} color="#080a0d" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setCatalogItemModalVisible(false)}
                    style={styles.btnCancel}
                  >
                    <Text style={{ color: '#ff4444' }}>{t.cancel}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveCatalogImage}
                    style={[styles.btnSave, { backgroundColor: textColor }]}
                  >
                    <Text style={{ color: '#080a0d', fontWeight: 'bold' }}>{t.save}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Модалка смены количества */}
      <Modal
        visible={qtyModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setQtyModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setQtyModalVisible(false)}>
          <View style={styles.modalBg}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { width: '80%', backgroundColor: currentTheme.cardBg }]}>
                <Text style={[styles.modalHeader, { color: textColor }]}>{t.enterQty}</Text>
                <TextInput
                  style={[styles.input, { color: currentTheme.textDefault }]}
                  keyboardType="numeric"
                  value={directQtyText}
                  onChangeText={setDirectQtyText}
                  autoFocus
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setQtyModalVisible(false)}
                    style={styles.btnCancel}
                  >
                    <Text style={{ color: '#ff4444' }}>{t.cancel}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={saveDirectQty}
                    style={[styles.btnSave, { backgroundColor: textColor }]}
                  >
                    <Text style={{ color: '#080a0d', fontWeight: 'bold' }}>{t.save}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Настройки (Выход по внешнему клику и свайпу назад без сохранения изменений) */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSettingsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSettingsVisible(false)}>
          <View style={styles.modalBg}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: currentTheme.cardBg }]}>
                <Text style={[styles.modalHeader, { color: textColor }]}>{t.settings}</Text>

                <Text style={styles.sectionLabel}>{t.language}</Text>
                <View style={styles.rowPicker}>
                  {['ru', 'en'].map((l) => (
                    <TouchableOpacity
                      key={l}
                      style={[
                        styles.chip,
                        lang === l && { backgroundColor: textColor },
                      ]}
                      onPress={() => saveSetting('@app_lang', l, setLang)}
                    >
                      <Text style={{ color: lang === l ? '#000' : currentTheme.textDefault }}>
                        {l.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>{t.theme}</Text>
                <View style={styles.rowPicker}>
                  {['dark', 'gray', 'light'].map((k) => (
                    <TouchableOpacity
                      key={k}
                      style={[
                        styles.chip,
                        themeKey === k && { backgroundColor: textColor },
                      ]}
                      onPress={() => saveSetting('@app_theme_key', k, setThemeKey)}
                    >
                      <Text style={{ color: themeKey === k ? '#000' : currentTheme.textDefault }}>
                        {k.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>{t.textColor}</Text>
                <View style={styles.rowPicker}>
                  {TEXT_COLORS.map((c) => (
                    <TouchableOpacity
                      key={c.value}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: c.value },
                        textColor === c.value && { borderWidth: 2, borderColor: '#fff' },
                      ]}
                      onPress={() => saveSetting('@app_text_color', c.value, setTextColor)}
                    />
                  ))}
                </View>

                <Text style={styles.sectionLabel}>{t.viewMode}</Text>
                <View style={styles.rowPicker}>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      viewMode === 'grid' && { backgroundColor: textColor },
                    ]}
                    onPress={() => saveSetting('@app_view_mode', 'grid', setViewMode)}
                  >
                    <Text style={{ color: viewMode === 'grid' ? '#000' : currentTheme.textDefault }}>
                      Плитка
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      viewMode === 'list' && { backgroundColor: textColor },
                    ]}
                    onPress={() => saveSetting('@app_view_mode', 'list', setViewMode)}
                  >
                    <Text style={{ color: viewMode === 'list' ? '#000' : currentTheme.textDefault }}>
                      Минимализм
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.switchRow}>
                  <Text style={{ color: currentTheme.textDefault, flex: 1, fontSize: 13 }}>
                    {t.lockViewMode}
                  </Text>
                  <Switch
                    value={isViewLocked}
                    onValueChange={(v) => saveSetting('@app_view_locked', v, setIsViewLocked)}
                    trackColor={{ false: '#444', true: textColor }}
                  />
                </View>

                <Text style={styles.sectionLabel}>{t.markStyle}</Text>
                <View style={styles.rowPicker}>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      markStyle === 'color' && { backgroundColor: textColor },
                    ]}
                    onPress={() => saveSetting('@app_mark_style', 'color', setMarkStyle)}
                  >
                    <Text style={{ color: markStyle === 'color' ? '#000' : currentTheme.textDefault }}>
                      {t.markColor}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      markStyle === 'check' && { backgroundColor: textColor },
                    ]}
                    onPress={() => saveSetting('@app_mark_style', 'check', setMarkStyle)}
                  >
                    <Text style={{ color: markStyle === 'check' ? '#000' : currentTheme.textDefault }}>
                      {t.markCheck}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => setSettingsVisible(false)}
                  style={[styles.btnSave, { backgroundColor: textColor, marginTop: 16 }]}
                >
                  <Text style={{ color: '#080a0d', fontWeight: 'bold', textAlign: 'center' }}>
                    ОК
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },

  listFolderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  folderTitle: { fontSize: 16, fontWeight: 'bold' },

  gridCard: {
    margin: 6,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridImageArea: { width: '100%', height: 90, borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
  gridImage: { width: '100%', height: '100%' },
  gridImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
  gridControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardActionsRow: { flexDirection: 'row', gap: 14, marginTop: 8 },

  listCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  checkArea: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  listTitle: { fontSize: 16, fontWeight: '500' },
  listThumbImage: { width: 32, height: 32, borderRadius: 6 },

  cardBought: { opacity: 0.35 },
  qtyBtn: { paddingHorizontal: 6 },
  qtyText: { fontSize: 14, fontWeight: 'bold', paddingHorizontal: 4 },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '88%',
    borderRadius: 12,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 15,
  },

  categoryAccordion: {
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  categoryTitle: { fontSize: 16, fontWeight: 'bold' },
  categoryBody: { padding: 8 },

  catalogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  catalogThumbImage: { width: 32, height: 32, borderRadius: 6, marginRight: 10 },
  catalogThumbPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catalogTitle: { flex: 1, fontSize: 14, fontWeight: '500' },
  addCategoryItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
    borderStyle: 'dashed',
  },

  unitContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 6 },
  unitBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  btnCancel: { padding: 10 },
  btnSave: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },

  sectionLabel: { color: '#888', fontSize: 13, marginTop: 10, marginBottom: 8 },
  rowPicker: { flexDirection: 'row', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  colorCircle: { width: 32, height: 32, borderRadius: 16 },
});
