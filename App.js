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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Базовые тексты
const TRANSLATIONS = {
  ru: {
    title: 'СПИСОК ПОКУПОК',
    shareHeader: '🛒 МОЙ СПИСОК ПОКУПОК:',
    add: 'Добавить',
    edit: 'Изменить',
    enterName: 'Название товара',
    enterQty: 'Количество',
    photoUrl: 'URL фото (или оставить пустым)',
    save: 'Сохранить',
    cancel: 'Отмена',
    settings: 'Настройки',
    theme: 'Тема фона',
    textColor: 'Цвет текста',
    viewMode: 'Вид отображения',
    shareProduct: 'Поделиться товаром',
    defaultItems: [
      { id: '1', name: 'Молоко', count: 1, unit: 'л', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200', bought: false },
      { id: '2', name: 'Картофель', count: 2, unit: 'кг', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200', bought: false },
      { id: '3', name: 'Клубника', count: 500, unit: 'г', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200', bought: false },
    ],
  },
  en: {
    title: 'GROCERY LIST',
    shareHeader: '🛒 MY GROCERY LIST:',
    add: 'Add Item',
    edit: 'Edit Item',
    enterName: 'Item name',
    enterQty: 'Quantity',
    photoUrl: 'Photo URL (optional)',
    save: 'Save',
    cancel: 'Cancel',
    settings: 'Settings',
    theme: 'Background Theme',
    textColor: 'Text Color',
    viewMode: 'View Mode',
    shareProduct: 'Share Product',
    defaultItems: [
      { id: '1', name: 'Milk', count: 1, unit: 'l', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200', bought: false },
      { id: '2', name: 'Potato', count: 2, unit: 'kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200', bought: false },
      { id: '3', name: 'Strawberry', count: 500, unit: 'g', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200', bought: false },
    ],
  },
};

// Цвета тем фона
const THEMES = {
  dark: { bg: '#080a0d', cardBg: '#ffffff0a', border: '#ffffff15' },
  gray: { bg: '#1e222b', cardBg: '#ffffff10', border: '#ffffff22' },
  light: { bg: '#f4f5f7', cardBg: '#ffffff', border: '#00000010' },
};

// Выбор цвета текста
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

  // Настройки пользователя
  const [lang, setLang] = useState('ru');
  const [themeKey, setThemeKey] = useState('dark');
  const [textColor, setTextColor] = useState('#00f0ff');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (плитка) или 'list' (список)
  
  const [items, setItems] = useState([]);

  // Модалка добавления/редактирования
  const [modalVisible, setModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCount, setItemCount] = useState('1');
  const [itemUnit, setItemUnit] = useState('шт');
  const [itemImage, setItemImage] = useState('');
  const [editingId, setEditingId] = useState(null);

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
      const savedItems = await AsyncStorage.getItem('@grocery_items_v3');
      const savedLang = await AsyncStorage.getItem('@app_lang');
      const savedTheme = await AsyncStorage.getItem('@app_theme_key');
      const savedColor = await AsyncStorage.getItem('@app_text_color');
      const savedView = await AsyncStorage.getItem('@app_view_mode');

      if (savedLang) setLang(savedLang);
      if (savedTheme) setThemeKey(savedTheme);
      if (savedColor) setTextColor(savedColor);
      if (savedView) setViewMode(savedView);

      if (savedItems !== null) {
        setItems(JSON.parse(savedItems));
      } else {
        setItems(TRANSLATIONS[savedLang || 'ru'].defaultItems);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveData = async (newItems) => {
    try {
      setItems(newItems);
      await AsyncStorage.setItem('@grocery_items_v3', JSON.stringify(newItems));
    } catch (e) {
      console.error(e);
    }
  };

  const saveSetting = async (key, value, setter) => {
    setter(value);
    await AsyncStorage.setItem(key, value);
  };

  // Поделиться всем списком
  const shareList = async () => {
    if (items.length === 0) return;
    const unbought = items.filter((i) => !i.bought);
    const bought = items.filter((i) => i.bought);

    let text = `${t.shareHeader}\n\n`;
    if (unbought.length > 0) {
      text += unbought.map((i) => `• ${i.name} — ${i.count} ${i.unit}`).join('\n');
    }
    if (bought.length > 0) {
      text += `\n\nКуплено:\n` + bought.map((i) => `✓ ${i.name}`).join('\n');
    }

    try {
      await Share.share({ message: text });
    } catch (error) {
      console.error(error);
    }
  };

  // 3. Поделиться ФОТО / конкретным товаром
  const shareSingleProduct = async (item) => {
    let msg = `Купи, пожалуйста: ${item.name} (${item.count} ${item.unit})`;
    if (item.image) {
      msg += `\nФото по ссылке: ${item.image}`;
    }
    try {
      await Share.share({ message: msg });
    } catch (error) {
      console.error(error);
    }
  };

  // Удаление абсолютно любого товара
  const deleteItem = (id) => {
    const updated = items.filter((i) => i.id !== id);
    saveData(updated);
  };

  // Добавление / Редактирование
  const handleSaveItem = () => {
    if (!itemName.trim()) return;

    if (editingId) {
      const updated = items.map((item) =>
        item.id === editingId
          ? { ...item, name: itemName, count: parseFloat(itemCount) || 1, unit: itemUnit, image: itemImage }
          : item
      );
      saveData(updated);
    } else {
      const newItem = {
        id: Date.now().toString(),
        name: itemName,
        count: parseFloat(itemCount) || 1,
        unit: itemUnit,
        image: itemImage,
        bought: false,
      };
      saveData([...items, newItem]);
    }
    closeModal();
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setItemName(item.name);
    setItemCount(item.count.toString());
    setItemUnit(item.unit || 'шт');
    setItemImage(item.image || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setItemName('');
    setItemCount('1');
    setItemUnit('шт');
    setItemImage('');
  };

  // Прямой ввод количества
  const openDirectQtyModal = (item) => {
    setSelectedItemForQty(item);
    setDirectQtyText(item.count.toString());
    setQtyModalVisible(true);
  };

  const saveDirectQty = () => {
    if (!selectedItemForQty) return;
    const val = parseFloat(directQtyText);
    if (!isNaN(val) && val > 0) {
      const updated = items.map((i) =>
        i.id === selectedItemForQty.id ? { ...i, count: val } : i
      );
      saveData(updated);
    }
    setQtyModalVisible(false);
  };

  const toggleBought = (id) => {
    const updated = items.map((i) =>
      i.id === id ? { ...i, bought: !i.bought } : i
    );
    saveData(updated);
  };

  const changeCount = (id, delta) => {
    const updated = items.map((i) => {
      if (i.id === id) {
        const newCount = Math.max(1, i.count + delta);
        return { ...i, count: newCount };
      }
      return i;
    });
    saveData(updated);
  };

  // Расчет колонок сетки (для планшета / альбома)
  const getNumColumns = () => {
    if (viewMode === 'list') return 1;
    if (width > 900) return 4;
    if (isLandscape || width > 600) return 3;
    return 2;
  };

  const numColumns = getNumColumns();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.bg }]}>
      <StatusBar barStyle={themeKey === 'light' ? 'dark-content' : 'light-content'} />

      {/* Шапка */}
      <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>{t.title}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {/* Быстрое переключение вида Плитка / Список (1 клик) */}
          <TouchableOpacity
            onPress={() =>
              saveSetting('@app_view_mode', viewMode === 'grid' ? 'list' : 'grid', setViewMode)
            }
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list' : 'grid'}
              size={24}
              color={textColor}
            />
          </TouchableOpacity>

          {/* Кнопка Поделиться списком */}
          <TouchableOpacity onPress={shareList}>
            <Ionicons name="share-social-outline" size={24} color={textColor} />
          </TouchableOpacity>

          {/* Настройки */}
          <TouchableOpacity onPress={() => setSettingsVisible(true)}>
            <Ionicons name="settings-outline" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Список товаров (Адаптивная сетка) */}
      <FlatList
        key={`${viewMode}-${numColumns}`}
        data={items}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          if (viewMode === 'grid') {
            // КВАДРАТИКИ (ОСНОВНОЙ РЕЖИМ)
            return (
              <View
                style={[
                  styles.gridCard,
                  {
                    backgroundColor: currentTheme.cardBg,
                    borderColor: currentTheme.border,
                    flex: 1 / numColumns,
                  },
                  item.bought && styles.cardBought,
                ]}
              >
                {/* Картинка / Аватар */}
                <TouchableOpacity onPress={() => toggleBought(item.id)} style={styles.gridImageArea}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.gridImage} />
                  ) : (
                    <View style={[styles.gridImagePlaceholder, { borderColor: textColor }]}>
                      <Ionicons name="basket-outline" size={30} color={textColor} />
                    </View>
                  )}
                  {item.bought && (
                    <View style={styles.checkOverlay}>
                      <Ionicons name="checkmark-circle" size={36} color={textColor} />
                    </View>
                  )}
                </TouchableOpacity>

                <Text numberOfLines={1} style={[styles.gridTitle, { color: textColor }]}>
                  {item.name}
                </Text>

                {/* Управление количеством */}
                <View style={styles.gridControls}>
                  <TouchableOpacity onPress={() => changeCount(item.id, -1)} style={styles.qtyBtn}>
                    <Text style={{ color: textColor, fontSize: 18, fontWeight: 'bold' }}>-</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => openDirectQtyModal(item)}>
                    <Text style={[styles.qtyText, { color: textColor }]}>
                      {item.count} {item.unit}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => changeCount(item.id, 1)} style={styles.qtyBtn}>
                    <Text style={{ color: textColor, fontSize: 18, fontWeight: 'bold' }}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Быстрые действия */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity onPress={() => shareSingleProduct(item)}>
                    <Ionicons name="share-outline" size={16} color={textColor} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openEditModal(item)}>
                    <Ionicons name="pencil" size={16} color="#888" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteItem(item.id)}>
                    <Ionicons name="trash-outline" size={16} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }

          // ЛИСТ / СПИСОК (ВСПОМОГАТЕЛЬНЫЙ РЕЖИМ)
          return (
            <View
              style={[
                styles.listCard,
                { backgroundColor: currentTheme.cardBg, borderColor: currentTheme.border },
                item.bought && styles.cardBought,
              ]}
            >
              <TouchableOpacity onPress={() => toggleBought(item.id)} style={styles.checkArea}>
                <Ionicons
                  name={item.bought ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={textColor}
                />
                <Text style={[styles.listTitle, { color: textColor }]}>{item.name}</Text>
              </TouchableOpacity>

              <View style={styles.gridControls}>
                <TouchableOpacity onPress={() => changeCount(item.id, -1)}>
                  <Text style={{ color: textColor, fontSize: 18, fontWeight: 'bold', padding: 4 }}>-</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => openDirectQtyModal(item)}>
                  <Text style={[styles.qtyText, { color: textColor }]}>
                    {item.count} {item.unit}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => changeCount(item.id, 1)}>
                  <Text style={{ color: textColor, fontSize: 18, fontWeight: 'bold', padding: 4 }}>+</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => shareSingleProduct(item)} style={{ marginLeft: 6 }}>
                  <Ionicons name="share-outline" size={18} color={textColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginLeft: 6 }}>
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

      {/* Кнопка Добавить */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: textColor }]}
        onPress={() => {
          closeModal();
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={32} color="#080a0d" />
      </TouchableOpacity>

      {/* Модалка Добавления / Редактирования */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>{editingId ? t.edit : t.add}</Text>

            <TextInput
              style={styles.input}
              placeholder={t.enterName}
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

            {/* Смена единиц измерения на лету */}
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
              <TouchableOpacity onPress={closeModal} style={styles.btnCancel}>
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

      {/* Модалка быстрого ввода количества */}
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
              <TouchableOpacity onPress={() => setQtyModalVisible(false)} style={styles.btnCancel}>
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

      {/* Модалка настроек (Темы + Цвет текста + Язык) */}
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

            {/* Выбор цвета текста */}
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

            {/* Переключение языка */}
            <TouchableOpacity
              style={styles.langBtn}
              onPress={() =>
                saveSetting('@app_lang', lang === 'ru' ? 'en' : 'ru', setLang)
              }
            >
              <Text style={{ color: '#fff' }}>Язык / Language: {lang.toUpperCase()}</Text>
            </TouchableOpacity>

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

  // Сетка (Квадратики)
  gridCard: {
    margin: 6,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
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

  // Список
  listCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
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
  unitContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  unitBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#ffffff11' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  btnCancel: { padding: 10 },
  btnSave: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },

  // Настройки
  sectionLabel: { color: '#888', fontSize: 13, marginTop: 10, marginBottom: 8 },
  rowPicker: { flexDirection: 'row', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#ffffff11' },
  colorCircle: { width: 32, height: 32, borderRadius: 16 },
  langBtn: { padding: 12, backgroundColor: '#ffffff11', borderRadius: 8, marginTop: 8 },
});
