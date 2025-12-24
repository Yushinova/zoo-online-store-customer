'use client';

import { useState, useEffect } from 'react';
import { orderService } from '@/api/orderService';
import styles from './OrdersTab.module.css';

export default function OrdersTab({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, paid, processing, shipped, delivered, deleted

  // Загрузка заказов пользователя
  useEffect(() => {
    if (!userId) return;

    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const userOrders = await orderService.getByUserId(userId);
        console.log('📦 Полный ответ сервера:', JSON.stringify(userOrders, null, 2));
        console.log('Загруженные заказы:', userOrders);
        setOrders(userOrders || []);
      } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        setError('Не удалось загрузить заказов. Попробуйте позже.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [userId]);

  // Фильтрация заказов по статусу
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Форматирование цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Получение статуса заказа
  const getStatusInfo = (status) => {
    const statuses = {
      'pending': { 
        text: 'Ожидает оплаты', 
        className: styles.statusPending,
        description: 'Заказ ожидает оплаты'
      },
      'paid': { 
        text: 'Оплачен', 
        className: styles.statusPaid,
        description: 'Заказ оплачен и ожидает обработки'
      },
      'processing': { 
        text: 'В обработке', 
        className: styles.statusProcessing,
        description: 'Заказ формируется и готовится к отправке'
      },
      'shipped': { 
        text: 'Отправлен', 
        className: styles.statusShipped,
        description: 'Заказ отправлен и находится в пути'
      },
      'delivered': { 
        text: 'Доставлен', 
        className: styles.statusDelivered,
        description: 'Заказ успешно доставлен'
      },
      'deleted': { 
        text: 'Удален', 
        className: styles.statusDeleted,
        description: 'Заказ был удален'
      }
    };
    
    return statuses[status] || { 
      text: status || 'Неизвестно', 
      className: styles.statusUnknown,
      description: 'Статус неизвестен'
    };
  };

  // Переключение деталей заказа
  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Общая сумма заказа
  const calculateOrderTotal = (order) => {
    return order.amount + (order.shippingCost || 0);
  };

  // Количество заказов по статусам
  const getOrdersCountByStatus = () => {
    const counts = {
      all: orders.length,
      Pending: orders.filter(o => o.status === 'pending').length,
      Paid: orders.filter(o => o.status === 'paid').length,
      Processing: orders.filter(o => o.status === 'processing').length,
      Shipped: orders.filter(o => o.status === 'shipped').length,
      Delivered: orders.filter(o => o.status === 'delivered').length,
      Deleted: orders.filter(o => o.status === 'deleted').length
    };
    return counts;
  };

  const statusCounts = getOrdersCountByStatus();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Загрузка заказов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className={styles.retryButton}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>📦</div>
        <h4>У вас пока нет заказов</h4>
        <p>Как только вы оформите заказ, он появится здесь</p>
        <a href="/" className={styles.shopButton}>
          Перейти в каталог
        </a>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Мои заказы</h3>
      
      {/* Фильтры по статусам */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('all')}
        >
          Все ({statusCounts.all})
        </button>
          <button
          className={`${styles.filterButton} ${filter === 'pending' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('pending')}
        >
          Ожидает оплаты ({statusCounts.Paid})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'paid' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('paid')}
        >
          Оплачен ({statusCounts.Paid})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'processing' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('processing')}
        >
          В обработке ({statusCounts.Processing})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'shipped' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('shipped')}
        >
          Отправлен ({statusCounts.Shipped})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'delivered' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('delivered')}
        >
          Доставлен ({statusCounts.Delivered})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'deleted' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('deleted')}
        >
          Удален ({statusCounts.Deleted})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className={styles.noResults}>
          <p>Нет заказов с выбранным статусом</p>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {filteredOrders.map(order => {
            const statusInfo = getStatusInfo(order.status);
            const isExpanded = expandedOrderId === order.id;
            const orderTotal = calculateOrderTotal(order);

            return (
              <div key={order.id} className={styles.orderCard}>
                {/* Заголовок заказа */}
                <div 
                  className={styles.orderHeader}
                  onClick={() => toggleOrderDetails(order.id)}
                >
                  <div className={styles.orderMainInfo}>
                    <div className={styles.orderNumberSection}>
                      <span className={styles.orderNumberLabel}>Заказ</span>
                      <span className={styles.orderNumber}>
                        #{order.orderNumber || order.id}
                      </span>
                      <div className={`${styles.orderStatusBadge} ${statusInfo.className}`}>
                        {statusInfo.text}
                      </div>
                    </div>
                    
                    <div className={styles.orderDateSection}>
                      <span className={styles.dateLabel}>Дата:</span>
                      <span className={styles.dateValue}>
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className={styles.orderAddressSection}>
                      <span className={styles.addressLabel}>Адрес:</span>
                      <span className={styles.addressValue}>
                        {order.shippingAddress || 'Не указан'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.orderStatusSection}>
                    <div className={styles.orderTotal}>
                      {formatPrice(orderTotal)}
                    </div>
                    <button className={styles.expandButton}>
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {/* Детали заказа (раскрывающиеся) */}
                {isExpanded && (
                  <div className={styles.orderDetails}>
                    {/* Статус заказа с описанием */}
                    <div className={styles.statusDescription}>
                      <strong>Статус:</strong> {statusInfo.description}
                    </div>

                    {/* Информация о покупателе */}
                    <div className={styles.detailsSection}>
                      <h5>Информация о покупателе:</h5>
                      <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Имя:</span>
                          <span className={styles.detailValue}>
                            {order.user?.name || 'Не указано'}
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Телефон:</span>
                          <span className={styles.detailValue}>
                            {order.user?.phone || 'Не указан'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Состав заказа */}
                    <div className={styles.detailsSection}>
                      <h5>Состав заказа:</h5>
                      <div className={styles.orderItems}>
                        {order.orderItems && order.orderItems.length > 0 ? (
                          order.orderItems.map((item, index) => (
                            <div key={index} className={styles.orderItem}>
                              <div className={styles.itemInfo}>
                                <span className={styles.itemName}>
                                  {item.productName || `Товар #${item.productId}`}
                                </span>
                                <span className={styles.itemQuantity}>
                                  × {item.quantity}
                                </span>
                              </div>
                              <div className={styles.itemPrice}>
                                {formatPrice(item.price || item.unitPrice * item.quantity)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className={styles.noItems}>Нет информации о товарах</p>
                        )}
                      </div>
                    </div>

                    {/* Итоговая сумма */}
                    <div className={styles.detailsSection}>
                      <div className={styles.orderSummary}>
                        <div className={styles.summaryRow}>
                          <span>Сумма товаров:</span>
                          <span>{formatPrice(order.amount)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                          <span>Доставка:</span>
                          <span>{formatPrice(order.shippingCost || 0)}</span>
                        </div>
                        <div className={styles.summaryRowTotal}>
                          <span>Итого:</span>
                          <span className={styles.totalAmount}>
                            {formatPrice(orderTotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Дополнительные действия */}
                    {order.status !== 'Deleted' && order.status !== 'Delivered' && (
                      <div className={styles.orderActions}>
                        {order.status === 'Paid' && (
                          <button className={styles.actionButton}>
                            Отследить заказ
                          </button>
                        )}
                        {order.status === 'Processing' && (
                          <button className={styles.actionButton}>
                            Уточнить детали
                          </button>
                        )}
                        {order.status === 'Shipped' && (
                          <button className={styles.actionButton}>
                            Подтвердить получение
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}