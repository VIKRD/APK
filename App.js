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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const TRANSLATIONS = {
  ru: {
    title: 'СПИСОК ПОКУПОК',
    agentTitle: 'СЕКРЕТНЫЙ СПИСОК',
    shareHeader: '🛒 МОЙ СПИСОК ПОКУПОК:',
    add: 'Добавить',
    edit: 'Изменить',
    enterName: 'Название товара',
    enterQty: 'Введите количество',
    save: 'Сохранить',
    cancel: 'Отмена',
    defaultItems: [
      { id: '1', name: 'Молоко', count: 1, unit: 'л', bought: false },
      { id: '2', name: 'Картофель', count: 2, unit: 'кг', bought: false },
      { id: '3', name: 'Клубника', count: 500, unit: 'г', bought: false },
    ],
  },
  en: {
    title: 'GROCERY LIST',
    agentTitle: 'TOP SECRET LIST',
    shareHeader: '🛒 MY GROCERY LIST:',
    add: 'Add Item',
    edit: 'Edit Item',
    enterName: 'Item name',
    enterQty: 'Enter quantity',
    save: 'Save',
    cancel: 'Cancel',
    defaultItems: [
      { id: '1', name: 'Milk', count: 1, unit: 'l', bought: false },
      { id: '2', name: 'Potato', count: 2, unit: 'kg', bought: false },
      { id: '3', name: 'Strawberry', count: 500, unit: 'g', bought: false },
    ],
  },
};

