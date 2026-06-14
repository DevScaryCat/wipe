/*
  WIPE 미니 사이클 — 스타터 키트로 만드는 "살균 키오스크 동작" 데모
  ------------------------------------------------------------------
  진짜 기계의 축소판:  시작 → 리프트 상승 → 상단(리미트) 도달 → UV 30초 → 하강 → 완료
  실제 부품(NEMA17/UV-C)은 나중에. 지금은 키트 부품으로 "로직"을 손에 익힌다.

  보드: Arduino UNO

  === 배선 (키트 부품) ===
  [스텝 모터 드라이버 ULN2003]   IN1->8   IN2->10   IN3->9   IN4->11
                                  (+)->5V   (-)->GND        // = 리프트
  [시작 버튼 (택트 스위치)]       한쪽->2,  반대쪽->GND       // 누르면 시작
  [리미트 버튼 (택트 스위치)]     한쪽->3,  반대쪽->GND       // 누르면 "상단 도달"
  [UV용 파랑 LED]                 긴다리(+)->220Ω->6,  짧은다리(-)->GND   // 파랑=UV 느낌
  [릴레이 모듈]                   IN->7,  VCC->5V,  GND->GND  // 실제 UV는 나중에 여기 연결
  [능동(액티브) 부저]             (+)->4,  (-)->GND          // 완료음

  ※ 버튼은 INPUT_PULLUP이라 "누르면 LOW".  실제 리미트 스위치도 똑같이 동작한다.
  ※ 릴레이가 반대로 동작하면(평소 ON) active-LOW 모듈 → uvOn()/uvOff()의 RELAY 값을 HIGH<->LOW 바꿔라.
*/

#include <Stepper.h>

const int STEPS_PER_REV = 2048;            // 28BYJ-48 한 바퀴
Stepper lift(STEPS_PER_REV, 8, 10, 9, 11); // ULN2003 핀 순서(8,10,9,11)

const int BTN_START = 2;
const int BTN_LIMIT = 3;
const int UV_LED    = 6;
const int RELAY     = 7;
const int BUZZER    = 4;

const int UV_SECONDS = 30;                 // 살균 시간 (실제와 동일하게 30초)

void setup() {
  Serial.begin(9600);
  pinMode(BTN_START, INPUT_PULLUP);
  pinMode(BTN_LIMIT, INPUT_PULLUP);
  pinMode(UV_LED, OUTPUT);
  pinMode(RELAY, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  lift.setSpeed(12);                       // 회전 속도(rpm)
  uvOff();
  Serial.println(F("WIPE 준비됨 — 시작 버튼(핀2)을 누르세요"));
}

void loop() {
  if (justPressed(BTN_START)) {
    runCycle();
    Serial.println(F("\n대기 중 — 시작 버튼을 누르세요"));
  }
}

void runCycle() {
  // [1] 리프트 상승: 리미트가 눌릴 때까지 조금씩 위로
  Serial.println(F("[1] 리프트 상승 중... (리미트 버튼=상단 도달)"));
  while (digitalRead(BTN_LIMIT) == HIGH) {  // 아직 안 눌림
    lift.step(20);                          // 20스텝씩 올림(중간중간 리미트 체크)
  }
  Serial.println(F("    상단 도달 · 챔버 밀폐 확인 OK"));

  // [2] UV-C 살균 — 안전 인터락: 상단 도달(밀폐) 후에만 점등
  Serial.println(F("[2] UV-C 살균 시작"));
  uvOn();
  for (int s = UV_SECONDS; s > 0; s--) {
    Serial.print(F("    남은 시간 "));
    Serial.print(s);
    Serial.println(F("초"));
    delay(1000);
  }
  uvOff();
  Serial.println(F("    살균 완료"));
  beep();

  // [3] 리프트 하강(복귀)
  Serial.println(F("[3] 리프트 하강 · 폰 반환"));
  lift.step(-STEPS_PER_REV);                // 한 바퀴 아래로(데모)
  Serial.println(F("[완료] 폰을 회수하세요"));
}

// 버튼 눌림 1회 감지 (디바운스 + 뗄 때까지 대기)
bool justPressed(int pin) {
  if (digitalRead(pin) == LOW) {
    delay(20);
    if (digitalRead(pin) == LOW) {
      while (digitalRead(pin) == LOW) { /* 손 뗄 때까지 */ }
      return true;
    }
  }
  return false;
}

void uvOn()  { digitalWrite(UV_LED, HIGH); digitalWrite(RELAY, HIGH); }
void uvOff() { digitalWrite(UV_LED, LOW);  digitalWrite(RELAY, LOW); }
void beep()  { digitalWrite(BUZZER, HIGH); delay(200); digitalWrite(BUZZER, LOW); }
