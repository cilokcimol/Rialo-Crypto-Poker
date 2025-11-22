Rialo Crypto Poker
Rialo Crypto Poker is a browser-based poker experience built for the Rialo ecosystem. It is a single player game where you play heads up against an AI bot. Chips are denominated in crypto assets such as BTC and ETH, and the UI leans on Rialo brand colors and narrative.

Concept
You play 5-card poker against a bot. Each hand:
- You and the bot receive five cards
- The engine evaluates both hands
- The winner gains crypto chips, the loser loses chips
- Chips are tracked in multiple crypto denominations (BTC, ETH and others can be added)

The twist:
- Chips are tagged as BTC or ETH style balances
- A live crypto price fetch (CoinGecko by default) estimates your total stack value in USD
- The table copy and micro animations are all aligned with Rialo ideas

This is not real money, not real gambling and not connected to any wallet. It is a simulation and a UI playground.

Key Features
- Heads up 5-card poker vs a reactive bot
- Custom player handle input before you play
- Bot names are auto created
- Multi asset chip stacks (BTC and ETH by default)
- Optional live price lookup for BTC and ETH via public APIs
- Rialo styled table, colors and typography

Tech Stack
- HTML5
- Vanilla CSS
- Vanilla JavaScript (no build step required)
- Public crypto market APIs for price data (CoinGecko, optional)

How It Works
Game loop:
1. Enter a player name and click the Start button.
2. The game picks a random bot name and initializes both stacks.
3. Every click on Deal New Hand:
   - A fresh deck is shuffled
   - Five cards are dealt to you and the bot
   - The engine evaluates both hands and determines the winner
   - Chips are transferred between you and the bot based on hand strength
   - UI updates your card grid, bot’s revealed cards, hand labels and chip balances
4. Price data fetch:
   - On load, the app fetches BTC and ETH USD prices from CoinGecko
   - The estimated USD value of your chips is shown in a small portfolio panel
Hand evaluation:
- Standard 5-card poker ranks:
  - High card
  - One pair
  - Two pair
  - Three of a kind
  - Straight
  - Flush
  - Full house
  - Four of a kind
  - Straight flush

Credits
Built by:
- GitHub: https://github.com/cilokcimol
- Telegram: https://t.me/vikajoestar
- Discord: https://discord.com/users/508636062340349962

This project is an experimental fan build themed around Rialo and crypto native gaming. It is not an official Rialo product and does not involve real funds or wagering.

License
MIT License. Use, fork, and extend freely.