export default function App() {
  const [lang, setLang] = useState('ru');
  const [isAgentTheme, setIsAgentTheme] = useState(false);
  const [items, setItems] = useState([]);

  // Модалка товара
  const [modalVisible, setModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCount, setItemCount] = useState('1');
  const [itemUnit, setItemUnit] = useState('шт');
  const [editingId, setEditingId] = useState(null);

  // Модалка прямого ввода количества
  const [qtyModalVisible, setQtyModalVisible] = useState(false);
  const [selectedItemForQty, setSelectedItemForQty] = useState(null);
  const [directQtyText, setDirectQtyText] = useState('');

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedItems = await AsyncStorage.getItem('@grocery_items_v2');
      const savedLang = await AsyncStorage.getItem('@app_lang');
      const savedTheme = await AsyncStorage.getItem('@app_theme');

      if (savedLang) setLang(savedLang);
      if (savedTheme) setIsAgentTheme(JSON.parse(savedTheme));

      if (savedItems !== null) {
        setItems(JSON.parse(savedItems));
      } else {
        // Первичная загрузка дефолтных
        setItems(TRANSLATIONS[savedLang || 'ru'].defaultItems);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveData = async (newItems) => {
    try {
      setItems(newItems);
      await AsyncStorage.setItem('@grocery_items_v2', JSON.stringify(newItems));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLanguage = async () => {
    const nextLang = lang === 'ru' ? 'en' : 'ru';
    setLang(nextLang);
    await AsyncStorage.setItem('@app_lang', nextLang);
  };

  const toggleTheme = async () => {
    const nextTheme = !isAgentTheme;
    setIsAgentTheme(nextTheme);
    await AsyncStorage.setItem('@app_theme', JSON.stringify(nextTheme));
  };

  // 1. ПОДЕЛИТЬСЯ ЧИСТЫМ ТЕКСТОМ В МЕССЕНДЖЕР
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

  // Удаление любого товара
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
          ? { ...item, name: itemName, count: parseFloat(itemCount) || 1, unit: itemUnit }
          : item
      );
      saveData(updated);
    } else {
      const newItem = {
        id: Date.now().toString(),
        name: itemName,
        count: parseFloat(itemCount) || 1,
        unit: itemUnit,
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
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setItemName('');
    setItemCount('1');
    setItemUnit('шт');
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

  // Синяя агентская тема (#00f0ff)
  const themeAccentColor = '#00f0ff';
  const themeTextColor = isAgentTheme ? '#00f0ff' : '#ffffff';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleTheme} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons
            name={isAgentTheme ? 'shield-checkmark' : 'basket'}
            size={26}
            color={themeAccentColor}
          />
          <Text style={[styles.headerTitle, { color: themeTextColor }]}>
            {isAgentTheme ? t.agentTitle : t.title}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={toggleLanguage}>
            <Text style={[styles.langText, { color: themeAccentColor }]}>
              {lang.toUpperCase()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={shareList}>
            <Ionicons name="share-social-outline" size={24} color={themeAccentColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Список товаров */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              item.bought && styles.cardBought,
              { borderColor: isAgentTheme ? '#00f0ff44' : '#ffffff15' },
            ]}
          >
            <TouchableOpacity
              onPress={() => toggleBought(item.id)}
              style={styles.checkArea}
            >
              <Ionicons
                name={item.bought ? 'checkbox' : 'square-outline'}
                size={24}
                color={themeAccentColor}
              />
              <Text
                style={[
                  styles.itemTitle,
                  { color: themeTextColor },
                  item.bought && styles.itemTitleBought,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>

            <View style={styles.controlsArea}>
              <TouchableOpacity
                onPress={() => changeCount(item.id, -1)}
                style={styles.qtyBtn}
              >
                <Text style={{ color: themeAccentColor, fontSize: 20, fontWeight: 'bold' }}>-</Text>
              </TouchableOpacity>

              {/* Нажатие на цифру для ручного ввода */}
              <TouchableOpacity onPress={() => openDirectQtyModal(item)}>
                <Text style={[styles.qtyText, { color: themeTextColor }]}>
                  {item.count} {item.unit || 'шт'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => changeCount(item.id, 1)}
                style={styles.qtyBtn}
              >
                <Text style={{ color: themeAccentColor, fontSize: 20, fontWeight: 'bold' }}>+</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginLeft: 6 }}>
                <Ionicons name="pencil" size={18} color="#888" />
              </TouchableOpacity>

              {/* Удалить ЛЮБОЙ товар */}
              <TouchableOpacity onPress={() => deleteItem(item.id)} style={{ marginLeft: 6 }}>
                <Ionicons name="trash-outline" size={18} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* FAB Добавить */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: themeAccentColor }]}
        onPress={() => {
          closeModal();
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={32} color="#080a0d" />
      </TouchableOpacity>

      {/* Модалка Добавления/Редактирования */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>
              {editingId ? t.edit : t.add}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={t.enterName}
              placeholderTextColor="#666"
              value={itemName}
              onChangeText={setItemName}
            />

            {/* Переключатель единиц: г, кг, шт, л, мл, уп */}
            <View style={styles.unitContainer}>
              {['г', 'кг', 'шт', 'л', 'мл', 'уп'].map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[
                    styles.unitBadge,
                    itemUnit === u && { backgroundColor: themeAccentColor },
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
                style={[styles.btnSave, { backgroundColor: themeAccentColor }]}
              >
                <Text style={{ color: '#080a0d', fontWeight: 'bold' }}>
                  {t.save}
                </Text>
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
              <TouchableOpacity
                onPress={() => setQtyModalVisible(false)}
                style={styles.btnCancel}
              >
                <Text style={{ color: '#ff4444' }}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveDirectQty}
                style={[styles.btnSave, { backgroundColor: themeAccentColor }]}
              >
                <Text style={{ color: '#080a0d', fontWeight: 'bold' }}>
                  {t.save}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080a0d' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff11',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  langText: { fontWeight: 'bold', fontSize: 16 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff05',
    marginBottom: 8,
    borderWidth: 1,
  },
  cardBought: { opacity: 0.3 },
  checkArea: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  itemTitle: { fontSize: 16 },
  itemTitleBought: { textDecorationLine: 'line-through' },
  controlsArea: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { paddingHorizontal: 8, paddingVertical: 2 },
  qtyText: { fontSize: 15, fontWeight: 'bold', paddingHorizontal: 4 },
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
    width: '90%',
    backgroundColor: '#16191f',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#ffffff11',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  unitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  unitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff11',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btnCancel: { padding: 10 },
  btnSave: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
});
