import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Начальная библиотека популярных продуктов (Украинский ассортимент + Бакалея)
const INITIAL_LIBRARY = [
  // Мясо и Колбасы
  { id: 'm1', name: 'Свинина', category: 'Мясо', image: null },
  { id: 'm2', name: 'Сало', category: 'Мясо', image: null },
  { id: 'm3', name: 'Индейка', category: 'Мясо', image: null },
  { id: 'm4', name: 'Курица', category: 'Мясо', image: null },
  { id: 'm5', name: 'Колбаса', category: 'Мясо', image: null },
  
  // Овощи
  { id: 'v1', name: 'Лук репчатый', category: 'Овощи', image: null },
  { id: 'v2', name: 'Лук зеленый (стручковой)', category: 'Овощи', image: null },
  { id: 'v3', name: 'Чеснок', category: 'Овощи', image: null },
  { id: 'v4', name: 'Перец болгарский', category: 'Овощи', image: null },
  { id: 'v5', name: 'Помидоры', category: 'Овощи', image: null },
  { id: 'v6', name: 'Помидоры черри', category: 'Овощи', image: null },
  { id: 'v7', name: 'Помидоры сливка', category: 'Овощи', image: null },
  { id: 'v8', name: 'Огурцы', category: 'Овощи', image: null },
  { id: 'v9', name: 'Огурцы гладкие', category: 'Овощи', image: null },
  { id: 'v10', name: 'Картошка', category: 'Овощи', image: null },

  // Фрукты и Ягоды
  { id: 'f1', name: 'Яблоки', category: 'Фрукты', image: null },
  { id: 'f2', name: 'Персики', category: 'Фрукты', image: null },
  { id: 'f3', name: 'Сливы', category: 'Фрукты', image: null },
  { id: 'f4', name: 'Виноград', category: 'Фрукты', image: null },
  { id: 'f5', name: 'Авокадо', category: 'Фрукты', image: null },
  { id: 'f6', name: 'Нектарин', category: 'Фрукты', image: null },
  { id: 'f7', name: 'Абрикосы', category: 'Фрукты', image: null },
  { id: 'f8', name: 'Малина', category: 'Фрукты', image: null },
  { id: 'f9', name: 'Голубика (Лохина)', category: 'Фрукты', image: null },

  // Бакалея и Крупы
  { id: 'g1', name: 'Гречка', category: 'Бакалея', image: null },
  { id: 'g2', name: 'Пшено', category: 'Бакалея', image: null },
  { id: 'g3', name: 'Геркулес', category: 'Бакалея', image: null },
  { id: 'g4', name: 'Рис', category: 'Бакалея', image: null },
  { id: 'g5', name: 'Рис Басмати', category: 'Бакалея', image: null },
  { id: 'g6', name: 'Вермишель Спагетти', category: 'Бакалея', image: null },
  { id: 'g7', name: 'Вермишель Рожки', category: 'Бакалея', image: null },
  { id: 'g8', name: 'Вермишель Вермишелька', category: 'Бакалея', image: null },

  // Консервы и Деликатесы
  { id: 'c1', name: 'Тушенка куриная', category: 'Консервы', image: null },
  { id: 'c2', name: 'Тушенка свиная', category: 'Консервы', image: null },
  { id: 'c3', name: 'Тушенка говяжья', category: 'Консервы', image: null },
  { id: 'c4', name: 'Килька в томате', category: 'Консервы', image: null },
  { id: 'c5', name: 'Бычки в томате', category: 'Консервы', image: null },
  { id: 'c6', name: 'Сайра', category: 'Консервы', image: null },
  { id: 'c7', name: 'Красная рыба консервированная', category: 'Консервы', image: null },
  { id: 'c8', name: 'Икра красная', category: 'Консервы', image: null },
  { id: 'c9', name: 'Икра черная', category: 'Консервы', image: null },

  // Напитки
  { id: 'd1', name: 'Пиво', category: 'Напитки', image: null },
  { id: 'd2', name: 'Пепси', category: 'Напитки', image: null },
  { id: 'd3', name: 'Кола', category: 'Напитки', image: null },
  { id: 'd4', name: 'Фанта', category: 'Напитки', image: null },
  { id: 'd5', name: 'Спрайт', category: 'Напитки', image: null },
  { id: 'd6', name: 'Байкал', category: 'Напитки', image: null },
  { id: 'd7', name: 'Живчик', category: 'Напитки', image: null },
  { id: 'j1', name: 'Сок томатный', category: 'Напитки', image: null },
  { id: 'j2', name: 'Сок виноградно-яблочный', category: 'Напитки', image: null },
  { id: 'j3', name: 'Сок яблочный', category: 'Напитки', image: null },
  { id: 'j4', name: 'Сок апельсиновый', category: 'Напитки', image: null },
];

