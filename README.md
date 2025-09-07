# X clone

Projekt ma dwa tryby pracy: **dev** (z hot reloadem przez Vite) oraz **prod** (z Nginx-em serwującym zbudowane pliki).

### Dev (Vite + HMR)
Uruchamia serwis backend, bazę danych oraz frontend w trybie developerskim z automatycznym odświeżaniem.

```bash
docker compose --profile dev up --build --remove-orphans
```

Aplikacja frontendowa dostępna będzie pod adresem:
[http://localhost:5174](http://localhost:5174)

Backend: [http://localhost:8000](http://localhost:8000)

---

### Prod (Nginx + build dist)
Uruchamia pełny stack w trybie produkcyjnym – frontend budowany i serwowany przez Nginx.

```bash
docker compose --profile normal up --build --remove-orphans
```

Aplikacja frontendowa dostępna będzie pod adresem:
[http://localhost:5173](http://localhost:5173)

Backend: [http://localhost:8000](http://localhost:8000)

---

### Dodatkowe polecenia
Zatrzymanie i usunięcie kontenerów + wolumenów:
```bash
docker compose down -v
```

Czyszczenie nieużywanych wolumenów:
```bash
docker volume prune -f
```
