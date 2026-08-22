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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Базовые тексты
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
    photoUrl: 'URL фото (или из галереи)',
    pickGallery: 'Выбрать из галереи',
    save: 'Сохранить',
    cancel: 'Отмена',
    settings: 'Настройки',
    theme: 'Тема фона',
    textColor: 'Цвет текста',
    viewMode: 'Режим отображения',
    lockViewMode: 'Заблокировать смену вида в шапке',
    markStyle: 'Стиль отмеченных товаров',
    markColor: 'Цвет (Красный/Зелёный)',
    markCheck: 'Галочка',
    shareProduct: 'Поделиться товаром',
    defaultListName: 'Мой первый список',
    defaultItems: [
      { id: '1', name: 'Молоко', count: 1, unit: 'л', image: '', bought: false },
      { id: '2', name: 'Картофель', count: 2, unit: 'кг', image: '', bought: false },
    ],
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
    photoUrl: 'Photo URL (or from gallery)',
    pickGallery: 'Pick from gallery',
    save: 'Save',
    cancel: 'Cancel',
    settings: 'Settings',
    theme: 'Background Theme',
    textColor: 'Text Color',
    viewMode: 'View Mode',
    lockViewMode: 'Lock view switcher in header',
    markStyle: 'Marked items style',
    markColor: 'Color (Red/Green)',
    markCheck: 'Checkmark',
    shareProduct: 'Share Product',
    defaultListName: 'My First List',
    defaultItems: [
      { id: '1', name: 'Milk', count: 1, unit: 'l', image: '', bought: false },
      { id: '2', name: 'Potato', count: 2, unit: 'kg', image: '', bought: false },
    ],
  },
};

const THEMES = {
  dark: { bg: '#080a0d', cardBg: '#ffffff0a', border: '#ffffff15' },
  gray: { bg: '#1e222b', cardBg: '#ffffff10', border: '#ffffff22' },
  light: { bg: '#f4f5f7', cardBg: '#ffffff', border: '#00000010' },
};

const TEXT_COLORS = [
  { label: 'Белый', value: '#ffffff' },
  { label: 'Голубой', value: '#00f0ff' },
  { label: 'Синий', value: '#007AFF' },
  { label: 'Жёлтый', value: '#ffd700' },
  { label: 'Серый', value: '#a0a5b5' },
  { label: 'Чёрный', value: '#000000' },
];

