# Jaimino
Projeto final para a disciplina de Computação Física do curso SMD/UFC. Foi desenvolvido um porteiro eletrônico, que funciona respondendo comandos recebidos via um bot no Telegram.

- `/bot`: Tudo referente ao bot. Foi usado o `[telegraf](https://github.com/telegraf/telegraf)` como framework que implementa a API de Bot do Telegram.
- `/db`: Base de dados para o sistema. Todos os dados ficam salvos em um `.json` que é gerenciado usando o pacote `[lowdb](https://github.com/typicode/lowdb)`.
- `/firmware`: Firmware que se comunica com o Arduino.

## Equipe
- João Paulo Sabino
- Matheus Campelo
- Matheus Oliveira Costa([@mathocosta](https://github.com/mathocosta))
