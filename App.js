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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Дефолтный ассортимент с картинками Unsplash для каждого товара
const DEFAULT_CATEGORIZED_PRESETS = [
  {
    category: 'Овощи и Зелень',
    items: [
      { id: 'p_c1', name: 'Огурцы', unit: 'кг', image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=200' },
      { id: 'p_c2', name: 'Помидоры', unit: 'кг', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200' },
      { id: 'p_c3', name: 'Лук', unit: 'кг', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200' },
      { id: 'p_c4', name: 'Чеснок', unit: 'шт', image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=200' },
      { id: 'p_c5', name: 'Свекла (Буряк)', unit: 'кг', image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=200' },
      { id: 'p_c6', name: 'Морковь', unit: 'кг', image: 'https://images.unsplash.com/photo-1598170845058-12ef4a457c3b?w=200' },
      { id: 'p_c7', name: 'Картофель', unit: 'кг', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200' },
      { id: 'p_c8', name: 'Капуста', unit: 'кг', image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=200' },
      { id: 'p_c9', name: 'Авокадо', unit: 'шт', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200' },
      { id: 'p_c10', name: 'Грибы (Шампиньоны)', unit: 'кг', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200' },
      { id: 'p_c11', name: 'Вешенки', unit: 'кг', image: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=200' },
      { id: 'p_c12', name: 'Петрушка', unit: 'уп', image: 'https://images.unsplash.com/photo-1628773822503-930a8586f34b?w=200' },
      { id: 'p_c13', name: 'Салат', unit: 'уп', image: 'https://images.unsplash.com/photo-1515778767554-42d4b373f2b3?w=200' },
      { id: 'p_c14', name: 'Укроп', unit: 'уп', image: 'https://images.unsplash.com/photo-1598642732050-7058d7124976?w=200' },
    ],
  },
  {
    category: 'Фрукты и Ягоды',
    items: [
      { id: 'p_f1', name: 'Бананы', unit: 'кг', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200' },
      { id: 'p_f2', name: 'Яблоки', unit: 'кг', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200' },
      { id: 'p_f3', name: 'Клубника', unit: 'кг', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200' },
      { id: 'p_f4', name: 'Виноград', unit: 'кг', image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=200' },
      { id: 'p_f5', name: 'Персики', unit: 'кг', image: 'https://images.unsplash.com/photo-1629828874514-c1e5103f2150?w=200' },
      { id: 'p_f6', name: 'Абрикосы', unit: 'кг', image: 'https://images.unsplash.com/photo-1595231776515-ddffb1f4d2b4?w=200' },
      { id: 'p_f7', name: 'Нектарин', unit: 'кг', image: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?w=200' },
      { id: 'p_f8', name: 'Груши', unit: 'кг', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200' },
      { id: 'p_f9', name: 'Манго', unit: 'шт', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200' },
      { id: 'p_f10', name: 'Голубика (Черника)', unit: 'кг', image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=200' },
    ],
  },
  {
    category: 'Бакалея и Крупы',
    items: [
      { id: 'p_b1', name: 'Вермишель', unit: 'уп', image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=200' },
      { id: 'p_b2', name: 'Рис', unit: 'уп', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200' },
      { id: 'p_b3', name: 'Гречка', unit: 'уп', image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=200' },
      { id: 'p_b4', name: 'Пшеничная крупа', unit: 'уп', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200' },
      { id: 'p_b5', name: 'Горох', unit: 'уп', image: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a63?w=200' },
      { id: 'p_b6', name: 'Фасоль', unit: 'уп', image: 'https://images.unsplash.com/photo-1551462147-3a88588d445f?w=200' },
      { id: 'p_b7', name: 'Чечевица', unit: 'уп', image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=200' },
      { id: 'p_b8', name: 'Спагетти', unit: 'уп', image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6288764?w=200' },
      { id: 'p_b9', name: 'Кофе', unit: 'уп', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200' },
    ],
  },
  {
    category: 'Выпечка и Хлеб',
    items: [
      { id: 'p_h1', name: 'Хлеб Украинский', unit: 'шт', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200' },
      { id: 'p_h2', name: 'Батон', unit: 'шт', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=200' },
      { id: 'p_h3', name: 'Багет', unit: 'шт', image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=200' },
      { id: 'p_h4', name: 'Чиабатта', unit: 'шт', image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=200' },
      { id: 'p_h5', name: 'Хлеб чёрный', unit: 'шт', image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=200' },
    ],
  },
  {
    category: 'Молочные продукты',
    items: [
      { id: 'p_m1', name: 'Кефир', unit: 'л', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200' },
      { id: 'p_m2', name: 'Йогурт', unit: 'шт', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200' },
      { id: 'p_m3', name: 'Творог', unit: 'г', image: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?w=200' },
      { id: 'p_m4', name: 'Закваска', unit: 'л', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200' },
      { id: 'p_m5', name: 'Молоко', unit: 'л', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200' },
      { id: 'p_m6', name: 'Сыр', unit: 'г', image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=200' },
    ],
  },
  {
    category: 'Мясо и Колбасы',
    items: [
      { id: 'p_mk1', name: 'Колбаса докторская', unit: 'кг', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200' },
      { id: 'p_mk2', name: 'Колбаса сырокопчёная', unit: 'кг', image: 'https://images.unsplash.com/photo-1592686092794-6d9b3a4a7536?w=200' },
      { id: 'p_mk3', name: 'Свинина', unit: 'кг', image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=200' },
      { id: 'p_mk4', name: 'Сало', unit: 'кг', image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200' },
      { id: 'p_mk5', name: 'Курица', unit: 'кг', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200' },
    ],
  },
  {
    category: 'Консервы',
    items: [
      { id: 'p_kn1', name: 'Килька', unit: 'банка', image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=200' },
      { id: 'p_kn2', name: 'Бычки', unit: 'банка', image: 'https://images.unsplash.com/photo-1605035075487-eb9568dfdf79?w=200' },
      { id: 'p_kn3', name: 'Консервы свинина', unit: 'банка', image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=200' },
      { id: 'p_kn4', name: 'Скумбрия', unit: 'банка', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200' },
      { id: 'p_kn5', name: 'Консервы курятина', unit: 'банка', image: 'https://images.unsplash.com/photo-1569058242252-623df46b5025?w=200' },
      { id: 'p_kn6', name: 'Консервы говядина', unit: 'банка', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200' },
    ],
  },
  {
    category: 'Бытовая химия',
    items: [
      { id: 'p_ch1', name: 'Средство для унитаза', unit: 'шт', image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=200' },
      { id: 'p_ch2', name: 'Средство для ванной', unit: 'шт', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200' },
      { id: 'p_ch3', name: 'Средство для плиты', unit: 'шт', image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=200' },
      { id: 'p_ch4', name: 'Cif', unit: 'шт', image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=200' },
      { id: 'p_ch5', name: 'Fairy', unit: 'шт', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200' },
    ],
  },
  {
    category: 'Безалкогольные напитки',
    items: [
      { id: 'p_dr1', name: 'Живчик', unit: 'л', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200' },
      { id: 'p_dr2', name: 'Вода', unit: 'л', image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=200' },
      { id: 'p_dr3', name: 'Пепси', unit: 'л', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200' },
      { id: 'p_dr4', name: 'Фанта', unit: 'л', image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=200' },
      { id: 'p_dr5', name: 'Кока-Кола', unit: 'л', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200' },
      { id: 'p_dr6', name: 'Спрайт', unit: 'л', image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=200' },
      { id: 'p_dr7', name: 'Байкал', unit: 'л', image: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=200' },
      { id: 'p_dr8', name: 'Тархун', unit: 'л', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200' },
      { id: 'p_dr9', name: 'Питбуль', unit: 'л', image: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=200' },
      { id: 'p_dr10', name: 'Моджо', unit: 'л', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=200' },
      { id: 'p_dr11', name: 'Моршинская', unit: 'л', image: 'https://images.unsplash.com/photo-1560023907-5f313c8754b9?w=200' },
      { id: 'p_dr12', name: 'Оболонская', unit: 'л', image: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=200' },
      { id: 'p_dr13', name: 'Квас', unit: 'л', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200' },
      { id: 'p_dr14', name: 'Сок томатный', unit: 'л', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=200' },
      { id: 'p_dr15', name: 'Сок апельсиновый', unit: 'л', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200' },
      { id: 'p_dr16', name: 'Сок виноградно-яблочный', unit: 'л', image: 'https://images.unsplash.com/photo-1579705745070-a7593683a610?w=200' },
      { id: 'p_dr17', name: 'Сок мультивитамин', unit: 'л', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=200' },
      { id: 'p_dr18', name: 'Сок персиковый', unit: 'л', image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=200' },
      { id: 'p_dr19', name: 'Сок грейпфрутовый', unit: 'л', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=200' },
      { id: 'p_dr20', name: 'Сок сицилийский апельсин', unit: 'л', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200' },
    ],
  },
  {
    category: 'Алкогольные напитки',
    items: [
      { id: 'p_al1', name: 'Пиво', unit: 'л', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=200' },
      { id: 'p_al2', name: 'Водка', unit: 'л', image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=200' },
      { id: 'p_al3', name: 'Виски', unit: 'л', image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=200' },
      { id: 'p_al4', name: 'Джин', unit: 'л', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200' },
      { id: 'p_al5', name: 'Ликёр', unit: 'л', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=200' },
    ],
  },
];

const TRANSLATIONS = {
  ru: {
    title: 'МОИ СПИСКИ',
    shareHeader: '🛒 СПИСОК ПОКУПОК:',
    addList: 'Создать список',
    addItem: 'Добавить товар в библиотеку',
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
    themes: {
      dark: 'Тёмная',
      gray: 'Серая',
      light: 'Светлая',
    },
    modes: {
      grid: 'Плитка',
      list: 'Минимализм',
    },
  },
  en: {
    title: 'MY LISTS',
    shareHeader: '🛒 GROCERY LIST:',
    addList: 'Create List',
    addItem: 'Add Item to Library',
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
    themes: {
      dark: 'Dark',
      gray: 'Gray',
      light: 'Light',
    },
    modes: {
      grid: 'Grid',
      list: 'List',
    },
  },
};

const THEMES = {
  dark: { bg: '#0b0e14', cardBg: '#161b22', border: '#21262d', textDefault: '#e6edf3' },
  gray: { bg: '#181a1f', cardBg: '#22262e', border: '#2d3139', textDefault: '#d7dadc' },
  light: { bg: '#f0f2f5', cardBg: '#ffffff', border: '#d0d7de', textDefault: '#1f2328' },
};

const TEXT_COLORS = [
  { label: 'Светло-серый', value: '#e6edf3' },
  { label: 'Голубой', value: '#00f0ff' },
  { label: 'Синий', value: '#3b82f6' }, // Третий цвет - Синий по умолчанию
  { label: 'Жёлтый', value: '#ffd700' },
  { label: 'Мятный', value: '#2ecc71' },
];

export default function App() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // По умолчанию Light и 3-й цвет (Синий)
  const [lang, setLang] = useState('ru');
  const [themeKey, setThemeKey] = useState('light');
  const [textColor, setTextColor] = useState('#3b82f6');
  const [viewMode, setViewMode] = useState('grid');
  const [isViewLocked, setIsViewLocked] = useState(false);
  const [markStyle, setMarkStyle] = useState('color');

  const [lists, setLists] = useState([]);
  const [categorizedCatalog, setCategorizedCatalog] = useState([]);
  const [currentListId, setCurrentListId] = useState(null);

  // Аккордеон и поиск в библиотеке
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedCatalogItems, setSelectedCatalogItems] = useState({});
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');

  // Категория для добавления вручную
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
      const savedCatalog = await AsyncStorage.getItem('@app_categorized_catalog_v5');

      if (savedLang) setLang(JSON.parse(savedLang));
      if (savedTheme) setThemeKey(JSON.parse(savedTheme));
      if (savedColor) setTextColor(JSON.parse(savedColor));
      if (savedView) setViewMode(JSON.parse(savedView));
      if (savedLocked !== null) setIsViewLocked(JSON.parse(savedLocked));
      if (savedMark) setMarkStyle(JSON.parse(savedMark));

      let masterCat = DEFAULT_CATEGORIZED_PRESETS;
      if (savedCatalog) {
        const parsed = JSON.parse(savedCatalog);
        masterCat = mergeCatalogs(DEFAULT_CATEGORIZED_PRESETS, parsed);
      }
      setCategorizedCatalog(masterCat);
      await AsyncStorage.setItem('@app_categorized_catalog_v5', JSON.stringify(masterCat));

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
          const itemIdx = result[catIndex].items.findIndex(
            (i) => i.name.toLowerCase() === defItem.name.toLowerCase()
          );
          if (itemIdx === -1) {
            result[catIndex].items.push(defItem);
          } else if (!result[catIndex].items[itemIdx].image && defItem.image) {
            // Восстанавливаем картинку, если в хранилище её не было
            result[catIndex].items[itemIdx].image = defItem.image;
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
    await AsyncStorage.setItem('@app_categorized_catalog_v5', JSON.stringify(newCatalog));
  };

  const saveSetting = async (key, value, setter) => {
    setter(value);
    await AsyncStorage.setItem(key, JSON.stringify(value));
  };

  const currentList = lists.find((l) => l.id === currentListId);

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

  const toggleCategory = (catName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  const toggleSelectCatalogItem = (item) => {
    setSelectedCatalogItems((prev) => ({
      ...prev,
      [item.id]: prev[item.id] ? null : item,
    }));
  };

  const applySelectedCatalogItems = () => {
    if (!currentListId) return;

    const itemsToAdd = Object.values(selectedCatalogItems).filter(Boolean);
    if (itemsToAdd.length === 0) {
      setCatalogModalVisible(false);
      setCatalogSearchQuery('');
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
    setCatalogSearchQuery('');
    setCatalogModalVisible(false);
  };

  const addItemToCategory = (categoryName) => {
    setTargetCategoryForNewItem(categoryName);
    closeItemModal();
    setItemModalVisible(true);
  };

  const handleSaveCatalogImage = () => {
    if (!editingCatalogProduct) return;

    const updated = categorizedCatalog.map((cat) => ({
      ...cat,
      items: cat.items.map((p) =>
        p.id === editingCatalogProduct.id ? { ...p, image: catalogEditImage } : p
      ),
    }));

    saveCategorizedCatalog(updated);

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

  // ИСПРАВЛЕННОЕ СОХРАНЕНИЕ ТОВАРА
  const handleSaveItem = () => {
    if (!itemName.trim()) return;
    const trimmedName = itemName.trim();

    // 1. Редактирование существующего товара в текущем активном списке
    if (editingItemId && currentListId) {
      const countVal = parseFloat(itemCount) || 1;
      const updatedLists = lists.map((list) => {
        if (list.id === currentListId) {
          const updatedItems = list.items.map((i) =>
            i.id === editingItemId
              ? { ...i, name: trimmedName, count: countVal, unit: itemUnit, image: itemImage }
              : i
          );
          return { ...list, items: updatedItems };
        }
        return list;
      });
      saveLists(updatedLists);
      closeItemModal();
      return;
    }

    // 2. Добавление товара в библиотеку
    let targetCatName = targetCategoryForNewItem || 'Разное';

    const newProduct = {
      id: Date.now().toString() + Math.random().toString().substr(2, 4),
      name: trimmedName,
      unit: itemUnit,
      image: itemImage,
    };

    let catFound = false;

    // Сравнение имен категорий без учета регистра
    let updatedCat = categorizedCatalog.map((cat) => {
      if (cat.category.trim().toLowerCase() === targetCatName.trim().toLowerCase()) {
        catFound = true;
        targetCatName = cat.category; // Фиксируем точное имя из базы
        const exists = cat.items.some((i) => i.name.toLowerCase() === trimmedName.toLowerCase());
        if (!exists) {
          return {
            ...cat,
            items: [...cat.items, newProduct],
          };
        }
      }
      return cat;
    });

    // Создаем категорию, если её ещё нет в структуре
    if (!catFound) {
      updatedCat.push({
        category: targetCatName,
        items: [newProduct],
      });
    }

    saveCategorizedCatalog(updatedCat);

    // Раскрываем категорию, куда добавили товар
    setExpandedCategories((prev) => ({
      ...prev,
      [targetCatName]: true,
    }));

    closeItemModal();
  };

  const createAndSelectFromSearch = (queryName) => {
    if (!queryName.trim()) return;
    const trimmed = queryName.trim();

    const newPreset = {
      id: Date.now().toString() + Math.random().toString().substr(2, 4),
      name: trimmed,
      unit: 'шт',
      image: '',
    };

    const updatedCat = categorizedCatalog.map((cat, idx) => {
      if (idx === 0) {
        return {
          ...cat,
          items: [...cat.items, newPreset],
        };
      }
      return cat;
    });

    saveCategorizedCatalog(updatedCat);
    toggleSelectCatalogItem(newPreset);
    setCatalogSearchQuery('');
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

  // Поисковая строка в библиотеке товаров
  const searchResults = React.useMemo(() => {
    if (!catalogSearchQuery.trim()) return [];
    const query = catalogSearchQuery.toLowerCase().trim();
    const results = [];

    categorizedCatalog.forEach((cat) => {
      cat.items.forEach((item) => {
        if (item.name.toLowerCase().includes(query)) {
          results.push({ ...item, categoryName: cat.category });
        }
      });
    });

    return results;
  }, [catalogSearchQuery, categorizedCatalog]);

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

      {/* Кнопка Плюс */}
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
        <Ionicons name="add" size={32} color="#ffffff" />
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
                    <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>{t.save}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Модалка добавления/редактирования товара */}
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
                    <Ionicons name="image-outline" size={20} color="#ffffff" />
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
                          color: itemUnit === u ? '#ffffff' : currentTheme.textDefault,
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
                    <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>{t.save}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Модалка Библиотеки товаров */}
      <Modal
        visible={catalogModalVisible}
        animationType="slide"
        transparent
        onRequestClose={applySelectedCatalogItems}
      >
        <TouchableWithoutFeedback onPress={applySelectedCatalogItems}>
          <View style={styles.modalBg}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { height: '88%', backgroundColor: currentTheme.cardBg }]}>
                <Text style={[styles.modalHeader, { color: textColor }]}>{t.catalog}</Text>

                {/* Поисковая строка */}
                <View style={styles.searchBarContainer}>
                  <Ionicons name="search-outline" size={20} color="#888" style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.searchInput, { color: currentTheme.textDefault }]}
                    placeholder="Быстрый поиск товаров..."
                    placeholderTextColor="#888"
                    value={catalogSearchQuery}
                    onChangeText={setCatalogSearchQuery}
                  />
                  {catalogSearchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setCatalogSearchQuery('')}>
                      <Ionicons name="close-circle" size={18} color="#888" />
                    </TouchableOpacity>
                  )}
                </View>

                <ScrollView style={{ flex: 1, marginVertical: 10 }}>
                  {catalogSearchQuery.trim().length > 0 ? (
                    <View>
                      <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 10 }}>
                        Результаты поиска:
                      </Text>
                      {searchResults.length > 0 ? (
                        searchResults.map((p) => {
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
                                <View style={{ flex: 1 }}>
                                  <Text style={[styles.catalogTitle, { color: currentTheme.textDefault }]}>
                                    {p.name}
                                  </Text>
                                  <Text style={{ fontSize: 11, color: '#888' }}>{p.categoryName}</Text>
                                </View>
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
                        })
                      ) : (
                        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                          <Text style={{ color: currentTheme.textDefault, marginBottom: 12 }}>
                            Товар не найден в библиотеке
                          </Text>
                          <TouchableOpacity
                            style={[styles.addCategoryItemBtn, { borderColor: textColor, width: '100%' }]}
                            onPress={() => createAndSelectFromSearch(catalogSearchQuery)}
                          >
                            <Ionicons name="add-circle-outline" size={20} color={textColor} />
                            <Text style={{ color: textColor, fontWeight: 'bold' }}>
                              Добавить "{catalogSearchQuery.trim()}" в библиотеку
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ) : (
                    /* Библиотека категорий */
                    categorizedCatalog.map((catGroup) => {
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
                    })
                  )}
                </ScrollView>

                <TouchableOpacity
                  onPress={applySelectedCatalogItems}
                  style={[styles.btnSave, { backgroundColor: textColor, alignSelf: 'center', width: '100%' }]}
                >
                  <Text style={{ color: '#ffffff', fontWeight: 'bold', textAlign: 'center' }}>
                    ОК
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Модалка смены фото товара в Библиотеке */}
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
                    <Ionicons name="image-outline" size={20} color="#ffffff" />
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
                    <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>{t.save}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Модалка изменения количества */}
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
                    <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>{t.save}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Настройки */}
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
                      <Text style={{ color: lang === l ? '#ffffff' : currentTheme.textDefault }}>
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
                      <Text style={{ color: themeKey === k ? '#ffffff' : currentTheme.textDefault }}>
                        {t.themes[k]}
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
                        textColor === c.value && { borderWidth: 2, borderColor: '#000' },
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
                    <Text style={{ color: viewMode === 'grid' ? '#ffffff' : currentTheme.textDefault }}>
                      {t.modes.grid}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      viewMode === 'list' && { backgroundColor: textColor },
                    ]}
                    onPress={() => saveSetting('@app_view_mode', 'list', setViewMode)}
                  >
                    <Text style={{ color: viewMode === 'list' ? '#ffffff' : currentTheme.textDefault }}>
                      {t.modes.list}
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
                    <Text style={{ color: markStyle === 'color' ? '#ffffff' : currentTheme.textDefault }}>
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
                    <Text style={{ color: markStyle === 'check' ? '#ffffff' : currentTheme.textDefault }}>
                      {t.markCheck}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => setSettingsVisible(false)}
                  style={[styles.btnSave, { backgroundColor: textColor, marginTop: 16 }]}
                >
                  <Text style={{ color: '#ffffff', fontWeight: 'bold', textAlign: 'center' }}>
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
    maxHeight: '88%',
  },
  modalHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 15,
  },

  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
  },

  categoryAccordion: {
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
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
  catalogTitle: { fontSize: 14, fontWeight: '500' },
  addCategoryItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    borderStyle: 'dashed',
  },

  unitContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 6 },
  unitBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: 'rgba(0, 0, 0, 0.05)' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  btnCancel: { padding: 10 },
  btnSave: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },

  sectionLabel: { color: '#888', fontSize: 13, marginTop: 10, marginBottom: 8 },
  rowPicker: { flexDirection: 'row', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: 'rgba(0, 0, 0, 0.08)' },
  colorCircle: { width: 32, height: 32, borderRadius: 16 },
});