export default function App() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Настройки
  const [lang, setLang] = useState('ru');
  const [themeKey, setThemeKey] = useState('dark');
  const [textColor, setTextColor] = useState('#00f0ff');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isViewLocked, setIsViewLocked] = useState(false);
  const [markStyle, setMarkStyle] = useState('color'); // 'color' (красный/зеленый) | 'check'

  // Списки и выбранный список
  const [lists, setLists] = useState([]);
  const [currentListId, setCurrentListId] = useState(null);

  // Модалка создания/редактирования списка
  const [listModalVisible, setListModalVisible] = useState(false);
  const [listNameInput, setListNameInput] = useState('');

  // Модалка товара
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCount, setItemCount] = useState('1');
  const [itemUnit, setItemUnit] = useState('шт');
  const [itemImage, setItemImage] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);

  // Модалка быстрого ввода количества
  const [qtyModalVisible, setQtyModalVisible] = useState(false);
  const [selectedItemForQty, setSelectedItemForQty] = useState(null);
  const [directQtyText, setDirectQtyText] = useState('');

  // Модалка настроек
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
      const savedLists = await AsyncStorage.getItem('@app_grocery_lists_v1');

      if (savedLang) setLang(savedLang);
      if (savedTheme) setThemeKey(savedTheme);
      if (savedColor) setTextColor(savedColor);
      if (savedView) setViewMode(savedView);
      if (savedLocked !== null) setIsViewLocked(JSON.parse(savedLocked));
      if (savedMark) setMarkStyle(savedMark);

      if (savedLists) {
        const parsed = JSON.parse(savedLists);
        setLists(parsed);
      } else {
        const initialLists = [
          {
            id: '1',
            name: TRANSLATIONS[savedLang || 'ru'].defaultListName,
            items: TRANSLATIONS[savedLang || 'ru'].defaultItems,
          },
        ];
        setLists(initialLists);
        await AsyncStorage.setItem('@app_grocery_lists_v1', JSON.stringify(initialLists));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveLists = async (newLists) => {
    setLists(newLists);
    await AsyncStorage.setItem('@app_grocery_lists_v1', JSON.stringify(newLists));
  };

  const saveSetting = async (key, value, setter) => {
    setter(value);
    await AsyncStorage.setItem(key, JSON.stringify(value));
  };

  const currentList = lists.find((l) => l.id === currentListId);

  // --- Управление списками ---
  const handleCreateList = () => {
    if (!listNameInput.trim()) return;
    const newList = { id: Date.now().toString(), name: listNameInput, items: [] };
    const updated = [...lists, newList];
    saveLists(updated);
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

  // --- Управление товарами ---
  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Ошибка', 'Нужен доступ к галерее');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0].uri) {
      setItemImage(result.assets[0].uri);
    }
  };

  const handleSaveItem = () => {
    if (!itemName.trim() || !currentListId) return;

    const updatedLists = lists.map((list) => {
      if (list.id === currentListId) {
        if (editingItemId) {
          const updatedItems = list.items.map((i) =>
            i.id === editingItemId
              ? {
                  ...i,
                  name: itemName,
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
            name: itemName,
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

  // --- Модалки товара ---
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
  };

  // Быстрое количество
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

  // --- Отправка ---
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
    if (item.image && item.image.startsWith('http')) {
      msg += `\nСсылка на фото: ${item.image}`;
    }
    try {
      if (item.image && !item.image.startsWith('http')) {
        await Share.share({ url: item.image, message: msg });
      } else {
        await Share.share({ message: msg });
      }
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
          {/* Переключатель вида (если не заблокирован) */}
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

      {/* ЭКРАН 1: ВЫБОР СПИСКОВ */}
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
                  <Text style={{ color: '#888', fontSize: 13 }}>
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
        /* ЭКРАН 2: ТОВАРЫ В ВЫБРАННОМ СПИСКЕ */
        <FlatList
          key={`${viewMode}-${numColumns}`}
          data={currentList.items}
          numColumns={numColumns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => {
            // Подсветка цветом (Красный/Зеленый) или Стандартный стиль
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
                      <Image source={{ uri: item.image }} style={styles.gridImage} />
                    ) : (
                      <View style={[styles.gridImagePlaceholder, { borderColor: textColor }]}>
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

            // РЕЖИМ СПИСКА
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
                  <Text style={[styles.listTitle, { color: textColor }]}>{item.name}</Text>
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

      {/* Кнопка добавления (Списка или Товара) */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: textColor }]}
        onPress={() => {
          if (!currentListId) {
            setListModalVisible(true);
          } else {
            closeItemModal();
            setItemModalVisible(true);
          }
        }}
      >
        <Ionicons name="add" size={32} color="#080a0d" />
      </TouchableOpacity>

      {/* Модалка создания списка */}
      <Modal visible={listModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>{t.addList}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.enterListName}
              placeholderTextColor="#666"
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
        </View>
      </Modal>

      {/* Модалка добавления/редактирования товара */}
      <Modal visible={itemModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>{editingItemId ? t.editItem : t.addItem}</Text>

            <TextInput
              style={styles.input}
              placeholder={t.enterItemName}
              placeholderTextColor="#666"
              value={itemName}
              onChangeText={setItemName}
            />

            <TextInput
              style={styles.input}
              placeholder={t.photoUrl}
              placeholderTextColor="#666"
              value={itemImage}
              onChangeText={setItemImage}
            />

            <TouchableOpacity
              style={[styles.btnGallery, { borderColor: textColor }]}
              onPress={pickImageFromGallery}
            >
              <Ionicons name="image-outline" size={20} color={textColor} />
              <Text style={{ color: textColor, fontWeight: '500' }}>{t.pickGallery}</Text>
            </TouchableOpacity>

            <View style={styles.unitContainer}>
              {['г', 'кг', 'шт', 'л', 'мл', 'уп'].map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[
                    styles.unitBadge,
                    itemUnit === u && { backgroundColor: textColor },
                  ]}
                  onPress={() => setItemUnit(u)}
                >
                  <Text style={{ color: itemUnit === u ? '#080a0d' : '#fff', fontWeight: 'bold' }}>
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
        </View>
      </Modal>

      {/* Модалка ввода количества */}
      <Modal visible={qtyModalVisible} animationType="fade" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { width: '80%' }]}>
            <Text style={styles.modalHeader}>{t.enterQty}</Text>
            <TextInput
              style={styles.input}
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
        </View>
      </Modal>

      {/* Модалка НАСТРОЕК */}
      <Modal visible={settingsVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>{t.settings}</Text>

            {/* Выбор Темы */}
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
                  <Text style={{ color: themeKey === k ? '#000' : '#fff' }}>
                    {k.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Цвет текста */}
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

            {/* Режим отображения в настройках */}
            <Text style={styles.sectionLabel}>{t.viewMode}</Text>
            <View style={styles.rowPicker}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  viewMode === 'grid' && { backgroundColor: textColor },
                ]}
                onPress={() => saveSetting('@app_view_mode', 'grid', setViewMode)}
              >
                <Text style={{ color: viewMode === 'grid' ? '#000' : '#fff' }}>
                  Плитка (Кубики)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.chip,
                  viewMode === 'list' && { backgroundColor: textColor },
                ]}
                onPress={() => saveSetting('@app_view_mode', 'list', setViewMode)}
              >
                <Text style={{ color: viewMode === 'list' ? '#000' : '#fff' }}>
                  Минимализм
                </Text>
              </TouchableOpacity>
            </View>

            {/* Блокировка переключения вида */}
            <View style={styles.switchRow}>
              <Text style={{ color: '#fff', flex: 1, fontSize: 13 }}>{t.lockViewMode}</Text>
              <Switch
                value={isViewLocked}
                onValueChange={(v) => saveSetting('@app_view_locked', v, setIsViewLocked)}
                trackColor={{ false: '#444', true: textColor }}
              />
            </View>

            {/* Подсветка Красный/Зеленый или Галочка */}
            <Text style={styles.sectionLabel}>{t.markStyle}</Text>
            <View style={styles.rowPicker}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  markStyle === 'color' && { backgroundColor: textColor },
                ]}
                onPress={() => saveSetting('@app_mark_style', 'color', setMarkStyle)}
              >
                <Text style={{ color: markStyle === 'color' ? '#000' : '#fff' }}>
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
                <Text style={{ color: markStyle === 'check' ? '#000' : '#fff' }}>
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
        </View>
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
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '88%',
    backgroundColor: '#16191f',
    borderRadius: 12,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: {
    backgroundColor: '#ffffff11',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 15,
  },
  btnGallery: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  unitContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  unitBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#ffffff11' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  btnCancel: { padding: 10 },
  btnSave: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },

  sectionLabel: { color: '#888', fontSize: 13, marginTop: 10, marginBottom: 8 },
  rowPicker: { flexDirection: 'row', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#ffffff11' },
  colorCircle: { width: 32, height: 32, borderRadius: 16 },
});
