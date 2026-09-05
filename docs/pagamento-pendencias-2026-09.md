# SmartDayZ: o que falta pra alguém conseguir assinar (05/09/2026)

Levantamento feito na sessão autônoma do fim de semana. Nada aqui foi executado:
tudo que envolve dinheiro é decisão da Wanessa.

## Onde as coisas estão hoje

- Site no ar em **https://smartdayz.com** (o DNS já aponta pra VPS; o app antigo do
  GitHub Pages saiu do caminho).
- A agenda é servida em **/app**. A home é a landing de venda.
- Login e conta: Better Auth, com **7 dias de teste** liberados no cadastro (`TRIAL_DAYS=7`).
- Na Quack (organização **Smart Dayz**) já existe o produto **SmartDayZ Pro**,
  status `live`, assinatura mensal de **R$ 29,90**, com o gateway **Amplopay** ativo
  (PIX, cartão e cartão recorrente).

## O que trava a venda

1. **O app não conhece o checkout.** No Coolify não existem `QUACK_CHECKOUT_URL`
   nem `QUACK_PRODUCT_ID`. Sem isso o botão "Assinar" fica escondido: quem cria conta
   e termina o teste vê "o Pro ainda não está liberado nela" e não tem para onde ir.
   Falta o link do checkout do produto (pegar no painel da Quack) e o id
   `345f0438-7052-42f8-8c27-b3d3ba6d07f5`.

2. **Pagar não liberaria o Pro.** Falta `QUACK_WEBHOOK_SECRET` no Coolify e o webhook
   apontado na Quack para `https://smartdayz.com/api/webhooks/quack`. Sem os dois,
   a assinatura paga não vira acesso liberado dentro do app.

3. **A entrega aponta pro endereço velho.** O `deliveryUrl` do produto na Quack é
   `https://smartdayz.76.13.235.188.sslip.io`. Depois de pagar, a pessoa deveria cair
   em `https://smartdayz.com/app`.

4. **Só cartão.** O produto está com `allowedMethods: ["card"]`. Se a ideia é aceitar
   PIX em algum plano, é decisão dela (assinatura recorrente por PIX costuma não valer).

5. **Preço:** o combinado antigo era R$ 39,90 e o produto está em R$ 29,90. Só ela decide
   qual vale.

6. **IA sem chave.** `GEMINI_API_KEY` não está no Coolify, então "Delegar para IA"
   responde "A IA ainda não está configurada". A chave antiga ficou presa na Edge Function
   do Supabase.

## Fora de dinheiro, mas pendente

- O e-mail de sistema sai por `lab2appz.contato@gmail.com` (SMTP já configurado), mas o
  app não manda nenhum e-mail hoje: não existe confirmação de cadastro nem recuperação
  de senha. Quem esquecer a senha fica sem caminho.
- O login por e-mail e senha não tem "esqueci minha senha" em lugar nenhum.
- A landing pede nome e e-mail nas telas de venda; esses leads vão pro control
  (control.roriz.tech), não pro app.
