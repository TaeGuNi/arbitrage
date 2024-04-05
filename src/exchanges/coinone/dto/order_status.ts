export enum OrderStatus {
  /**
   * 오더북에 등록된 상태로 취소나 체결이 되지 않은 상태
   */
  LIVE = "LIVE",
  /**
   * 주문이 부분적으로 체결된 상태. 잔여 수량 존재함
   */
  PARTIALLY_FILLED = "PARTIALLY_FILLED",
  /**
   * 주문이 부분적으로 취소된 상태
   */
  PARTIALLY_CANCELED = "PARTIALLY_CANCELED",
  /**
   * 주문이 모두 체결된 상태
   */
  FILLED = "FILLED",
  /**
   * 주문이 취소된 상태
   */
  CANCELED = "CANCELED",
  /**
   * 예약가 주문이 발동되지 않은 상태
   */
  NOT_TRIGGERED = "NOT_TRIGGERED",
  /**
   * 예약가 주문이 발동되지 않고 부분 취소된 상태
   */
  NOT_TRIGGERED_PARTIALLY_CANCELED = "NOT_TRIGGERED_PARTIALLY_CANCELED",
  /**
   * 예약가 주문이 발동되지 않고 완전 취소된 상태
   */
  NOT_TRIGGERED_CANCELED = "NOT_TRIGGERED_CANCELED",
  /**
   * 예약가 주문이 발동된 상태
   */
  TRIGGERED = "TRIGGERED",
  /**
   * 시장가 주문이 체결할 수 있는 호가가 없어 자동으로 취소된 상태
   * 취소 시 모든 주문이 취소되는것이 아닌, 부분만 취소됨
   */
  CANCELED_NO_ORDER = "CANCELED_NO_ORDER",
  /**
   * 시장가 주문이 limit_price에 걸려, 더이상 주문이 체결되지 않아 자동으로 취소된 상태
   * * 매수/매도 주문 request body 중 limit_price 참조
   * 취소 시 모든 주문이 취소되는것이 아닌, 부분만 취소됨
   */
  CANCELED_LIMIT_PRICE_EXCEED = "CANCELED_LIMIT_PRICE_EXCEED",
  /**
   * 시장가 매수 주문 체결 중 주문 가능 총액이 최소 금액 미만으로 남아 자동으로 취소된 상태
   * 취소 시 모든 주문이 취소되는것이 아닌, 부분만 취소됨
   */
  CANCELED_UNDER_PRODUCT_UNIT = "CANCELED_UNDER_PRODUCT_UNIT",
}
