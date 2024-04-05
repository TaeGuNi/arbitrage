# Arbitrage

코인원과 업비트 간에 차익거래를 실행하는 봇입니다.

## 환경설정

- `.env.develop` 파일을 `.env` 파일로 복사 합니다.
- `.env` 파일을 수정합니다.
- `코인원`에서 발급받은 api 키를 `.env` 파일에 입력합니다.
- `업비트`에서 발급받은 api 키를 `.env` 파일에 입력합니다.

```text
LOG_LEVEL=debug

COINONE_ACCESS_KEY=
COINONE_SECRET_KEY=

UPBIT_ACCESS_KEY=
UPBIT_SECRET_KEY=

# 거래 가능한 코인
TRADE_SYMBOL=ADA,ALGO,ATOM,BTC,DOGE,ETH,KRW,MATIC,SOL

# 최소 거래 금액
MINIMUM_AMOUNT=5000

# 코인원 수수료
COINONE_FEE=0.002

# 업비트 수수료
UPBIT_FEE=0.0005

# ADA
TARGET_ADA_PROFIT_RATE=0.2      # 차익 거래 최소 수익률
TARGET_ADA_PROFIT=500           # 거래당 절대 최소 차익 금액

# ALGO
TARGET_ALGO_PROFIT_RATE=0.2     # 차익 거래 최소 수익률
TARGET_ALGO_PROFIT=500          # 거래당 절대 최소 차익 금액

# ATOM
TARGET_ATOM_PROFIT_RATE=0.2     # 차익 거래 최소 수익률
TARGET_ATOM_PROFIT=500          # 거래당 절대 최소 차익 금액

# BTC
TARGET_BTC_PROFIT_RATE=0.5      # 차익 거래 최소 수익률
TARGET_BTC_PROFIT=50000         # 거래당 절대 최소 차익 금액

# DOGE
TARGET_DOGE_PROFIT_RATE=0.2     # 차익 거래 최소 수익률
TARGET_DOGE_PROFIT=500          # 거래당 절대 최소 차익 금액

# ETH
TARGET_ETH_PROFIT_RATE=0.5      # 차익 거래 최소 수익률
TARGET_ETH_PROFIT=5000          # 거래당 절대 최소 차익 금액

# MATIC
TARGET_MATIC_PROFIT_RATE=0.2    # 차익 거래 최소 수익률
TARGET_MATIC_PROFIT=500         # 거래당 절대 최소 차익 금액

# SOL
TARGET_SOL_PROFIT_RATE=0.3      # 차익 거래 최소 수익률
TARGET_SOL_PROFIT=500           # 거래당 절대 최소 차익 금액
```

## 실행방법

- 터미널 사용

```sh
$ npm run dev
```

- _Visual Studio Code_ `Task Explorer` 사용
  - 에디터 왼쪽 탐색기 아래 부분 살펴보기
  - TASK EXPLOER 보기
  - npm > dev > ▷(Play) 버튼 클릭
