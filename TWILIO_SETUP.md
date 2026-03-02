# Configuração do WhatsApp - Avaloon 🚨

Para que o sistema consiga enviar mensagens para você e para os gerentes, é necessário "ativar" cada número no Sandbox do Twilio (devido ao plano de testes atual).

## 1. Como Ativar seu WhatsApp

Cada pessoa que deve receber alertas (Diretor e Gerentes) deve seguir estes passos:

1.  Adicione o número do Twilio aos seus contatos: **+1 415 523 8886**.
2.  Envie uma mensagem de WhatsApp para este número com o texto:
    `join <seu-codigo-sandbox>`
    *(O código geralmente começa com "join" seguido de duas palavras aleatórias, ex: `join logic-camera`)*.

> [!IMPORTANT]
> **Onde encontrar o código?**
> Peça ao administrador do sistema para consultar o código no [Painel do Twilio](https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox).

## 2. Limites da Conta de Teste
*   **Limite Diário:** 50 mensagens por dia para toda a conta.
*   **Sessão:** A ativação expira a cada **24 horas**. Se você parar de receber alertas, basta enviar qualquer mensagem para o número do Twilio para reativar a sessão.

## 3. Formato dos Números no Sistema
No painel do Avaloon ou no banco de dados, certifique-se de que os números dos gerentes sigam o padrão:
`+55 (DDD) 9XXXX-XXXX`
*(O sistema limpará espaços e parênteses automaticamente)*.
