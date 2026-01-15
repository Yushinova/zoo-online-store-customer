const FAVOURITES_KEY = 'pet_shop_favourites';
const MAX_FAVOURITES = 12;

//отправка события обновления избранного
const dispatchFavouritesUpdateEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('favouritesUpdated'));
    
    //отправляем storage event для других вкладок
    window.dispatchEvent(new StorageEvent('storage', {
      key: FAVOURITES_KEY,
      newValue: localStorage.getItem(FAVOURITES_KEY)
    }));
  }
};

//получить избранное из localStorage
export const getFavourites = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    const favouritesData = localStorage.getItem(FAVOURITES_KEY);
    return favouritesData ? JSON.parse(favouritesData) : [];
  } catch (error) {
    console.error('Error reading favourites from localStorage:', error);
    return [];
  }
};

//сохранить избранное в localStorage
const saveFavourites = (favourites) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favourites));
    dispatchFavouritesUpdateEvent(); //отправляем событие
  } catch (error) {
    console.error('Error saving favourites to localStorage:', error);
  }
};

//добавить товар в избранное
export const addToFavourites = (productId) => {
  const favourites = getFavourites();
  
  //проверяем, не превышен ли лимит
  if (favourites.length >= MAX_FAVOURITES) {
    throw new Error(`Достигнут лимит избранных товаров (${MAX_FAVOURITES})`);
  }
  
  //проверяем, не добавлен ли уже товар
  const isAlreadyFavourite = favourites.some(item => item.productId === productId);
  if (isAlreadyFavourite) {
    return favourites;
  }
  
  //добавляем новый товар
  favourites.push({
    productId,
    addedAt: new Date().toISOString()
  });
  
  saveFavourites(favourites);
  return favourites;
};

//удалить товар из избранного
export const removeFromFavourites = (productId) => {
  const favourites = getFavourites();
  const newFavourites = favourites.filter(item => item.productId !== productId);
  saveFavourites(newFavourites);
  return newFavourites;
};

//очистить избранное
export const clearFavourites = () => {
  saveFavourites([]);
  return [];
};

//получить количество избранных товаров
export const getFavouritesCount = () => {
  const favourites = getFavourites();
  return favourites.length;
};

//получить массив ID товаров в избранном
export const getFavouriteProductIds = () => {
  const favourites = getFavourites();
  return favourites.map(item => item.productId);
};

//проверить, есть ли товар в избранном
export const isInFavourites = (productId) => {
  const favourites = getFavourites();
  return favourites.some(item => item.productId === productId);
};

//проверить, можно ли добавить еще товаров
export const canAddMoreFavourites = () => {
  const favourites = getFavourites();
  return favourites.length < MAX_FAVOURITES;
};

//получить оставшееся количество мест для избранного
export const getRemainingFavouritesSlots = () => {
  const favourites = getFavourites();
  return MAX_FAVOURITES - favourites.length;
};

//получить избранное с сортировкой по дате добавления (новые первые)
export const getSortedFavourites = () => {
  const favourites = getFavourites();
  return [...favourites].sort((a, b) => 
    new Date(b.addedAt) - new Date(a.addedAt)
  );
};

//загрузить данные товаров по их ID
export const loadFavouriteProducts = async (productService) => {
  const favourites = getSortedFavourites();
  const productIds = favourites.map(item => item.productId);
  
  if (productIds.length === 0) {
    return [];
  }
  
  try {
    //загружаем каждый товар по ID
    const productsPromises = favourites.map(async (favourite) => {
      try {
        //используем переданный productService
        const product = await productService.getByIdWithAllInfo(favourite.productId);
        
        //добавляем дату добавления в избранное
        return {
          ...product,
          favouriteAddedAt: favourite.addedAt
        };
      } catch (error) {
        console.error(`Error loading product ${favourite.productId}:`, error);
        
        //возвращаем базовую информацию о товаре, если не удалось загрузить
        return {
          id: favourite.productId,
          name: 'Товар временно недоступен',
          price: 0,
          isActive: false,
          productImages: [],
          error: true,
          favouriteAddedAt: favourite.addedAt
        };
      }
    });
    
    //ожидаем загрузку всех товаров
    const products = await Promise.all(productsPromises);
    
    //фильтруем только успешно загруженные товары
    const validProducts = products.filter(product => !product.error);
    
    //возвращаем отсортированные по дате добавления
    return validProducts.sort((a, b) => 
      new Date(b.favouriteAddedAt) - new Date(a.favouriteAddedAt)
    );
    
  } catch (error) {
    console.error('Error loading favourite products:', error);
    return [];
  }
};

//обновить информацию о конкретном товаре в избранном
export const refreshFavouriteProduct = async (productId, productService) => {
  try {
    const product = await productService.getByIdWithAllInfo(productId);
    return {
      ...product,
      favouriteAddedAt: getFavourites().find(fav => fav.productId === productId)?.addedAt
    };
  } catch (error) {
    console.error(`Error refreshing product ${productId}:`, error);
    return null;
  }
};