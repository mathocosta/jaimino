/*
 * Firmware para o Arduino
 *
 * Protocolo dos códigos de envio:
 *  - 1º pedaço
 *    - 0(A): leitura do cartão
 *    - 1(B): verificação de código digitado
 *  - 2º pedaço os dados restantes
 * Protocolo dos dados recebidos:
 *  - 1º pedaço: comando que está sendo respondido, baseado na lógica do protocolo anterior.
 *  - 2º pedaço: true(1) ou false(0) se o comando deu certo.
 */

#include <Keypad.h>
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 9
#define RST_PIN 8

#define RELAY 48
#define BUZZER 49

MFRC522 mfrc522(SS_PIN, RST_PIN);

const byte ROWS = 4;
const byte COLS = 3; 
char keys[ROWS][COLS] = {
  {'1', '2', '3'},
  {'4', '5', '6'},
  {'7', '8', '9'},
  {'*', '0', '#'}
};
byte rowPins[ROWS] = {22, 7, 6, 5}; // Pinos das linhas do keypad
byte colPins[COLS] = {4, 3, 2};     // Pinos das colunas do keypad

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

String senha = "";
void setup() {
  Serial.begin(9600);
  pinMode(50, OUTPUT);
  pinMode(RELAY, OUTPUT);

  SPI.begin();        // Inicia SPI bus
  mfrc522.PCD_Init(); // Inicia MFRC522
}

void cartaoLogic() {
  String conteudo = "";
  byte letra;
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    conteudo.concat(String(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " "));
    conteudo.concat(String(mfrc522.uid.uidByte[i], HEX));
  }

  conteudo.toUpperCase();
  Serial.println(conteudo);

  // TODO: Colocar essa parte na função de recebimento
  if (conteudo.substring(1) == "B3 72 6C 9A") {
    tone(BUZZER, 262, 500);
    digitalWrite(RELAY, HIGH);
    delay(3000);
    digitalWrite(RELAY, LOW);
  } else {
    tone(BUZZER, 392, 500);
    delay(800);
  
    tone(BUZZER, 392, 500);
    delay(800);
  
    tone(BUZZER, 392, 500);
    delay(1000);
  }
}

// Função para gerenciar as respostas do computador
void responseHandler() {

}

/*
 * - Verificação dos digitos
 * - Verificação do cartao
 * - Função para as respostas do computador
 */
void loop() {
  char key = keypad.getKey();
  if (key) {
    if (senha.length() < 7) {
      senha.concat(key);
    }

    tone(BUZZER, 220, 500);

    // Zerar os digitos
    if (key == '*') { 
      senha = "";
    }

    // Enviar a senha
    if (key == "#" && senha.length() == 7 ) {
    }
  }

  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    cartaoLogic();
  }
}
