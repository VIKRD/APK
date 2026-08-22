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
  Alert,
  Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const INITIAL_LIBRARY = [
  // Мясо и Колбасы
  { id: 'm1', name: 'Свинина', category: 'Мясо', image: null },
  { id: 'm2', name: 'Сало', category: 'Мясо', image: null },
  { id: 'm3', name: 'Индейка', category: 'Мясо', image: null },
  { id: 'm4', name: 'Курица', category: 'Мясо', image: null },
  { id: 'm5', name: 'Колбаса', category: 'Мясо', image: null },
  
  // Овощи
  { id: 'v1', name: 'Лук репчатый', category: 'Овощи', image: null },
  { id: 'v2', name: 'Лук зеленый', category: 'Овощи', image: null },
  { id: 'v3', name: 'Чеснок', category: 'Овощи', image: null },
  { id: 'v4', name: 'Перец болгарский', category: 'Овощи', image: null },
  { id: 'v5', name: 'Помидоры', category: 'Овощи', image: null },
  { id: 'v8', name: 'Огурцы', category: 'Овощи', image: null },
  { id: 'v10', name: 'Картошка', category: 'Овощи', image: null },

  // Фрукты и Ягоды
  { id: 'f1', name: 'Яблоки', category: 'Фрукты', image: null },
  { id: 'f2', name: 'Персики', category: 'Фрукты', image: null },
  { id: 'f4', name: 'Виноград', category: 'Фрукты', image: null },
  { id: 'f5', name: 'Авокадо', category: 'Фрукты', image: null },
  { id: 'f9', name: 'Голубика (Лохина)', category: 'Фрукты', image: null },

  // Бакалея и Крупы
  { id: 'g1', name: 'Гречка', category: 'Бакалея', image: null },
  { id: 'g4', name: 'Рис', category: 'Бакалея', image: null },
  { id: 'g6', name: 'Макароны', category: 'Бакалея', image: null },

  // Консервы
  { id: 'c1', name: 'Тушенка', category: 'Консервы', image: null },
  { id: 'c8', name: 'Икра красная', category: 'Консервы', image: null },

  // Напитки
  { id: 'd1', name: 'Пиво', category: 'Напитки', image: null },
  { id: 'd2', name: 'Сок', category: 'Напитки', image: null },
  { id: 'd3', name: 'Вода', category: 'Напитки', image: null }
];

const CATEGORIES = ['Все', 'Мясо', 'Овощи', 'Фрукты', 'Бакалея', 'Консервы', 'Напитки', 'Другое'];

