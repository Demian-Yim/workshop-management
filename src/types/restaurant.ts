import { Timestamp } from 'firebase/firestore';

/** 카카오 로컬 API 검색 결과 */
export interface KakaoPlaceResult {
  id: string;
  place_name: string;
  category_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  distance?: string;
}

/** 메뉴 항목 */
export interface MenuItem {
  id: string;
  name: string;
  price: number | null;
  description: string;
  isPopular: boolean;
}

/** 앱 내 저장된 식당 */
export interface Restaurant {
  id: string;
  kakaoPlaceId: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  placeUrl: string;
  menuItems: MenuItem[];
  addedBy: string;
  createdAt: Timestamp;
}

/** 주문 항목 */
export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
}

/** 학습자 메뉴 주문 */
export interface MenuOrder {
  id: string;
  participantName: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  note: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** 메뉴별 주문 취합 */
export interface OrderSummaryItem {
  menuItemName: string;
  totalQuantity: number;
  orderers: string[];
}

/** 식당별 주문 취합 */
export interface OrderSummary {
  restaurantId: string;
  restaurantName: string;
  items: OrderSummaryItem[];
  totalOrders: number;
}

/** 점심 주문 운영 설정 */
export interface LunchOrderConfig {
  isOpen: boolean;
  selectedRestaurantIds: string[];
  deadline: Timestamp | null;
}
