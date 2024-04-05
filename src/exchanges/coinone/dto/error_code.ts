export const error_code = {
  4: {
    message: "Blocked user access",
    description: "제한된 사용자의 접근입니다.",
  },
  8: {
    message: "Request Token Parameter is needed",
    description: "토큰 파라미터 요청이 필요 합니다.",
  },
  11: {
    message: "Access token is missing",
    description: "액세스 토큰 필요 합니다.",
  },
  12: {
    message: "Invalid access token",
    description: "유효하지 않은 액세스 토큰입니다.",
  },
  20: {
    message: "This service does not exist",
    description: "존재하지 않은 API 서비스입니다.",
  },
  21: {
    message: "Customers who need to register for API usage",
    description: "API 사용을 위한 등록이 필요 합니다.",
  },
  22: {
    message: "This service is not approved",
    description: "승인되지 않은 서비스입니다.",
  },
  23: {
    message: "Invalid App Secret",
    description:
      "유효하지 않은 App Secret 입니다. 코인원 웹 > Open API 메뉴에서 상태 확인 부탁드립니다.",
  },
  24: {
    message: "Invalid App Id",
    description:
      "유효하지 않은 APP ID 입니다. 코인원 웹 > Open API 메뉴에서 상태 확인 부탁드립니다.",
  },
  25: {
    message: "Request Token does not exist",
    description: "존재하지 않은 Request Token 입니다.",
  },
  26: {
    message: "Failed to delete Request Token",
    description: "Request Token 삭제를 실패 하였습니다.",
  },
  27: {
    message: "Access Token does not exist",
    description: "존재하지 않은 Access Token 입니다.",
  },
  28: {
    message: "Failed to delete Access Token",
    description: "Access Token 삭제 실패 하였습니다.",
  },
  29: {
    message: "Failed to refresh Access Token",
    description: "Access Token을 리프레쉬 하는데 실패 하였습니다.",
  },
  40: {
    message: "Invalid API permission",
    description: "승인되지 않은 API 권한입니다.",
  },
  50: {
    message:
      "You can use the API after complete Coinone identity verification by web or app",
    description: "코인원 웹이나 앱을 통한 KYC 인증 이후 API 이용이 가능합니다.",
  },
  51: {
    message: "This API is no longer available",
    description: "더 이상 유효하지 않은 API 입니다.",
  },
  52: {
    message:
      "Customers who did not complete the real name account verification are not allowed to use this service",
    description:
      "실명 계좌 인증을 완료하지 않은 고객 입니다. 코인원 앱을 통해 실명 계좌 인증이 필요 합니다.",
  },
  53: {
    message: "Two Factor Auth Fail",
    description: "2-Factor 인증 실패 하였습니다.",
  },
  101: { message: "Invalid format", description: "유효하지 않은 포맷입니다." },
  103: { message: "Lack of Balance", description: "잔고가 부족 합니다." },
  104: {
    message: "Order id is not exist",
    description: "존재하지 않은 주문입니다.",
  },
  105: {
    message: "Price is not correct",
    description: "올바르지 않은 가격입니다.",
  },
  107: { message: "Parameter error", description: "파라메터 에러입니다." },
  108: {
    message: "Unknown cryptocurrency",
    description: "존재하지 않은 종목 심볼입니다.",
  },
  109: {
    message: "Unknown cryptocurrency pair",
    description: "존재하지 않은 거래 종목입니다.",
  },
  111: {
    message:
      "The order unavailable due to significant price difference between the order price and the current price",
    description: "주문 가격과 현재 가격의 현격한 차이로 주문이 불가 합니다.",
  },
  113: {
    message: "Quantity is too low",
    description: "최소 수량 미달로 요청이 불가 합니다.",
  },
  114: {
    message: "This is not a valid your order amount",
    description: "유효하지 않은 주문 수량 입니다.",
  },
  115: {
    message:
      "The sum of the holding quantity and the quantity of active orders has exceeded the maximum quantity",
    description:
      "보유 수량과 등록된 주문 수량의 합 최대 수량을 초과 하였습니다.",
  },
  116: { message: "Already Traded", description: "이미 체결된 주문입니다." },
  117: { message: "Already Canceled", description: "이미 취소된 주문입니다." },
  118: {
    message: "Already Submitted",
    description: "이미 등록된 주문입니다.",
  },
  120: {
    message: "V2 API payload is missing",
    description: "V2 API payload 값 입력이 필요 합니다.",
  },
  121: {
    message: "V2 API signature is missing",
    description: "V2 API signature 값 입력이 필요 합니다.",
  },
  122: {
    message: "V2 API nonce is missing",
    description: "V2 API nonce 값 입력이 필요 합니다.",
  },
  123: {
    message: "V2 API signature is not correct",
    description: "V2 API signature 값이 올바르지 않습니다.",
  },
  130: {
    message: "V2 API Nonce value must be a positive integer",
    description: "V2 API Nonce 값은 양의 숫자 값이어야 합니다.",
  },
  131: {
    message: "V2 API Nonce is must be bigger then last nonce",
    description: "V2 API Nonce 값은 이전 Nonce 값보다 커야 합니다.",
  },
  132: {
    message: "Nonce already used",
    description: "이미 사용된 Nonce 값 입니다.",
  },
  133: {
    message: "Nonce must be in the form of a UUID",
    description: "Nonce값은 UUID 포맷이어야 합니다.",
  },
  151: {
    message: "It's V2 API. V1 Access token is not acceptable",
    description: "V1의 Access Token으로는 V2 API 이용이 불가합니다.",
  },
  152: { message: "Invalid address", description: "유효하지 않은 주소입니다." },
  153: {
    message:
      "The address is detected by FDS. Please contact our customer center",
    description: "FDS에 의해 제한된 주소입니다. 고객 센터로 연락 부탁드립니다.",
  },
  154: {
    message: "The address is not registered as an API withdrawal address",
    description: "API 출금 주소 등록이 필요한 주소입니다.",
  },
  155: {
    message:
      "Withdrawal through the 'CODE Solution' requires registration of the deposit address",
    description:
      "CODE 솔루션을 통한 출금을 위해서는 입금 주소 생성이 필요합니다. 코인원 웹/앱에서 입금주소 생성 후 요청하시기 바랍니다.",
  },
  156: {
    message: "The withdrawal address does not exist",
    description: "존재하지 않은 출금 주소입니다.",
  },
  157: { message: "Insufficient balance", description: "잔액이 부족합니다." },
  158: {
    message: "Minimum withdrawal quantity insufficient",
    description: "최소 출금 가능 금액보다 부족합니다.",
  },
  159: {
    message: "Required the memo to proceed with the withdrawal",
    description: "출금을 위해서는 Memo 입력이 필요합니다.",
  },
  160: {
    message: "Withdrawal/Deposit id is invalid",
    description:
      "단일 입출금 내역 조회 시 올바르지 않은 입출금 내역 식별 ID가 입력된 경우입니다.",
  },
  161: {
    message: "price is required for LIMIT or STOP_LIMIT order.",
    description:
      "지정가, 예약 지정가 주문시 필수정보인 가격필드가 입력되지 않은 경우입니다.",
  },
  162: {
    message: "qty is required for LIMIT or STOP_LIMIT or MARKET(SELL) order.",
    description:
      "지정가, 예약 지정가, 시장가(매도), 주문시 필수정보인 수량필드가 입력되지 않은 경우입니다.",
  },
  163: {
    message: "post_only is required for LIMIT order.",
    description:
      "지정가 주문시 필수정보인 post_only필드가 입력되지 않은 경우입니다.",
  },
  164: {
    message: "trigger_price is required for STOP_LIMIT order",
    description:
      "예약 지정가 주문시 필수정보인 trigger_price 필드가 입력되지 않은 경우입니다.",
  },
  165: {
    message: "amount is required for MARKET(BUY) order.",
    description:
      "시장가(매수) 주문시 필수정보인 총액필드가 입력되지 않은 경우입니다.",
  },
  166: {
    message: "Not Supported Order Type.",
    description:
      "V2.1 Order API 요청시 입력한 주문타입이 지원하지 않는 주문타입인 경우입니다. 가능한 주문 타입 : LIMIT, MARKET, STOP_LIMIT (대문자만 가능)",
  },
  167: {
    message: "trigger price and current price can not be same.",
    description:
      "예약지정가 주문시 trigger_price 에 입력하신 값이 해당 코인의 현재가와 동일한 경우입니다.",
  },
  202: {
    message: "Withdrawal quantity is not correct",
    description:
      "옳바르지 않은 출금 수량입니다. (최소 출금 수량 미만 혹은 지원하지 않는 자릿수)",
  },
  300: {
    message: "Invalid order information",
    description: "유효하지 않은 주문 정보입니다.",
  },
  301: {
    message: "Cannot register selling orders below the base price",
    description: "기본가 이하로는 매도 주문 등록 불가 합니다.",
  },
  302: {
    message: "Cannot register selling orders above the base price",
    description: "기본가격 이상으로는 매도 주문 등록 불가 합니다.",
  },
  303: {
    message: "Cannot register buying orders below the base price",
    description: "기본가격 이하로는 매수 주문 등록 불가 합니다.",
  },
  304: {
    message: "Cannot register buying orders above the base price",
    description: "기본가격 이상으로는 매수 주문 등록 불가 합니다.",
  },
  305: {
    message: "Invalid quantity",
    description: "잘못된 수량이 입력되었습니다.",
  },
  306: {
    message: "Cannot be process the orders below the minimum amount",
    description: "최소 수량 이하로는 주문이 불가 합니다.",
  },
  307: {
    message: "Cannot be process the orders exceed the maximum amount",
    description: "최대 수량 이상으로는 주문이 불가 합니다.",
  },
  308: {
    message: "Price is out of range.",
    description:
      "주문 요청 시 입력한 가격이 최소 주문 가능 가격~최대 주문 가능 가격 범위를 벗어날 경우 발생합니다.",
  },
  309: {
    message: "Qty is out of range.",
    description:
      "주문 요청 시 입력한 수량이 최소 주문 가능 수량~최대 주문 가능 수량을 벗어날 경우 발생합니다.",
  },
  310: {
    message:
      "Unavailable price unit. Please check the Range unit API to get the price_unit.",
    description: "가격 단위가 유효하지 않을 때 발생합니다.",
  },
  311: {
    message:
      "Unavailable qty unit. Please check the Market API to see the qty_unit.",
    description: "수량 단위가 유효하지 않을 때 발생합니다.",
  },
  312: {
    message: "Duplicated user_order_id",
    description: "중복된 user_order_id",
  },
  313: {
    message:
      "user_order_id and order_Id cannot be requested together. Otherwise, neither was entered",
    description:
      "order_id 와 user_order_id 가 함께 요청되거나, 둘다 입력되지 않았을 경우",
  },
  314: {
    message: "Invalid user_order_id (It must be lower case)",
    description:
      "잘못된 user_order_id (대문자 혹은 지원하지 않는 특문, 150자 초과)",
  },
  315: {
    message: "The API does not support a portfolio.",
    description: "포트폴리오를 지원하지 않는 API 입니다.",
  },
  405: { message: "Server error", description: "서버 에러가 발생하였습니다." },
  777: {
    message: "Invalid 2FA",
    description: "유효하지 않은 2-Factor 인증 값입니다.",
  },
  1201: {
    message: "The V2 order API only supports limit order types.",
    description:
      "v2의 특정 주문 조회 시(v2/order/query_order) 조회하려는 주문이 지정가 주문이 아닌 경우 발생합니다. (v2는 시장가, 예약 지정가를 지원하지 않아 발생하는 에러입니다.)",
  },
  1202: {
    message: "This API is deprecated and only supports limit order type.",
    description:
      "v21의 특정 주문 정보 조회 시(v2.1/order/info) 조회하려는 주문이 지정가 주문이 아닌 경우 발생합니다. (v2.1/order/info는 시장가, 예약 지정가를 지원하지 않아 발생하는 에러입니다.)",
  },
  1206: { message: "User not found", description: "존재하지 않은 고객입니다." },
  3001: {
    message:
      "Withdrawal of the virtual asset has been suspended. Please check our notice",
    description:
      "출금이 일시적 혹은 영구적으로 정지된 가상자산입니다. 공지사항을 확인 부탁드립니다.",
  },
  3002: {
    message: "Withdrawal is rejected",
    description: "출금이 특정 사유로 인해 거절된 상태입니다.",
  },
  3003: {
    message: "Exceed daily withdrawal limit",
    description: "일일 출금 가능 수량을 초과 하였습니다.",
  },
  3004: {
    message: "Failed by 24-hour withdrawal delay policy",
    description:
      "원화 입금으로 인한 24시간 출금지연 상태로 출금에 실패 하였습니다.",
  },
  3005: {
    message: "Try again after complete phone verification",
    description: "휴대폰 번호 인증 완료 하신 후에 재시도 부탁드립니다.",
  },
  3007: {
    message: "An error in the balance. Please contact CS center",
    description: "잔고에 오류가 발생하였습니다. 고객 센터에 연락 부탁드립니다.",
  },
  3009: {
    message: "Account was detected through FDS system monitoring",
    description: "이상거래에 탐지되어 이용할 수 없는 상태입니다.",
  },
  3010: {
    message: "Account is locked",
    description:
      "계정 잠금으로 인해 출금이 불가한 경우입니다. 잠금 해제는 최신 버전의 앱 또는 웹페이지에서 로그인을 통해 진행할 수 있습니다.",
  },
  3011: {
    message: "Withdrawal is restricted by master account.",
    description: "마스터 계정이 서브 계정의 가상자산 출금을 제한한 상태입니다.",
  },
};
