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
  Alert,
  Share,
  Image,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Переводы
const TRANSLATIONS = {
  ru: {
    title: 'GROCERY MISSION',
    agentTitle: 'СЕКРЕТНЫЙ СПИСОК',
    share: 'Поделиться',
    add: 'Добавить',
    edit: 'Изменить',
    delete: 'Удалить',
    unitG: 'г',
    unitKg: 'кг',
    unitPcs: 'шт',
    unitL: 'л',
    unitMl: 'мл',
    unitPack: 'уп',
    quantity: 'Количество',
    enterQty: 'Введите количество',
    save: 'Сохранить',
    cancel: 'Отмена',
    lang: 'Язык',
    photo: 'Фото',
    takePhoto: 'Сделать фото',
    choosePhoto: 'Из галереи',
    defaultItems: [
      { id: '1', name: 'Молоко', count: 1, unit: 'л', bought: false },
      { id: '2', name: 'Картофель', count: 2, unit: 'кг', bought: false },
      { id: '3', name: 'Клубника', count: 500, unit: 'г', bought: false },
    ],
  },
  en: {
    title: 'GROCERY MISSION',
    agentTitle: 'TOP SECRET LIST',
    share: 'Share',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    unitG: 'g',
    unitKg: 'kg',
    unitPcs: 'pcs',
    unitL: 'l',
    unitMl: 'ml',
    unitPack: 'pack',
    quantity: 'Quantity',
    enterQty: 'Enter quantity',
    save: 'Save',
    cancel: 'Cancel',
    lang: 'Language',
    photo: 'Photo',
    takePhoto: 'Take Photo',
    choosePhoto: 'From Gallery',
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
  const [itemImage, setItemImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Модалка прямого ввода количества
  const [qtyModalVisible, setQtyModalVisible] = useState(false);
  const [selectedItemForQty, setSelectedItemForQty] = useState(null);
  const [directQtyText, setDirectQtyText] = useState('');

  const t = TRANSLATIONS[lang];

  // Загрузка
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedItems = await AsyncStorage.getItem('@grocery_items');
      const savedLang = await AsyncStorage.getItem('@app_lang');
      const savedTheme = await AsyncStorage.getItem('@app_theme');

      if (savedLang) setLang(savedLang);
      if (savedTheme) setIsAgentTheme(JSON.parse(savedTheme));

      if (savedItems) {
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
      await AsyncStorage.setItem('@grocery_items', JSON.stringify(newItems));
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

  // 1. Функция "Поделиться"
  const shareList = async () => {
    try {
      const listText = items
        .map((i) => `${i.bought ? '[x]' : '[ ]'} ${i.name}: ${i.count} ${i.unit}`)
        .join('\n');
      await Share.share({
        message: `${t.title}:\n\n${listText}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // 3. Выбор фото
  const pickImage = async (useCamera = false) => {
    let result;
    if (useCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return;
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
    }

    if (!result.canceled) {
      setItemImage(result.assets[0].uri);
    }
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
    setItemImage(item.image || null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setItemName('');
    setItemCount('1');
    setItemUnit('шт');
    setItemImage(null);
  };

  // 4. Прямой ввод количества через нажатие на число
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

  const deleteItem = (id) => {
    const updated = items.filter((i) => i.id !== id);
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

  // Цвета темы
  const themeAccentColor = isAgentTheme ? '#00f0ff' : '#007AFF';
  const themeBgColor = '#080a0d';
  const themeTextColor = isAgentTheme ? '#00f0ff' : '#ffffff'; // Синий текст для агента

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeBgColor }]}>
      <StatusBar barStyle="light-content" />

      {/* Шляпка */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 10 }}>
            <Ionicons
              name={isAgentTheme ? 'shield' : 'basket'}
              size={28}
              color={themeAccentColor}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeTextColor }]}>
            {isAgentTheme ? t.agentTitle : t.title}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={toggleLanguage}>
            <Text style={[styles.langText, { color: themeAccentColor }]}>
              {lang.toUpperCase()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={shareList}>
            <Ionicons name="share-outline" size={24} color={themeAccentColor} />
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
              { borderColor: isAgentTheme ? '#00f0ff33' : '#ffffff11' },
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
              
              {/* Аватарка товара */}
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImagePlaceholder, { borderColor: themeAccentColor }]}>
                  <Text style={{ color: themeAccentColor, fontSize: 10 }}>IMG</Text>
                </View>
              )}

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
                <Text style={{ color: themeAccentColor, fontSize: 18 }}>-</Text>
              </TouchableOpacity>

              {/* 4. Клик по цифре для прямого ввода */}
              <TouchableOpacity onPress={() => openDirectQtyModal(item)}>
                <Text style={[styles.qtyText, { color: themeTextColor }]}>
                  {item.count} {item.unit || 'шт'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => changeCount(item.id, 1)}
                style={styles.qtyBtn}
              >
                <Text style={{ color: themeAccentColor, fontSize: 18 }}>+</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginLeft: 8 }}>
                <Ionicons name="pencil" size={18} color="#888" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deleteItem(item.id)} style={{ marginLeft: 8 }}>
                <Ionicons name="trash-outline" size={18} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Кнопка Добавить */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: themeAccentColor }]}
        onPress={() => {
          closeModal();
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={32} color="#000" />
      </TouchableOpacity>

      {/* Модалка добавления/редактирования */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>
              {editingId ? t.edit : t.add}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Название товара"
              placeholderTextColor="#666"
              value={itemName}
              onChangeText={setItemName}
            />

            {/* Выбор единиц (5) */}
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
                  <Text style={{ color: itemUnit === u ? '#000' : '#fff' }}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Выбор фото (3) */}
            <View style={styles.photoContainer}>
              {itemImage && (
                <Image source={{ uri: itemImage }} style={styles.previewImage} />
              )}
              <View style={{ gap: 8 }}>
                <TouchableOpacity
                  style={styles.photoBtn}
                  onPress={() => pickImage(true)}
                >
                  <Ionicons name="camera-outline" size={16} color="#fff" />
                  <Text style={{ color: '#fff' }}>{t.takePhoto}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.photoBtn}
                  onPress={() => pickImage(false)}
                >
                  <Ionicons name="image-outline" size={16} color="#fff" />
                  <Text style={{ color: '#fff' }}>{t.choosePhoto}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeModal} style={styles.btnCancel}>
                <Text style={{ color: '#ff4444' }}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveItem}
                style={[styles.btnSave, { backgroundColor: themeAccentColor }]}
              >
                <Text style={{ color: '#000', fontWeight: 'bold' }}>
                  {t.save}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модалка прямого ввода количества (4) */}
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
                <Text style={{ color: '#000', fontWeight: 'bold' }}>
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
  container: { flex: 1 },
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
  cardBought: { opacity: 0.4 },
  checkArea: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  itemTitle: { fontSize: 16 },
  itemTitleBought: { textDecorationLine: 'line-through' },
  itemImage: { width: 36, height: 36, borderRadius: 18 },
  itemImagePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsArea: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { paddingHorizontal: 8, paddingVertical: 4 },
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
    marginBottom: 12,
  },
  unitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  unitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ffffff11',
  },
  photoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  previewImage: { width: 60, height: 60, borderRadius: 8 },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff15',
    padding: 8,
    borderRadius: 6,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  btnCancel: { padding: 10 },
  btnSave: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
});
