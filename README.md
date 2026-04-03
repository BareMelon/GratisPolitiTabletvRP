# vRP Politi Tablet (MDT)
**Version:** 1.0.0

Dette er en top-moderne, "Glassmorphism" politi-tablet (MDT) udviklet specielt til dansk vRP. Designet er inspireret af Kamaryn's HR UI og bygget til at være ekstremt brugervenligt, flot og sikkert.

## Funktioner
*   **Dansk Default:** Alt tekst, struktur og logik er pre-konfigureret på dansk.
*   **Sikkerhed:** Logikken er placeret på server-siden for at forhindre NUI-exploits og LUA-injectors i at manipulere med politiets database.
*   **Design:** Ægte Glassmorphism-effekter (blurry baggrunde, teal accenter) der lægger sig flot over dit spil uden at blokere synsfeltet fuldstændigt.
*   **Søg Borger:** Slå hurtigt borgere op via deres PID/CPR-nummer for at se deres telefonnummer, køretøjer og eventuelle aktive efterlysninger.

## Installation for Server Ejere

1.  Download `vrp_policetablet` mappen.
2.  Placer mappen i din `resources/[vrp]/` mappe (eller hvor du gemmer dine vRP add-ons).
3.  Tilføj `ensure vrp_policetablet` til din `server.cfg`.
4.  Genstart din server, eller skriv `refresh` efterfulgt af `ensure vrp_policetablet` i din konsol.

### Konfiguration (`config.lua`)
Åbn filen `config.lua` for at ændre de vigtigste indstillinger for tabletten:
*   **`Config.OpenKey`**: Hvilken knap betjentene skal trykke på for at åbne tabletten (Standard: `F3`).
*   **`Config.UseItem`**: Sæt denne til `true`, hvis betjentene skal have "police_tablet" i deres vRP inventory for at kunne åbne den.
*   **`Config.PoliceGroups`**: Hvilke vRP-grupper der har adgang til tablet-systemet (fx. "Politi", "LSPD").

## For Udviklere (Open Source / Distribution)
UI-delen (HTML, CSS, JS) er 100% open source og kan nemt oversættes eller tilpasses.
Hvis du distribuerer dette script videre og ønsker at beskytte dine egne ændringer i database-logikken, anbefales det at du pakker/krypterer filen **`server/main.lua`** via *FiveM Asset Escrow* før udgivelse.
