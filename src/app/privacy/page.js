'use client'
import Link from 'next/link';
import styles from './page.module.css';

export default function PrivacyPolicyPage() {

const sections = [
  { id: 'data-collection', title: '1. Какие данные мы собираем' },
  { id: 'data-usage', title: '2. Как мы используем ваши данные' },
  { id: 'data-protection', title: '3. Защита данных' },
  { id: 'cookies', title: '4. Использование cookies' },
  { id: 'contacts', title: '5. Контакты' },
];

const features = [
  {
    title: 'Обслуживание',
    description: 'Обработка заказов, доставка товаров, обслуживание клиентов',
    color: 'blue'
  },
  {
    title: 'Улучшение сервиса',
    description: 'Анализ использования сайта для улучшения пользовательского опыта',
    color: 'green'
  },
  {
    title: 'Коммуникация',
    description: 'Отправка уведомлений о заказах, ответы на вопросы, информационные рассылки',
    color: 'purple'
  },
  {
    title: 'Безопасность',
    description: 'Обнаружение и предотвращение мошенничества, защита аккаунтов',
    color: 'yellow'
  }
];
  const currentDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Функции для получения классов по цвету
  const getFeatureCardClass = (color) => {
    const baseClass = styles.featureCard;
    switch(color) {
      case 'blue': return `${baseClass} ${styles.featureCardBlue}`;
      case 'green': return `${baseClass} ${styles.featureCardGreen}`;
      case 'purple': return `${baseClass} ${styles.featureCardPurple}`;
      case 'yellow': return `${baseClass} ${styles.featureCardYellow}`;
      default: return baseClass;
    }
  };

  const getFeatureTitleClass = (color) => {
    const baseClass = styles.featureTitle;
    switch(color) {
      case 'blue': return `${baseClass} ${styles.featureTitleBlue}`;
      case 'green': return `${baseClass} ${styles.featureTitleGreen}`;
      case 'purple': return `${baseClass} ${styles.featureTitlePurple}`;
      case 'yellow': return `${baseClass} ${styles.featureTitleYellow}`;
      default: return baseClass;
    }
  };

  const getFeatureTextClass = (color) => {
    const baseClass = styles.featureText;
    switch(color) {
      case 'blue': return `${baseClass} ${styles.featureTextBlue}`;
      case 'green': return `${baseClass} ${styles.featureTextGreen}`;
      case 'purple': return `${baseClass} ${styles.featureTextPurple}`;
      case 'yellow': return `${baseClass} ${styles.featureTextYellow}`;
      default: return baseClass;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Хлебные крошки */}
        <nav className={styles.breadcrumbs}>
          <ol className={styles.breadcrumbList}>
            <li className={styles.breadcrumbItem}>
              <Link href="/" className={styles.breadcrumbLink}>
                Главная
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
            </li>
            <li className={styles.breadcrumbItem}>
              <span className={styles.breadcrumbActive}>
                Политика конфиденциальности
              </span>
            </li>
          </ol>
        </nav>

        {/* Заголовок */}
        <div className={styles.header}>
          <h1 className={styles.title}>Политика конфиденциальности</h1>
          <p className={styles.date}>
            Последнее обновление: {currentDate}
          </p>
        </div>

        {/* Основной контент */}
        <div className={styles.content}>
          {/* Введение */}
          <div className={styles.intro}>
            <p className={styles.introText}>
              Настоящая Политика конфиденциальности (далее — «Политика») описывает, как мы собираем, 
              используем, храним и защищаем ваши персональные данные при использовании нашего сайта.
            </p>
            <p className={styles.introText}>
              Используя наш сайт, вы соглашаетесь с условиями настоящей Политики конфиденциальности.
            </p>
          </div>

          {/* Оглавление */}
          <div className={styles.toc}>
            <h3 className={styles.tocTitle}>Содержание:</h3>
            <ul className={styles.tocList}>
              {sections.map((section) => (
                <li key={section.id} className={styles.tocItem}>
                  <a 
                    href={`#${section.id}`}
                    className={styles.tocLink}
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Раздел 1: Какие данные мы собираем */}
          <section id="data-collection" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {sections[0].title}
            </h2>
            <div className={styles.sectionContent}>
              <p className={styles.sectionText}>
                Мы собираем следующие типы информации:
              </p>
              <ul className={styles.list}>
                <li className={styles.listItem}>
                  <span className={styles.highlight}>Персональные данные:</span> имя, адрес электронной почты, 
                  номер телефона, которые вы предоставляете при регистрации или оформлении заказа.
                </li>
                <li className={styles.listItem}>
                  <span className={styles.highlight}>Данные для доставки:</span> адрес доставки, информация для 
                  контакта с курьером.
                </li>
                <li className={styles.listItem}>
                  <span className={styles.highlight}>Платежная информация:</span> данные, необходимые для обработки 
                  платежей (через защищенные платежные шлюзы).
                </li>
                <li className={styles.listItem}>
                  <span className={styles.highlight}>Техническая информация:</span> IP-адрес, тип браузера, 
                  операционная система, данные об устройстве.
                </li>
                <li className={styles.listItem}>
                  <span className={styles.highlight}>Данные об использовании:</span> страницы, которые вы посещаете, 
                  время посещения, история заказов.
                </li>
              </ul>
            </div>
          </section>

          {/* Раздел 2: Как мы используем ваши данные */}
          <section id="data-usage" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {sections[1].title}
            </h2>
            <div className={styles.sectionContent}>
              <p className={styles.sectionText}>
                Собранные данные используются для следующих целей:
              </p>
              <div className={styles.features}>
                {features.map((feature, index) => (
                  <div key={index} className={getFeatureCardClass(feature.color)}>
                    <h3 className={getFeatureTitleClass(feature.color)}>
                      {feature.title}
                    </h3>
                    <p className={getFeatureTextClass(feature.color)}>
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Раздел 3: Защита данных */}
          <section id="data-protection" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {sections[2].title}
            </h2>
            <div className={styles.sectionContent}>
              <p className={styles.sectionText}>
                Мы принимаем разумные меры для защиты ваших персональных данных:
              </p>
              <ul className={styles.list}>
                <li className={styles.listItem}>Использование шифрования SSL для передачи данных</li>
                <li className={styles.listItem}>Регулярное обновление систем безопасности</li>
                <li className={styles.listItem}>Ограниченный доступ к персональным данным сотрудников</li>
                <li className={styles.listItem}>Хранение данных на защищенных серверах</li>
                <li className={styles.listItem}>Регулярное резервное копирование данных</li>
              </ul>
            </div>
          </section>

          {/* Раздел 4: Использование cookies */}
          <section id="cookies" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {sections[3].title}
            </h2>
            <div className={styles.sectionContent}>
              <p className={styles.sectionText}>
                Мы используем cookies для:
              </p>
              <ul className={styles.list}>
                <li className={styles.listItem}>Запоминания ваших предпочтений</li>
                <li className={styles.listItem}>Анализа трафика и использования сайта</li>
                <li className={styles.listItem}>Персонализации контента</li>
                <li className={styles.listItem}>Работы корзины покупок</li>
                <li className={styles.listItem}>Улучшения производительности сайта</li>
              </ul>
              <p className={styles.sectionText}>
                Вы можете управлять cookies через настройки вашего браузера, 
                однако это может повлиять на функциональность сайта.
              </p>
            </div>
          </section>

          {/* Раздел 5: Контакты */}
          <section id="contacts" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {sections[4].title}
            </h2>
            <div className={styles.sectionContent}>
              <p className={styles.sectionText}>
                Если у вас есть вопросы о нашей Политике конфиденциальности или 
                обработке ваших персональных данных, свяжитесь с нами:
              </p>
              <div className={styles.contactBox}>
                <p className={styles.contactLabel}>Электронная почта:</p>
                <a 
                  href="mailto:bestfriend@mail.ru" 
                  className={styles.contactLink}
                >
                  bestfriend@mail.ru
                </a>
                
                <p className={styles.contactLabel}>Телефон:</p>
                <a 
                  href="tel:+78005863322" 
                  className={styles.contactLink}
                >
                  8 (800) 586-33-22
                </a>
                
                <p className={styles.contactLabel}>Адрес:</p>
                <p className={styles.contactText}>г. Москва, ул. Ленина, д. 1, офис 101</p>
              </div>
            </div>
          </section>

          {/* Заключение */}
          <div className={styles.conclusion}>
            <p>
              Благодарим за доверие и использование нашего сервиса. 
              Мы ценим вашу конфиденциальность и стремимся защищать ваши данные.
            </p>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className={styles.actions}>
          <Link
            href="/"
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            Вернуться на главную
          </Link>
          <Link
            href="/contacts"
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            Связаться с нами
          </Link>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.print();
              }
            }}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            Распечатать политику
          </button>
        </div>
      </div>
    </div>
  );
}