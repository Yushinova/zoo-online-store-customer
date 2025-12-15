'use client';

import { useState, useEffect, useCallback } from 'react';
import { addressService } from '@/api/addressService';
import AddressInput from '@/components/yandex/AddressInput';
import styles from './UserAddresses.module.css';

export default function UserAddresses({ userId }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [selectedYmapsAddress, setSelectedYmapsAddress] = useState(null);
  const [manualAddress, setManualAddress] = useState('');
  const [useManualInput, setUseManualInput] = useState(false);

  // Загрузка адресов пользователя
  const loadAddresses = useCallback(async () => {
    // userId должен быть числовым id из UserResponse
    if (!userId) {
      console.error('ID пользователя не указан');
      return;
    }
    
    setLoading(true);
    try {
      const userAddresses = await addressService.getByUserId(userId);
      setAddresses(userAddresses || []);
    } catch (error) {
      console.error('Ошибка загрузки адресов:', error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Обработчик выбора адреса из Yandex Maps
  const handleAddressSelect = (address) => {
    console.log('Выбран адрес из AddressInput:', address);
    
    if (address && address.formattedAddress) {
      setNewAddress(address.formattedAddress);
    } else if (typeof address === 'string') {
      setNewAddress(address);
    } else if (address && typeof address === 'object') {
      const addressString = address.value || address.title || address.name || 
                           JSON.stringify(address);
      setNewAddress(addressString);
    } else {
      setNewAddress('');
    }
    
    setSelectedYmapsAddress(address);
    setUseManualInput(false);
  };

  // Сброс формы
  const resetForm = () => {
    setNewAddress('');
    setManualAddress('');
    setSelectedYmapsAddress(null);
    setIsAddingNew(false);
    setUseManualInput(false);
  };

  // Проверяем, можно ли сохранить адрес
  const canSaveAddress = () => {
    if (useManualInput) {
      return manualAddress && manualAddress.trim().length > 0;
    } else {
      return newAddress && newAddress.trim().length > 0;
    }
  };

  // Создание нового адреса
  const handleCreateAddress = async () => {
    let addressToSave = '';
    
    if (useManualInput) {
      addressToSave = manualAddress.trim();
    } else {
      addressToSave = newAddress.trim();
    }

    if (!addressToSave) {
      alert('Пожалуйста, введите адрес');
      return;
    }

    // userId должен быть числовым id
    if (!userId) {
      alert('Ошибка: пользователь не найден');
      return;
    }

    try {
      const addressData = {
        FullAddress: addressToSave,
        UserId: userId  // Числовой id из UserResponse
      };

      console.log('Отправка адреса на сервер:', addressData);
      
      await addressService.create(addressData);
      alert('Адрес успешно добавлен!');
      resetForm();
      loadAddresses();
    } catch (error) {
      console.error('Ошибка создания адреса:', error);
      alert(`Ошибка: ${error.message}`);
    }
  };

  // Удаление адреса
  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Вы уверены, что хотите удалить этот адрес?')) {
      return;
    }

    try {
      await addressService.deleteById(addressId);
      alert('Адрес удален!');
      loadAddresses();
    } catch (error) {
      console.error('Ошибка удаления адреса:', error);
      alert(`Ошибка: ${error.message}`);
    }
  };

  // Начало добавления нового адреса
  const handleAddNewAddress = () => {
    resetForm();
    setIsAddingNew(true);
  };

  // Отмена добавления
  const handleCancelAdd = () => {
    resetForm();
  };

  // Переключение на ручной ввод
  const toggleManualInput = () => {
    setUseManualInput(!useManualInput);
    if (!useManualInput) {
      setNewAddress('');
      setSelectedYmapsAddress(null);
    } else {
      setManualAddress('');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Загрузка адресов...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Заголовок и кнопка добавления */}
      <div className={styles.header}>
        <h3 className={styles.title}>Мои адреса</h3>
        {!isAddingNew && (
          <button 
            onClick={handleAddNewAddress}
            className={styles.addButton}
          >
            + Добавить новый адрес
          </button>
        )}
      </div>

      {/* Форма добавления нового адреса */}
      {isAddingNew && (
        <div className={styles.addForm}>
          <div className={styles.formHeader}>
            <h4>Добавить новый адрес</h4>
            <button 
              onClick={handleCancelAdd}
              className={styles.cancelButton}
            >
              ✕
            </button>
          </div>
          
          {/* Переключатель способа ввода */}
          <div className={styles.inputMethodToggle}>
            <button
              onClick={() => setUseManualInput(false)}
              className={`${styles.toggleButton} ${!useManualInput ? styles.activeToggle : ''}`}
            >
              Выбрать из подсказок
            </button>
            <button
              onClick={() => setUseManualInput(true)}
              className={`${styles.toggleButton} ${useManualInput ? styles.activeToggle : ''}`}
            >
              Ввести вручную
            </button>
          </div>

          {!useManualInput ? (
            <>
              <div className={styles.addressInputWrapper}>
                <AddressInput
                  onAddressSelect={handleAddressSelect}
                  placeholder="Начните вводить адрес..."
                  className={styles.addressInput}
                />
              </div>

              {newAddress && (
                <div className={styles.selectedAddressPreview}>
                  <p className={styles.previewTitle}>Выбранный адрес:</p>
                  <p className={styles.previewAddress}>{newAddress}</p>
                </div>
              )}
            </>
          ) : (
            <div className={styles.manualInputWrapper}>
              <textarea
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Введите полный адрес вручную..."
                className={styles.manualTextarea}
                rows="3"
              />
              <p className={styles.manualHint}>
                Пример: г. Москва, ул. Тверская, д. 1, кв. 25
              </p>
            </div>
          )}

          <div className={styles.formActions}>
            <button
              onClick={handleCancelAdd}
              className={styles.secondaryButton}
            >
              Отмена
            </button>
            <button
              onClick={handleCreateAddress}
              disabled={!canSaveAddress()}
              className={styles.primaryButton}
            >
              Сохранить адрес
            </button>
          </div>
        </div>
      )}

      {/* Список сохраненных адресов */}
      <div className={styles.addressesList}>
        {addresses.length === 0 && !isAddingNew ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>У вас нет сохраненных адресов</p>
            <button 
              onClick={handleAddNewAddress}
              className={styles.emptyAddButton}
            >
              Добавить первый адрес
            </button>
          </div>
        ) : (
          addresses.map(address => (
            <div key={address.id} className={styles.addressCard}>
              <div className={styles.addressContent}>
                <p className={styles.addressText}>{address.fullAddress}</p>
              </div>
              <div className={styles.addressActions}>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className={styles.deleteButton}
                  title="Удалить адрес"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Информационное сообщение */}
      <div className={styles.infoMessage}>
        <p>💡 Выберите адрес из подсказок или введите вручную, затем нажмите "Сохранить адрес"</p>
      </div>
    </div>
  );
}