export default function App() {
  const [library, setLibrary] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  
  const [activeTab, setActiveTab] = useState('list');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [notifications, setNotifications] = useState(true);
  const [autoClear, setAutoClear] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Другое');
  const [newItemImage, setNewItemImage] = useState(null);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { saveData(); }, [library, shoppingList, notifications, autoClear]);

  const loadData = async () => {
    try {
      const savedLib = await AsyncStorage.getItem('@grocery_library');
      const savedList = await AsyncStorage.getItem('@grocery_shopping_list');
      const savedNotif = await AsyncStorage.getItem('@grocery_notif');
      const savedClear = await AsyncStorage.getItem('@grocery_autoclear');

      setLibrary(savedLib ? JSON.parse(savedLib) : INITIAL_LIBRARY);
      if (savedList) setShoppingList(JSON.parse(savedList));
      if (savedNotif !== null) setNotifications(JSON.parse(savedNotif));
      if (savedClear !== null) setAutoClear(JSON.parse(savedClear));
    } catch (e) {}
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('@grocery_library', JSON.stringify(library));
      await AsyncStorage.setItem('@grocery_shopping_list', JSON.stringify(shoppingList));
      await AsyncStorage.setItem('@grocery_notif', JSON.stringify(notifications));
      await AsyncStorage.setItem('@grocery_autoclear', JSON.stringify(autoClear));
    } catch (e) {}
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Ошибка', 'Нужен доступ к галерее');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets) {
      setNewItemImage(result.assets[0].uri);
    }
  };

  const handleAddItem = () => {
    const trimmed = newItemName.trim();
    if (!trimmed) return;

    if (shoppingList.some(i => i.name.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert('Уже в списке', `"${trimmed}" уже есть в корзине.`);
      return;
    }

    let libItem = library.find(i => i.name.toLowerCase() === trimmed.toLowerCase());
    let updatedLib = [...library];

    if (!libItem) {
      libItem = { id: Date.now().toString(), name: trimmed, category: newItemCategory, image: newItemImage };
      updatedLib.push(libItem);
    } else if (newItemImage) {
      libItem = { ...libItem, image: newItemImage };
      updatedLib = updatedLib.map(i => i.id === libItem.id ? libItem : i);
    }

    setLibrary(updatedLib);
    setShoppingList([...shoppingList, { id: Date.now().toString(), libraryId: libItem.id, name: libItem.name, checked: false }]);
    
    setNewItemName('');
    setNewItemImage(null);
    setModalVisible(false);
  };

  const addFromLibraryToList = (libItem) => {
    if (shoppingList.some(i => i.name.toLowerCase() === libItem.name.toLowerCase())) {
      Alert.alert('Уже в списке', `"${libItem.name}" уже добавлен.`);
      return;
    }
    setShoppingList([...shoppingList, { id: Date.now().toString(), libraryId: libItem.id, name: libItem.name, checked: false }]);
  };

  const filteredLibrary = library.filter(item => {
    const matchesCat = selectedCategory === 'Все' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Продукты 🛒</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={26} color="#080a0d" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'list' && styles.activeTab]} onPress={() => setActiveTab('list')}>
          <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>Корзина ({shoppingList.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'library' && styles.activeTab]} onPress={() => setActiveTab('library')}>
          <Text style={[styles.tabText, activeTab === 'library' && styles.activeTabText]}>Каталог ({library.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'settings' && styles.activeTab]} onPress={() => setActiveTab('settings')}>
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>⚙️ Настройки</Text>
        </TouchableOpacity>
      </View>

      {/* Вкладка Корзина */}
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
                  <TouchableOpacity 
                    onPress={() => setShoppingList(shoppingList.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i))} 
                    style={styles.cardLeft}
                  >
                    <Ionicons name={item.checked ? "checkbox" : "square-outline"} size={24} color={item.checked ? "#00ff88" : "#8e8e93"} />
                    {libData?.image ? (
                      <Image source={{ uri: libData.image }} style={styles.thumbImage} />
                    ) : (
                      <View style={styles.thumbPlaceholder}><Ionicons name="basket-outline" size={18} color="#8e8e93" /></View>
                    )}
                    <Text style={[styles.cardText, item.checked && styles.cardTextChecked]}>{item.name}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShoppingList(shoppingList.filter(i => i.id !== item.id))}>
                    <Ionicons name="trash-outline" size={20} color="#ff453a" />
                  </TouchableOpacity>
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>Корзина пуста</Text>}
          />
          {shoppingList.some(i => i.checked) && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setShoppingList(shoppingList.filter(i => !i.checked))}>
              <Text style={styles.clearButtonText}>Удалить купленное</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Вкладка Каталог */}
      {activeTab === 'library' && (
        <View style={{ flex: 1 }}>
          <TextInput 
            style={styles.searchInput} 
            placeholder="Поиск..." 
            placeholderTextColor="#8e8e93" 
            value={searchQuery} 
            onChangeText={setSearchQuery} 
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]} 
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredLibrary}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.thumbImage} />
                  ) : (
                    <View style={styles.thumbPlaceholder}><Ionicons name="camera-outline" size={20} color="#00ff88" /></View>
                  )}
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.cardText}>{item.name}</Text>
                    <Text style={styles.categorySubText}>{item.category}</Text>
                  </View>
                </View>

                <TouchableOpacity onPress={() => addFromLibraryToList(item)} style={styles.addToListBtn}>
                  <Ionicons name="cart-outline" size={22} color="#00ff88" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      {/* Вкладка Настройки */}
      {activeTab === 'settings' && (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Уведомления</Text>
              <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#21262d', true: '#00ff88' }} />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Автоочистка корзины</Text>
              <Switch value={autoClear} onValueChange={setAutoClear} trackColor={{ false: '#21262d', true: '#00ff88' }} />
            </View>
          </View>

          <TouchableOpacity style={styles.clearAllBtn} onPress={() => setShoppingList([])}>
            <Text style={styles.clearAllBtnText}>Очистить всю корзину</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Модалка */}
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
                  <Text style={{ color: '#8e8e93', fontSize: 12, marginTop: 4 }}>Фото</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput 
              style={styles.modalInput} 
              placeholder="Название..." 
              placeholderTextColor="#8e8e93" 
              value={newItemName} 
              onChangeText={setNewItemName} 
            />

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
  tabText: { color: '#8e8e93', fontWeight: '600', fontSize: 13 },
  activeTabText: { color: '#00ff88' },

  listPadding: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: '#161b22', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardChecked: { opacity: 0.5 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cardText: { color: '#fff', fontSize: 16, marginLeft: 10 },
  cardTextChecked: { textDecorationLine: 'line-through', color: '#8e8e93' },
  
  thumbImage: { width: 36, height: 36, borderRadius: 8, marginLeft: 8 },
  thumbPlaceholder: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#21262d', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },

  categorySubText: { color: '#8e8e93', fontSize: 12 },
  addToListBtn: { backgroundColor: '#21262d', padding: 8, borderRadius: 8 },

  searchInput: { backgroundColor: '#161b22', color: '#fff', padding: 12, marginHorizontal: 16, borderRadius: 10, marginBottom: 10 },
  categoriesScroll: { paddingLeft: 16, marginBottom: 12, maxHeight: 36 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#161b22', borderRadius: 16, marginRight: 8, height: 32 },
  categoryChipActive: { backgroundColor: '#00ff88' },
  categoryChipText: { color: '#8e8e93', fontSize: 13 },
  categoryChipTextActive: { color: '#080a0d', fontWeight: 'bold' },

  clearButton: { backgroundColor: '#ff453a22', margin: 16, padding: 12, borderRadius: 10, alignItems: 'center' },
  clearButtonText: { color: '#ff453a', fontWeight: 'bold' },
  emptyText: { color: '#8e8e93', textAlign: 'center', marginTop: 40 },

  settingCard: { backgroundColor: '#161b22', borderRadius: 12, padding: 16, marginBottom: 16 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  settingText: { color: '#fff', fontSize: 16 },
  clearAllBtn: { backgroundColor: '#ff453a22', padding: 14, borderRadius: 10, alignItems: 'center' },
  clearAllBtnText: { color: '#ff453a', fontWeight: 'bold' },

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