const CATEGORIES = ['Все', 'Мясо', 'Овощи', 'Фрукты', 'Бакалея', 'Консервы', 'Напитки', 'Другое'];

export default function App() {
  const [library, setLibrary] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  
  // Состояния UI
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'library'
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Для добавления/редактирования
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Другое');
  const [newItemImage, setNewItemImage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [library, shoppingList]);

  const loadData = async () => {
    try {
      const savedLib = await AsyncStorage.getItem('@grocery_library');
      const savedList = await AsyncStorage.getItem('@grocery_shopping_list');
      
      if (savedLib) {
        setLibrary(JSON.parse(savedLib));
      } else {
        setLibrary(INITIAL_LIBRARY);
      }
      if (savedList) {
        setShoppingList(JSON.parse(savedList));
      }
    } catch (e) {
      console.error('Ошибка загрузки данных', e);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('@grocery_library', JSON.stringify(library));
      await AsyncStorage.setItem('@grocery_shopping_list', JSON.stringify(shoppingList));
    } catch (e) {
      console.error('Ошибка сохранения данных', e);
    }
  };

  // Выбор картинки из галереи
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Доступ запрещен', 'Разрешите доступ к фото в настройках устройства.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setNewItemImage(result.assets[0].uri);
    }
  };

  // Добавление в библиотеку и в список
  const handleAddItem = () => {
    const trimmedName = newItemName.trim();
    if (!trimmedName) return;

    // 1. Проверяем дубликаты в списке покупок
    const existingInList = shoppingList.find(i => i.name.toLowerCase() === trimmedName.toLowerCase());
    if (existingInList) {
      Alert.alert('Продукт уже в корзине!', `Товар "${trimmedName}" уже добавлен в ваш список покупок.`);
      return;
    }

    // 2. Ищем или создаем товар в библиотеке
    let libItem = library.find(i => i.name.toLowerCase() === trimmedName.toLowerCase());
    let updatedLibrary = [...library];

    if (!libItem) {
      libItem = {
        id: Date.now().toString(),
        name: trimmedName,
        category: newItemCategory,
        image: newItemImage
      };
      updatedLibrary.push(libItem);
    } else if (newItemImage && libItem.image !== newItemImage) {
      // Если фото изменили — обновляем в библиотеке
      libItem = { ...libItem, image: newItemImage };
      updatedLibrary = updatedLibrary.map(i => i.id === libItem.id ? libItem : i);
    }

    setLibrary(updatedLibrary);

    // 3. Добавляем в список покупок
    setShoppingList([...shoppingList, { id: Date.now().toString(), libraryId: libItem.id, name: libItem.name, checked: false }]);
    
    // Сброс формы
    setNewItemName('');
    setNewItemImage(null);
    setModalVisible(false);
  };

  // Изменить фото у существующго товара из Библиотеки
  const updateProductImage = async (libId) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Ошибка', 'Нет доступа к галерее');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      const newUri = result.assets[0].uri;
      // Синхронно обновляем изображение в библиотеке (автоматически обновит и все списки!)
      setLibrary(library.map(item => item.id === libId ? { ...item, image: newUri } : item));
    }
  };

  // Добавить товар из Библиотеки в список покупок (с защитой от дублей)
  const addFromLibraryToList = (libItem) => {
    const isAlreadyInList = shoppingList.some(i => i.name.toLowerCase() === libItem.name.toLowerCase());
    if (isAlreadyInList) {
      Alert.alert('Уже в списке', `"${libItem.name}" уже добавлен в корзину.`);
      return;
    }
    setShoppingList([...shoppingList, { id: Date.now().toString(), libraryId: libItem.id, name: libItem.name, checked: false }]);
  };

  // Удалить из библиотеки
  const deleteFromLibrary = (libId) => {
    Alert.alert(
      'Удалить из библиотеки?',
      'Товар полностью удалится из общего каталога.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive', 
          onPress: () => {
            setLibrary(library.filter(i => i.id !== libId));
          } 
        }
      ]
    );
  };

  // Чекбокс выполнения
  const toggleCheck = (id) => {
    setShoppingList(shoppingList.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // Удалить из списка покупок
  const deleteFromList = (id) => {
    setShoppingList(shoppingList.filter(item => item.id !== id));
  };

  // Очистить купленное
  const clearChecked = () => {
    setShoppingList(shoppingList.filter(item => !item.checked));
  };

  // Фильтрация библиотеки
  const filteredLibrary = library.filter(item => {
    const matchesCat = selectedCategory === 'Все' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Продукты 🛒</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={26} color="#080a0d" />
        </TouchableOpacity>
      </View>

      {/* Переключатель вкладок */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'list' && styles.activeTab]} 
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>
            Список ({shoppingList.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'library' && styles.activeTab]} 
          onPress={() => setActiveTab('library')}
        >
          <Text style={[styles.tabText, activeTab === 'library' && styles.activeTabText]}>
            Библиотека ({library.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ЭКРАН 1: СПИСОК ПОКУПОК */}
      {activeTab === 'list' && (
        <View style={{ flex: 1 }}>
          <FlatList
            data={shoppingList}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => {
              const libData = library.find(l => l.id === item.libraryId || l.name === item.name);
              return (
                <View style={[styles.card, item.checked && styles.cardChecked]}>
                  <TouchableOpacity onPress={() => toggleCheck(item.id)} style={styles.cardLeft}>
                    <Ionicons 
                      name={item.checked ? "checkbox" : "square-outline"} 
                      size={24} 
                      color={item.checked ? "#00ff88" : "#8e8e93"} 
                    />
                    {libData?.image ? (
                      <Image source={{ uri: libData.image }} style={styles.thumbImage} />
                    ) : (
                      <View style={styles.thumbPlaceholder}>
                        <Ionicons name="basket-outline" size={18} color="#8e8e93" />
                      </View>
                    )}
                    <Text style={[styles.cardText, item.checked && styles.cardTextChecked]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteFromList(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#ff453a" />
                  </TouchableOpacity>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Корзина пуста. Добавьте из Библиотеки или через +</Text>
            }
          />
          {shoppingList.some(i => i.checked) && (
            <TouchableOpacity style={styles.clearButton} onPress={clearChecked}>
              <Text style={styles.clearButtonText}>Удалить купленное</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ЭКРАН 2: БИБЛИОТЕКА ПРОДУКТОВ */}
      {activeTab === 'library' && (
        <View style={{ flex: 1 }}>
          {/* Поиск */}
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по каталогу..."
            placeholderTextColor="#8e8e93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Фильтр по Категориям */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Список Библиотеки */}
          <FlatList
            data={filteredLibrary}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <TouchableOpacity onPress={() => updateProductImage(item.id)}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.thumbImage} />
                  ) : (
                    <View style={styles.thumbPlaceholder}>
                      <Ionicons name="camera-outline" size={20} color="#00ff88" />
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.libInfo}>
                  <Text style={styles.cardText}>{item.name}</Text>
                  <Text style={styles.categorySubText}>{item.category}</Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity onPress={() => addFromLibraryToList(item)} style={styles.addToListBtn}>
                    <Ionicons name="cart-outline" size={22} color="#00ff88" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteFromLibrary(item.id)} style={{ marginLeft: 12 }}>
                    <Ionicons name="trash-outline" size={20} color="#ff453a" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {/* МОДАЛЬНОЕ ОКНО СОЗДАНИЯ */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Новый продукт</Text>

            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
              {newItemImage ? (
                <Image source={{ uri: newItemImage }} style={styles.modalPreviewImage} />
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="camera" size={32} color="#00ff88" />
                  <Text style={{ color: '#8e8e93', fontSize: 12, marginTop: 4 }}>Выбрать фото</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.modalInput}
              placeholder="Название (например, Свинина)..."
              placeholderTextColor="#8e8e93"
              value={newItemName}
              onChangeText={setNewItemName}
            />

            <Text style={{ color: '#fff', marginBottom: 8 }}>Категория:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40, marginBottom: 20 }}>
              {CATEGORIES.filter(c => c !== 'Все').map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, newItemCategory === cat && styles.categoryChipActive]}
                  onPress={() => setNewItemCategory(cat)}
                >
                  <Text style={[styles.categoryChipText, newItemCategory === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.mBtn, styles.mBtnCancel]} onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#fff' }}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.mBtn, styles.mBtnAdd]} onPress={handleAddItem}>
                <Text style={{ color: '#080a0d', fontWeight: 'bold' }}>Добавить</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  addButton: { backgroundColor: '#00ff88', padding: 8, borderRadius: 20 },
  
  tabContainer: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: '#161b22', borderRadius: 10, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#21262d' },
  tabText: { color: '#8e8e93', fontWeight: '600' },
  activeTabText: { color: '#00ff88' },

  listPadding: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: '#161b22', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardChecked: { opacity: 0.5 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cardText: { color: '#fff', fontSize: 16, marginLeft: 12 },
  cardTextChecked: { textDecorationLine: 'line-through', color: '#8e8e93' },
  
  thumbImage: { width: 40, height: 40, borderRadius: 8, marginLeft: 10 },
  thumbPlaceholder: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#21262d', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  
  libInfo: { flex: 1, marginLeft: 4 },
  categorySubText: { color: '#8e8e93', fontSize: 12, marginLeft: 12 },
  actionsRow: { flexDirection: 'row', alignItems: 'center' },
  addToListBtn: { backgroundColor: '#21262d', padding: 6, borderRadius: 8 },

  searchInput: { backgroundColor: '#161b22', color: '#fff', padding: 12, marginHorizontal: 16, borderRadius: 10, marginBottom: 10 },
  categoriesScroll: { paddingLeft: 16, marginBottom: 12, maxHeight: 36 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#161b22', borderRadius: 16, marginRight: 8, height: 32 },
  categoryChipActive: { backgroundColor: '#00ff88' },
  categoryChipText: { color: '#8e8e93', fontSize: 13 },
  categoryChipTextActive: { color: '#080a0d', fontWeight: 'bold' },

  clearButton: { backgroundColor: '#ff453a22', margin: 16, padding: 12, borderRadius: 10, alignItems: 'center' },
  clearButtonText: { color: '#ff453a', fontWeight: 'bold' },
  emptyText: { color: '#8e8e93', textAlign: 'center', marginTop: 40 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#161b22', borderRadius: 16, padding: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  imagePickerBtn: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#21262d', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16, overflow: 'hidden' },
  modalPreviewImage: { width: '100%', height: '100%' },
  modalInput: { backgroundColor: '#080a0d', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  mBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  mBtnCancel: { backgroundColor: '#21262d' },
  mBtnAdd: { backgroundColor: '#00ff88' }
});
