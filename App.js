import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Alert,
  StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export default function App() {
  // --- Состояния приложения ---
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'files' | 'settings'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // --- Состояния свежего функционала (файлы и медиа) ---
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Динамические стили темы
  const themeContainerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const themeTextStyle = isDarkMode ? styles.darkText : styles.lightText;
  const themeCardStyle = isDarkMode ? styles.darkCard : styles.lightCard;

  // --- Функционал выбора изображения ---
  const pickImage = async () => {
    try {
      setIsLoading(true);
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Ошибка доступа', 'Разрешите доступ к галерее в настройках устройства.');
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить изображение.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Функционал выбора документа ---
  const pickDocument = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedDoc(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать документ.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Рендер содержимого по вкладкам ---
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, themeTextStyle]}>Главная панель</Text>
            <View style={[styles.card, themeCardStyle]}>
              <Text style={[styles.cardTitle, themeTextStyle]}>Статус системы</Text>
              <Text style={[styles.cardSubtitle, themeTextStyle]}>
                Все модули работают исправно. Перейдите во вкладку «Файлы» для загрузки или в «Настройки» для конфигурации.
              </Text>
            </View>
          </View>
        );

      case 'files':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, themeTextStyle]}>Загрузка и файлы</Text>
            
            {/* Кнопки работы с файлами */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton} onPress={pickImage} disabled={isLoading}>
                <Text style={styles.actionButtonText}>📷 Выбрать фото</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={pickDocument} disabled={isLoading}>
                <Text style={styles.actionButtonText}>📄 Выбрать документ</Text>
              </TouchableOpacity>
            </View>

            {isLoading && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={[styles.loadingText, themeTextStyle]}>Обработка файла...</Text>
              </View>
            )}

            {/* Предпросмотр изображения */}
            {selectedImage && (
              <View style={[styles.card, themeCardStyle]}>
                <Text style={[styles.cardTitle, themeTextStyle]}>Выбранное изображение:</Text>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>Удалить</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Данные документа */}
            {selectedDoc && (
              <View style={[styles.card, themeCardStyle]}>
                <Text style={[styles.cardTitle, themeTextStyle]}>Выбранный документ:</Text>
                <Text style={[styles.fileInfoText, themeTextStyle]}>Имя: {selectedDoc.name}</Text>
                <Text style={[styles.fileInfoText, themeTextStyle]}>Размер: {(selectedDoc.size / 1024).toFixed(2)} KB</Text>
                <TouchableOpacity onPress={() => setSelectedDoc(null)} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>Удалить</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );

      case 'settings':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, themeTextStyle]}>Настройки</Text>

            {/* Блок переключателей */}
            <View style={[styles.card, themeCardStyle]}>
              <View style={styles.settingItem}>
                <Text style={[styles.settingLabel, themeTextStyle]}>Тёмная тема</Text>
                <Switch
                  value={isDarkMode}
                  onValueChange={(val) => setIsDarkMode(val)}
                  trackColor={{ false: '#767577', true: '#007AFF' }}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <Text style={[styles.settingLabel, themeTextStyle]}>Уведомления</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(val) => setNotificationsEnabled(val)}
                  trackColor={{ false: '#767577', true: '#34C759' }}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <Text style={[styles.settingLabel, themeTextStyle]}>Автосохранение</Text>
                <Switch
                  value={autoSaveEnabled}
                  onValueChange={(val) => setAutoSaveEnabled(val)}
                  trackColor={{ false: '#767577', true: '#34C759' }}
                />
              </View>
            </View>

            {/* Дополнительные действия */}
            <TouchableOpacity 
              style={styles.dangerButton}
              onPress={() => Alert.alert('Сброс', 'Все настройки сброшены по умолчанию.')}
            >
              <Text style={styles.dangerButtonText}>Сбросить настройки</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, themeContainerStyle]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderContent()}
      </ScrollView>

      {/* Нижняя навигация (Таббар) */}
      <View style={[styles.tabBar, isDarkMode ? styles.darkTabBar : styles.lightTabBar]}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'home' && styles.activeTabItem]} 
          onPress={() => setActiveTab('home')}
        >
          <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>🏠 Главная</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'files' && styles.activeTabItem]} 
          onPress={() => setActiveTab('files')}
        >
          <Text style={[styles.tabText, activeTab === 'files' && styles.activeTabText]}>📁 Файлы</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'settings' && styles.activeTabItem]} 
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>⚙️ Настройки</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- Стили ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#F2F2F7',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  tabContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  lightText: {
    color: '#000000',
  },
  darkText: {
    color: '#FFFFFF',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lightCard: {
    backgroundColor: '#FFFFFF',
  },
  darkCard: {
    backgroundColor: '#1C1C1E',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 0.48,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#5856D6',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  loaderContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 12,
  },
  fileInfoText: {
    fontSize: 14,
    marginVertical: 2,
  },
  deleteButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 8,
  },
  dangerButton: {
    backgroundColor: '#FF3B3015',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  dangerButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    borderTopWidth: 1,
    paddingBottom: 10,
    paddingTop: 8,
  },
  lightTabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E5EA',
  },
  darkTabBar: {
    backgroundColor: '#1C1C1E',
    borderTopColor: '#2C2C2E',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabItem: {
    opacity: 1,
  },
  tabText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
